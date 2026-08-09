const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each user/IP to 10 scan requests per minute
  message: { success: false, error: 'Scan limit reached, please try again after a minute' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 20, // 1000 in dev, 20 in prod
  message: { success: false, error: 'Too many auth attempts from this IP, please try again after 15 minutes' }
});

module.exports = { generalLimiter, scanLimiter, authLimiter };
