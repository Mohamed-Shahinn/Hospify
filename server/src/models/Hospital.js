const mongoose = require('mongoose');

/**
 * Hospital Model — Extended profile for users with role 'hospital'.
 *
 * Relationship:
 *  Hospital.userId → User._id (1:1, the hospital admin account)
 *  Doctors reference Hospital via Doctor.hospitals[]
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    head: {
      type: String, // Department head's name (optional)
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      unique: true,
    },

    registrationNumber: {
      type: String,
      required: [true, 'Hospital registration number is required'],
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ['public', 'private', 'clinic', 'specialized', 'teaching'],
      required: true,
    },

    description: {
      type: String,
      maxlength: [3000, 'Description must be under 3000 characters'],
      trim: true,
    },

    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Egypt' },
      postalCode: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    contactInfo: {
      phone: { type: String, trim: true },
      emergencyPhone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
    },

    departments: [departmentSchema],

    totalBeds: {
      type: Number,
      min: 0,
    },

    availableBeds: {
      type: Number,
      min: 0,
    },

    workingHours: {
      openTime: { type: String, default: '08:00' },   // "HH:MM"
      closeTime: { type: String, default: '20:00' },
      isOpen24Hours: { type: Boolean, default: false },
    },

    amenities: [
      {
        type: String, // e.g. "Parking", "Pharmacy", "ICU", "Lab"
        trim: true,
      },
    ],

    accreditations: [
      {
        type: String,
        trim: true,
      },
    ],

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

    images: [
      {
        type: String, // URL to hospital images
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
hospitalSchema.index({ userId: 1 }, { unique: true });
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ 'address.city': 1 });
hospitalSchema.index({ rating: -1 });
hospitalSchema.index({ type: 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;
