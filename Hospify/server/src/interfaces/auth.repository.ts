import type { OtpPurpose, OtpRecord } from "../models/otp.model";
import type { User, UserRole } from "../models/user.model";

export interface CreateUserData {
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userId: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  setUserVerified(userId: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  saveOtp(record: OtpRecord): Promise<void>;
  findOtp(email: string, purpose: OtpPurpose): Promise<OtpRecord | null>;
  deleteOtp(email: string, purpose: OtpPurpose): Promise<void>;
}
