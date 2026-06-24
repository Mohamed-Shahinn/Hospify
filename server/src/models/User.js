const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

/**
 * User Model — Base authentication entity.
 *
 * All four roles (admin, doctor, patient, hospital) have one User document.
 * Role-specific profile data lives in the Patient / Doctor / Hospital collections,
 * which reference this User via a 1:1 relationship (userId field).
 *
 * Security:
 *  - password field is excluded from queries by default (select: false)
 *  - refreshToken excluded from queries by default
 *  - password is hashed in a pre-save hook
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries unless explicitly requested
    },

    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Role must be one of: admin, doctor, patient, hospital',
      },
      required: [true, 'Role is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number'],
    },

    avatar: {
      type: String, // URL to profile image
      default: null,
    },

    // Stored refresh token (hashed) for single-device logout support
    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─── Pre-save Hook: Hash password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plaintext password against the stored hash.
 * @param {string} candidatePassword  Password from request body
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Check if the user has a specific role.
 * @param {...string} roles  One or more role strings
 * @returns {boolean}
 */
userSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
