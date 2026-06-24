const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { ROLES } = require('../config/constants');

const seedDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📝  Database already has users. Skipping seeding.');
      return;
    }

    console.log('🌱  Seeding database with initial users, doctors, and hospitals...');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'Hospify Admin',
      email: 'admin@hospify.com',
      password: 'Password123', // Hashed automatically by pre-save User hook
      role: ROLES.ADMIN,
      isActive: true,
      isVerified: true,
      phone: '+1234567890',
    });
    console.log('🏥  Seeded Admin User: admin@hospify.com');

    // 2. Create Patient User & Patient Profile
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@hospify.com',
      password: 'Password123',
      role: ROLES.PATIENT,
      isActive: true,
      isVerified: true,
      phone: '+1987654321',
    });

    const patientProfile = await Patient.create({
      userId: patientUser._id,
      dateOfBirth: new Date('1990-05-15'),
      gender: 'male',
      bloodType: 'O+',
      allergies: ['Penicillin'],
      address: {
        street: '123 Health Road',
        city: 'Cairo',
        country: 'Egypt'
      }
    });
    console.log('🏥  Seeded Patient User: patient@hospify.com');

    // 3. Create Hospital User & Profile
    const hospitalUser = await User.create({
      name: 'Hospify General Hospital Admin',
      email: 'hospital@hospify.com',
      password: 'Password123',
      role: ROLES.HOSPITAL,
      isActive: true,
      isVerified: true,
      phone: '+1122334455',
    });

    const hospital = await Hospital.create({
      userId: hospitalUser._id,
      name: 'Hospify General Hospital',
      registrationNumber: 'HOSP998877',
      type: 'private',
      description: 'A premium multidisciplinary hospital offering state-of-the-art medical services.',
      address: {
        street: '123 Health Ave',
        city: 'Cairo',
        state: 'Cairo Governorate',
        country: 'Egypt',
        postalCode: '11511',
      },
      contactInfo: {
        phone: '+2021234567',
        emergencyPhone: '+202999111',
        email: 'info@hospify.com',
        website: 'www.hospify.com',
      },
    });
    console.log('🏥  Seeded Hospital Profile: Hospify General Hospital');

    // 4. Create Doctor Users & Profiles
    const doctorData = [
      {
        name: 'Dr. Sarah Wilson',
        email: 'sarah.wilson@hospify.com',
        licenseNumber: 'DOC001',
        specializations: ['Cardiology'],
        rating: 4.9,
        totalReviews: 24,
        consultationFee: 150,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30, isAvailable: true },
        ],
      },
      {
        name: 'Dr. James Chen',
        email: 'james.chen@hospify.com',
        licenseNumber: 'DOC002',
        specializations: ['Dermatology'],
        rating: 4.8,
        totalReviews: 19,
        consultationFee: 120,
        availability: [
          { day: 'Tuesday', startTime: '10:00', endTime: '16:00', slotDuration: 30, isAvailable: true },
          { day: 'Thursday', startTime: '10:00', endTime: '16:00', slotDuration: 30, isAvailable: true },
        ],
      },
      {
        name: 'Dr. Emily Brown',
        email: 'emily.brown@hospify.com',
        licenseNumber: 'DOC003',
        specializations: ['Orthopedics'],
        rating: 4.7,
        totalReviews: 15,
        consultationFee: 130,
        availability: [
          { day: 'Wednesday', startTime: '09:00', endTime: '15:00', slotDuration: 30, isAvailable: true },
          { day: 'Friday', startTime: '09:00', endTime: '15:00', slotDuration: 30, isAvailable: true },
        ],
      },
      {
        name: 'Dr. Michael Lee',
        email: 'michael.lee@hospify.com',
        licenseNumber: 'DOC004',
        specializations: ['Pediatrics'],
        rating: 4.9,
        totalReviews: 32,
        consultationFee: 110,
        availability: [
          { day: 'Monday', startTime: '08:00', endTime: '14:00', slotDuration: 30, isAvailable: true },
          { day: 'Thursday', startTime: '12:00', endTime: '18:00', slotDuration: 30, isAvailable: true },
        ],
      },
    ];

    for (const doc of doctorData) {
      const docUser = await User.create({
        name: doc.name,
        email: doc.email,
        password: 'Password123',
        role: ROLES.DOCTOR,
        isActive: true,
        isVerified: true,
        phone: '+1002003000',
      });

      await Doctor.create({
        userId: docUser._id,
        licenseNumber: doc.licenseNumber,
        specializations: doc.specializations,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        consultationFee: doc.consultationFee,
        hospitals: [hospital._id],
        availability: doc.availability,
      });
      console.log(`🏥  Seeded Doctor User: ${doc.name}`);
    }

    console.log('✅  Database seeding completed successfully!');
  } catch (error) {
    console.error('❌  Seeding database failed:', error);
  }
};

module.exports = seedDB;
