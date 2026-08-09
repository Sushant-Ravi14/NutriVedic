const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  currency: { type: String, default: 'INR' },
  paymentMethod: { type: String, enum: ['razorpay', 'stripe'] },
  paymentGatewayId: String,
  status: { type: String, enum: ['success', 'failed', 'pending'] },
  description: String,
  invoiceId: String,
  receiptUrl: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
