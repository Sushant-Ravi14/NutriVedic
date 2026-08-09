const calcBMR = (weightKg, heightCm, age, gender) => {
  if (gender === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else if (gender === 'female') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }
  // Fallback for 'other' - average of male and female
  return ((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 78);
};

const calcTDEE = (bmr, activityLevel) => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    intense: 1.725,
    very_intense: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

const calcTargetKcal = (tdee, goal) => {
  const adjustments = {
    weight_loss: -500,
    weight_gain: 300,
    maintain: 0,
    manage_disease: -200
  };
  return tdee + (adjustments[goal] || 0);
};

const calcBMI = (weightKg, heightCm) => {
  return Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
};

const getBMICategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi >= 18.5 && bmi <= 24.9) return 'Healthy';
  if (bmi >= 25 && bmi <= 29.9) return 'Overweight';
  return 'Obese';
};

const calcMacroTargets = (targetKcal, goal, weightKg) => {
  let proteinFactor = 1.2;
  if (goal === 'weight_loss' || goal === 'weight_gain') {
    proteinFactor = 1.6;
  }
  
  const protein = Math.round(weightKg * proteinFactor);
  const proteinKcal = protein * 4;
  
  const fatKcal = Math.round(targetKcal * 0.25);
  const fat = Math.round(fatKcal / 9);
  
  const remainingKcal = targetKcal - proteinKcal - fatKcal;
  const carbs = Math.round(remainingKcal / 4);
  
  return { protein, fat, carbs, fiber: 30 }; // Fiber 25-35g flat
};

const calcDailyCompliance = (loggedKcal, targetKcal) => {
  if (!targetKcal || targetKcal === 0) return { percentage: 0, status: 'under' };
  
  const percentage = Math.round((loggedKcal / targetKcal) * 100);
  let status = 'under';
  
  if (percentage >= 90 && percentage <= 110) {
    status = 'on_track';
  } else if (percentage > 110) {
    status = 'over';
  }
  
  return { percentage, status };
};

const calcNutritionPerWeight = (nutritionPer100g, weightGrams) => {
  const scale = weightGrams / 100;
  const result = {};
  for (const [key, value] of Object.entries(nutritionPer100g)) {
    if (typeof value === 'number') {
      result[key] = Number((value * scale).toFixed(1));
    }
  }
  return result;
};

module.exports = {
  calcBMR,
  calcTDEE,
  calcTargetKcal,
  calcBMI,
  getBMICategory,
  calcMacroTargets,
  calcDailyCompliance,
  calcNutritionPerWeight
};
