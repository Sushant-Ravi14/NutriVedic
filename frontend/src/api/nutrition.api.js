import client from './client';

export const getFoodLogApi = async (date) => {
  const res = await client.get(`/api/nutrition/daily?date=${date}`);
  return res.data;
};

export const logMealApi = async (mealData) => {
  const res = await client.post('/api/nutrition/log', mealData);
  return res.data;
};

export const deleteMealItemApi = async (itemId) => {
  const res = await client.delete(`/api/nutrition/meal/${itemId}`);
  return res.data;
};

export const updateWaterApi = async (glasses) => {
  const res = await client.patch('/api/nutrition/water', { glasses });
  return res.data;
};

export const getMealHistoryApi = async () => {
  const res = await client.get('/api/nutrition/history');
  return res.data;
};

export const getWeeklyReportApi = async () => {
  const res = await client.get('/api/nutrition/weekly');
  return res.data;
};
