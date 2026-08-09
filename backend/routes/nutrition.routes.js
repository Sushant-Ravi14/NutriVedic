const express = require('express');
const router = express.Router();
const { logMeal, getDailySummary, getWeeklyReport, getMonthlyReport, getMealHistory, updateMeal, deleteMeal, getCompliance, updateWater } = require('../controllers/nutrition.controller');
const { protect } = require('../middleware/auth.middleware');
const { mealLogValidator } = require('../utils/validators');
const { validate } = require('../middleware/validate.middleware');

router.use(protect);

router.post('/log', mealLogValidator, validate, logMeal);
router.get('/daily', getDailySummary);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/history', getMealHistory);
router.put('/meal/:mealId', updateMeal);
router.delete('/meal/:mealId', deleteMeal);
router.get('/compliance', getCompliance);
router.patch('/water', updateWater);

module.exports = router;
