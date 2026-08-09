const express = require('express');
const router = express.Router();
const { startSubscription, verifyPayment, getStatus, cancelSubscription, webhookHandler } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

router.use(protect);

router.post('/start', startSubscription);
router.post('/verify', verifyPayment);
router.get('/status', getStatus);
router.post('/cancel', cancelSubscription);

module.exports = router;
