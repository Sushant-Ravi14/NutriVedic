const FreshnessScan = require('../models/FreshnessScan.model');
const UserInventory = require('../models/UserInventory.model');
const { uploadBuffer } = require('../utils/cloudinary');
const { estimateFreshness } = require('../utils/gemini');

const logFreshness = async (req, res, next) => {
  try {
    const { itemName, itemType, freshnessScore, freshnessClass } = req.body;
    let imageUrl = '';

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, 'freshness_scans');
      imageUrl = uploadResult.secure_url;
    }

    const aiAnalysis = await estimateFreshness(itemName, freshnessScore, freshnessClass);
    
    const estimatedSpoilageDate = new Date();
    estimatedSpoilageDate.setDate(estimatedSpoilageDate.getDate() + aiAnalysis.estimatedDaysRemaining);

    const scan = await FreshnessScan.create({
      userId: req.user._id,
      itemName,
      itemType,
      freshnessScore,
      freshnessClass,
      imageUrl,
      estimatedDaysRemaining: aiAnalysis.estimatedDaysRemaining,
      estimatedSpoilageDate,
      shelfLifeTip: aiAnalysis.shelfLifeTip,
      nutritionNote: aiAnalysis.nutritionNote,
      addedToInventory: true
    });

    let inventory = await UserInventory.findOne({ userId: req.user._id });
    if (!inventory) {
      inventory = new UserInventory({ userId: req.user._id, items: [] });
    }

    let status = 'fresh';
    if (aiAnalysis.estimatedDaysRemaining <= 2) status = 'expiring_soon';
    if (aiAnalysis.estimatedDaysRemaining <= 0) status = 'expired';

    inventory.items.push({
      itemName,
      quantity: 1,
      unit: 'piece',
      freshnessScore,
      addedDate: new Date(),
      estimatedExpiry: estimatedSpoilageDate,
      daysRemaining: aiAnalysis.estimatedDaysRemaining,
      status
    });

    await inventory.save();

    res.status(201).json({ success: true, scan });
  } catch (error) {
    next(error);
  }
};

const getInventory = async (req, res, next) => {
  try {
    const inventory = await UserInventory.findOne({ userId: req.user._id });
    if (!inventory) return res.status(200).json({ success: true, items: [] });

    // Sort by days remaining ascending
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
    // Simple mock logic for impact (in real scenario, this tracks deleted items that weren't expired)
    const inventory = await UserInventory.findOne({ userId: req.user._id });
    const itemsSaved = inventory ? inventory.items.length * 2 : 0; 
    const rupeesSaved = itemsSaved * 40; // Assuming 40 rs per item avg
    
    res.status(200).json({ success: true, impact: { itemsSaved, rupeesSaved } });
  } catch (error) {
    next(error);
  }
};

module.exports = { logFreshness, getInventory, getAlerts, deleteInventoryItem, getImpact };
