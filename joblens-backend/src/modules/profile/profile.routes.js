import { Router } from 'express';
import { requireAuth } from '../../middleware/authMiddleware.js';
import { updateProfileValidation, updateSkillsValidation } from './profile.validation.js';
import * as profileController from './profile.controller.js';

const router = Router();

router.get('/', requireAuth, profileController.getMyProfile);
router.put('/', requireAuth, updateProfileValidation, profileController.updateMyProfile);
router.put('/skills', requireAuth, updateSkillsValidation, profileController.updateMySkills);
router.get('/skills/search', requireAuth, profileController.searchSkillsCatalog);

export default router;
