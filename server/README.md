# Hospify Backend API

Welcome to the **Hospify Backend API**, a secure, scalable, and production-ready Express.js application designed to power the Hospify Healthcare Platform. It connects Patients, Doctors, Hospitals, and Admins via structured, role-scoped RESTful endpoints.

## 🏥 Architecture Overview

The backend uses a layered architecture to separate concerns and maintain clean code:

```
Request ──► Middleware (Auth, Rate Limit, Validation) ──► Controllers ──► Services ──► MongoDB
```

- **Routes**: Define HTTP entry points and map them to middlewares and controllers.
- **Middleware**: Intercepts requests for authentication (JWT), authorization (RBAC), request rate-limiting, and validation schema execution.
- **Controllers**: Handle HTTP requests, parsing parameters, checking resource ownership, and invoking business logic.
- **Services**: Contain pure business logic (e.g., availability slot calculations, double-booking checks, notification triggers).
- **Models**: MongoDB schemas with data validation rules, indexes, and hook triggers.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Security**: Helmet, CORS, express-rate-limit, BCryptJS (password hashing)
- **Authentication**: JWT (Access Tokens + Refresh Tokens)
- **Validation**: express-validator

---

## 📂 Project Structure

```
server/
├── src/
│   ├── config/          # DB connections, system constants
│   ├── controllers/     # Route request handlers
│   ├── middleware/      # Auth, error handling, rate limiters, validation runners
│   ├── models/          # Mongoose database models
│   ├── routes/          # REST route definitions mapped by resources
│   ├── services/        # Centralized business logic (appointment slots, notifications)
│   ├── utils/           # Response builders, token signers, async wrappers
│   ├── validators/      # express-validator chain definitions
│   └── app.js           # Express app setup and middleware configuration
├── .env.example         # Template for environment configuration
├── .gitignore           # Git ignore patterns
├── package.json         # Scripts and dependencies
└── server.js            # Main HTTP server entry point
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas connection URI

### Installation

1. Clone or navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Open `.env` and adjust the variables as needed:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/hospify
   JWT_SECRET=your-secure-jwt-secret
   JWT_REFRESH_SECRET=your-secure-refresh-secret
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

---

## 🏃 Running the Application

### Development Mode (auto-reloads on changes)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

## 🔑 Authentication Flow

Hospify uses a dual-token JWT mechanism (Access & Refresh tokens) to balance security and UX:

1. **Login/Register**: Client receives `accessToken` (short-lived, e.g. 15m) and `refreshToken` (long-lived, e.g. 7d).
2. **Accessing API**: Client attaches `Authorization: Bearer <accessToken>` header.
3. **Session Refresh**: When the access token expires, client hits `POST /api/auth/refresh` sending the refresh token to get a new access token.
4. **Logout**: Invalidates the refresh token on the server by removing it from the database blocklist.

---

## 📡 API Reference

### Auth Endpoint (`/api/auth`)
- `POST /register` - Register a patient, doctor, or hospital.
- `POST /login` - Log in and obtain token pairs.
- `POST /logout` - Log out and invalidate sessions.
- `POST /refresh` - Retrieve a new access token using a refresh token.
- `GET /me` - Retrieve the currently logged-in user and their profile.

### Patients (`/api/patients`)
- `GET /profile` - Get patient profile.
- `PUT /profile` - Update patient details.
- `GET /appointments` - List patient's appointments (paginated).
- `GET /records` - List patient's medical records (paginated).
- `GET /records/:recordId/prescriptions` - List prescriptions associated with a medical record.

### Doctors (`/api/doctors`)
- `GET /` - Public search/filter doctor directory.
- `GET /:id` - Public doctor details.
- `GET /:id/availability` - Public available slots search by date.
- `PUT /profile` - [Doctor Only] Update profile fields (consultation fee, bio, specializations).
- `PUT /availability` - [Doctor Only] Set weekly recurrence availability.
- `GET /appointments/list` - [Doctor Only] List appointments booked for this doctor.

### Hospitals (`/api/hospitals`)
- `GET /` - Search/list hospitals.
- `GET /:id` - Hospital details.
- `GET /:id/doctors` - Retrieve list of doctors practicing at this hospital.
- `PUT /profile` - [Hospital Only] Update contact info, bed capacity.
- `POST /departments` - [Hospital Only] Register hospital departments.

### Appointments (`/api/appointments`)
- `POST /` - [Patient Only] Book an appointment slot.
- `GET /` - List all appointments (role-scoped).
- `GET /:id` - Retrieve individual appointment details.
- `PATCH /:id/status` - [Doctor/Admin] Update status (confirm, cancel, complete).
- `PATCH /:id/reschedule` - [Patient Only] Request a new date/time slot.

### Medical Records (`/api/records`)
- `POST /` - [Doctor Only] Create medical record after appointment.
- `GET /` - List medical records (access-controlled: Patient sees own, Doctor sees created/authorized, Admin sees all).
- `GET /:id` - Detailed view of a medical record.
- `POST /:id/prescriptions` - [Doctor Only] Issue a prescription linked to the record.

### Admin Dashboard (`/api/admin`)
- `GET /stats` - Aggregated counts.
- `GET /dashboard` - Dashboard summaries (stats, recent signups, recent bookings).
- `GET /users` - Filterable paginated directory of all user accounts.
- `PATCH /users/:id/status` - Activate or deactivate user accounts.

### Notifications (`/api/notifications`)
- `GET /` - Retrieve user's in-app notifications.
- `PATCH /read-all` - Bulk mark all as read.
- `PATCH /:id/read` - Mark single notification as read.
