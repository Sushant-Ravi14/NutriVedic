const mongoose = require('mongoose');
const { Schema } = mongoose;

const foodCacheSchema = new Schema({
  dishName: { type: String, unique: true, index: true },
  variations: [String],
  source: { type: String, enum: ['gemini_vision','manual_entry','usda'] },
  nutrition: {
    calories: Number, 
    protein: Number, 
    fat: Number,
    carbs: Number, 
    fiber: Number, 
    sodium: Number,
    standardServing: String
  },
  imageHash: String,
  imageUrl: String,
  confidenceScore: Number,
  verifiedByUser: { type: Boolean, default: false },
  verificationCount: { type: Number, default: 0 },
  usageCount: { type: Number, default: 0 },
  lastUsed: Date,
  region: { type: String, default: 'India' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodCache', foodCacheSchema);
