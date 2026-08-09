const express = require('express');
const router = express.Router();
const { searchFoodDatabase, getSuggestions, getSearchHistory, getTrending } = require('../controllers/search.controller');
const { protect } = require('../middleware/auth.middleware');
const { cacheResponse } = require('../middleware/cache.middleware');

router.use(protect);

router.get('/food', cacheResponse(3600), searchFoodDatabase);
router.get('/suggestions', cacheResponse(3600), getSuggestions);
router.get('/history', getSearchHistory);
router.get('/trending', cacheResponse(3600), getTrending);

module.exports = router;
