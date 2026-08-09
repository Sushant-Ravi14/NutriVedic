const User = require('../models/User.model');
const UserProfile = require('../models/UserProfile.model');
const WeightLog = require('../models/WeightLog.model');
const AuditLog = require('../models/AuditLog.model');
const { calcBMI, calcBMR, calcTDEE, calcTargetKcal, calcMacroTargets } = require('../utils/calculations');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    let profile = await UserProfile.findOne({ userId: req.user._id });
    
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user._id });
    }
    
    res.status(200).json({ success: true, user, profile });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new UserProfile({ userId: req.user._id });
    }

    const body = req.body || {};

    // Normalize field names from frontend variations
    const age = body.age || profile.age;
    const weightKg = Number(body.weightKg || body.weight || profile.weightKg || 70);
    const heightCm = Number(body.heightCm || body.height || profile.heightCm || 175);
    const gender = body.gender || body.sex || profile.gender || 'male';
    const activityLevel = body.activityLevel || profile.activityLevel || 'moderate';
    const goal = body.goal || profile.goal || 'maintain';
    const healthConditions = body.healthConditions || body.conditions || profile.healthConditions || [];

    const oldGoal = profile.goal;
    const oldConditions = (profile.healthConditions || []).join(',');
    const newConditions = (healthConditions || []).join(',');
    const conditionsChanged = oldGoal !== goal || oldConditions !== newConditions;

    profile.age = age;
    profile.weightKg = weightKg;
    profile.heightCm = heightCm;
    profile.gender = gender;
    profile.activityLevel = activityLevel;
    profile.goal = goal;
    profile.healthConditions = healthConditions;
    profile.dietaryPreferences = body.dietaryPreferences || profile.dietaryPreferences || [];
    profile.allergies = body.allergies || profile.allergies || [];
    profile.updatedAt = new Date();

    // Calculate health metrics
    if (weightKg && heightCm && age && gender) {
      profile.bmi = calcBMI ? calcBMI(weightKg, heightCm) : Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
      const bmr = calcBMR ? calcBMR(weightKg, heightCm, age, gender) : (10 * weightKg + 6.25 * heightCm - 5 * age + 5);
      profile.tdee = body.tdee || (calcTDEE ? calcTDEE(bmr, activityLevel) : Math.round(bmr * 1.375));
      profile.targetKcal = body.targetKcal || body.targetCalories || (calcTargetKcal ? calcTargetKcal(profile.tdee, goal) : profile.tdee);
      
      if (calcMacroTargets) {
        const macros = calcMacroTargets(profile.targetKcal, goal, weightKg);
        profile.proteinTargetG = macros.protein;
        profile.fatTargetG = macros.fat;
        profile.carbTargetG = macros.carbs;
      }
    }

    await profile.save();

    // Dynamically sync today's DailySummary target calories to match the new profile target
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const DailySummary = require('../models/DailySummary.model');
      const todaySummary = await DailySummary.findOne({ userId: req.user._id, date: todayDate });
      if (todaySummary) {
        todaySummary.targetCalories = profile.targetKcal;
        todaySummary.caloriesRemaining = profile.targetKcal - (todaySummary.totalCalories || 0);
        await todaySummary.save();
      }
    } catch (summaryErr) {
      console.warn('Could not sync today DailySummary target calories:', summaryErr.message);
    }

    // Trigger background diet plan regeneration if core health conditions changed
    if (conditionsChanged) {
      const DietPlan = require('../models/DietPlan.model');
      const { generateDietPlan } = require('../utils/gemini');

      DietPlan.updateMany({ userId: req.user._id }, { active: false }).then(() => {
        return generateDietPlan({
          age: profile.age || 30,
          gender: profile.gender || 'male',
          heightCm: profile.heightCm || 170,
          weightKg: profile.weightKg || 70,
          activityLevel: profile.activityLevel || 'moderate',
          goal: profile.goal || 'maintain',
          healthConditions: profile.healthConditions || [],
          targetKcal: profile.targetKcal || 2000,
          proteinTargetG: profile.proteinTargetG || 50
        });
      }).then((aiResponse) => {
        return DietPlan.create({
          userId: req.user._id,
          condition: profile.healthConditions ? profile.healthConditions.join(', ') : 'Healthy',
          targetKcal: profile.targetKcal,
          planStartDate: new Date(),
          planEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          plan: aiResponse.plan,
          dietaryNotes: aiResponse.dietaryNotes,
          avoidFoods: aiResponse.avoidFoods,
          preferFoods: aiResponse.preferFoods
        });
      }).catch(err => console.error("Background diet plan generation failed:", err));
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Update Profile Controller Error:', error);
    next(error);
  }
};

const addWeightLog = async (req, res, next) => {
  try {
    const { weightKg, weight, date } = req.body;
    const finalWeight = weightKg || weight;
    
    const weightLog = await WeightLog.create({
      userId: req.user._id,
      weightKg: finalWeight,
      date: date || new Date().toISOString().split('T')[0]
    });

    await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { weightKg: finalWeight },
      { new: true }
    );

    res.status(201).json({ success: true, weightLog });
  } catch (error) {
    next(error);
  }
};

const getPreferences = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id }).select('dietaryPreferences allergies healthConditions');
    res.status(200).json({ success: true, preferences: profile || {} });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { dietaryPreferences, allergies, healthConditions, conditions } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { dietaryPreferences, allergies, healthConditions: healthConditions || conditions },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, preferences: profile });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { accountStatus: 'deleted' });
    
    await AuditLog.create({
      userId: req.user._id,
      action: 'ACCOUNT_DELETE_SCHEDULED',
      details: { reason: 'User requested deletion' },
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Account scheduled for deletion' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, addWeightLog, getPreferences, updatePreferences, deleteAccount };
