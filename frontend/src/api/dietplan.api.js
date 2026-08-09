import client from './client';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Normalizes backend DietPlan format into what frontend components expect.
 */
const mapBackendPlanToFrontend = (backendData) => {
  if (!backendData) return null;

  // Extract inner data if response is nested
  const planData = backendData.data || backendData;

  if (!planData || !planData.plan) return null;

  const mappedDays = planData.plan.map((d) => {
    // Backend d.day is 1-indexed number (1 = Monday)
    const dayName = DAYS_OF_WEEK[d.day - 1] || `Day ${d.day}`;
    const meals = [];

    // Map each meal slot
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach((slot) => {
      const meal = d[slot];
      if (meal) {
        meals.push({
          id: slot,
          name: meal.name,
          description: meal.description,
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fat: meal.fat || 0,
          cookingTime: meal.cookingTime || 0,
          eaten: meal.eaten || false,
          ingredients: meal.ingredients || []
        });
      }
    });

    return {
      day: dayName,
      meals
    };
  });

  return {
    id: planData._id,
    title: planData.title || `${planData.condition || 'Ayurvedic'} Plan`,
    description: planData.description || `Custom glycemic plan tailored for ${planData.condition || 'your health targets'}.`,
    conditions: planData.condition ? planData.condition.split(', ') : [],
    days: mappedDays,
    notes: planData.dietaryNotes || '',
    avoidFoods: planData.avoidFoods || [],
    preferFoods: planData.preferFoods || [],
    targetKcal: planData.targetKcal || 2000
  };
};

export const getCurrentDietPlanApi = async () => {
  const res = await client.get('/api/diet/current');
  return mapBackendPlanToFrontend(res.data);
};

export const generatePlanApi = async (preferences) => {
  const res = await client.post('/api/diet/generate', preferences);
  return mapBackendPlanToFrontend(res.data);
};

export const swapMealApi = async ({ planId, day, mealId }) => {
  const targetPlanId = planId || 'current';
  // Map day name string to 1-indexed number
  const dayNumber = DAYS_OF_WEEK.indexOf(day) + 1;
  const res = await client.put(`/api/diet/${targetPlanId}/meal`, {
    day: dayNumber > 0 ? dayNumber : 1,
    slot: mealId
  });
  return res.data;
};

export const toggleMealEatenApi = async ({ planId, day, mealId, eaten }) => {
  const targetPlanId = planId || 'current';
  // Map day name string to 1-indexed number
  const dayNumber = DAYS_OF_WEEK.indexOf(day) + 1;
  const res = await client.put(`/api/diet/${targetPlanId}/eaten`, {
    day: dayNumber > 0 ? dayNumber : 1,
    slot: mealId,
    eaten
  });
  return res.data;
};
