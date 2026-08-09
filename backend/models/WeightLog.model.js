const mongoose = require('mongoose');
const { Schema } = mongoose;

const weightLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  weightKg: { type: Number, required: true },
  date: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeightLog', weightLogSchema);
