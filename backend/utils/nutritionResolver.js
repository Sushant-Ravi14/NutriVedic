/**
 * NutriVedic Nutrition Resolver
 * Waterfall: FoodCache → USDA → OpenFoodFacts → Gemini estimate
 * Returns normalized nutrition object + source label.
 */

const axios = require('axios');
const { searchFood } = require('./usda');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search OpenFoodFacts for a food item by name.
 * @param {string} query
 * @returns {object|null} normalized nutrition or null
 */
const searchOpenFoodFacts = async (query) => {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl`,
      {
        params: {
          search_terms: query,
          search_simple: 1,
          action: 'process',
          json: 1,
          page_size: 5
        },
        timeout: 5000
      }
    );

    const products = response.data?.products;
    if (!products || products.length === 0) return null;

    // Pick first product with nutriments
    const product = products.find(p => p.nutriments);
    if (!product) return null;

    const n = product.nutriments;
    return {
      calories: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0),
      protein: parseFloat((n['proteins_100g'] || 0).toFixed(1)),
      fat: parseFloat((n['fat_100g'] || 0).toFixed(1)),
      carbs: parseFloat((n['carbohydrates_100g'] || 0).toFixed(1)),
      fiber: parseFloat((n['fiber_100g'] || 0).toFixed(1)),
      sodium: parseFloat((n['sodium_100g'] || 0).toFixed(1)),
      standardServing: '100g'
    };
  } catch (error) {
    console.error('OpenFoodFacts Error:', error.message);
    return null;
  }
};

/**
 * Ask Gemini text model to estimate nutrition for a dish.
 * Used as last-resort fallback.
 * @param {string} foodName
 * @param {number} weightGrams
 * @returns {object} estimated nutrition
 */
const geminiNutritionEstimate = async (foodName, weightGrams = 100) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a certified nutritionist. 
Estimate the nutritional content for: "${foodName}" (portion: ${weightGrams}g).
Return ONLY valid JSON, no markdown, no explanation:
{
  "calories": number,
  "protein": number,
  "fat": number,
  "carbs": number,
  "fiber": number,
  "sodium": number,
  "standardServing": "${weightGrams}g"
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Nutrition Estimate Error:', error.message);
    // Return zeros as absolute fallback
    return {
      calories: 0, protein: 0, fat: 0, carbs: 0,
      fiber: 0, sodium: 0, standardServing: `${weightGrams}g`
    };
  }
};

/**
 * Resolve nutrition for a food item using a waterfall strategy.
 * Order: USDA → OpenFoodFacts → Gemini estimate
 *
 * @param {string} foodName
 * @param {number} weightGrams
 * @returns {{ nutrition: object, source: string }}
 */
const resolveNutrition = async (foodName, weightGrams = 100) => {
  // 1. Try USDA
  try {
    const usdaResults = await searchFood(foodName);
    if (usdaResults && usdaResults.length > 0) {
      const raw = usdaResults[0].nutrition;
      const scale = weightGrams / 100;
      return {
        nutrition: {
          calories: Math.round((raw.caloriesPer100g || 0) * scale),
          protein: parseFloat(((raw.proteinPer100g || 0) * scale).toFixed(1)),
          fat: parseFloat(((raw.fatPer100g || 0) * scale).toFixed(1)),
          carbs: parseFloat(((raw.carbsPer100g || 0) * scale).toFixed(1)),
          fiber: parseFloat(((raw.fiberPer100g || 0) * scale).toFixed(1)),
          sodium: 0,
          standardServing: `${weightGrams}g`
        },
        source: 'usda'
      };
    }
  } catch (e) {
    console.error('USDA resolve failed:', e.message);
  }

  // 2. Try OpenFoodFacts
  try {
    const offNutrition = await searchOpenFoodFacts(foodName);
    if (offNutrition) {
      const scale = weightGrams / 100;
      return {
        nutrition: {
          calories: Math.round(offNutrition.calories * scale),
          protein: parseFloat((offNutrition.protein * scale).toFixed(1)),
          fat: parseFloat((offNutrition.fat * scale).toFixed(1)),
          carbs: parseFloat((offNutrition.carbs * scale).toFixed(1)),
          fiber: parseFloat((offNutrition.fiber * scale).toFixed(1)),
          sodium: parseFloat((offNutrition.sodium * scale).toFixed(1)),
          standardServing: `${weightGrams}g`
        },
        source: 'off'
      };
    }
  } catch (e) {
    console.error('OpenFoodFacts resolve failed:', e.message);
  }

  // 3. Gemini estimate (last resort)
  const estimated = await geminiNutritionEstimate(foodName, weightGrams);
  return { nutrition: estimated, source: 'gemini_estimate' };
};

module.exports = { resolveNutrition, searchOpenFoodFacts };
