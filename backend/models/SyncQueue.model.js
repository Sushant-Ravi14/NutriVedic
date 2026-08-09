const mongoose = require('mongoose');
const { Schema } = mongoose;

const syncQueueSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  operation: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'] },
  entityType: { type: String, enum: ['MealLog', 'WeightLog', 'UserInventory'] },
  data: Schema.Types.Mixed,
  synced: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SyncQueue', syncQueueSchema);
