const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../config/constants');

/**
 * Appointment Model — Core scheduling entity.
 *
 * Relationships:
 *  Appointment.patientId  → Patient._id
 *  Appointment.doctorId   → Doctor._id
 *  Appointment.hospitalId → Hospital._id (optional, for hospital-based appointments)
 *
 * Double-booking prevention is handled at the service layer using
 * a compound index on (doctorId, date, timeSlot).
 */
const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required'],
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      default: null,
    },

    // The appointment date (date only, no time)
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },

    // Time slot in "HH:MM" format, e.g. "09:00"
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time slot must be in HH:MM format'],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(APPOINTMENT_STATUS),
        message: 'Invalid appointment status',
      },
      default: APPOINTMENT_STATUS.PENDING,
    },

    type: {
      type: String,
      enum: ['in-person', 'online'],
      default: 'in-person',
    },

    // Reason for the visit
    reasonForVisit: {
      type: String,
      trim: true,
      maxlength: [500, 'Reason must be under 500 characters'],
    },

    // Doctor's notes (only doctor can write this)
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes must be under 2000 characters'],
    },

    // Who cancelled and why
    cancellationReason: {
      type: String,
      trim: true,
    },

    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'hospital', 'admin'],
    },

    // Rescheduling tracking
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },

    // Duration in minutes
    duration: {
      type: Number,
      default: 30,
    },

    // Link to the resulting medical record (filled after appointment)
    medicalRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound unique index to prevent double-booking
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['cancelled', 'no_show'] },
    },
  }
);

appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
