const express = require('express');
const router = express.Router();
const { register, login, googleAuth, refresh, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../utils/validators');
const { validate } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/google', authLimiter, googleAuth);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:resetToken', authLimiter, resetPassword);

module.exports = router;
