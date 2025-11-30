import { body, param, query } from 'express-validator';

// Varisangya Validations
export const createVarisangyaValidation = [
  body('familyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid family ID'),
  body('memberId')
    .optional()
    .isMongoId()
    .withMessage('Invalid member ID'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('paymentDate')
    .notEmpty()
    .withMessage('Payment date is required')
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('paymentMethod').optional().trim(),
  body('receiptNo').optional().trim(),
  body('remarks').optional().trim(),
];

// Zakat Validations
export const createZakatValidation = [
  body('payerName')
    .trim()
    .notEmpty()
    .withMessage('Payer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Payer name must be between 2 and 100 characters'),
  body('payerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid payer member ID'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('paymentDate')
    .notEmpty()
    .withMessage('Payment date is required')
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  body('paymentMethod').optional().trim(),
  body('receiptNo').optional().trim(),
  body('category').optional().trim(),
  body('remarks').optional().trim(),
];

// Wallet Validations
export const getWalletTransactionsValidation = [
  param('walletId').isMongoId().withMessage('Invalid wallet ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

