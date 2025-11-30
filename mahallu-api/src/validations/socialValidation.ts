import { body, param } from 'express-validator';

// Banner Validations
export const createBannerValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Banner title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Banner title must be between 2 and 200 characters'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Banner image is required'),
  body('link').optional().trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

// Feed Validations
export const createFeedValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Feed title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Feed title must be between 2 and 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Feed content is required')
    .isLength({ min: 1 })
    .withMessage('Feed content is required'),
  body('image').optional().trim(),
  body('authorId')
    .notEmpty()
    .withMessage('Author ID is required')
    .isMongoId()
    .withMessage('Invalid author ID'),
  body('isSuperFeed')
    .optional()
    .isBoolean()
    .withMessage('isSuperFeed must be a boolean'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
];

// Support Validations
export const createSupportValidation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Support subject is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Support subject must be between 2 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Support message is required')
    .isLength({ min: 10 })
    .withMessage('Support message must be at least 10 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
];

export const updateSupportValidation = [
  param('id').isMongoId().withMessage('Invalid support ID'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('response').optional().trim(),
];

