import { body } from 'express-validator';

export const refreshMatchesValidation = [
  // FIXED: no-body match refresh endpoint still has an explicit validation rule.
  body().custom((value) => Object.keys(value || {}).length === 0).withMessage('Request body is not allowed.'),
];
