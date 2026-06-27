const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const {
  updateDoctorProfileValidation,
  updateAvailabilityValidation,
} = require('../validators/doctor.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/availability', doctorController.getAvailability);

// Protected routes (Doctor only)
router.put('/profile', authenticate, authorize(ROLES.DOCTOR), updateDoctorProfileValidation, validate, doctorController.updateProfile);
router.put('/availability', authenticate, authorize(ROLES.DOCTOR), updateAvailabilityValidation, validate, doctorController.updateAvailability);
router.get('/appointments/list', authenticate, authorize(ROLES.DOCTOR), doctorController.getAppointments);

module.exports = router;
