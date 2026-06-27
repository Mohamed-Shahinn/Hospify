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
 *  - otpCode and otpExpiry excluded from queries by default
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
      select: false,
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
      type: String,
      default: null,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ─── OTP Fields ───────────────────────────────────────────────────────────
    otpCode: {
      type: String,
      select: false, // Never exposed in queries unless explicitly requested
    },

    otpExpiry: {
      type: Date,
      select: false,
    },

    passwordResetVerifiedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.otpCode;
        delete ret.otpExpiry;
        delete ret.passwordResetVerifiedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });


// ─── Pre-save Hook: Hash password ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
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

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

const User = mongoose.model('User', userSchema);
module.exports = User;