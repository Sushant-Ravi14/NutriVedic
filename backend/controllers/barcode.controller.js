const BarcodeCache = require('../models/BarcodeCache.model');
const { lookupBarcode } = require('../utils/openFoodFacts');
const { searchFood } = require('../utils/usda');

const scanBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.body;
    if (!barcode) return res.status(400).json({ success: false, error: 'Barcode required' });

    let product = await BarcodeCache.findOne({ barcode });
    
    if (product) {
      product.usageCount += 1;
      await product.save();
      return res.status(200).json({ success: true, data: product });
    }

    const offData = await lookupBarcode(barcode);
    
    if (offData) {
      product = await BarcodeCache.create(offData);
      return res.status(200).json({ success: true, data: product });
    }

    res.status(404).json({ success: false, error: 'Product not found. Please add it manually.' });
  } catch (error) {
    next(error);
  }
};

const getBarcodeInfo = async (req, res, next) => {
  try {
    const product = await BarcodeCache.findOne({ barcode: req.params.barcode });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const verifyBarcode = async (req, res, next) => {
  try {
    const product = await BarcodeCache.findOneAndUpdate(
      { barcode: req.params.barcode },
      { $inc: { usageCount: 1 }, verified: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const submitUnknown = async (req, res, next) => {
  try {
    const { barcode, productName, nutrition, ingredients } = req.body;
    
    const product = await BarcodeCache.create({
      barcode,
      productName,
      nutrition,
      ingredients,
      source: 'manual',
      verified: false
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = { scanBarcode, getBarcodeInfo, verifyBarcode, submitUnknown };
