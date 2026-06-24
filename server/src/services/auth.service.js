const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenManager');
const { AppError } = require('../middleware/errorHandler');

/**
 * Auth Service — Business logic for authentication.
 * Controllers call these methods; they don't touch the DB directly.
 */

/**
 * Register a new user.
 * Checks for duplicate email before creating.
 * Does NOT create the role-specific profile (Patient/Doctor/Hospital) —
 * that is done by the calling controller after the user is created.
 *
 * @param {{ name, email, password, role, phone }} userData
 * @returns {{ user, accessToken, refreshToken }}
 */
const register = async ({ name, email, password, role, phone }) => {
  // Check for existing email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Create user (password hashing is done in User pre-save hook)
  const user = await User.create({ name, email, password, role, phone });

  // Issue tokens
  const tokens = generateTokenPair(user);

  // Store refresh token hash in DB
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user, ...tokens };
};

/**
 * Login an existing user.
 * @param {{ email, password }} credentials
 * @returns {{ user, accessToken, refreshToken }}
 */
const login = async ({ email, password }) => {
  // Explicitly select password (hidden by default)
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user) {
    // Use generic message to prevent user enumeration
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact support.', 403);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Issue new tokens
  const tokens = generateTokenPair(user);

  // Update refresh token and last login
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Remove sensitive fields from user object
  user.password = undefined;
  user.refreshToken = undefined;

  return { user, ...tokens };
};

/**
 * Logout — clears the refresh token from DB.
 * @param {string} userId  The authenticated user's ID
 */
const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

/**
 * Refresh access token using a valid refresh token.
 * @param {string} refreshToken
 * @returns {{ accessToken, refreshToken }}
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

  // Issue new token pair (token rotation)
  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return tokens;
};

module.exports = { register, login, logout, refreshTokens };
