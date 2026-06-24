const mongoose = require('mongoose');
const { SPECIALIZATIONS, DAYS_OF_WEEK } = require('../config/constants');

/**
 * Doctor Model — Extended profile for users with role 'doctor'.
 *
 * Relationship:
 *  Doctor.userId    → User._id   (1:1)
 *  Doctor.hospitals → Hospital[] (many-to-many via array of refs)
 *
 * Availability is stored as a weekly schedule:
 *  availability: [{ day: 'Monday', slots: ['09:00', '10:00', ...] }]
 */
const availabilitySlotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: DAYS_OF_WEEK,
      required: true,
    },
    startTime: {
      type: String, // e.g. "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "17:00"
      required: true,
    },
    slotDuration: {
      type: Number, // minutes per appointment slot
      default: 30,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required'],
      unique: true,
      trim: true,
    },

    specializations: {
      type: [String],
      enum: {
        values: SPECIALIZATIONS,
        message: '{VALUE} is not a recognized medical specialization',
      },
      required: [true, 'At least one specialization is required'],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one specialization is required',
      },
    },

    qualifications: [
      {
        degree: { type: String, trim: true },       // e.g. "MD"
        institution: { type: String, trim: true },  // e.g. "Cairo University"
        year: { type: Number },
      },
    ],

    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
    },

    bio: {
      type: String,
      maxlength: [2000, 'Bio must be under 2000 characters'],
      trim: true,
    },

    // Hospitals this doctor is affiliated with
    hospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
    ],

    // Weekly availability schedule
    availability: [availabilitySlotSchema],

    // Consultation fee in local currency
    consultationFee: {
      type: Number,
      min: [0, 'Fee cannot be negative'],
    },

    // Average star rating (1-5), auto-computed from reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isAvailableForOnlineConsultation: {
      type: Boolean,
      default: false,
    },

    languages: [
      {
        type: String,
        trim: true,
      },
    ],
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
doctorSchema.index({ userId: 1 }, { unique: true });
doctorSchema.index({ specializations: 1 });
doctorSchema.index({ hospitals: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ licenseNumber: 1 }, { unique: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
