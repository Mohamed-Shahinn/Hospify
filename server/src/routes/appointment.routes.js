const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');
const {
  createAppointmentValidation,
  updateStatusValidation,
  rescheduleValidation,
} = require('../validators/appointment.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Apply authentication to all appointment routes
router.use(authenticate);

// Patient only: book or reschedule appointment
router.post(
  '/',
  authorize(ROLES.PATIENT),
  createAppointmentValidation,
  validate,
  appointmentController.createAppointment
);

router.patch(
  '/:id/reschedule',
  authorize(ROLES.PATIENT),
  rescheduleValidation,
  validate,
  appointmentController.reschedule
);

// All authenticated roles: get list or get details (role scoped inside controller)
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);

// Doctor, Admin or Patient: change appointment status (cancellation)
router.patch(
  '/:id/status',
  authorize(ROLES.DOCTOR, ROLES.ADMIN, ROLES.PATIENT),
  updateStatusValidation,
  validate,
  appointmentController.updateStatus
);

module.exports = router;
