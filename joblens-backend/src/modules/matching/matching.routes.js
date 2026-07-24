import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware.js';
import * as matchingController from './matching.controller.js';
import { refreshMatchesValidation } from './matching.validation.js';

const router = Router();

router.get('/', requireAuth, matchingController.getMyMatches);
router.post('/refresh', requireAuth, refreshMatchesValidation, matchingController.refreshMatches);

export default router;
