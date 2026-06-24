const { body } = require('express-validator');

const forgotPasswordValidator = [
    body('email').isEmail().withMessage('Valid email is required'),
];

const verifyOTPValidator = [
    body('email').isEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const resetPasswordValidator = [
    body('email').isEmail(),
    body('newPassword').isLength({ min: 6 }).withMessage('Password too short'),
];

module.exports = { forgotPasswordValidator, verifyOTPValidator, resetPasswordValidator };