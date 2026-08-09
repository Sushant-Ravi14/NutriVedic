const mongoose = require('mongoose');
const { Schema } = mongoose;

const mealLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: ['breakfast','lunch','dinner','snack'], required: true },
  foodName: { type: String, required: true },
  quantity: Number,
  unit: { type: String, default: 'grams' },
  source: { type: String, enum: ['manual','camera_scan','barcode','template'] },
  nutrition: {
    calories: Number, 
    protein: Number, 
    fat: Number,
    carbs: Number, 
    fiber: Number, 
    sodium: Number,
    calcium: Number,
    iron: Number,
    vitaminC: Number
  },
  mealPhotoUrl: String,
  date: { type: String, required: true }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  editedAt: Date,
  notes: String,
  confidenceScore: Number,
  userConfirmed: { type: Boolean, default: false }
});

mealLogSchema.index({ userId: 1, date: 1 });
mealLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('MealLog', mealLogSchema);
