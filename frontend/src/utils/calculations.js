/**
 * NutriVedic Nutrition & Physical Calculations Utility
 */

export const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
};

export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-amber-600' };
  if (bmi < 24.9) return { category: 'Normal weight', color: 'text-positive' };
  if (bmi < 29.9) return { category: 'Overweight', color: 'text-amber-600' };
  return { category: 'Obese', color: 'text-negative' };
};

export const calculateBMR = ({ weight, height, age, sex }) => {
  if (!weight || !height || !age) return 2000;
  // Mifflin-St Jeor Equation
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);

  if (sex === 'female') {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
};

export const calculateTDEE = ({ weight, height, age, sex, activityLevel }) => {
  const bmr = calculateBMR({ weight, height, age, sex });
  const multipliers = {
    sedentary: 1.2,
    moderate: 1.55,
    active: 1.725
  };
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
};

export const calculateTargetCalories = ({ tdee, goal }) => {
  if (!tdee) return 2000;
  switch (goal) {
    case 'weight_loss':
      return Math.round(tdee - 500);
    case 'muscle_gain':
      return Math.round(tdee + 300);
    case 'manage_disease':
      return Math.round(tdee - 200);
    case 'maintenance':
    default:
      return tdee;
  }
};

export const calculateMacros = (targetKcal) => {
  // Balanced Indian diet: 55% Carbs, 20% Protein, 25% Fat
  const carbsGrams = Math.round((targetKcal * 0.55) / 4);
  const proteinGrams = Math.round((targetKcal * 0.20) / 4);
  const fatGrams = Math.round((targetKcal * 0.25) / 9);
  const fiberGrams = Math.round((targetKcal / 1000) * 14); // ~14g per 1000 kcal

  return {
    carbs: carbsGrams,
    protein: proteinGrams,
    fat: fatGrams,
    fiber: fiberGrams
  };
};
