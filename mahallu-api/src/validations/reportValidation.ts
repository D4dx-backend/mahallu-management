import { query } from 'express-validator';

export const getAreaReportValidation = [
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID'),
  query('state').optional().trim(),
  query('district').optional().trim(),
  query('village').optional().trim(),
];

export const getBloodBankReportValidation = [
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID'),
  query('bloodGroup')
    .optional()
    .isIn(['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve'])
    .withMessage('Invalid blood group'),
];

export const getOrphansReportValidation = [
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid tenant ID'),
  query('age')
    .optional()
    .isInt({ min: 0, max: 18 })
    .withMessage('Age must be between 0 and 18'),
];

