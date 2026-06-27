const { errorResponse } = require('../utils/apiResponse');

/**
 * Authorization Middleware Factory (Role-Based Access Control)
 *
 * Returns an Express middleware that checks if req.user has one of the
 * allowed roles. Must be used AFTER the authenticate middleware.
 *
 * Usage:
 *   router.delete('/users/:id', authenticate, authorize('admin'), controller)
 *   router.post('/appointments', authenticate, authorize('patient'), controller)
 *   router.patch('/status', authenticate, authorize('doctor', 'admin'), controller)
 *
 * @param {...string} roles  Allowed role strings
 * @returns {Function}       Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // authenticate middleware must run first
    if (!req.user) {
      return errorResponse(res, {
        message: 'Authentication required.',
        status: 401,
      });
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        message: `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`,
        status: 403,
      });
    }

    next();
  };
};

module.exports = authorize;
