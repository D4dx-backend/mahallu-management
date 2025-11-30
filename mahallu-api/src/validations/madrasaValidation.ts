import { body, param } from 'express-validator';

// Madrasas use the Institute model with type='madrasa'
export const createMadrasaValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Madrasa name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Madrasa name must be between 2 and 200 characters'),
  body('place')
    .trim()
    .notEmpty()
    .withMessage('Place is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Place must be between 1 and 200 characters'),
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
  body('address.state').optional().trim(),
  body('address.district').optional().trim(),
  body('address.pinCode').optional().trim(),
  body('address.postOffice').optional().trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const updateMadrasaValidation = [
  param('id').isMongoId().withMessage('Invalid madrasa ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Madrasa name must be between 2 and 200 characters'),
  body('place')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Place must be between 1 and 200 characters'),
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

export const getMadrasaValidation = [
  param('id').isMongoId().withMessage('Invalid madrasa ID'),
];

export const deleteMadrasaValidation = [
  param('id').isMongoId().withMessage('Invalid madrasa ID'),
];

