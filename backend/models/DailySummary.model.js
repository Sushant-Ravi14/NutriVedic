const mongoose = require('mongoose');
const { Schema } = mongoose;

const dailySummarySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  totalCalories: Number, 
  totalProtein: Number, 
  totalFat: Number,
  totalCarbs: Number, 
  totalFiber: Number,
  mealCount: Number,
  mealIds: [{ type: Schema.Types.ObjectId, ref: 'MealLog' }],
  targetCalories: Number,
  caloriesRemaining: Number,
  compliancePercentage: Number,
  status: { type: String, enum: ['under','on_track','over'] },
  waterGlasses: { type: Number, default: 0 }
});

dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailySummary', dailySummarySchema);
