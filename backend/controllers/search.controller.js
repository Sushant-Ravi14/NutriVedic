const FoodCache = require('../models/FoodCache.model');
const { searchProduct } = require('../utils/openFoodFacts');
const { searchFood: searchUSDA } = require('../utils/usda');
const MealLog = require('../models/MealLog.model');

const searchFoodDatabase = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ success: false, error: 'Query required' });

    const [cacheResults, usdaResults, offResults] = await Promise.all([
      FoodCache.find({ dishName: { $regex: query, $options: 'i' } }).limit(5),
      searchUSDA(query),
      searchProduct(query)
    ]);

    const formattedCache = cacheResults.map(c => ({
      name: c.dishName,
      nutrition: c.nutrition,
      source: 'nutrivedic_db'
    }));

    const formattedUsda = usdaResults.map(u => ({
      name: u.productName,
      nutrition: u.nutrition,
      source: 'usda'
    }));

    const formattedOff = offResults.map(o => ({
      name: o.productName,
      nutrition: o.nutrition,
      source: 'open_food_facts'
    }));

    const merged = [...formattedCache, ...formattedUsda, ...formattedOff].slice(0, 20);

    res.status(200).json({ success: true, data: merged });
  } catch (error) {
    next(error);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(200).json({ success: true, data: [] });

    const results = await FoodCache.find({
      $or: [
        { dishName: { $regex: '^' + query, $options: 'i' } },
        { variations: { $regex: '^' + query, $options: 'i' } }
      ]
    }).select('dishName').limit(8);

    res.status(200).json({ success: true, data: results.map(r => r.dishName) });
  } catch (error) {
    next(error);
  }
};

const getSearchHistory = async (req, res, next) => {
  try {
    const history = await MealLog.distinct('foodName', { userId: req.user._id });
    res.status(200).json({ success: true, data: history.slice(0, 20) });
  } catch (error) {
    next(error);
  }
};

const getTrending = async (req, res, next) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    
    const trending = await FoodCache.find({ lastUsed: { $gte: date } })
      .sort({ usageCount: -1 })
      .limit(10)
      .select('dishName usageCount nutrition');
      
    res.status(200).json({ success: true, data: trending });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchFoodDatabase, getSuggestions, getSearchHistory, getTrending };
