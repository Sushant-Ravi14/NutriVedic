const DietPlan = require('../models/DietPlan.model');
const UserProfile = require('../models/UserProfile.model');
const { generateDietPlan, swapMeal } = require('../utils/gemini');
const { generateDietPlanPDF } = require('../utils/pdf');

const createPlan = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(400).json({ success: false, error: 'Please complete your profile first' });

    // Mark previous plans as inactive
    await DietPlan.updateMany({ userId: req.user._id }, { active: false });

    // Call Gemini AI
    const aiResponse = await generateDietPlan({
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

    const plan = await DietPlan.create({
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

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const getCurrentPlan = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ userId: req.user._id, active: true });
    if (!plan) return res.status(404).json({ success: false, error: 'No active diet plan found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const getPlanById = async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({ _id: req.params.planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

const handleSwapMeal = async (req, res, next) => {
  try {
    const { day, slot } = req.body;
    const query = req.params.planId === 'current'
      ? { userId: req.user._id, active: true }
      : { _id: req.params.planId, userId: req.user._id };
    const plan = await DietPlan.findOne(query);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    const profile = await UserProfile.findOne({ userId: req.user._id });
    
    const dayPlan = plan.plan.find(p => p.day === day);
    if (!dayPlan || !dayPlan[slot]) return res.status(400).json({ success: false, error: 'Invalid day or slot' });

    const existingMealName = dayPlan[slot].name;
    const newMeal = await swapMeal(profile, day, slot, existingMealName);

    dayPlan[slot] = newMeal;
    
    // Mongoose array subdoc update flag
    plan.markModified('plan');
    await plan.save();

    res.status(200).json({ success: true, data: dayPlan[slot] });
  } catch (error) {
    next(error);
  }
};

const toggleEaten = async (req, res, next) => {
  try {
    const { day, slot, eaten } = req.body;
    const query = req.params.planId === 'current'
      ? { userId: req.user._id, active: true }
      : { _id: req.params.planId, userId: req.user._id };
    const plan = await DietPlan.findOne(query);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    const dayPlan = plan.plan.find(p => p.day === day);
    if (dayPlan && dayPlan[slot]) {
      dayPlan[slot].eaten = eaten;
      plan.markModified('plan');
      await plan.save();
    }

    res.status(200).json({ success: true, message: 'Updated' });
  } catch (error) {
    next(error);
  }
};

const exportPlan = async (req, res, next) => {
  try {
    const query = req.params.planId === 'current'
      ? { userId: req.user._id, active: true }
      : { _id: req.params.planId, userId: req.user._id };
    const plan = await DietPlan.findOne(query);
    const profile = await UserProfile.findOne({ userId: req.user._id });
    
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });

    const pdfUrl = await generateDietPlanPDF(plan, profile);
    res.status(200).json({ success: true, url: pdfUrl });
  } catch (error) {
    next(error);
  }
};

const ratePlan = async (req, res, next) => {
  try {
    const query = req.params.planId === 'current'
      ? { userId: req.user._id, active: true }
      : { _id: req.params.planId, userId: req.user._id };
    const plan = await DietPlan.findOneAndUpdate(
      query,
      { userRating: req.body.rating },
      { new: true }
    );
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPlan, getCurrentPlan, getPlanById, handleSwapMeal, toggleEaten, exportPlan, ratePlan };
