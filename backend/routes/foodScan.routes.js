const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { scanFoodPhoto, getScanHistory, submitFeedback, getTrending } = require('../controllers/foodScan.controller');
const { protect } = require('../middleware/auth.middleware');
const { scanLimiter } = require('../middleware/rateLimiter.middleware');

router.use(protect);

router.post('/scan', scanLimiter, upload.single('image'), scanFoodPhoto);
router.get('/history', getScanHistory);
router.post('/scan/:scanId/feedback', submitFeedback);
router.get('/trending', getTrending);

module.exports = router;
