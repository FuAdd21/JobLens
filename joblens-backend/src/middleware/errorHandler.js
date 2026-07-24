import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // FIXED: route all server errors through one logger so output is consistent across modules.
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
};
