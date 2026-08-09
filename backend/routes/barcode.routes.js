const express = require('express');
const router = express.Router();
const { scanBarcode, getBarcodeInfo, verifyBarcode, submitUnknown } = require('../controllers/barcode.controller');
const { protect } = require('../middleware/auth.middleware');
const { scanLimiter } = require('../middleware/rateLimiter.middleware');
const { cacheResponse } = require('../middleware/cache.middleware');

router.use(protect);

router.post('/scan', scanLimiter, scanBarcode);
router.get('/:barcode', cacheResponse(86400), getBarcodeInfo); // Cache 24 hours
router.post('/:barcode/verify', verifyBarcode);
router.post('/unknown', submitUnknown);

module.exports = router;
