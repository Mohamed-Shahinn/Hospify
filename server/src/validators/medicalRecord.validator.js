const { body, param } = require('express-validator');

/**
 * Validation chains for medical record and prescription endpoints.
 */

const createRecordValidation = [
  body('appointmentId')
    .notEmpty().withMessage('Appointment ID is required')
    .isMongoId().withMessage('Invalid appointment ID format'),

  body('chiefComplaint')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Chief complaint must be under 500 characters'),

  body('diagnoses')
    .optional()
    .isArray().withMessage('Diagnoses must be an array'),

  body('diagnoses.*.name')
    .if(body('diagnoses').exists())
    .notEmpty().withMessage('Diagnosis name is required'),

  body('clinicalNotes')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Clinical notes must be under 5000 characters'),

  body('treatmentPlan')
    .optional()
    .trim()
    .isLength({ max: 3000 }).withMessage('Treatment plan must be under 3000 characters'),

  body('authorizedDoctors')
    .optional()
    .isArray().withMessage('Authorized doctors must be an array of doctor IDs'),

  body('authorizedDoctors.*')
    .optional()
    .isMongoId().withMessage('Invalid doctor ID format in authorizedDoctors'),

  body('isFinalized')
    .optional()
    .isBoolean().withMessage('isFinalized must be a boolean'),
];

const addPrescriptionValidation = [
  param('id')
    .isMongoId().withMessage('Invalid medical record ID format'),

  body('medications')
    .notEmpty().withMessage('Medications array is required')
    .isArray({ min: 1 }).withMessage('Medications must be a non-empty array'),

  body('medications.*.name')
    .notEmpty().withMessage('Medication name is required')
    .trim(),

  body('medications.*.dosage')
    .notEmpty().withMessage('Medication dosage is required')
    .trim(),

  body('medications.*.frequency')
    .notEmpty().withMessage('Medication frequency is required')
    .trim(),

  body('medications.*.duration')
    .notEmpty().withMessage('Medication duration is required')
    .trim(),

  body('validUntil')
    .optional()
    .isISO8601().withMessage('validUntil must be a valid date'),
];

module.exports = {
  createRecordValidation,
  addPrescriptionValidation,
};
