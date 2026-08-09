const FreshnessScan = require('../models/FreshnessScan.model');
const UserInventory = require('../models/UserInventory.model');
const { uploadBuffer } = require('../utils/cloudinary');
const { analyzeProduceFreshness, estimateFreshness } = require('../utils/gemini');
const { calculateFreshnessVerdict } = require('../utils/scoreEngine');

/**
 * POST /api/freshness/log
 * Full two-pass freshness detection pipeline:
 *  Pass 1 — Gemini Vision: food gate (is this produce?) + visual freshness score
 *  Pass 2 — Gemini Text:   shelf life + storage tip + nutrition state
 *
 * Body fields:
 *   image (file)          — required, the produce photo
 *   addToInventory        — optional boolean, defaults to true
 *
 * Optional YOLO hint fields (from frontend):
 *   yoloClass             — e.g. 'fresh_fruit'
 *   yoloConfidence        — 0 to 1
 */
const logFreshness = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, error: 'File must be an image' });
    }

    // ── Pass 1: Gemini Vision — produce gate + freshness score ──────────────
    let visionResult;
    try {
      visionResult = await analyzeProduceFreshness(req.file.buffer, req.file.mimetype);
    } catch (visionError) {
      // Vision model failed — if YOLO hint provided, use that as fallback
      if (req.body.yoloClass) {
        const { yoloFreshnessScore } = require('../utils/scoreEngine');
        const yoloScore = yoloFreshnessScore(req.body.yoloClass, parseFloat(req.body.yoloConfidence || 0.5));
        visionResult = {
          isProduce: true,
          foodIdentified: req.body.yoloClass.replace(/_/g, ' '),
          freshnessScore: yoloScore.freshnessScore,
          status: yoloScore.freshnessCategory.charAt(0).toUpperCase() + yoloScore.freshnessCategory.slice(1),
          safeToEat: yoloScore.freshnessScore > 25,
          confidence: parseFloat(req.body.yoloConfidence || 0.5),
          spoilageSigns: [],
          storageAdvice: 'Store in a cool dry place.',
          _fallbackMode: true
        };
      } else {
        return res.status(503).json({
          success: false,
          error: 'ai_unavailable',
          message: 'On-device analysis unavailable — try a different browser or check your connection.'
        });
      }
    }

    // ── Produce gate: reject non-produce images ──────────────────────────────
    if (visionResult.isProduce === false) {
      return res.status(422).json({
        success: false,
        error: 'not_produce',
        message: `No fruit or vegetable detected. ${visionResult.reason || ''}`,
        suggestion: 'Please photograph fresh produce directly against a plain background.'
      });
    }

    // ── Calculate scored verdict ─────────────────────────────────────────────
    const { finalScore, scoreVerdict } = calculateFreshnessVerdict(
      visionResult.freshnessScore,
      visionResult.status,
      visionResult.safeToEat
    );

    // ── Pass 2: Gemini Text — shelf life + nutrition guidance ────────────────
    let shelfLifeData;
    let shelfLifeFailed = false;
    try {
      shelfLifeData = await estimateFreshness(
        visionResult.foodIdentified,
        finalScore,
        visionResult.status
      );
    } catch (shelfError) {
      shelfLifeFailed = true;
      shelfLifeData = {
        estimatedDaysRemaining: null,
        bestConsumedWithin: null,
        shelfLifeTip: 'Shelf life estimate unavailable — showing visual freshness score only.',
        nutritionNote: null,
        avoidIfDescription: null,
        nutritionAtCurrentState: null
      };
    }

    // ── Upload image to Cloudinary ───────────────────────────────────────────
    let imageUrl = '';
    if (req.file) {
      try {
        const uploadResult = await uploadBuffer(req.file.buffer, 'freshness_scans');
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload failed:', uploadError.message);
        // Non-fatal — continue without image URL
      }
    }

    // ── Calculate spoilage date ──────────────────────────────────────────────
    const estimatedSpoilageDate = shelfLifeData.estimatedDaysRemaining != null
      ? new Date(Date.now() + shelfLifeData.estimatedDaysRemaining * 24 * 60 * 60 * 1000)
      : null;

    // ── Save FreshnessScan document ──────────────────────────────────────────
    const scan = await FreshnessScan.create({
      userId: req.user._id,
      itemName: visionResult.foodIdentified,
      itemType: visionResult.status.toLowerCase().includes('fruit') ? 'fruit' : 'vegetable',
      freshnessScore: finalScore,
      freshnessClass: visionResult.status,
      imageUrl,
      estimatedDaysRemaining: shelfLifeData.estimatedDaysRemaining ?? 0,
      estimatedSpoilageDate,
      shelfLifeTip: shelfLifeData.shelfLifeTip,
      nutritionNote: shelfLifeData.nutritionNote,
      addedToInventory: false
    });

    // ── Optionally add to UserInventory ─────────────────────────────────────
    const shouldAddToInventory = req.body.addToInventory !== 'false' && req.body.addToInventory !== false;
    if (shouldAddToInventory && shelfLifeData.estimatedDaysRemaining != null) {
      let inventory = await UserInventory.findOne({ userId: req.user._id });
      if (!inventory) {
        inventory = new UserInventory({ userId: req.user._id, items: [] });
      }

      let status = 'fresh';
      if (shelfLifeData.estimatedDaysRemaining <= 2) status = 'expiring_soon';
      if (shelfLifeData.estimatedDaysRemaining <= 0) status = 'expired';

      inventory.items.push({
        itemName: visionResult.foodIdentified,
        quantity: 1,
        unit: 'piece',
        freshnessScore: finalScore,
        addedDate: new Date(),
        estimatedExpiry: estimatedSpoilageDate,
        daysRemaining: shelfLifeData.estimatedDaysRemaining,
        status
      });

      await inventory.save();
      scan.addedToInventory = true;
      await scan.save();
    }

    // ── Return full scored result ─────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      shelfLifeFailed,
      scan: {
        _id: scan._id,
        // Vision results
        foodIdentified: visionResult.foodIdentified,
        freshnessScore: finalScore,
        status: visionResult.status,
        safeToEat: visionResult.safeToEat,
        scoreVerdict,
        confidence: visionResult.confidence,
        spoilageSigns: visionResult.spoilageSigns || [],
        storageAdvice: visionResult.storageAdvice,
        // Shelf life results
        estimatedDaysRemaining: shelfLifeData.estimatedDaysRemaining,
        bestConsumedWithin: shelfLifeData.bestConsumedWithin,
        shelfLifeTip: shelfLifeData.shelfLifeTip,
        nutritionNote: shelfLifeData.nutritionNote,
        avoidIfDescription: shelfLifeData.avoidIfDescription,
        nutritionAtCurrentState: shelfLifeData.nutritionAtCurrentState,
        // Meta
        imageUrl,
        addedToInventory: scan.addedToInventory,
        fallbackMode: visionResult._fallbackMode || false
      }
    });

  } catch (error) {
    next(error);
  }
};

const getInventory = async (req, res, next) => {
  try {
    const inventory = await UserInventory.findOne({ userId: req.user._id });
    if (!inventory) return res.status(200).json({ success: true, items: [] });
    inventory.items.sort((a, b) => a.daysRemaining - b.daysRemaining);
    res.status(200).json({ success: true, items: inventory.items });
  } catch (error) {
    next(error);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const inventory = await UserInventory.findOne({ userId: req.user._id });
    if (!inventory) return res.status(200).json({ success: true, alerts: [] });
    const alerts = inventory.items.filter(item => item.daysRemaining <= 2 && item.status !== 'expired');
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
};

const deleteInventoryItem = async (req, res, next) => {
  try {
    const inventory = await UserInventory.findOne({ userId: req.user._id });
    if (!inventory) return res.status(404).json({ success: false, error: 'Inventory not found' });
    inventory.items = inventory.items.filter(item => item._id.toString() !== req.params.itemId);
    await inventory.save();
    res.status(200).json({ success: true, message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};

const getImpact = async (req, res, next) => {
  try {
    const inventory = await UserInventory.findOne({ userId: req.user._id });
    const itemsSaved = inventory ? inventory.items.length * 2 : 0;
    const rupeesSaved = itemsSaved * 40;
    res.status(200).json({ success: true, impact: { itemsSaved, rupeesSaved } });
  } catch (error) {
    next(error);
  }
};

module.exports = { logFreshness, getInventory, getAlerts, deleteInventoryItem, getImpact };
