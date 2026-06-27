const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION, ROLES } = require('../config/constants');

/**
 * GET /api/admin/stats
 * Admin only — Retrieve platform-wide statistics.
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    totalHospitals,
    totalAppointments,
    appointmentStats,
    totalRecords,
  ] = await Promise.all([
    User.countDocuments(),
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Hospital.countDocuments(),
    Appointment.countDocuments(),
    Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    MedicalRecord.countDocuments(),
  ]);

  // Format appointment stats into a nice object
  const appointmentsByStatus = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    no_show: 0,
  };

  appointmentStats.forEach((stat) => {
    if (appointmentsByStatus[stat._id] !== undefined) {
      appointmentsByStatus[stat._id] = stat.count;
    }
  });

  return successResponse(res, {
    message: 'Platform statistics retrieved.',
    data: {
      users: {
        total: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        hospitals: totalHospitals,
      },
      appointments: {
        total: totalAppointments,
        byStatus: appointmentsByStatus,
      },
      medicalRecords: {
        total: totalRecords,
      },
    },
  });
});

/**
 * GET /api/admin/users
 * Admin only — List all users with query filters (role, isActive, search name/email) and pagination.
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const { role, isActive, search } = req.query;
  const filter = {};

  if (role) {
    filter.role = role;
  }
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return successResponse(res, {
    message: 'Users retrieved successfully.',
    data: users,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * PATCH /api/admin/users/:id/status
 * Admin only — Activate or deactivate user accounts.
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const userId = req.params.id;

  if (isActive === undefined) {
    throw new AppError('isActive status is required.', 400);
  }

  // Prevent admin from deactivating themselves
  if (userId === req.user._id.toString()) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  user.isActive = isActive;
  await user.save();

  return successResponse(res, {
    message: `User account has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
    data: user,
  });
});

/**
 * GET /api/admin/dashboard
 * Admin only — Aggregated dashboard data (stats + recent signups + recent appointments).
 */
const getDashboard = asyncHandler(async (req, res) => {
  const [
    recentUsers,
    recentAppointments,
  ] = await Promise.all([
    User.find()
      .sort({ createdAt: -1 })
      .limit(5),
    Appointment.find()
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name email' },
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  // We can reuse the stats retrieval logic to provide a single all-in-one payload
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    totalHospitals,
    totalAppointments,
    totalRecords,
  ] = await Promise.all([
    User.countDocuments(),
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Hospital.countDocuments(),
    Appointment.countDocuments(),
    MedicalRecord.countDocuments(),
  ]);

  return successResponse(res, {
    message: 'Admin dashboard data retrieved.',
    data: {
      stats: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          hospitals: totalHospitals,
        },
        appointments: {
          total: totalAppointments,
        },
        medicalRecords: {
          total: totalRecords,
        },
      },
      recentUsers,
      recentAppointments,
    },
  });
});

module.exports = {
  getStats,
  getAllUsers,
  updateUserStatus,
  getDashboard,
};
