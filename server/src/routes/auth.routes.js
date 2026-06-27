const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  updateProfileValidation,
} = require('../validators/auth.validator');
const { forgotPasswordValidator, verifyOTPValidator, resetPasswordValidator } = require('../validators/otp.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', refreshTokenValidation, validate, authController.refreshToken);
router.get('/me', authenticate, authController.getMe);
router.put('/me/profile', authenticate, updateProfileValidation, validate, authController.updateUserProfile);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/verify-otp', verifyOTPValidator, validate, authController.verifyOTP);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);



module.exports = router;
