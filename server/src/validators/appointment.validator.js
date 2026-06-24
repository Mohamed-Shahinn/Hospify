const { body, param } = require('express-validator');
const { APPOINTMENT_STATUS } = require('../config/constants');

/**
 * Validation chains for appointment endpoints.
 */

// ─── Create Appointment ───────────────────────────────────────────────────────
const createAppointmentValidation = [
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required')
    .isMongoId().withMessage('Invalid Doctor ID format'),

  body('date')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD)')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),

  body('timeSlot')
    .notEmpty().withMessage('Time slot is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time slot must be in HH:MM format (e.g. 09:00)'),

  body('hospitalId')
    .optional()
    .isMongoId().withMessage('Invalid Hospital ID format'),

  body('type')
    .optional()
    .isIn(['in-person', 'online']).withMessage('Appointment type must be "in-person" or "online"'),

  body('reasonForVisit')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters'),
];

// ─── Update Appointment Status ────────────────────────────────────────────────
const updateStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid appointment ID format'),

  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(Object.values(APPOINTMENT_STATUS)).withMessage(
      `Status must be one of: ${Object.values(APPOINTMENT_STATUS).join(', ')}`
    ),

  body('cancellationReason')
    .if(body('status').equals('cancelled'))
    .notEmpty().withMessage('Cancellation reason is required when cancelling an appointment')
    .isLength({ max: 500 }).withMessage('Reason must be under 500 characters'),
];

// ─── Reschedule Appointment ───────────────────────────────────────────────────
const rescheduleValidation = [
  param('id')
    .isMongoId().withMessage('Invalid appointment ID format'),

  body('date')
    .notEmpty().withMessage('New date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error('New appointment date cannot be in the past');
      }
      return true;
    }),

  body('timeSlot')
    .notEmpty().withMessage('New time slot is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time slot must be in HH:MM format'),
];

module.exports = {
  createAppointmentValidation,
  updateStatusValidation,
  rescheduleValidation,
};
