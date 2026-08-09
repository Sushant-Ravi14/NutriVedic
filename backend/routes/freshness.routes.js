const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { logFreshness, getInventory, getAlerts, deleteInventoryItem, getImpact } = require('../controllers/freshness.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/log', upload.single('image'), logFreshness);
router.get('/inventory', getInventory);
router.get('/alerts', getAlerts);
router.delete('/:itemId', deleteInventoryItem);
router.get('/impact', getImpact);

module.exports = router;
