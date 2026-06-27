const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Validation Middleware
 *
 * Runs after express-validator chains and collects any validation errors.
 * If errors exist, returns a 422 response with the structured error list.
 * Otherwise, calls next() to proceed to the controller.
 *
 * Usage (in routes):
 *   router.post('/register', [...validationChain], validate, registerController)
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {Function}                   next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(res, {
      message: 'Validation failed. Please check the request data.',
      status: 422,
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validate;
