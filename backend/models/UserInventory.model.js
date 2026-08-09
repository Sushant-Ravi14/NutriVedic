const mongoose = require('mongoose');
const { Schema } = mongoose;

const userInventorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    itemName: String,
    quantity: Number,
    unit: String,
    freshnessScore: Number,
    addedDate: Date,
    estimatedExpiry: Date,
    daysRemaining: Number,
    status: { type: String, enum: ['fresh','expiring_soon','expired'] },
    alertSent: { type: Boolean, default: false }
  }],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserInventory', userInventorySchema);
