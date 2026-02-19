import { body, param } from 'express-validator';

export const createEmployeeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Employee name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Employee name must be between 2 and 200 characters'),
  body('instituteId')
    .notEmpty()
    .withMessage('Institute ID is required')
    .isMongoId()
    .withMessage('Invalid Institute ID'),
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
  body('salary')
    .notEmpty()
    .withMessage('Salary is required')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
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
  body('department').optional().trim(),
  body('joinDate')
    .optional()
    .isISO8601()
    .withMessage('Join date must be a valid date'),
  body('address').optional().trim(),
  body('qualifications').optional().trim(),
  body('bankAccount.accountNumber').optional().trim(),
  body('bankAccount.bankName').optional().trim(),
  body('bankAccount.ifscCode').optional().trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const updateEmployeeValidation = [
  param('id').isMongoId().withMessage('Invalid employee ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Employee name must be between 2 and 200 characters'),
  body('designation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Designation must be between 2 and 100 characters'),
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
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
  body('department').optional().trim(),
  body('joinDate')
    .optional()
    .isISO8601()
    .withMessage('Join date must be a valid date'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const getEmployeeValidation = [
  param('id').isMongoId().withMessage('Invalid employee ID'),
];

export const deleteEmployeeValidation = [
  param('id').isMongoId().withMessage('Invalid employee ID'),
];
