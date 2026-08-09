import client from './client';

export const scanBarcodeApi = async (barcode) => {
  const res = await client.get(`/api/barcode/${barcode}`);
  const item = res.data?.data || res.data;
  return {
    name: item.productName || item.name || `Scanned Item (${barcode})`,
    brand: item.brand || '',
    confidence: 100,
    servingSizeGrams: 100,
    calories: item.nutrition?.caloriesPer100g || item.calories || 60,
    protein: item.nutrition?.proteinPer100g || item.protein || 3.2,
    carbs: item.nutrition?.carbsPer100g || item.carbs || 4.8,
    fat: item.nutrition?.fatPer100g || item.fat || 3.0,
    fiber: item.nutrition?.fiberPer100g || item.fiber || 0,
    glycemicIndex: 'Low'
  };
};
