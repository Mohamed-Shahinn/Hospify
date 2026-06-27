const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { ROLES, PAGINATION } = require('../config/constants');
const notificationService = require('../services/notification.service');

/**
 * POST /api/records
 * Doctor only — create a new medical record for an appointment.
 */
const createRecord = asyncHandler(async (req, res) => {
  const {
    appointmentId,
    chiefComplaint,
    diagnoses,
    vitalSigns,
    clinicalNotes,
    treatmentPlan,
    followUp,
    authorizedDoctors,
    isFinalized,
  } = req.body;

  // 1. Get doctor profile
  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    throw new AppError('Doctor profile not found.', 404);
  }

  // 2. Get and verify appointment
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.doctorId.toString() !== doctor._id.toString()) {
    throw new AppError('You are not authorized to create a record for this appointment.', 403);
  }

  // Check if a record already exists for this appointment
  const existingRecord = await MedicalRecord.findOne({ appointmentId });
  if (existingRecord) {
    throw new AppError('A medical record already exists for this appointment.', 400);
  }

  // 3. Create medical record
  const record = await MedicalRecord.create({
    patientId: appointment.patientId,
    doctorId: doctor._id,
    appointmentId,
    visitDate: appointment.date,
    chiefComplaint,
    diagnoses,
    vitalSigns,
    clinicalNotes,
    treatmentPlan,
    followUp,
    authorizedDoctors: authorizedDoctors || [],
    isFinalized: isFinalized || false,
  });

  // 4. Update appointment with medical record link and mark as completed
  appointment.medicalRecordId = record._id;
  appointment.status = 'completed';
  await appointment.save();

  // 5. Send notification to patient
  const patient = await Patient.findById(appointment.patientId).populate('userId');
  if (patient && patient.userId) {
    const visitDateStr = appointment.date.toISOString().split('T')[0];
    await notificationService.notifyRecordAdded(patient.userId._id, {
      doctorName: req.user.name,
      visitDate: visitDateStr,
      recordId: record._id,
    });
  }

  return successResponse(res, {
    status: 201,
    message: 'Medical record created successfully.',
    data: record,
  });
});

/**
 * GET /api/records
 * Doctor or Patient — list medical records with access control.
 * Patients can only see their own records.
 * Doctors can see records they created, or records they are authorized to view.
 */
const getRecords = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  let query = {};

  if (req.user.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      throw new AppError('Patient profile not found.', 404);
    }
    query.patientId = patient._id;
  } else if (req.user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      throw new AppError('Doctor profile not found.', 404);
    }
    // Doctors see records they created OR records they have authorized access to
    query = {
      $or: [
        { doctorId: doctor._id },
        { authorizedDoctors: doctor._id },
      ],
    };
  } else if (req.user.role === ROLES.ADMIN) {
    // Admin can see all, query stays empty unless filtering by patientId/doctorId
    if (req.query.patientId) query.patientId = req.query.patientId;
    if (req.query.doctorId) query.doctorId = req.query.doctorId;
  } else {
    throw new AppError('Unauthorized access to medical records.', 403);
  }

  const [records, total] = await Promise.all([
    MedicalRecord.find(query)
      .populate({
        path: 'patientId',
        select: 'dateOfBirth gender bloodType',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate({
        path: 'doctorId',
        select: 'specializations',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .populate('appointmentId', 'date timeSlot type')
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit),
    MedicalRecord.countDocuments(query),
  ]);

  return successResponse(res, {
    message: 'Medical records retrieved.',
    data: records,
    meta: paginationMeta(total, page, limit),
  });
});

/**
 * GET /api/records/:id
 * Get a single medical record by ID with access checks.
 */
const getRecordById = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate({
      path: 'patientId',
      select: 'dateOfBirth gender bloodType allergies medicalHistory emergencyContact',
      populate: { path: 'userId', select: 'name email phone avatar' },
    })
    .populate({
      path: 'doctorId',
      select: 'specializations licenseNumber',
      populate: { path: 'userId', select: 'name email phone' },
    })
    .populate('appointmentId', 'date timeSlot reasonForVisit');

  if (!record) {
    throw new AppError('Medical record not found.', 404);
  }

  // Access control
  if (req.user.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || record.patientId._id.toString() !== patient._id.toString()) {
      throw new AppError('You do not have permission to view this medical record.', 403);
    }
  } else if (req.user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      throw new AppError('Doctor profile not found.', 404);
    }
    const isOwner = record.doctorId._id.toString() === doctor._id.toString();
    const isAuthorized = record.authorizedDoctors.some(
      (docId) => docId.toString() === doctor._id.toString()
    );
    if (!isOwner && !isAuthorized) {
      throw new AppError('You do not have permission to view this medical record.', 403);
    }
  }

  return successResponse(res, {
    message: 'Medical record retrieved successfully.',
    data: record,
  });
});

/**
 * POST /api/records/:id/prescriptions
 * Doctor only — issue a new prescription linked to a medical record.
 */
const addPrescription = asyncHandler(async (req, res) => {
  const { medications, validUntil, additionalInstructions } = req.body;

  const doctor = await Doctor.findOne({ userId: req.user._id });
  if (!doctor) {
    throw new AppError('Doctor profile not found.', 404);
  }

  const record = await MedicalRecord.findById(req.params.id);
  if (!record) {
    throw new AppError('Medical record not found.', 404);
  }

  // Access check
  if (record.doctorId.toString() !== doctor._id.toString()) {
    throw new AppError('You can only add prescriptions to records you created.', 403);
  }

  const prescription = await Prescription.create({
    medicalRecordId: record._id,
    doctorId: doctor._id,
    patientId: record.patientId,
    medications,
    validUntil,
    additionalInstructions,
  });

  // Notify patient of the new prescription
  const patient = await Patient.findById(record.patientId).populate('userId');
  if (patient && patient.userId) {
    await notificationService.notifyPrescriptionAdded(patient.userId._id, {
      doctorName: req.user.name,
      prescriptionId: prescription._id,
    });
  }

  return successResponse(res, {
    status: 201,
    message: 'Prescription added successfully.',
    data: prescription,
  });
});

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  addPrescription,
};
