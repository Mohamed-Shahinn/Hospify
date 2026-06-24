/**
 * asyncHandler — wraps async controller functions to automatically
 * forward any rejected promise to Express's next(err) error handler.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 *
 * Without this wrapper you'd need try/catch in every single controller.
 *
 * @param {Function} fn  Async route handler / controller function
 * @returns {Function}   Express-compatible middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
