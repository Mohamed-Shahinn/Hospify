const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenManager');
const { generateOTP, sendOTPEmail, getOtpExpiryMinutes } = require('../utils/email.util');
const { AppError } = require('../middleware/errorHandler');

const getPasswordResetWindowMinutes = () =>
  Number(process.env.PASSWORD_RESET_WINDOW_MINUTES) || 15;


/**
 * Auth Service — Business logic for authentication.
 * Controllers call these methods; they don't touch the DB directly.
 */

/**
 * Register a new user.
 */
const register = async ({ name, email, password, role, phone }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const user = await User.create({ name, email, password, role, phone });

  const tokens = generateTokenPair(user);

  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, ...tokens };
};

/**
 * Login an existing user.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const tokens = generateTokenPair(user);

  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  user.password = undefined;
  user.refreshToken = undefined;

  return { user, ...tokens };
};

/**
 * Logout — clears the refresh token from DB.
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

/**
 * Refresh access + refresh tokens.
 */
const refreshTokens = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token. Please log in again.', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Refresh token is invalid or has been revoked.', 401);
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return tokens;
};

/**
 * STEP 1: Generate OTP and send to user's email.
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Use generic message to prevent user enumeration
  if (!user) {
    throw new AppError('If this email is registered, an OTP will be sent to it.', 200);
  }

  const otp = generateOTP();
  const expiryMinutes = getOtpExpiryMinutes();
  const expiry = new Date(Date.now() + expiryMinutes * 60000);

  user.otpCode = otp;
  user.otpExpiry = expiry;
  user.passwordResetVerifiedAt = undefined;
  await user.save({ validateBeforeSave: false });

  await sendOTPEmail(email, otp);
};

/**
 * STEP 2: Verify OTP code.
 */
const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email }).select('+otpCode +otpExpiry');

  if (!user || user.otpCode !== otp) {
    throw new AppError('Invalid OTP.', 400);
  }

  if (user.otpExpiry < new Date()) {
    throw new AppError('OTP has expired. Please request a new one.', 400);
  }

  // Clear OTP and mark reset window as verified
  user.otpCode = undefined;
  user.otpExpiry = undefined;
  user.passwordResetVerifiedAt = new Date();
  await user.save({ validateBeforeSave: false });
};

/**
 * STEP 3: Set new password.
 */
const resetPassword = async (email, newPassword) => {
  const user = await User.findOne({ email }).select('+passwordResetVerifiedAt');

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (!user.passwordResetVerifiedAt) {
    throw new AppError('Please verify your OTP before resetting your password.', 400);
  }

  const windowMs = getPasswordResetWindowMinutes() * 60000;
  if (Date.now() - user.passwordResetVerifiedAt.getTime() > windowMs) {
    user.passwordResetVerifiedAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Password reset session has expired. Please verify your OTP again.', 400);
  }

  // Password hashing is handled by the User pre-save hook
  user.password = newPassword;
  user.passwordResetVerifiedAt = undefined;
  await user.save();
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  verifyOTP,
  resetPassword,
};