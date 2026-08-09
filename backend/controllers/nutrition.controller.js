const MealLog = require('../models/MealLog.model');
const DailySummary = require('../models/DailySummary.model');
const UserProfile = require('../models/UserProfile.model');
const { calcDailyCompliance } = require('../utils/calculations');

const logMeal = async (req, res, next) => {
  try {
    const date = req.body.date || new Date().toISOString().split('T')[0];
    
    // Support frontend grouped items payload
    if (req.body.items && req.body.items.length > 0) {
      const mealType = (req.body.slot || 'breakfast').toLowerCase();
      const savedMeals = [];
      
      for (const item of req.body.items) {
        const meal = await MealLog.create({
          userId: req.user._id,
          mealType: mealType === 'snacks' ? 'snack' : mealType,
          foodName: item.name || item.foodName || 'Unknown Dish',
          quantity: item.grams || item.quantity || 100,
          unit: item.unit || 'grams',
          source: req.body.source || 'manual',
          nutrition: {
            calories: item.calories || 0,
            protein: item.protein || 0,
            fat: item.fat || 0,
            carbs: item.carbs || 0,
            fiber: item.fiber || 0,
            sodium: item.sodium || 0,
            calcium: item.calcium || 0,
            iron: item.iron || 0,
            vitaminC: item.vitaminC || 0
          },
          date
        });
        savedMeals.push(meal);
      }
      
      await updateDailySummary(req.user._id, date);
      return res.status(201).json({ success: true, data: savedMeals[0] });
    }

    // Support flat payload fallback
    const { mealType, foodName, quantity, unit, source, nutrition, date: flatDate } = req.body;
    const meal = await MealLog.create({
      userId: req.user._id,
      mealType, foodName, quantity, unit, source, nutrition, date: flatDate || date
    });

    await updateDailySummary(req.user._id, date);
    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    next(error);
  }
};

const getDailySummary = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const summary = await DailySummary.findOne({ userId: req.user._id, date }).populate('mealIds');
    const flatMeals = await MealLog.find({ userId: req.user._id, date }).sort({ timestamp: 1 });

    // Group meals by slots: Breakfast, Lunch, Snacks, Dinner
    const slotsMap = {
      breakfast: { slot: 'Breakfast', items: [] },
      lunch: { slot: 'Lunch', items: [] },
      snacks: { slot: 'Snacks', items: [] },
      dinner: { slot: 'Dinner', items: [] }
    };

    flatMeals.forEach(meal => {
      const type = (meal.mealType || 'breakfast').toLowerCase();
      const slotKey = type === 'snack' ? 'snacks' : type;
      if (slotsMap[slotKey]) {
        slotsMap[slotKey].items.push({
          id: meal._id,
          name: meal.foodName,
          calories: meal.nutrition?.calories || 0,
          protein: meal.nutrition?.protein || 0,
          carbs: meal.nutrition?.carbs || 0,
          fat: meal.nutrition?.fat || 0,
          fiber: meal.nutrition?.fiber || 0,
          sodium: meal.nutrition?.sodium || 0,
          calcium: meal.nutrition?.calcium || 0,
          iron: meal.nutrition?.iron || 0,
          vitaminC: meal.nutrition?.vitaminC || 0,
          grams: meal.quantity || 100
        });
      }
    });

    const meals = Object.values(slotsMap);

    res.status(200).json({ success: true, summary, meals });
  } catch (error) {
    next(error);
  }
};

const getWeeklyReport = async (req, res, next) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const summaries = await DailySummary.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo.toISOString().split('T')[0], $lte: today.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    res.status(200).json({ success: true, data: summaries });
  } catch (error) {
    next(error);
  }
};

const getMonthlyReport = async (req, res, next) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const summaries = await DailySummary.find({
      userId: req.user._id,
      date: { $gte: thirtyDaysAgo.toISOString().split('T')[0], $lte: today.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    res.status(200).json({ success: true, data: summaries });
  } catch (error) {
    next(error);
  }
};

const getMealHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { mealType, startDate, endDate } = req.query;

    const query = { userId: req.user._id };
    if (mealType) query.mealType = mealType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const meals = await MealLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ success: true, data: meals });
  } catch (error) {
    next(error);
  }
};

const updateMeal = async (req, res, next) => {
  try {
    const meal = await MealLog.findOneAndUpdate(
      { _id: req.params.mealId, userId: req.user._id },
      { ...req.body, edited: true, editedAt: new Date() },
      { new: true }
    );
    
    if (!meal) return res.status(404).json({ success: false, error: 'Meal not found' });
    
    await updateDailySummary(req.user._id, meal.date);
    res.status(200).json({ success: true, data: meal });
  } catch (error) {
    next(error);
  }
};

const deleteMeal = async (req, res, next) => {
  try {
    const meal = await MealLog.findOneAndDelete({ _id: req.params.mealId, userId: req.user._id });
    if (!meal) return res.status(404).json({ success: false, error: 'Meal not found' });
    
    await updateDailySummary(req.user._id, meal.date);
    res.status(200).json({ success: true, message: 'Meal deleted' });
  } catch (error) {
    next(error);
  }
};

const getCompliance = async (req, res, next) => {
  try {
    // Calculate streak
    const summaries = await DailySummary.find({ userId: req.user._id }).sort({ date: -1 }).limit(30);
    let streak = 0;
    
    for (const summary of summaries) {
      if (summary.status === 'on_track') {
        streak++;
      } else {
        break;
      }
    }
    
    res.status(200).json({ success: true, streak });
  } catch (error) {
    next(error);
  }
};

// Helper function
async function updateDailySummary(userId, date) {
  const profile = await UserProfile.findOne({ userId });
  const meals = await MealLog.find({ userId, date });
  
  let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0, totalFiber = 0;
  
  meals.forEach(meal => {
    if (meal.nutrition) {
      totalCalories += meal.nutrition.calories || 0;
      totalProtein += meal.nutrition.protein || 0;
      totalFat += meal.nutrition.fat || 0;
      totalCarbs += meal.nutrition.carbs || 0;
      totalFiber += meal.nutrition.fiber || 0;
    }
  });

  const targetCalories = profile ? profile.targetKcal : 2000;
  const compliance = calcDailyCompliance(totalCalories, targetCalories);

  await DailySummary.findOneAndUpdate(
    { userId, date },
    {
      totalCalories, totalProtein, totalFat, totalCarbs, totalFiber,
      mealCount: meals.length,
      mealIds: meals.map(m => m._id),
      targetCalories,
      caloriesRemaining: targetCalories - totalCalories,
      compliancePercentage: compliance.percentage,
      status: compliance.status
    },
    { upsert: true, new: true }
  );
}

const updateWater = async (req, res, next) => {
  try {
    const { glasses } = req.body;
    const date = new Date().toISOString().split('T')[0];

    const summary = await DailySummary.findOneAndUpdate(
      { userId: req.user._id, date },
      { waterGlasses: glasses },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

module.exports = { logMeal, getDailySummary, getWeeklyReport, getMonthlyReport, getMealHistory, updateMeal, deleteMeal, getCompliance, updateWater };
