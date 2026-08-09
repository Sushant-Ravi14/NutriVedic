const FoodCache = require('../models/FoodCache.model');
const MealLog = require('../models/MealLog.model');
const crypto = require('crypto');
const { identifyFood } = require('../utils/gemini');
const { searchFood } = require('../utils/usda');

const scanFoodPhoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No image provided' });

    const imageHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    let cached = await FoodCache.findOne({ imageHash });
    
    if (cached) {
      cached.usageCount += 1;
      cached.lastUsed = new Date();
      await cached.save();
      return res.status(200).json({ success: true, data: cached });
    }

    const aiResult = await identifyFood(req.file.buffer, req.file.mimetype);
    
    if (!aiResult.isFood) {
      return res.status(400).json({ success: false, error: 'Not a recognized food item' });
    }

    // Try to get macros from USDA based on dish name
    const usdaResults = await searchFood(aiResult.foodName);
    let nutrition = {
      calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sodium: 0, standardServing: aiResult.servingDescription || '1 serving'
    };

    if (usdaResults.length > 0) {
      nutrition = { ...nutrition, ...usdaResults[0].nutrition };
    }

    const newCache = await FoodCache.create({
      dishName: aiResult.foodName,
      source: 'gemini_vision',
      nutrition,
      imageHash,
      confidenceScore: aiResult.confidence * 100,
      usageCount: 1,
      lastUsed: new Date()
    });

    res.status(200).json({ success: true, data: newCache });
  } catch (error) {
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

    // Update food cache verification
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
      { $group: { _id: "$foodName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.status(200).json({ success: true, data: trending });
  } catch (error) {
    next(error);
  }
};

module.exports = { scanFoodPhoto, getScanHistory, submitFeedback, getTrending };
