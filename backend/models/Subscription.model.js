const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tier: { type: String, enum: ['free', 'premium'], default: 'free' },
  status: { type: String, enum: ['active', 'cancelled', 'expired', 'suspended'], default: 'active' },
  startDate: Date,
  endDate: Date,
  autoRenew: { type: Boolean, default: true },
  paymentMethod: { type: String, enum: ['razorpay', 'stripe', 'manual'] },
  amount: Number,
  currency: { type: String, default: 'INR' },
  razorpaySubscriptionId: String,
  cancelledAt: Date,
  cancellationReason: String,
  nextBillingDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
