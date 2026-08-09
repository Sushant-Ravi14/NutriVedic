const mongoose = require('mongoose');
const { Schema } = mongoose;

const userProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  age: Number,
  heightCm: Number,
  weightKg: Number,
  gender: { type: String },
  activityLevel: { type: String },
  healthConditions: [String],
  allergies: [String],
  dietaryPreferences: [String],
  goal: { type: String },
  targetWeightKg: Number,
  bmi: Number,
  tdee: Number,
  targetKcal: Number,
  proteinTargetG: Number,
  carbTargetG: Number,
  fatTargetG: Number,
  mealRemindersEnabled: { type: Boolean, default: true },
  reminderTimes: { type: [String], default: ['08:00','13:00','19:00'] },
  language: { type: String, default: 'en' },
  timezone: { type: String, default: 'Asia/Kolkata' },
  metricSystem: { type: String, default: 'metric' },
  privacyLevel: { type: String, default: 'private' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
