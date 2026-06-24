const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../config/constants');

/**
 * Patient Model — Extended profile for users with role 'patient'.
 *
 * Relationship: Patient.userId → User._id (1:1)
 * Doctors access patient records only after an appointment link exists.
 */
const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      required: [true, 'Gender is required'],
    },

    bloodType: {
      type: String,
      enum: {
        values: BLOOD_TYPES,
        message: 'Invalid blood type',
      },
    },

    // Known allergies as a simple string array
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],

    // Chronic conditions / existing diagnoses
    chronicConditions: [
      {
        type: String,
        trim: true,
      },
    ],

    // Current regular medications
    currentMedications: [
      {
        name: { type: String, trim: true },
        dosage: { type: String, trim: true },
        frequency: { type: String, trim: true },
      },
    ],

    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Egypt' },
      postalCode: { type: String, trim: true },
    },

    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    },

    insuranceProvider: {
      type: String,
      trim: true,
    },

    insuranceNumber: {
      type: String,
      trim: true,
    },

    nationalId: {
      type: String,
      trim: true,
      select: false, // Sensitive — hide unless explicitly requested
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

// ─── Virtuals ──────────────────────────────────────────────────────────────────
// Calculate age from dateOfBirth dynamically
patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
patientSchema.index({ userId: 1 }, { unique: true });

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
