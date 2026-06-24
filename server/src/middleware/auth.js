const User = require('../models/User');
const { verifyAccessToken, extractBearerToken } = require('../utils/tokenManager');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Authentication Middleware
 *
 * Verifies the JWT access token from the Authorization header.
 * On success, attaches the full user document to req.user.
 * On failure, returns a 401 Unauthorized response.
 *
 * Usage: router.get('/protected', authenticate, controller)
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return errorResponse(res, {
        message: 'Access denied. No authentication token provided.',
        status: 401,
      });
    }

    // 2. Verify and decode token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtError) {
      const message =
        jwtError.name === 'TokenExpiredError'
          ? 'Access token has expired. Please refresh your session.'
          : 'Invalid access token. Please log in again.';

      return errorResponse(res, { message, status: 401 });
    }

    // 3. Fetch user from DB to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return errorResponse(res, {
        message: 'User account not found. Please log in again.',
        status: 401,
      });
    }

    if (!user.isActive) {
      return errorResponse(res, {
        message: 'Your account has been deactivated. Please contact support.',
        status: 403,
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
