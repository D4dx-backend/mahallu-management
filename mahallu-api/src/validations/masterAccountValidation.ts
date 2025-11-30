import { body, param } from 'express-validator';

// Institute Account Validations
export const createInstituteAccountValidation = [
  body('instituteId')
    .notEmpty()
    .withMessage('Institute ID is required')
    .isMongoId()
    .withMessage('Invalid institute ID'),
  body('accountName')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Account name must be between 2 and 200 characters'),
  body('accountNumber').optional().trim(),
  body('bankName').optional().trim(),
  body('ifscCode').optional().trim(),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status'),
];

// Category Validations
export const createCategoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Category name must be between 2 and 200 characters'),
  body('description').optional().trim(),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Invalid category type'),
];

// Master Wallet Validations
export const createWalletValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Wallet name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Wallet name must be between 2 and 200 characters'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance must be a non-negative number'),
  body('type')
    .isIn(['main', 'reserve', 'charity'])
    .withMessage('Invalid wallet type'),
];

// Ledger Validations
export const createLedgerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Ledger name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Ledger name must be between 2 and 200 characters'),
  body('description').optional().trim(),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Invalid ledger type'),
];

// Ledger Item Validations
export const createLedgerItemValidation = [
  body('ledgerId')
    .notEmpty()
    .withMessage('Ledger ID is required')
    .isMongoId()
    .withMessage('Invalid ledger ID'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('paymentMethod').optional().trim(),
  body('referenceNo').optional().trim(),
];

