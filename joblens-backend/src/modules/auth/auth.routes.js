import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from './auth.controller.js';
import { registerValidation, loginValidation } from './auth.validation.js';
import { requireAuth } from '../../middleware/authMiddleware.js';

const router = Router();

// FR-002/FR-003: basic brute-force protection on auth endpoints.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/logout', requireAuth, authController.logout);

export default router;
