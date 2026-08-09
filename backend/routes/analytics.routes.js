const express = require('express');
const router = express.Router();
const { getDashboard, getWeekly, getMonthly, getTrends, exportData } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);
router.get('/trends', getTrends);
router.post('/export', exportData);

module.exports = router;
