const { body } = require('express-validator');
const { SPECIALIZATIONS, DAYS_OF_WEEK } = require('../config/constants');

/**
 * Validation chains for doctor profile and availability endpoints.
 */

// ─── Update Doctor Profile ────────────────────────────────────────────────────
const updateDoctorProfileValidation = [
  body('specializations')
    .optional()
    .isArray({ min: 1 }).withMessage('Specializations must be a non-empty array')
    .custom((arr) => {
      const invalid = arr.filter((s) => !SPECIALIZATIONS.includes(s));
      if (invalid.length > 0) {
        throw new Error(`Invalid specializations: ${invalid.join(', ')}`);
      }
      return true;
    }),

  body('licenseNumber')
    .optional()
    .trim()
    .notEmpty().withMessage('License number cannot be empty'),

  body('yearsOfExperience')
    .optional()
    .isInt({ min: 0, max: 70 }).withMessage('Years of experience must be between 0 and 70'),

  body('consultationFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Bio must be under 2000 characters'),

  body('languages')
    .optional()
    .isArray().withMessage('Languages must be an array'),

  body('isAvailableForOnlineConsultation')
    .optional()
    .isBoolean().withMessage('isAvailableForOnlineConsultation must be a boolean'),
];

// ─── Update Availability ──────────────────────────────────────────────────────
const updateAvailabilityValidation = [
  body('availability')
    .notEmpty().withMessage('Availability schedule is required')
    .isArray().withMessage('Availability must be an array'),

  body('availability.*.day')
    .notEmpty().withMessage('Day is required')
    .isIn(DAYS_OF_WEEK).withMessage(`Day must be one of: ${DAYS_OF_WEEK.join(', ')}`),

  body('availability.*.startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),

  body('availability.*.endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),

  body('availability.*.slotDuration')
    .optional()
    .isInt({ min: 15, max: 120 }).withMessage('Slot duration must be between 15 and 120 minutes'),
];

module.exports = {
  updateDoctorProfileValidation,
  updateAvailabilityValidation,
};
