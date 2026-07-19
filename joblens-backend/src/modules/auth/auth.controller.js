import { validationResult } from 'express-validator';
import * as authService from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const { email, password } = req.body;
    const existing = await authService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await authService.createUser(email, password);
    // TODO Module 5: trigger email verification event here.

    return res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const valid = await authService.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Account suspended.' });
    }

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Login successful.',
      data: { accessToken, user: { id: user.id, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user?.sub) {
      await authService.bumpRefreshTokenVersion(req.user.sub);
    }
    res.clearCookie('refreshToken');
    return res.json({ success: true, message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
};
