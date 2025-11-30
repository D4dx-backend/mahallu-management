import { body, param } from 'express-validator';

export const createMemberValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('familyId')
    .notEmpty()
    .withMessage('Family ID is required')
    .isMongoId()
    .withMessage('Invalid family ID'),
  body('familyName')
    .trim()
    .notEmpty()
    .withMessage('Family Name is required'),
  body('mahallId').optional().trim(),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Invalid gender'),
  body('bloodGroup')
    .optional()
    .isIn(['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve'])
    .withMessage('Invalid blood group'),
  body('healthStatus').optional().trim(),
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('education').optional().trim(),
];

export const updateMemberValidation = [
  param('id').isMongoId().withMessage('Invalid member ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('familyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid family ID'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('gender')
    .optional()
    .isIn(['male', 'female'])
    .withMessage('Invalid gender'),
  body('bloodGroup')
    .optional()
    .isIn(['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve'])
    .withMessage('Invalid blood group'),
];

export const getMemberValidation = [
  param('id').isMongoId().withMessage('Invalid member ID'),
];

export const deleteMemberValidation = [
  param('id').isMongoId().withMessage('Invalid member ID'),
];

