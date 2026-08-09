const User = require('../models/User.model');
const UserProfile = require('../models/UserProfile.model');
const WeightLog = require('../models/WeightLog.model');
const AuditLog = require('../models/AuditLog.model');
const { calcBMI, getBMICategory, calcBMR, calcTDEE, calcTargetKcal, calcMacroTargets } = require('../utils/calculations');

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

    const updates = req.body;
    Object.assign(profile, updates);

    // Recalculate health metrics if relevant fields changed
    if (profile.weightKg && profile.heightCm && profile.age && profile.gender && profile.activityLevel && profile.goal) {
      profile.bmi = calcBMI(profile.weightKg, profile.heightCm);
      const bmr = calcBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
      profile.tdee = calcTDEE(bmr, profile.activityLevel);
      profile.targetKcal = calcTargetKcal(profile.tdee, profile.goal);
      
      const macros = calcMacroTargets(profile.targetKcal, profile.goal, profile.weightKg);
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

const addWeightLog = async (req, res, next) => {
  try {
    const { weightKg, date } = req.body;
    
    const weightLog = await WeightLog.create({
      userId: req.user._id,
      weightKg,
      date: date || new Date().toISOString().split('T')[0]
    });

    await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { weightKg },
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
    const { dietaryPreferences, allergies, healthConditions } = req.body;
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { dietaryPreferences, allergies, healthConditions },
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
