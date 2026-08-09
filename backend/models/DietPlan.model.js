const mongoose = require('mongoose');
const { Schema } = mongoose;

const mealSchema = new Schema({
  name: String, 
  description: String, 
  ingredients: [String], 
  calories: Number, 
  protein: Number, 
  carbs: Number, 
  fat: Number, 
  cookingTime: Number, 
  eaten: { type: Boolean, default: false }
}, { _id: false });

const dietPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  condition: String,
  targetKcal: Number,
  planStartDate: Date,
  planEndDate: Date,
  plan: [{
    day: Number,
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
    snack: mealSchema
  }],
  dietaryNotes: String,
  avoidFoods: [String],
  preferFoods: [String],
  generatedByAi: { type: Boolean, default: true },
  aiModel: { type: String, default: 'gemini-2.5-flash' },
  userRating: { type: Number, min: 1, max: 5 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

dietPlanSchema.index({ userId: 1, createdAt: -1 });
dietPlanSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
