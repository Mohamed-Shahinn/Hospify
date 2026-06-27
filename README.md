dependenciesrontendepository-urlepository-url Hospify

A modern Full-Stack Hospital Management System built with React, Node.js, Express, TypeScript, and MongoDB.

---

# Team Members

- Mohamed Maher Mohamed
- Mostafa Khaled Mahmoud
- Mostafa Eid Abdelmonem
- Dina Yehya Abdelmonem
- Dina Abdelsalam Ahmed

---

# Instructor

Hesham Mohamed

---

# Project Overview

Hospify is a modern hospital management platform designed to simplify healthcare operations through a secure role-based system.

The system enables patients to book appointments online, doctors to manage their schedules and appointments, and administrators to oversee the entire hospital workflow from a centralized dashboard.

Hospify was developed following Clean Architecture principles to ensure scalability, maintainability, and separation of concerns.

---

# Key Features

## Authentication

- JWT Authentication
- Secure Login
- User Registration
- Email OTP Verification
- Role-Based Authorization

---

## Patient Module

- Patient Dashboard
- Patient Profile Management
- Book Appointments
- Appointment History
- Medical Information Management

---

## Doctor Module

- Doctor Dashboard
- Doctor Profile
- Doctor Directory
- Appointment Management
- Availability Management

---

## Appointment Management

- Book Appointment
- Confirm Appointment
- Complete Appointment
- Cancel Appointment
- Appointment Status Tracking

---

## Admin

- Manage Patients
- Manage Doctors
- View Appointments
- Hospital Statistics

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- React Query
- Tailwind CSS
- shadcn/ui

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Bcrypt

---

# Project Architecture

The backend follows Clean Architecture principles.

```
Controllers
      │
      ▼
Services
      │
      ▼
Repositories
      │
      ▼
MongoDB
```

---

# Project Structure

```
client/
│
├── components/
├── pages/
├── hooks/
├── services/
├── layouts/
└── contexts/

server/
│
├── controllers/
├── services/
├── repositories/
├── middleware/
├── models/
├── routes/
├── validators/
└── config/
```

---

# Core Functionalities

- Secure Authentication
- Role-Based Access Control
- Patient Management
- Doctor Management
- Appointment Scheduling
- Doctor Directory
- Dashboard Statistics
- MongoDB Integration
- RESTful API
- Responsive User Interface

---

# Future Improvements

- Email Notifications
- SMS Appointment Reminders
- Online Payments
- Medical Reports Upload
- Real-time Notifications
- Video Consultation
- Analytics Dashboard

---

# Installation

### Clone the repository

```bash
git clone <https://github.com/Mohamed-Shahinn/Hospify>
```

### Install frontend dependencies

```bash
npm install
```

### Install backend dependencies

```bash
cd server
npm install
```

### Start backend

```bash
npm run dev
```

### Start frontend

```bash
npm run dev
```

---

# Contributors

Developed by the Hospify Team ❤️
