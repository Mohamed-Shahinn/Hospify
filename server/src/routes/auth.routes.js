const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  updateProfileValidation,
  forgotPasswordValidator, verifyOTPValidator, resetPasswordValidator
} = require('../validators/auth.validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', refreshTokenValidation, validate, authController.refreshToken);
router.get('/me', authenticate, authController.getMe);
router.put('/me/profile', authenticate, updateProfileValidation, validate, authController.updateUserProfile);
router.post('/forgot-password', forgotPasswordValidator, authController.forgotPassword);
router.post('/verify-otp', verifyOTPValidator, authController.verifyOTP);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);



module.exports = router;
