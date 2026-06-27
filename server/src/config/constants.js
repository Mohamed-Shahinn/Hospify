/**
 * Application-wide constants.
 * Centralizing these prevents magic strings scattered across the codebase.
 */

// ─── User Roles ───────────────────────────────────────────────────────────────
const ROLES = Object.freeze({
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  HOSPITAL: 'hospital',
});

// ─── Appointment Statuses ─────────────────────────────────────────────────────
const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
});

// ─── Blood Types ──────────────────────────────────────────────────────────────
const BLOOD_TYPES = Object.freeze(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

// ─── Medical Specializations ──────────────────────────────────────────────────
const SPECIALIZATIONS = Object.freeze([
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'Geriatrics',
  'Gynecology',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Surgery',
  'Urology',
]);

// ─── Notification Types ───────────────────────────────────────────────────────
const NOTIFICATION_TYPES = Object.freeze({
  APPOINTMENT_BOOKED: 'appointment_booked',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  RECORD_ADDED: 'record_added',
  PRESCRIPTION_ADDED: 'prescription_added',
  SYSTEM: 'system',
});

// ─── JWT ──────────────────────────────────────────────────────────────────────
const TOKEN_TYPES = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
});

// ─── Pagination Defaults ──────────────────────────────────────────────────────
const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

// ─── Days of Week ─────────────────────────────────────────────────────────────
const DAYS_OF_WEEK = Object.freeze([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]);

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  BLOOD_TYPES,
  SPECIALIZATIONS,
  NOTIFICATION_TYPES,
  TOKEN_TYPES,
  PAGINATION,
  DAYS_OF_WEEK,
};
