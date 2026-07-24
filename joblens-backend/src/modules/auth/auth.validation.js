import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const noBodyValidation = [
  // FIXED: no-body mutating auth endpoints still have an explicit validation rule.
  body().custom((value) => Object.keys(value || {}).length === 0).withMessage('Request body is not allowed.'),
];
