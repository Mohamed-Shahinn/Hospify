import type { PublicUser, RegistrationRole } from "../models/user.model";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  role: RegistrationRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  email: string;
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface LoginResult {
  token: string;
  user: PublicUser;
}
