const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    chiefComplaint: {
      type: String,
      trim: true,
    },
    diagnoses: [
      {
        name: { type: String, required: true },
        code: { type: String },
      },
    ],
    vitalSigns: {
      bloodPressure: { type: String },
      temperature: { type: Number },
      pulse: { type: Number },
      respiratoryRate: { type: Number },
    },
    clinicalNotes: {
      type: String,
      trim: true,
    },
    treatmentPlan: {
      type: String,
      trim: true,
    },
    followUp: {
      type: Date,
    },
    authorizedDoctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
    isFinalized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
