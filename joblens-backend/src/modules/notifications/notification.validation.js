import { body } from 'express-validator';

export const checkNotificationsValidation = [
  // FIXED: no-body notification check endpoint still has an explicit validation rule.
  body().custom((value) => Object.keys(value || {}).length === 0).withMessage('Request body is not allowed.'),
];
