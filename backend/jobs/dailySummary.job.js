const cron = require('node-cron');
const User = require('../models/User.model');
const MealLog = require('../models/MealLog.model');
const DailySummary = require('../models/DailySummary.model');
const UserProfile = require('../models/UserProfile.model');
const { calcDailyCompliance } = require('../utils/calculations');

// Run every night at 11:55 PM IST (18:25 UTC)
const startDailySummaryJob = () => {
  cron.schedule('25 18 * * *', async () => {
    console.log('Running daily summary job...');
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const activeUsers = await MealLog.distinct('userId', { date: today });
      
      for (const userId of activeUsers) {
        const profile = await UserProfile.findOne({ userId });
        const meals = await MealLog.find({ userId, date: today });
        
        let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0, totalFiber = 0;
        meals.forEach(m => {
          if (m.nutrition) {
            totalCalories += m.nutrition.calories || 0;
            totalProtein += m.nutrition.protein || 0;
            totalFat += m.nutrition.fat || 0;
            totalCarbs += m.nutrition.carbs || 0;
            totalFiber += m.nutrition.fiber || 0;
          }
        });

        const targetCalories = profile ? profile.targetKcal : 2000;
        const compliance = calcDailyCompliance(totalCalories, targetCalories);

        await DailySummary.findOneAndUpdate(
          { userId, date: today },
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
      console.log('Daily summary job completed');
    } catch (error) {
      console.error('Daily Summary Job Error:', error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });
};

module.exports = { startDailySummaryJob };
