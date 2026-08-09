import client from './client';

export const scanFoodImageApi = async (formData) => {
  const res = await client.post('/api/food/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const item = res.data?.data || res.data;
  return {
    name: item.dishName || item.name || 'Recognized Dish',
    confidence: Math.round(item.confidenceScore || item.confidence || 95),
    servingSizeGrams: item.nutrition?.servingSizeGrams || item.servingSizeGrams || 250,
    calories: item.nutrition?.calories || item.calories || 320,
    protein: item.nutrition?.protein || item.protein || 14,
    carbs: item.nutrition?.carbs || item.carbs || 38,
    fat: item.nutrition?.fat || item.fat || 12,
    fiber: item.nutrition?.fiber || item.fiber || 5,
    glycemicIndex: item.glycemicIndex || 'Low (42)',
    ayurvedicImpact: item.ayurvedicImpact || 'Tridoshic Balance'
  };
};

export const searchFoodApi = async (query) => {
  const res = await client.get(`/api/search/food?q=${encodeURIComponent(query)}`);
  return res.data?.data || res.data;
};

export const getScanHistoryApi = async () => {
  const res = await client.get('/api/food/history');
  return res.data?.data || res.data;
};
