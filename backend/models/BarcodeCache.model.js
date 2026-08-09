const mongoose = require('mongoose');
const { Schema } = mongoose;

const barcodeCacheSchema = new Schema({
  barcode: { type: String, unique: true, index: true },
  eanType: String,
  productName: String,
  brand: String,
  imageUrl: String,
  nutrition: {
    caloriesPer100g: Number, 
    proteinPer100g: Number,
    fatPer100g: Number, 
    carbsPer100g: Number,
    fiberPer100g: Number, 
    sodiumPer100g: Number,
    servingSize: String, 
    servingsPerPackage: Number
  },
  ingredients: [String],
  allergens: [String],
  novaGroup: Number,
  source: { type: String, enum: ['open_food_facts','usda','manual'] },
  verified: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BarcodeCache', barcodeCacheSchema);
