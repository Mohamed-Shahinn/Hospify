/**
 * Standardized API response builder.
 * All controllers MUST use these helpers — never send raw res.json calls.
 *
 * Success shape:  { success: true,  message, data, meta? }
 * Error shape:    { success: false, message, errors? }
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} options.message   Human-readable success message
 * @param {*}      options.data      Response payload (object or array)
 * @param {number} [options.status]  HTTP status code (default 200)
 * @param {object} [options.meta]    Pagination or extra metadata
 */
const successResponse = (res, { message = 'Success', data = null, status = 200, meta = null }) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string}   options.message  Human-readable error message
 * @param {number}   [options.status] HTTP status code (default 500)
 * @param {Array}    [options.errors] Validation error array
 */
const errorResponse = (res, { message = 'An error occurred', status = 500, errors = null }) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(status).json(payload);
};

/**
 * Build pagination metadata object.
 * @param {number} total    Total documents in collection
 * @param {number} page     Current page number
 * @param {number} limit    Items per page
 */
const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { successResponse, errorResponse, paginationMeta };
