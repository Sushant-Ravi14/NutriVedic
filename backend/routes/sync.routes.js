const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder for sync logic
const syncData = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Sync complete' });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, lastSync: new Date() });
  } catch (error) {
    next(error);
  }
};

router.use(protect);
router.post('/', syncData);
router.get('/status', getStatus);

module.exports = router;
