const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { PAGINATION } = require('../config/constants');

/**
 * GET /api/patients/profile
 * Get the authenticated patient's profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id }).populate(
    'userId',
    'name email phone avatar createdAt'
  );

  if (!patient) {
    throw new AppError('Patient profile not found.', 404);
  }

  return successResponse(res, {
    message: 'Patient profile retrieved.',
    data: patient,
  });
});

/**
 * PUT /api/patients/profile
 * Update the authenticated patient's profile.
 * Fields are selectively merged — only provided fields are updated.
 */
const updateProfile = asyncHandler(async (req, res) => {
  // Prevent userId from being changed
  const { userId, ...updateData } = req.body;

  const patient = await Patient.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('userId', 'name email phone avatar');

  if (!patient) {
    throw new AppError('Patient profile not found.', 404);
  }

  return successResponse(res, {
    message: 'Profile updated successfully.',
    data: patient,
  });
});

/**
 * GET /api/patients/appointments
 * Get the patient's appointment history with pagination.
 */
const getAppointments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const { status } = req.query;

  // Get patient profile first
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new AppError('Patient profile not found.', 404);
  }

  // Build query
  const query = { patientId: patient._id };
  if (status) query.status = status;

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate({
        path: 'doctorId',
        select: 'specializations consultationFee',
        populate: { path: 'userId', select: 'name email avatar phone' },
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

/**
 * GET /api/patients/records
 * Get the authenticated patient's medical records.
 */
const getMedicalRecords = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new AppError('Patient profile not found.', 404);
  }

  const [records, total] = await Promise.all([
    MedicalRecord.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        select: 'specializations',
        populate: { path: 'userId', select: 'name' },
      })
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),
    MedicalRecord.countDocuments({ patientId: patient._id }),
  ]);

  return successResponse(res, {
    message: 'Medical records retrieved.',
    data: records,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * GET /api/patients/records/:recordId/prescriptions
 * Get prescriptions for a specific medical record.
 */
const getPrescriptions = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new AppError('Patient profile not found.', 404);
  }

  // Verify record belongs to this patient
  const record = await MedicalRecord.findOne({
    _id: req.params.recordId,
    patientId: patient._id,
  });
  if (!record) {
    throw new AppError('Medical record not found.', 404);
  }

  const prescriptions = await Prescription.find({ medicalRecordId: record._id }).populate({
    path: 'doctorId',
    select: 'specializations',
    populate: { path: 'userId', select: 'name' },
  });

  return successResponse(res, {
    message: 'Prescriptions retrieved.',
    data: prescriptions,
  });
});

module.exports = { getProfile, updateProfile, getAppointments, getMedicalRecords, getPrescriptions };
