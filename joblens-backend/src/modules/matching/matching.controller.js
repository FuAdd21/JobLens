import { validationResult } from 'express-validator';
import * as matchingService from './matching.service.js';

// Recompute + return fresh matches (call after profile updates, or on-demand refresh button)
export const refreshMatches = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // FIXED: refresh now checks express-validator before recomputing matches.
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const matches = await matchingService.computeMatchesForUser(req.user.sub);
    return res.json({ success: true, message: 'Matches recalculated.', data: matches });
  } catch (err) {
    next(err);
  }
};

// Fast read of last-computed matches (no re-embedding, no recompute)
export const getMyMatches = async (req, res, next) => {
  try {
    const matches = await matchingService.getStoredMatches(req.user.sub);
    return res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
};
