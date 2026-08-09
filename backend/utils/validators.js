const { body } = require('express-validator');

const registerValidator = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Please enter a password with 6 or more characters'),
  body('firstName').notEmpty().withMessage('First name is required')
];

const loginValidator = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

const profileValidator = [
  body('age').optional().isNumeric(),
  body('heightCm').optional().isNumeric(),
  body('weightKg').optional().isNumeric(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('goal').optional().isIn(['weight_loss', 'weight_gain', 'maintain', 'manage_disease'])
];

const mealLogValidator = [
  body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
  body('foodName').notEmpty().withMessage('Food name is required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD')
];

module.exports = {
  registerValidator,
  loginValidator,
  profileValidator,
  mealLogValidator
};
