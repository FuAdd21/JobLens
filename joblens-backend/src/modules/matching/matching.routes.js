import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware.js';
import * as matchingController from './matching.controller.js';

const router = Router();

router.get('/', requireAuth, matchingController.getMyMatches);
router.post('/refresh', requireAuth, matchingController.refreshMatches);

export default router;