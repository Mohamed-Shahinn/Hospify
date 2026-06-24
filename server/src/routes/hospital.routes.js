const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { ROLES } = require('../config/constants');

// Public routes
router.get('/', hospitalController.getHospitals);
router.get('/:id', hospitalController.getHospitalById);
router.get('/:id/doctors', hospitalController.getHospitalDoctors);

// Protected routes (Hospital admin only)
router.put('/profile', authenticate, authorize(ROLES.HOSPITAL), hospitalController.updateProfile);
router.post('/departments', authenticate, authorize(ROLES.HOSPITAL), hospitalController.addDepartment);

module.exports = router;
