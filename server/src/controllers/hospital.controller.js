const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * GET /api/hospitals
 * Public — list hospitals with filters and pagination.
 * Query params: city, type, page, limit, search
 */
const getHospitals = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.city)   filter['address.city'] = { $regex: req.query.city, $options: 'i' };
  if (req.query.type)   filter.type = req.query.type;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

  const [hospitals, total] = await Promise.all([
    Hospital.find(filter)
      .populate('userId', 'name email phone isActive')
      .select('-departments') // Exclude heavy nested array in list view
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit),
    Hospital.countDocuments(filter),
  ]);

  const active = hospitals.filter((h) => h.userId && h.userId.isActive);

  return successResponse(res, {
    message: 'Hospitals retrieved successfully.',
    data: active,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * GET /api/hospitals/:id
 * Public — full hospital detail including departments.
 */
const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)
    .populate('userId', 'name email phone avatar createdAt');

  if (!hospital) {
    throw new AppError('Hospital not found.', 404);
  }

  return successResponse(res, {
    message: 'Hospital retrieved successfully.',
    data: hospital,
  });
});

/**
 * PUT /api/hospitals/profile
 * Hospital admin only — update hospital profile.
 */
const updateProfile = asyncHandler(async (req, res) => {
  // Protect immutable fields
  const { userId, registrationNumber, rating, totalReviews, ...updateData } = req.body;

  const hospital = await Hospital.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('userId', 'name email phone');

  if (!hospital) {
    throw new AppError('Hospital profile not found.', 404);
  }

  return successResponse(res, {
    message: 'Hospital profile updated successfully.',
    data: hospital,
  });
});

/**
 * GET /api/hospitals/:id/doctors
 * Public — list all doctors affiliated with a hospital.
 */
const getHospitalDoctors = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip  = (page - 1) * limit;

  // Verify hospital exists
  const hospital = await Hospital.findById(req.params.id);
  if (!hospital) {
    throw new AppError('Hospital not found.', 404);
  }

  const filter = { hospitals: req.params.id };
  if (req.query.specialization) filter.specializations = req.query.specialization;

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate({
        path: 'userId',
        select: 'name email avatar isActive',
        match: { isActive: true },
      })
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit),
    Doctor.countDocuments(filter),
  ]);

  const active = doctors.filter((d) => d.userId !== null);

  return successResponse(res, {
    message: `Doctors at ${hospital.name} retrieved.`,
    data: active,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * POST /api/hospitals/:id/departments
 * Hospital admin only — add a department to the hospital.
 */
const addDepartment = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ userId: req.user._id });
  if (!hospital) {
    throw new AppError('Hospital profile not found.', 404);
  }

  hospital.departments.push(req.body);
  await hospital.save();

  return successResponse(res, {
    status: 201,
    message: 'Department added successfully.',
    data: hospital.departments,
  });
});

module.exports = {
  getHospitals,
  getHospitalById,
  updateProfile,
  getHospitalDoctors,
  addDepartment,
};
