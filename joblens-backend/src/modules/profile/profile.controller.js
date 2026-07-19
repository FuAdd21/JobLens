import { validationResult } from 'express-validator';
import * as profileService from './profile.service.js';

export const getMyProfile = async (req, res, next) => {
  try {
    await profileService.ensureProfileExists(req.user.sub);
    const profile = await profileService.getProfileByUserId(req.user.sub);
    const skills = await profileService.getUserSkills(req.user.sub);
    return res.json({ success: true, data: { ...profile, skills } });
  } catch (err) {
    next(err);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const profile = await profileService.updateProfile(req.user.sub, req.body);
    return res.json({ success: true, message: 'Profile updated.', data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateMySkills = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors: errors.array() });
    }

    const skills = await profileService.setUserSkills(req.user.sub, req.body.skills);
    return res.json({ success: true, message: 'Skills updated.', data: skills });
  } catch (err) {
    next(err);
  }
};

export const searchSkillsCatalog = async (req, res, next) => {
  try {
    const { q = '', limit = 10 } = req.query;
    const results = await profileService.searchSkills(q, limit);
    return res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};
