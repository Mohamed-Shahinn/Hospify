const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');
const appointmentService = require('../services/appointment.service');

/**
 * GET /api/doctors
 * Public — list all doctors with filters and pagination.
 * Query params: specialization, hospitalId, page, limit, search, minRating
 */
const getDoctors = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip  = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.specialization) filter.specializations = req.query.specialization;
  if (req.query.hospitalId)     filter.hospitals = req.query.hospitalId;
  if (req.query.minRating)      filter.rating = { $gte: parseFloat(req.query.minRating) };
  if (req.query.online === 'true') filter.isAvailableForOnlineConsultation = true;

  // Build text search on user name — requires a lookup via populate
  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate({
        path: 'userId',
        select: 'name email phone avatar isActive',
        ...(req.query.search
          ? { match: { name: { $regex: req.query.search, $options: 'i' }, isActive: true } }
          : { match: { isActive: true } }),
      })
      .populate('hospitals', 'name address.city')
      .sort({ rating: -1 })
      .skip(skip)
      .limit(limit),
    Doctor.countDocuments(filter),
  ]);

  // Filter out doctors where populate returned null (inactive users)
  const filtered = doctors.filter((d) => d.userId !== null);

  return successResponse(res, {
    message: 'Doctors retrieved successfully.',
    data: filtered,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * GET /api/doctors/:id
 * Public — get a single doctor's full profile.
 */
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name email phone avatar createdAt')
    .populate('hospitals', 'name address type contactInfo');

  if (!doctor || !doctor.userId) {
    throw new AppError('Doctor not found.', 404);
  }

  return successResponse(res, {
    message: 'Doctor retrieved successfully.',
    data: doctor,
  });
});

/**
 * PUT /api/doctors/profile
 * Doctor only — update own profile.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { userId, hospitals, rating, totalReviews, ...updateData } = req.body;

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('userId', 'name email phone avatar')
    .populate('hospitals', 'name address.city');

  if (!doctor) {
    throw new AppError('Doctor profile not found.', 404);
  }

  return successResponse(res, {
    message: 'Doctor profile updated successfully.',
    data: doctor,
  });
});

/**
 * PUT /api/doctors/availability
 * Doctor only — set weekly availability schedule.
 */
const updateAvailability = asyncHandler(async (req, res) => {
  const { availability } = req.body;

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { availability } },
    { new: true, runValidators: true }
  );

  if (!doctor) {
    throw new AppError('Doctor profile not found.', 404);
  }

  return successResponse(res, {
    message: 'Availability schedule updated successfully.',
    data: { availability: doctor.availability },
  });
});

/**
 * GET /api/doctors/:id/availability?date=YYYY-MM-DD
 * Public — get available time slots for a doctor on a specific date.
 */
const getAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    throw new AppError('Please provide a date query parameter (YYYY-MM-DD).', 400);
  }

  const slots = await appointmentService.getAvailableSlots(req.params.id, date);

  return successResponse(res, {
    message: 'Availability slots retrieved.',
    data: slots,
  });
});

/**
 * GET /api/doctors/appointments
 * Doctor only — list own appointments.
 */
const getAppointments = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip  = (page - 1) * limit;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const query = { doctorId: doctor._id };
  if (req.query.status) query.status = req.query.status;
  if (req.query.date)   query.date   = new Date(req.query.date);

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate({
        path: 'patientId',
        select: 'dateOfBirth gender bloodType',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate('hospitalId', 'name address.city')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(query),
  ]);

  return successResponse(res, {
    message: 'Appointments retrieved.',
    data: appointments,
    meta: paginationMeta(total, page, limit),
  });
});

module.exports = {
  getDoctors,
  getDoctorById,
  updateProfile,
  updateAvailability,
  getAvailability,
  getAppointments,
};
