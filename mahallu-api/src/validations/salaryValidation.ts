import { body, param } from 'express-validator';

export const createSalaryPaymentValidation = [
  body('instituteId')
    .notEmpty()
    .withMessage('Institute ID is required')
    .isMongoId()
    .withMessage('Invalid Institute ID'),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Invalid Employee ID'),
  body('month')
    .notEmpty()
    .withMessage('Month is required')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000 })
    .withMessage('Year must be 2000 or later'),
  body('baseSalary')
    .notEmpty()
    .withMessage('Base salary is required')
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
  body('allowances')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Allowances must be a positive number'),
  body('deductions')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deductions must be a positive number'),
  body('netAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Net amount must be a positive number'),
  body('paymentDate')
    .notEmpty()
    .withMessage('Payment date is required')
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'bank', 'upi', 'cheque'])
    .withMessage('Invalid payment method'),
  body('referenceNo').optional().trim(),
  body('status')
    .optional()
    .isIn(['paid', 'pending', 'cancelled'])
    .withMessage('Invalid status'),
  body('remarks').optional().trim(),
];

export const updateSalaryPaymentValidation = [
  param('id').isMongoId().withMessage('Invalid salary payment ID'),
  body('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .optional()
    .isInt({ min: 2000 })
    .withMessage('Year must be 2000 or later'),
  body('baseSalary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number'),
  body('allowances')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Allowances must be a positive number'),
  body('deductions')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deductions must be a positive number'),
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank', 'upi', 'cheque'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['paid', 'pending', 'cancelled'])
    .withMessage('Invalid status'),
  body('remarks').optional().trim(),
];

export const getSalaryPaymentValidation = [
  param('id').isMongoId().withMessage('Invalid salary payment ID'),
];

export const deleteSalaryPaymentValidation = [
  param('id').isMongoId().withMessage('Invalid salary payment ID'),
];

export const getEmployeeSalaryHistoryValidation = [
  param('employeeId').isMongoId().withMessage('Invalid employee ID'),
];
