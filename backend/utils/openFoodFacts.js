const axios = require('axios');

const lookupBarcode = async (barcode) => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = response.data;
    
    if (data.status !== 1) {
      return null;
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    return {
      barcode: product.id,
      productName: product.product_name || 'Unknown Product',
      brand: product.brands || 'Unknown Brand',
      imageUrl: product.image_url || product.image_front_url,
      nutrition: {
        caloriesPer100g: nutriments['energy-kcal_100g'] || 0,
        proteinPer100g: nutriments.proteins_100g || 0,
        fatPer100g: nutriments.fat_100g || 0,
        carbsPer100g: nutriments.carbohydrates_100g || 0,
        fiberPer100g: nutriments.fiber_100g || 0,
        sodiumPer100g: nutriments.sodium_100g || 0,
        servingSize: product.serving_size || '100g',
      },
      ingredients: product.ingredients_text ? product.ingredients_text.split(',').map(i => i.trim()) : [],
      allergens: product.allergens_tags ? product.allergens_tags.map(a => a.replace('en:', '')) : [],
      novaGroup: product.nova_group,
      source: 'open_food_facts'
    };
  } catch (error) {
    console.error('OpenFoodFacts Error:', error.message);
    return null;
  }
};

const searchProduct = async (query) => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&countries_tags=en:india&page_size=10`);
    
    if (!response.data || !response.data.products) {
      return [];
    }

    return response.data.products.map(product => {
      const nutriments = product.nutriments || {};
      return {
        barcode: product.id,
        productName: product.product_name,
        brand: product.brands,
        nutrition: {
          caloriesPer100g: nutriments['energy-kcal_100g'] || 0,
          proteinPer100g: nutriments.proteins_100g || 0,
          fatPer100g: nutriments.fat_100g || 0,
          carbsPer100g: nutriments.carbohydrates_100g || 0
        }
      };
    }).filter(p => p.productName);
  } catch (error) {
    console.error('OpenFoodFacts Search Error:', error.message);
    return [];
  }
};

module.exports = { lookupBarcode, searchProduct };
