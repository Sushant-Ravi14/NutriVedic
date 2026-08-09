const axios = require('axios');

const searchFood = async (query) => {
  try {
    const response = await axios.post(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}`, {
      query,
      dataType: ['Survey (FNDDS)', 'SR Legacy'],
      pageSize: 10
    });

    if (!response.data || !response.data.foods) {
      return [];
    }

    return response.data.foods.map(food => {
      const nutrients = food.foodNutrients || [];
      const getNutrient = (name) => {
        const n = nutrients.find(x => x.nutrientName.toLowerCase().includes(name));
        return n ? n.value : 0;
      };

      return {
        fdcId: food.fdcId,
        productName: food.description,
        nutrition: {
          caloriesPer100g: getNutrient('energy'),
          proteinPer100g: getNutrient('protein'),
          fatPer100g: getNutrient('total lipid (fat)'),
          carbsPer100g: getNutrient('carbohydrate, by difference'),
          fiberPer100g: getNutrient('fiber, total dietary')
        },
        source: 'usda'
      };
    });
  } catch (error) {
    console.error('USDA Search Error:', error.message);
    return [];
  }
};

const getNutritionByFdcId = async (fdcId, weightGrams = 100) => {
  try {
    const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${process.env.USDA_API_KEY}`);
    const food = response.data;
    
    if (!food) return null;

    const nutrients = food.foodNutrients || [];
    const getNutrient = (name) => {
      const n = nutrients.find(x => x.nutrient && x.nutrient.name.toLowerCase().includes(name));
      const amount = n ? n.amount : 0;
      return Number(((amount * weightGrams) / 100).toFixed(1));
    };

    return {
      fdcId: food.fdcId,
      productName: food.description,
      nutrition: {
        calories: getNutrient('energy'),
        protein: getNutrient('protein'),
        fat: getNutrient('total lipid (fat)'),
        carbs: getNutrient('carbohydrate, by difference'),
        fiber: getNutrient('fiber, total dietary'),
        sodium: getNutrient('sodium')
      }
    };
  } catch (error) {
    console.error('USDA Get Food Error:', error.message);
    return null;
  }
};

module.exports = { searchFood, getNutritionByFdcId };
