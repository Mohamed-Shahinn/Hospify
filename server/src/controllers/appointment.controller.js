const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, paginationMeta } = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');
const { APPOINTMENT_STATUS, ROLES, PAGINATION } = require('../config/constants');
const appointmentService = require('../services/appointment.service');
const notificationService = require('../services/notification.service');

/**
 * POST /api/appointments
 * Patient only — book a new appointment.
 */
const createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, hospitalId, date, timeSlot, type, reasonForVisit } = req.body;

  // Get patient profile
  const patient = await Patient.findOne({ userId: req.user._id });
  if (!patient) {
    throw new AppError('Patient profile not found. Please complete your registration.', 404);
  }

  // Verify doctor exists and is active
  const doctor = await Doctor.findById(doctorId).populate('userId', 'name isActive');
  if (!doctor || !doctor.userId || !doctor.userId.isActive) {
    throw new AppError('Doctor not found or is not currently available.', 404);
  }

  // Create appointment (slot availability checked inside service)
  const appointment = await appointmentService.createAppointment({
    patientId: patient._id,
    doctorId,
    hospitalId: hospitalId || null,
    date: new Date(date),
    timeSlot,
    type: type || 'in-person',
    reasonForVisit,
  });

  // Send notification to patient
  await notificationService.notifyAppointmentBooked(req.user._id, {
    doctorName: doctor.userId.name,
    date,
    timeSlot,
    appointmentId: appointment._id,
  });

  const populated = await Appointment.findById(appointment._id)
    .populate({
      path: 'doctorId',
      select: 'specializations consultationFee',
      populate: { path: 'userId', select: 'name email phone' },
    })
    .populate('hospitalId', 'name address.city');

  return successResponse(res, {
    status: 201,
    message: 'Appointment booked successfully.',
    data: populated,
  });
});

/**
 * GET /api/appointments
 * All authenticated users — list appointments (role-scoped).
 */
const getAppointments = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page)  || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip  = (page - 1) * limit;

  let query = {};
  const { status, date } = req.query;

  if (req.user.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) throw new AppError('Patient profile not found.', 404);
    query.patientId = patient._id;
  } else if (req.user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) throw new AppError('Doctor profile not found.', 404);
    query.doctorId = doctor._id;
  }
  // Admin can see all — no filter added

  if (status) query.status = status;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setHours(23, 59, 59, 999);
    query.date = { $gte: d, $lte: dEnd };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate({
        path: 'patientId',
        select: 'dateOfBirth gender bloodType',
        populate: { path: 'userId', select: 'name email phone avatar' },
      })
      .populate({
        path: 'doctorId',
        select: 'specializations consultationFee',
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

/**
 * GET /api/appointments/:id
 * Get a single appointment by ID.
 * Patients can only see their own; doctors only theirs; admins see all.
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'patientId',
      select: 'dateOfBirth gender bloodType allergies',
      populate: { path: 'userId', select: 'name email phone avatar' },
    })
    .populate({
      path: 'doctorId',
      select: 'specializations consultationFee',
      populate: { path: 'userId', select: 'name email phone avatar' },
    })
    .populate('hospitalId', 'name address contactInfo');

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Access control
  if (req.user.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
      throw new AppError('You do not have permission to view this appointment.', 403);
    }
  } else if (req.user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      throw new AppError('You do not have permission to view this appointment.', 403);
    }
  }

  return successResponse(res, {
    message: 'Appointment retrieved.',
    data: appointment,
  });
});

/**
 * PATCH /api/appointments/:id/status
 * Doctor, Admin or Patient — update appointment status.
 * - Patients can only cancel their own appointments.
 * - Doctors can confirm (booked), complete, or cancel their own appointments.
 * - Admins can do anything.
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, cancellationReason, doctorNotes } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'name _id' },
    })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name' },
    });

  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  // Patient role: can only cancel their own appointment
  if (req.user.role === ROLES.PATIENT) {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient || appointment.patientId._id.toString() !== patient._id.toString()) {
      throw new AppError('You can only cancel your own appointments.', 403);
    }
    if (status !== APPOINTMENT_STATUS.CANCELLED) {
      throw new AppError('Patients can only cancel appointments.', 403);
    }
  }

  // Doctor role: can only update their own appointments
  if (req.user.role === ROLES.DOCTOR) {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      throw new AppError('You can only update your own appointments.', 403);
    }
  }

  // Prevent invalid status transitions
  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new AppError('Cannot change the status of a cancelled appointment.', 400);
  }
  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new AppError('Cannot change the status of a completed appointment.', 400);
  }

  appointment.status = status;
  if (cancellationReason) {
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledBy = req.user.role;
  }
  if (doctorNotes) appointment.doctorNotes = doctorNotes;

  await appointment.save();

  // Notify patient of the status change
  const patientUserId = appointment.patientId?.userId?._id;
  if (patientUserId) {
    const dateStr = appointment.date.toISOString().split('T')[0];
    if (status === APPOINTMENT_STATUS.CONFIRMED || status === 'booked') {
      await notificationService.notifyAppointmentConfirmed(patientUserId, {
        doctorName: appointment.doctorId?.userId?.name,
        date: dateStr,
        timeSlot: appointment.timeSlot,
        appointmentId: appointment._id,
      });
    } else if (status === APPOINTMENT_STATUS.CANCELLED) {
      await notificationService.notifyAppointmentCancelled(patientUserId, {
        date: dateStr,
        timeSlot: appointment.timeSlot,
        appointmentId: appointment._id,
        reason: cancellationReason,
      });
    }
  }

  return successResponse(res, {
    message: `Appointment ${status} successfully.`,
    data: appointment,
  });
});

/**
 * PATCH /api/appointments/:id/reschedule
 * Patient only — reschedule an appointment to a new date/time.
 */
const reschedule = asyncHandler(async (req, res) => {
  const { date, timeSlot } = req.body;

  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    date,
    timeSlot,
    req.user
  );

  return successResponse(res, {
    message: 'Appointment rescheduled successfully.',
    data: appointment,
  });
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateStatus,
  reschedule,
};
