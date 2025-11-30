import { body, param } from 'express-validator';

export const createCommitteeValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Committee name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Committee name must be between 2 and 200 characters'),
  body('description').optional().trim(),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const updateCommitteeValidation = [
  param('id').isMongoId().withMessage('Invalid committee ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Committee name must be between 2 and 200 characters'),
  body('description').optional().trim(),
  body('members')
    .optional()
    .isArray()
    .withMessage('Members must be an array'),
  body('members.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

export const getCommitteeValidation = [
  param('id').isMongoId().withMessage('Invalid committee ID'),
];

export const deleteCommitteeValidation = [
  param('id').isMongoId().withMessage('Invalid committee ID'),
];

