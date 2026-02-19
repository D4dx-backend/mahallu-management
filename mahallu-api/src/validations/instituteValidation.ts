import { body, param } from 'express-validator';

export const createInstituteValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Institute name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Institute name must be between 2 and 200 characters'),
  body('place')
    .trim()
    .notEmpty()
    .withMessage('Place is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Place must be between 1 and 200 characters'),
  body('type')
    .isIn(['institute', 'madrasa', 'orphanage', 'hospital', 'other'])
    .withMessage('Invalid institute type'),
  body('joinDate')
    .optional()
    .isISO8601()
    .withMessage('Join date must be a valid date'),
  body('description').optional().trim(),
  body('contactNo')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact number must be exactly 10 digits'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const updateInstituteValidation = [
  param('id').isMongoId().withMessage('Invalid institute ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Institute name must be between 2 and 200 characters'),
  body('place')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Place must be between 1 and 200 characters'),
  body('type')
    .optional()
    .isIn(['institute', 'madrasa', 'orphanage', 'hospital', 'other'])
    .withMessage('Invalid institute type'),
  body('joinDate')
    .optional()
    .isISO8601()
    .withMessage('Join date must be a valid date'),
  body('description').optional().trim(),
  body('contactNo')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact number must be exactly 10 digits'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const getInstituteValidation = [
  param('id').isMongoId().withMessage('Invalid institute ID'),
];

export const deleteInstituteValidation = [
  param('id').isMongoId().withMessage('Invalid institute ID'),
];

