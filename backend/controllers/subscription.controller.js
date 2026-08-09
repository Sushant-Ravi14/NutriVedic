const Subscription = require('../models/Subscription.model');
const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const crypto = require('crypto');
const Razorpay = require('razorpay');

let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const startSubscription = async (req, res, next) => {
  try {
    if (!razorpay) return res.status(500).json({ success: false, error: 'Razorpay not configured' });

    const options = {
      amount: 39900, // 399 INR
      currency: "INR",
      receipt: `receipt_${req.user._id}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                    .update(body.toString())
                                    .digest('hex');
                                    
    if (expectedSignature === razorpay_signature) {
      // Payment successful
      await Payment.create({
        userId: req.user._id,
        amount: 399,
        paymentMethod: 'razorpay',
        paymentGatewayId: razorpay_payment_id,
        status: 'success'
      });

      await Subscription.findOneAndUpdate(
        { userId: req.user._id },
        { 
          tier: 'premium', 
          status: 'active', 
          startDate: new Date(), 
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        },
        { upsert: true }
      );

      await User.findByIdAndUpdate(req.user._id, { subscriptionTier: 'premium', subscriptionActive: true });

      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

const cancelSubscription = async (req, res, next) => {
  try {
    await Subscription.findOneAndUpdate(
      { userId: req.user._id },
      { autoRenew: false, status: 'cancelled', cancelledAt: new Date() }
    );
    res.status(200).json({ success: true, message: 'Subscription cancelled. You will have access until the end of your billing cycle.' });
  } catch (error) {
    next(error);
  }
};

const webhookHandler = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      // Handle webhook events (e.g., subscription.charged, subscription.cancelled)
      // Logic would go here
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { startSubscription, verifyPayment, getStatus, cancelSubscription, webhookHandler };
