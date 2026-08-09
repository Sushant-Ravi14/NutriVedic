import client from './client';

export const getCurrentDietPlanApi = async () => {
  const res = await client.get('/api/diet/current');
  return res.data;
};

export const generatePlanApi = async (preferences) => {
  const res = await client.post('/api/diet/generate', preferences);
  return res.data;
};

export const swapMealApi = async ({ planId, day, mealId }) => {
  const res = await client.put(`/api/diet/${planId}/meal`, { day, mealId });
  return res.data;
};

export const toggleMealEatenApi = async ({ planId, day, mealId, eaten }) => {
  const res = await client.put(`/api/diet/${planId}/eaten`, { day, mealId, eaten });
  return res.data;
};
