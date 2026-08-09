const express = require('express');
const router = express.Router();
const { createHealthProfile, getCalculatedTDEE, updateGoals, getTargets, saveFoodPreferences } = require('../controllers/personalization.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/profile', createHealthProfile);
router.get('/tdee', getCalculatedTDEE);
router.put('/goals', updateGoals);
router.get('/targets', getTargets);
router.post('/preferences', saveFoodPreferences);

module.exports = router;
