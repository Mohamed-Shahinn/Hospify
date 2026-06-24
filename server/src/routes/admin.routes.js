const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Apply authentication and check for admin role for all admin routes
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getAllUsers);
router.get('/dashboard', adminController.getDashboard);

router.patch(
  '/users/:id/status',
  [
    body('isActive')
      .notEmpty().withMessage('isActive status is required')
      .isBoolean().withMessage('isActive must be a boolean'),
  ],
  validate,
  adminController.updateUserStatus
);

module.exports = router;
