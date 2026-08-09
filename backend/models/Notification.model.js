const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['meal_reminder','expiration_alert','milestone','health_tip','subscription','encouragement'] },
  title: String,
  message: String,
  actionUrl: String,
  read: { type: Boolean, default: false },
  readAt: Date,
  channel: [String],
  sentVia: [String],
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
