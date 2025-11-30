import { body, param } from 'express-validator';

// Nikah Registration Validations
export const createNikahRegistrationValidation = [
  body('groomName')
    .trim()
    .notEmpty()
    .withMessage('Groom name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Groom name must be between 2 and 100 characters'),
  body('groomAge')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Groom age must be between 0 and 150'),
  body('groomId')
    .optional()
    .isMongoId()
    .withMessage('Invalid groom member ID'),
  body('brideName')
    .trim()
    .notEmpty()
    .withMessage('Bride name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Bride name must be between 2 and 100 characters'),
  body('brideAge')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Bride age must be between 0 and 150'),
  body('brideId')
    .optional()
    .isMongoId()
    .withMessage('Invalid bride member ID'),
  body('nikahDate')
    .notEmpty()
    .withMessage('Nikah date is required')
    .isISO8601()
    .withMessage('Nikah date must be a valid date'),
  body('mahallId').optional().trim(),
  body('waliName').optional().trim(),
  body('witness1').optional().trim(),
  body('witness2').optional().trim(),
  body('mahrAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Mahr amount must be a positive number'),
  body('mahrDescription').optional().trim(),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('remarks').optional().trim(),
];

export const getNikahRegistrationValidation = [
  param('id').isMongoId().withMessage('Invalid nikah registration ID'),
];

// Death Registration Validations
export const createDeathRegistrationValidation = [
  body('deceasedName')
    .trim()
    .notEmpty()
    .withMessage('Deceased name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Deceased name must be between 2 and 100 characters'),
  body('deceasedId')
    .optional()
    .isMongoId()
    .withMessage('Invalid deceased member ID'),
  body('deathDate')
    .notEmpty()
    .withMessage('Death date is required')
    .isISO8601()
    .withMessage('Death date must be a valid date'),
  body('placeOfDeath').optional().trim(),
  body('causeOfDeath').optional().trim(),
  body('mahallId').optional().trim(),
  body('familyId')
    .optional()
    .isMongoId()
    .withMessage('Invalid family ID'),
  body('informantName').optional().trim(),
  body('informantRelation').optional().trim(),
  body('informantPhone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Informant phone must be exactly 10 digits'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('remarks').optional().trim(),
];

export const getDeathRegistrationValidation = [
  param('id').isMongoId().withMessage('Invalid death registration ID'),
];

// NOC Validations
export const createNOCValidation = [
  body('applicantName')
    .trim()
    .notEmpty()
    .withMessage('Applicant name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Applicant name must be between 2 and 100 characters'),
  body('applicantId')
    .optional()
    .isMongoId()
    .withMessage('Invalid applicant member ID'),
  body('applicantPhone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Applicant phone must be exactly 10 digits'),
  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Purpose must be between 2 and 500 characters'),
  body('type')
    .isIn(['common', 'nikah'])
    .withMessage('Invalid NOC type'),
  body('nikahRegistrationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid nikah registration ID'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('issuedDate')
    .optional()
    .isISO8601()
    .withMessage('Issued date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('remarks').optional().trim(),
];

export const updateNOCValidation = [
  param('id').isMongoId().withMessage('Invalid NOC ID'),
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('issuedDate')
    .optional()
    .isISO8601()
    .withMessage('Issued date must be a valid date'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid date'),
  body('remarks').optional().trim(),
];

export const getNOCValidation = [
  param('id').isMongoId().withMessage('Invalid NOC ID'),
];

