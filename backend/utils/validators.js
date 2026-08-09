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
  body('height').optional().isNumeric(),
  body('weightKg').optional().isNumeric(),
  body('weight').optional().isNumeric(),
  body('gender').optional(),
  body('sex').optional(),
  body('goal').optional()
];

const mealLogValidator = [
  body('mealType').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
  body('foodName').optional().notEmpty(),
  body('date').optional()
];

module.exports = {
  registerValidator,
  loginValidator,
  profileValidator,
  mealLogValidator
};
