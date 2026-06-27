const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { AppError } = require('../middleware/errorHandler');
const { APPOINTMENT_STATUS } = require('../config/constants');

/**
 * Appointment Service — Scheduling logic.
 * Handles slot availability calculation and double-booking prevention.
 */

/**
 * Check if a doctor is available on a given date and time.
 * Returns false if there's already a non-cancelled appointment at that slot.
 *
 * @param {string}  doctorId
 * @param {Date}    date
 * @param {string}  timeSlot  e.g. "09:00"
 * @param {string}  [excludeAppointmentId]  Exclude current appointment when rescheduling
 * @returns {Promise<boolean>}
 */
const isSlotAvailable = async (doctorId, date, timeSlot, excludeAppointmentId = null) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    timeSlot,
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existing = await Appointment.findOne(query);
  return !existing; // true = slot is free
};

/**
 * Get all booked time slots for a doctor on a specific date.
 * Used by the frontend to show which slots are taken.
 *
 * @param {string}  doctorId
 * @param {Date}    date
 * @returns {Promise<string[]>}  Array of taken time slots e.g. ["09:00", "10:30"]
 */
const getBookedSlots = async (doctorId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
  }).select('timeSlot -_id');

  return appointments.map((a) => a.timeSlot);
};

/**
 * Generate all available time slots for a doctor on a specific date.
 * Cross-references the doctor's availability schedule with existing bookings.
 *
 * @param {string}  doctorId
 * @param {string}  dateStr   ISO date string "YYYY-MM-DD"
 * @returns {Promise<{ available: string[], booked: string[] }>}
 */
const getAvailableSlots = async (doctorId, dateStr) => {
  const date = new Date(dateStr);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // "Monday"

  // Get doctor's schedule for that day
  const doctor = await Doctor.findById(doctorId).select('availability');
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  const daySchedule = doctor.availability.find(
    (s) => s.day === dayName && s.isAvailable
  );

  if (!daySchedule) {
    return { available: [], booked: [] };
  }

  // Generate all slots from startTime to endTime
  const allSlots = generateTimeSlots(
    daySchedule.startTime,
    daySchedule.endTime,
    daySchedule.slotDuration || 30
  );

  // Get already booked slots
  const bookedSlots = await getBookedSlots(doctorId, date);

  const available = allSlots.filter((slot) => !bookedSlots.includes(slot));

  return { available, booked: bookedSlots };
};

/**
 * Generate time slots between startTime and endTime.
 * @param {string} startTime  "HH:MM"
 * @param {string} endTime    "HH:MM"
 * @param {number} duration   Slot duration in minutes
 * @returns {string[]}
 */
const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM; // minutes from midnight
  const end = endH * 60 + endM;

  while (current + duration <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += duration;
  }

  return slots;
};

/**
 * Create an appointment after validating slot availability.
 *
 * @param {object} appointmentData
 * @returns {Promise<Appointment>}
 */
const createAppointment = async (appointmentData) => {
  const { doctorId, date, timeSlot } = appointmentData;

  const available = await isSlotAvailable(doctorId, new Date(date), timeSlot);
  if (!available) {
    throw new AppError(
      `The time slot ${timeSlot} on ${date} is already booked for this doctor. Please choose another slot.`,
      409
    );
  }

  const appointment = await Appointment.create(appointmentData);
  return appointment;
};

/**
 * Reschedule an existing appointment.
 *
 * @param {string} appointmentId
 * @param {string} newDate
 * @param {string} newTimeSlot
 * @param {object} requestingUser  req.user
 * @returns {Promise<Appointment>}
 */
const rescheduleAppointment = async (appointmentId, newDate, newTimeSlot, requestingUser) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  // Authorization: only the patient or admin can reschedule
  if (
    requestingUser.role === 'patient' &&
    appointment.patientId.toString() !== requestingUser._id.toString()
  ) {
    // Note: patientId in Appointment refers to Patient profile, not User
    // Actual check is done at controller after resolving Patient profile
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new AppError('Cannot reschedule a cancelled appointment', 400);
  }

  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new AppError('Cannot reschedule a completed appointment', 400);
  }

  // Check new slot availability (excluding current appointment)
  const available = await isSlotAvailable(
    appointment.doctorId,
    new Date(newDate),
    newTimeSlot,
    appointmentId
  );

  if (!available) {
    throw new AppError(
      `The new time slot ${newTimeSlot} on ${newDate} is not available.`,
      409
    );
  }

  // Update appointment
  appointment.date = new Date(newDate);
  appointment.timeSlot = newTimeSlot;
  appointment.status = APPOINTMENT_STATUS.PENDING;

  await appointment.save();
  return appointment;
};

module.exports = {
  isSlotAvailable,
  getBookedSlots,
  getAvailableSlots,
  generateTimeSlots,
  createAppointment,
  rescheduleAppointment,
};
