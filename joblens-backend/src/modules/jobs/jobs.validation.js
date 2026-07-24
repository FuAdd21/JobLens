import { body, param } from 'express-validator';

export const syncTelegramValidation = [
  // FIXED: expensive Telegram sync trigger now validates input before controller work starts.
  body('channelUsername').isString().trim().notEmpty().isLength({ max: 120 }),
];

export const syncWebsiteValidation = [
  // FIXED: adapter-based sync trigger now validates its adapter key.
  body('adapterKey').isString().trim().notEmpty().isLength({ max: 80 }),
];

export const syncGenericWebsiteValidation = [
  // FIXED: generic scraper trigger validates URL and optional source name.
  body('url').isURL({ require_protocol: true }).withMessage('Valid URL is required.'),
  body('name').optional().isString().trim().isLength({ max: 150 }),
];

export const toggleSourceValidation = [
  // FIXED: source toggle now validates the path id before parameterized SQL receives it.
  param('id').isUUID().withMessage('Valid source id is required.'),
];
