import { body, param } from 'express-validator';

export const createTenantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tenant name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Tenant name must be between 2 and 200 characters'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Tenant code is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Tenant code must be between 2 and 50 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Tenant code must contain only uppercase letters and numbers'),
  body('type')
    .isIn(['standard', 'premium', 'enterprise'])
    .withMessage('Invalid tenant type'),
  body('location').optional().trim(),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.district')
    .trim()
    .notEmpty()
    .withMessage('District is required'),
  body('address.pinCode').optional().trim(),
  body('address.postOffice').optional().trim(),
  body('address.lsgName')
    .trim()
    .notEmpty()
    .withMessage('LSG Name is required'),
  body('address.village')
    .trim()
    .notEmpty()
    .withMessage('Village is required'),
  body('settings.varisangyaAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Varisangya amount must be a positive number'),
];

export const updateTenantValidation = [
  param('id').isMongoId().withMessage('Invalid tenant ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Tenant name must be between 2 and 200 characters'),
  body('status')
    .optional()
    .isIn(['active', 'suspended', 'inactive'])
    .withMessage('Invalid status'),
];

export const getTenantValidation = [
  param('id').isMongoId().withMessage('Invalid tenant ID'),
];

export const deleteTenantValidation = [
  param('id').isMongoId().withMessage('Invalid tenant ID'),
];

