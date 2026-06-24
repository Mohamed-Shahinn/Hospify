const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * Notification Service — Creates in-app notifications for users.
 *
 * All notification creation goes through this service so that
 * the messaging logic is centralized and consistent.
 *
 * Future extension: add email/SMS sending here without touching controllers.
 */

/**
 * Create a single notification for a user.
 *
 * @param {object} options
 * @param {string} options.userId       The recipient's User._id
 * @param {string} options.type         NOTIFICATION_TYPES value
 * @param {string} options.title        Short title
 * @param {string} options.message      Full message body
 * @param {object} [options.data]       Optional payload (e.g. { appointmentId })
 * @returns {Promise<Notification>}
 */
const createNotification = async ({ userId, type, title, message, data = null }) => {
  return Notification.create({ userId, type, title, message, data });
};

/**
 * Notify a patient that their appointment has been booked.
 * @param {string}  patientUserId
 * @param {object}  appointmentDetails  { doctorName, date, timeSlot, appointmentId }
 */
const notifyAppointmentBooked = async (patientUserId, { doctorName, date, timeSlot, appointmentId }) => {
  return createNotification({
    userId: patientUserId,
    type: NOTIFICATION_TYPES.APPOINTMENT_BOOKED,
    title: 'Appointment Booked',
    message: `Your appointment with ${doctorName} on ${date} at ${timeSlot} has been successfully booked.`,
    data: { appointmentId },
  });
};

/**
 * Notify a patient that their appointment has been confirmed by the doctor.
 */
const notifyAppointmentConfirmed = async (patientUserId, { doctorName, date, timeSlot, appointmentId }) => {
  return createNotification({
    userId: patientUserId,
    type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
    title: 'Appointment Confirmed',
    message: `Dr. ${doctorName} has confirmed your appointment on ${date} at ${timeSlot}.`,
    data: { appointmentId },
  });
};

/**
 * Notify relevant parties that an appointment has been cancelled.
 * @param {string}  recipientUserId  The user to notify (patient or doctor)
 * @param {object}  details
 */
const notifyAppointmentCancelled = async (recipientUserId, { date, timeSlot, appointmentId, reason }) => {
  return createNotification({
    userId: recipientUserId,
    type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
    title: 'Appointment Cancelled',
    message: `An appointment scheduled for ${date} at ${timeSlot} has been cancelled. ${reason ? `Reason: ${reason}` : ''}`,
    data: { appointmentId },
  });
};

/**
 * Notify patient that a medical record has been added.
 */
const notifyRecordAdded = async (patientUserId, { doctorName, visitDate, recordId }) => {
  return createNotification({
    userId: patientUserId,
    type: NOTIFICATION_TYPES.RECORD_ADDED,
    title: 'New Medical Record Added',
    message: `Dr. ${doctorName} has added a medical record for your visit on ${visitDate}.`,
    data: { recordId },
  });
};

/**
 * Notify patient that a prescription has been issued.
 */
const notifyPrescriptionAdded = async (patientUserId, { doctorName, prescriptionId }) => {
  return createNotification({
    userId: patientUserId,
    type: NOTIFICATION_TYPES.PRESCRIPTION_ADDED,
    title: 'New Prescription',
    message: `Dr. ${doctorName} has issued a new prescription for you.`,
    data: { prescriptionId },
  });
};

module.exports = {
  createNotification,
  notifyAppointmentBooked,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyRecordAdded,
  notifyPrescriptionAdded,
};
