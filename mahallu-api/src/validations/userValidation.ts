import { body, param, query } from 'express-validator';

export const createUserValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['super_admin', 'mahall', 'survey', 'institute', 'member'])
    .withMessage('Invalid role. Must be one of: super_admin, mahall, survey, institute, member'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID'),
  body('memberId')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID'),
  body('permissions.view').optional().isBoolean(),
  body('permissions.add').optional().isBoolean(),
  body('permissions.edit').optional().isBoolean(),
  body('permissions.delete').optional().isBoolean(),
];

export const updateUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
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

export const getUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const deleteUserValidation = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

