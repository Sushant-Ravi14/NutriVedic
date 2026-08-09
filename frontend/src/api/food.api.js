import client from './client';

export const scanFoodImageApi = async (formData) => {
  const res = await client.post('/api/food/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const item = res.data?.data || res.data;
  return {
    name: item.dishName || item.name || 'Recognized Dish',
    confidence: Math.round(item.confidenceScore || item.confidence || 95),
    consumeScore: item.consumeScore || null,
    scoreVerdict: item.scoreVerdict || null,
    nutritionSource: item.nutritionSource || 'usda',
    servingSizeGrams: item.nutrition?.servingSizeGrams || item.meta?.estimatedWeightGrams || item.servingSizeGrams || 250,
    calories: item.nutrition?.calories || item.calories || 320,
    protein: item.nutrition?.protein || item.protein || 14,
    carbs: item.nutrition?.carbs || item.carbs || 38,
    fat: item.nutrition?.fat || item.fat || 12,
    fiber: item.nutrition?.fiber || item.fiber || 5,
    sodium: item.nutrition?.sodium || item.sodium || 0,
    calcium: item.nutrition?.calcium || item.calcium || 0,
    iron: item.nutrition?.iron || item.iron || 0,
    vitaminC: item.nutrition?.vitaminC || item.vitaminC || 0,
    glycemicIndex: item.glycemicIndex || 'Low (42)',
    ayurvedicImpact: item.ayurvedicImpact || 'Tridoshic Balance',
    healthFeedback: item.meta?.healthFeedback || item.healthFeedback || null
  };
};

export const searchFoodApi = async (query) => {
  const res = await client.get(`/api/search/food?q=${encodeURIComponent(query)}`);
  const items = res.data?.data || res.data || [];
  return items.map((item) => {
    const nut = item.nutrition || {};
    return {
      id: item.id || item._id || item.fdcId || item.name || item.dishName,
      name: item.name || item.dishName || 'Unknown Item',
      calories: Math.round(nut.calories || nut.caloriesPer100g || item.calories || 0),
      protein: parseFloat((nut.protein || nut.proteinPer100g || item.protein || 0).toFixed(1)),
      carbs: parseFloat((nut.carbs || nut.carbsPer100g || item.carbs || 0).toFixed(1)),
      fat: parseFloat((nut.fat || nut.fatPer100g || item.fat || 0).toFixed(1)),
      fiber: parseFloat((nut.fiber || nut.fiberPer100g || item.fiber || 0).toFixed(1)),
      sodium: parseFloat((nut.sodium || nut.sodiumPer100g || item.sodium || 0).toFixed(1)),
      calcium: parseFloat((nut.calcium || nut.calciumPer100g || item.calcium || 0).toFixed(1)),
      iron: parseFloat((nut.iron || nut.ironPer100g || item.iron || 0).toFixed(1)),
      vitaminC: parseFloat((nut.vitaminC || nut.vitaminCPer100g || item.vitaminC || 0).toFixed(1)),
      serving: item.serving || '100g serving',
      source: item.source || 'usda'
    };
  });
};

export const getScanHistoryApi = async () => {
  const res = await client.get('/api/food/history');
  return res.data?.data || res.data;
};
