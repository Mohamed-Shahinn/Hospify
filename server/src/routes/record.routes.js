const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecord.controller');
const {
  createRecordValidation,
  addPrescriptionValidation,
} = require('../validators/medicalRecord.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Apply authentication to all record routes
router.use(authenticate);

// Create record (Doctor only)
router.post(
  '/',
  authorize(ROLES.DOCTOR),
  createRecordValidation,
  validate,
  medicalRecordController.createRecord
);

// Add prescription to a record (Doctor only)
router.post(
  '/:id/prescriptions',
  authorize(ROLES.DOCTOR),
  addPrescriptionValidation,
  validate,
  medicalRecordController.addPrescription
);

// Retrieve list of records (Patient, Doctor, Admin)
router.get('/', medicalRecordController.getRecords);

// Retrieve single record details (Patient, Doctor, Admin)
router.get('/:id', medicalRecordController.getRecordById);

module.exports = router;
