export type UserRole = "patient" | "doctor" | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: Extract<UserRole, "patient" | "doctor">;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface LoginResponse {
  success: true;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  success: true;
  message: string;
  verificationRequired: boolean;
}

export interface VerifyOtpResponse {
  success: true;
  message: string;
}
