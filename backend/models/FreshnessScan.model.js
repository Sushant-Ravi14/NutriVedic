const mongoose = require('mongoose');
const { Schema } = mongoose;

const freshnessScanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: String,
  itemType: { type: String, enum: ['vegetable','fruit','leaf','grain'] },
  freshnessScore: Number,
  freshnessClass: { type: String, enum: ['fresh','ripe','stale'] },
  imageUrl: String,
  estimatedDaysRemaining: Number,
  estimatedSpoilageDate: Date,
  shelfLifeTip: String,
  nutritionNote: String,
  addedToInventory: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FreshnessScan', freshnessScanSchema);
