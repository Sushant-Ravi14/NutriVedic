const express = require('express');
const router = express.Router();
const { createPlan, getCurrentPlan, getPlanById, handleSwapMeal, toggleEaten, exportPlan, ratePlan } = require('../controllers/dietPlan.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/generate', createPlan);
router.get('/current', getCurrentPlan);
router.get('/:planId', getPlanById);
router.put('/:planId/meal', handleSwapMeal);
router.put('/:planId/eaten', toggleEaten);
router.post('/:planId/export', exportPlan);
router.post('/:planId/rating', ratePlan);

module.exports = router;
