const { body } = require('express-validator');
const { ROLES } = require('../config/constants');

/**
 * Validation chains for authentication endpoints.
 * Used alongside the validate middleware in route definitions.
 */

// ─── Register ─────────────────────────────────────────────────────────────────
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Please provide a valid phone number'),
];

// ─── Login ────────────────────────────────────────────────────────────────────
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
    .isString().withMessage('Refresh token must be a string'),
];

// ─── Change Password ──────────────────────────────────────────────────────────
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),
];

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Please provide a valid phone number'),
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
  updateProfileValidation,
};
