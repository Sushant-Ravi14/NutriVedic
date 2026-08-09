const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, addWeightLog, getPreferences, updatePreferences, deleteAccount } = require('../controllers/user.controller');
const { profileValidator } = require('../utils/validators');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', profileValidator, validate, updateProfile);
router.post('/weight', addWeightLog);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.delete('/account', deleteAccount);

module.exports = router;
