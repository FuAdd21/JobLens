import { body } from 'express-validator';

export const updateProfileValidation = [
  body('firstName').optional().isString().trim().isLength({ max: 100 }),
  body('lastName').optional().isString().trim().isLength({ max: 100 }),
  body('country').optional().isString().trim().isLength({ max: 100 }),
  body('city').optional().isString().trim().isLength({ max: 100 }),
  body('educationLevel')
    .optional()
    .isIn(['DIPLOMA', 'BACHELOR', 'MASTER', 'PHD'])
    .withMessage('Invalid education level'),
  body('profession').optional().isString().trim().isLength({ max: 150 }),
  body('experienceLevel')
    .optional()
    .isIn(['INTERNSHIP', 'JUNIOR', 'MID', 'SENIOR'])
    .withMessage('Invalid experience level'),
  body('industry').optional().isString().trim().isLength({ max: 100 }),
  body('bio').optional().isString().trim().isLength({ max: 1000 }),
  body('preferredLocations').optional().isArray(),
  body('employmentTypes')
    .optional()
    .isArray()
    .custom((arr) =>
      arr.every((type) => ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].includes(type))
    )
    .withMessage('Invalid employment type'),
  body('workArrangement')
    .optional()
    .isArray()
    .custom((arr) => arr.every((arrangement) => ['REMOTE', 'HYBRID', 'ONSITE'].includes(arrangement)))
    .withMessage('Invalid work arrangement'),
];

export const updateSkillsValidation = [
  body('skills').isArray({ min: 0 }).withMessage('skills must be an array'),
  body('skills.*.name').isString().trim().notEmpty().withMessage('Skill name is required'),
  body('skills.*.category').optional().isString().trim().isLength({ max: 100 }),
  body('skills.*.proficiencyLevel')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'])
    .withMessage('Invalid proficiency level'),
  body('skills.*.yearsExperience').optional().isFloat({ min: 0, max: 60 }),
];
