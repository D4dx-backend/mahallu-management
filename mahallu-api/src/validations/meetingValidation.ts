import { body, param } from 'express-validator';

export const createMeetingValidation = [
  body('committeeId')
    .notEmpty()
    .withMessage('Committee ID is required')
    .isMongoId()
    .withMessage('Invalid committee ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Meeting title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Meeting title must be between 2 and 200 characters'),
  body('meetingDate')
    .notEmpty()
    .withMessage('Meeting date is required')
    .isISO8601()
    .withMessage('Meeting date must be a valid date'),
  body('attendance')
    .optional()
    .isArray()
    .withMessage('Attendance must be an array'),
  body('attendance.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID in attendance'),
  body('totalMembers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total members must be a non-negative integer'),
  body('attendancePercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Attendance percent must be between 0 and 100'),
  body('agenda').optional().trim(),
  body('minutes').optional().trim(),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];

export const updateMeetingValidation = [
  param('id').isMongoId().withMessage('Invalid meeting ID'),
  body('committeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid committee ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Meeting title must be between 2 and 200 characters'),
  body('meetingDate')
    .optional()
    .isISO8601()
    .withMessage('Meeting date must be a valid date'),
  body('attendance')
    .optional()
    .isArray()
    .withMessage('Attendance must be an array'),
  body('attendance.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID in attendance'),
  body('totalMembers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total members must be a non-negative integer'),
  body('attendancePercent')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Attendance percent must be between 0 and 100'),
  body('agenda').optional().trim(),
  body('minutes').optional().trim(),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
];

export const getMeetingValidation = [
  param('id').isMongoId().withMessage('Invalid meeting ID'),
];

export const deleteMeetingValidation = [
  param('id').isMongoId().withMessage('Invalid meeting ID'),
];

