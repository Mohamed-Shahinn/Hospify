const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Error Handler Middleware
 *
 * Must be the LAST middleware registered in app.js (after all routes).
 * Express identifies error handlers by their 4-parameter signature: (err, req, res, next).
 *
 * Handles:
 *  - Mongoose validation errors (400)
 *  - Mongoose duplicate key errors (409)
 *  - Mongoose cast errors / invalid ObjectId (400)
 *  - JWT errors (401) — though most are caught in auth.js
 *  - Generic server errors (500)
 */
const errorHandler = (err, req, res, next) => {
  // Log full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('\n❌  Error:', err);
  } else {
    console.error(`❌  [${new Date().toISOString()}] ${err.name}: ${err.message}`);
  }

  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose: Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose: Duplicate Key Error ─────────────────────────────────────────
  else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `A record with this ${field} (${value}) already exists.`;
  }

  // ── Mongoose: Invalid ObjectId (CastError) ────────────────────────────────
  else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for field '${err.path}': "${err.value}"`;
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token has expired. Please log in again.';
  }

  // ── Custom Application Error ──────────────────────────────────────────────
  // Use AppError class (or set err.statusCode directly in controllers)
  else if (err.isOperational) {
    // Already formatted; use as-is
  }

  // ── Generic 500 ───────────────────────────────────────────────────────────
  else if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong on our end. Please try again later.';
  }

  return errorResponse(res, { message, status, errors });
};

/**
 * Simple operational error class for throwing HTTP errors from controllers.
 *
 * Usage:
 *   throw new AppError('Doctor not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
