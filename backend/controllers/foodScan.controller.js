const FoodCache = require('../models/FoodCache.model');
const MealLog = require('../models/MealLog.model');
const UserProfile = require('../models/UserProfile.model');
const crypto = require('crypto');
const { identifyFood } = require('../utils/gemini');
const { resolveNutrition } = require('../utils/nutritionResolver');
const { calculateConsumeScore } = require('../utils/scoreEngine');

/**
 * POST /api/food/scan
 * Accepts an image, runs Gemini Vision food gate + identification,
 * resolves nutrition via waterfall (USDA → OFF → Gemini estimate),
 * and returns a scored result with consumeScore + scoreVerdict.
 *
 * Optional body fields (from frontend YOLO pre-detection):
 *   yoloClass       {string}  — COCO class name e.g. "banana"
 *   yoloConfidence  {number}  — 0 to 1
 */
const scanFoodPhoto = async (req, res, next) => {
  try {
    // 1. Validate image upload
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, error: 'File must be an image' });
    }

    // 2. Check FoodCache by MD5 hash (skip AI if recently cached)
    const imageHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cached = await FoodCache.findOne({ imageHash, updatedAt: { $gte: sevenDaysAgo } });

    if (cached) {
      cached.usageCount += 1;
      cached.lastUsed = new Date();
      await cached.save();
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: cached
      });
    }

    // 3. Build optional YOLO hint from request body
    const yoloHint = (req.body.yoloClass && req.body.yoloConfidence)
      ? { yoloClass: req.body.yoloClass, yoloConfidence: parseFloat(req.body.yoloConfidence) }
      : null;

    // 4. Fetch User Profile and Run Gemini Vision — food gate + identification
    const userProfile = await UserProfile.findOne({ userId: req.user._id });
    const aiResult = await identifyFood(req.file.buffer, req.file.mimetype, yoloHint, userProfile);

    // 5. Food gate: reject non-food images
    if (aiResult.isFood === false) {
      return res.status(422).json({
        success: false,
        error: 'not_food',
        message: `No food detected. ${aiResult.reason || 'Please photograph a meal or food item directly.'}`,
        suggestion: 'Point your camera directly at a meal, dish, or food item.'
      });
    }

    // 6. Low confidence food: unidentified but it is food
    if (aiResult.unidentified === true) {
      return res.status(422).json({
        success: false,
        error: 'unidentified',
        message: `Dish not recognised. ${aiResult.reason || 'Try a clearer photo with better lighting.'}`,
        suggestion: 'Try a clearer photo with better lighting and a direct angle.'
      });
    }

    // 7. Resolve nutrition via waterfall (USDA → OpenFoodFacts → Gemini)
    const { nutrition, source: nutritionSource } = await resolveNutrition(
      aiResult.foodName,
      aiResult.estimatedWeightGrams || 100
    );

    // 8. Calculate consume score
    const { consumeScore, scoreVerdict } = calculateConsumeScore(
      aiResult.confidence || 0.5,
      nutrition,
      nutritionSource
    );

    // 9. Build result payload
    const resultPayload = {
      dishName: aiResult.foodName,
      source: 'gemini_vision',
      nutrition,
      nutritionSource,
      imageHash,
      confidenceScore: Math.round((aiResult.confidence || 0.5) * 100),
      consumeScore,
      scoreVerdict,
      meta: {
        cuisineType: aiResult.cuisineType,
        alternateNames: aiResult.alternateNames || [],
        mainIngredients: aiResult.mainIngredients || [],
        portionDescription: aiResult.portionDescription || '',
        estimatedWeightGrams: aiResult.estimatedWeightGrams || 100,
        isIndianFood: aiResult.isIndianFood,
        yoloHint: yoloHint || null,
        healthFeedback: aiResult.healthFeedback || null
      },
      usageCount: 1,
      lastUsed: new Date()
    };

    // 10. Save/Update FoodCache (using upsert to prevent duplicate key errors)
    const newCache = await FoodCache.findOneAndUpdate(
      { dishName: resultPayload.dishName },
      resultPayload,
      { upsert: true, new: true }
    );

    // 11. Return scored result
    return res.status(200).json({
      success: true,
      source: nutritionSource === 'gemini_estimate' ? 'gemini_estimate' : 'live',
      nutritionDisclaimer: nutritionSource === 'gemini_estimate'
        ? 'Nutrition values are estimated by AI and may not be exact.'
        : null,
      data: newCache
    });

  } catch (error) {
    if (error.message && (error.message.includes('quota') || error.message.includes('Quota') || error.message.includes('429') || error.message.includes('limit') || error.message.includes('quota exceeded'))) {
      return res.status(429).json({
        success: false,
        error: 'quota_exceeded',
        message: 'Daily AI scanner quota exceeded for this API key. Please check your API usage limits or try again tomorrow.'
      });
    }
    // Handle Gemini network errors gracefully
    if (error.message && error.message.includes('fetch')) {
      return res.status(503).json({
        success: false,
        error: 'ai_unavailable',
        message: 'Could not reach AI service. Check your connection and try again.'
      });
    }
    next(error);
  }
};

const getScanHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const logs = await MealLog.find({ userId: req.user._id, source: 'camera_scan' })
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const { correctName } = req.body;

    const log = await MealLog.findOne({ _id: scanId, userId: req.user._id });
    if (!log) return res.status(404).json({ success: false, error: 'Scan log not found' });

    log.userConfirmed = true;
    if (correctName) log.foodName = correctName;
    await log.save();

    await FoodCache.findOneAndUpdate(
      { dishName: log.foodName },
      { $inc: { verificationCount: 1 }, verifiedByUser: true }
    );

    res.status(200).json({ success: true, message: 'Feedback saved' });
  } catch (error) {
    next(error);
  }
};

const getTrending = async (req, res, next) => {
  try {
    const trending = await MealLog.aggregate([
      { $match: { source: 'camera_scan' } },
      { $group: { _id: '$foodName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.status(200).json({ success: true, data: trending });
  } catch (error) {
    next(error);
  }
};

module.exports = { scanFoodPhoto, getScanHistory, submitFeedback, getTrending };
