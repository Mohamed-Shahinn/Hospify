const { body } = require('express-validator');
const { BLOOD_TYPES } = require('../config/constants');

/**
 * Validation chains for patient profile endpoints.
 */

// ─── Update Patient Profile ───────────────────────────────────────────────────
const updatePatientProfileValidation = [
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      // Must be between 0 and 130 years old
      const age = (today - dob) / (1000 * 60 * 60 * 24 * 365.25);
      if (age > 130) {
        throw new Error('Please enter a valid date of birth');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, other, prefer_not_to_say'),

  body('bloodType')
    .optional()
    .isIn(BLOOD_TYPES).withMessage(`Blood type must be one of: ${BLOOD_TYPES.join(', ')}`),

  body('allergies')
    .optional()
    .isArray().withMessage('Allergies must be an array of strings'),

  body('allergies.*')
    .optional()
    .trim()
    .isString().withMessage('Each allergy must be a string'),

  body('chronicConditions')
    .optional()
    .isArray().withMessage('Chronic conditions must be an array of strings'),

  body('currentMedications')
    .optional()
    .isArray().withMessage('Current medications must be an array'),

  body('currentMedications.*.name')
    .if(body('currentMedications').exists())
    .notEmpty().withMessage('Medication name is required'),

  body('address')
    .optional()
    .isObject().withMessage('Address must be an object'),

  body('address.city')
    .optional()
    .trim()
    .isString().withMessage('City must be a string'),

  body('emergencyContact')
    .optional()
    .isObject().withMessage('Emergency contact must be an object'),

  body('emergencyContact.name')
    .optional()
    .trim()
    .isString().withMessage('Emergency contact name must be a string'),

  body('emergencyContact.phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-().]{7,20}$/).withMessage('Please provide a valid emergency contact phone number'),

  body('insuranceProvider')
    .optional()
    .trim()
    .isString().withMessage('Insurance provider must be a string'),

  body('insuranceNumber')
    .optional()
    .trim()
    .isString().withMessage('Insurance number must be a string'),
];

module.exports = { updatePatientProfileValidation };
