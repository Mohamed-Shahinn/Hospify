const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { ROLES } = require('../config/constants');

/**
 * POST /api/auth/register
 * Register a new user and create their role-specific profile.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, ...profileData } = req.body;

  // Register user and get tokens
  const { user, accessToken, refreshToken } = await authService.register({
    name, email, password, role, phone,
  });

  // Create role-specific profile with any additional data provided
  if (role === ROLES.PATIENT) {
    await Patient.create({
      userId: user._id,
      dateOfBirth: profileData.dateOfBirth || new Date('2000-01-01'),
      gender: profileData.gender || 'prefer_not_to_say',
      ...profileData,
    });
  } else if (role === ROLES.DOCTOR) {
    if (!profileData.licenseNumber || !profileData.specializations) {
      throw new AppError('Doctors must provide licenseNumber and specializations during registration.', 400);
    }
    await Doctor.create({
      userId: user._id,
      licenseNumber: profileData.licenseNumber,
      specializations: profileData.specializations,
      ...profileData,
    });
  } else if (role === ROLES.HOSPITAL) {
    if (!profileData.registrationNumber || !profileData.hospitalName) {
      throw new AppError('Hospitals must provide registrationNumber and hospitalName during registration.', 400);
    }
    await Hospital.create({
      userId: user._id,
      name: profileData.hospitalName,
      registrationNumber: profileData.registrationNumber,
      type: profileData.type || 'private',
      address: profileData.address || { street: '', city: '' },
      ...profileData,
    });
  }
  // Admins have no extended profile

  return successResponse(res, {
    status: 201,
    message: 'Account created successfully. Welcome to Hospify!',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  return successResponse(res, {
    message: 'Logged in successfully.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * POST /api/auth/logout
 * Requires authentication.
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  return successResponse(res, {
    message: 'Logged out successfully.',
    data: null,
  });
});

/**
 * POST /api/auth/refresh
 * Issue new access + refresh tokens from a valid refresh token.
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  const tokens = await authService.refreshTokens(token);

  return successResponse(res, {
    message: 'Tokens refreshed successfully.',
    data: tokens,
  });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user's profile.
 * Requires authentication.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Load role-specific profile
  let profile = null;
  if (req.user.role === ROLES.PATIENT) {
    profile = await Patient.findOne({ userId: req.user._id });
  } else if (req.user.role === ROLES.DOCTOR) {
    profile = await Doctor.findOne({ userId: req.user._id }).populate('hospitals', 'name address.city');
  } else if (req.user.role === ROLES.HOSPITAL) {
    profile = await Hospital.findOne({ userId: req.user._id });
  }

  return successResponse(res, {
    message: 'User profile retrieved.',
    data: { user, profile },
  });
});

/**
 * PUT /api/auth/me/profile
 * Update authenticated user's basic profile (name, phone).
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const update = {};
  if (name) update.name = name;
  if (phone) update.phone = phone;

  const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true }).select('-password -refreshToken');
  return successResponse(res, { message: 'User profile updated.', data: user });
});

/**
 * POST /api/auth/me/change-password
 * Change authenticated user's password.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }
  user.password = newPassword;
  await user.save();
  return successResponse(res, { message: 'Password changed successfully.' });
});

module.exports = { register, login, logout, refreshToken, getMe, updateUserProfile, changePassword };
