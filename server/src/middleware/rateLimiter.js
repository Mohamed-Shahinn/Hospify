const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

// ─── Helper ───────────────────────────────────────────────────────────────────
const rateLimitHandler = (req, res) => {
  return errorResponse(res, {
    message: 'Too many requests. Please slow down and try again later.',
    status: 429,
  });
};

/**
 * Auth Rate Limiter — strict limit for login/register endpoints.
 * Prevents brute-force attacks on authentication routes.
 *
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
});

/**
 * General API Rate Limiter — applied to all other routes.
 * 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Upload Rate Limiter — for file upload endpoints.
 * 20 uploads per hour per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { authLimiter, apiLimiter, uploadLimiter };
