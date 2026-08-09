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
