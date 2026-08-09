const DailySummary = require('../models/DailySummary.model');
const WeightLog = require('../models/WeightLog.model');
const MealLog = require('../models/MealLog.model');

const getDashboard = async (req, res, next) => {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    const todaySummary = await DailySummary.findOne({ userId: req.user._id, date: todayDate });
    
    const summaries = await DailySummary.find({ userId: req.user._id }).sort({ date: -1 }).limit(30);
    
    let currentStreak = 0;
    for (const sum of summaries) {
      if (sum.status === 'on_track') currentStreak++;
      else break;
    }

    const totalMeals = await MealLog.countDocuments({ userId: req.user._id });
    
    const weightTrend = await WeightLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(5);

    res.status(200).json({ 
      success: true, 
      today: todaySummary, 
      currentStreak, 
      totalMeals, 
      weightTrend 
    });
  } catch (error) {
    next(error);
  }
};

const getWeekly = async (req, res, next) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    
    const summaries = await DailySummary.find({
      userId: req.user._id,
      date: { $gte: date.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    const avgCompliance = summaries.reduce((acc, curr) => acc + curr.compliancePercentage, 0) / (summaries.length || 1);

    res.status(200).json({ success: true, data: summaries, avgCompliance: Math.round(avgCompliance) });
  } catch (error) {
    next(error);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    
    const summaries = await DailySummary.find({
      userId: req.user._id,
      date: { $gte: date.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    res.status(200).json({ success: true, data: summaries });
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const weightTrend = await WeightLog.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(60);

    const topFoods = await MealLog.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$foodName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({ success: true, weightTrend, topFoods });
  } catch (error) {
    next(error);
  }
};

const exportData = async (req, res, next) => {
  try {
    // Generate PDF placeholder
    res.status(200).json({ success: true, url: 'https://example.com/report.pdf' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getWeekly, getMonthly, getTrends, exportData };
