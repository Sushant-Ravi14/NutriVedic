const UserProfile = require('../models/UserProfile.model');
const { calcBMR, calcTDEE, calcTargetKcal, calcMacroTargets } = require('../utils/calculations');

const createHealthProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const getCalculatedTDEE = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile || !profile.weightKg || !profile.heightCm || !profile.age) {
      return res.status(400).json({ success: false, error: 'Profile incomplete' });
    }
    
    const bmr = calcBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
    const tdee = calcTDEE(bmr, profile.activityLevel);
    
    res.status(200).json({ success: true, tdee, bmr });
  } catch (error) {
    next(error);
  }
};

const updateGoals = async (req, res, next) => {
  try {
    const { goal, targetWeightKg } = req.body;
    let profile = await UserProfile.findOne({ userId: req.user._id });
    
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    
    profile.goal = goal;
    if (targetWeightKg) profile.targetWeightKg = targetWeightKg;
    
    if (profile.tdee) {
      profile.targetKcal = calcTargetKcal(profile.tdee, goal);
      const macros = calcMacroTargets(profile.targetKcal, goal, profile.weightKg);
      profile.proteinTargetG = macros.protein;
      profile.fatTargetG = macros.fat;
      profile.carbTargetG = macros.carbs;
    }
    
    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

const getTargets = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id }).select('targetKcal proteinTargetG fatTargetG carbTargetG targetWeightKg');
    res.status(200).json({ success: true, targets: profile });
  } catch (error) {
    next(error);
  }
};

const saveFoodPreferences = async (req, res, next) => {
  try {
    const { dietaryPreferences, allergies } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { dietaryPreferences, allergies },
      { new: true }
    );
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { createHealthProfile, getCalculatedTDEE, updateGoals, getTargets, saveFoodPreferences };
