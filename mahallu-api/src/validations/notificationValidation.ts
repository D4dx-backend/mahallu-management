import { body, param } from 'express-validator';

export const createNotificationValidation = [
  body('recipientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('recipientType')
    .isIn(['user', 'member', 'all'])
    .withMessage('Invalid recipient type'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Notification title must be between 2 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 1 })
    .withMessage('Notification message is required'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Invalid notification type'),
  body('link').optional().trim(),
];

export const markAsReadValidation = [
  param('id').isMongoId().withMessage('Invalid notification ID'),
];

