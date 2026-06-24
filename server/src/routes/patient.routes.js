const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { updatePatientProfileValidation } = require('../validators/patient.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Apply authentication and check for patient role for all patient-specific routes
router.use(authenticate, authorize(ROLES.PATIENT));

router.get('/profile', patientController.getProfile);
router.put('/profile', updatePatientProfileValidation, validate, patientController.updateProfile);
router.get('/appointments', patientController.getAppointments);
router.get('/records', patientController.getMedicalRecords);
router.get('/records/:recordId/prescriptions', patientController.getPrescriptions);

module.exports = router;
