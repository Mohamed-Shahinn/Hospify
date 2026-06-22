import bcrypt from "bcrypt";

import {
  BCRYPT_SALT_ROUNDS,
  OTP_EXPIRATION_MINUTES,
} from "../constants/auth.constants";
import { generateAccessToken } from "../config/jwt";
import { logDevelopmentOtp } from "../config/logger";
import { AppError } from "../errors/app-error";
import type { AuthRepository } from "../interfaces/auth.repository";
import type { OtpPurpose } from "../models/otp.model";
import type { PublicUser, User } from "../models/user.model";
import type {
  ForgotPasswordInput,
  LoginInput,
  LoginResult,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "../types/auth.types";
import { generateOtp } from "../utils/otp";

export class AuthService {
  constructor(private readonly repository: AuthRepository) {}

  async register(input: RegisterInput): Promise<void> {
    const email = this.normalizeEmail(input.email);
    const existingUser = await this.repository.findUserByEmail(email);

    if (existingUser) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    await this.repository.createUser({
      fullName: input.fullName.trim(),
      email,
      passwordHash,
      role: input.role,
    });

    await this.issueOtp(email, "account_verification");
    // TODO(Email Service): Send the verification OTP to the registered email address.
  }

  async verifyOtp(input: VerifyOtpInput): Promise<void> {
    const email = this.normalizeEmail(input.email);
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new AppError(400, "Invalid OTP");
    }

    if (user.isVerified) {
      throw new AppError(400, "Account is already verified");
    }

    await this.assertValidOtp(email, input.otp, "account_verification");
    await this.repository.setUserVerified(user.id);
    await this.repository.deleteOtp(email, "account_verification");
    // TODO(Email Service): Send the welcome email after successful account verification.
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const email = this.normalizeEmail(input.email);
    const user = await this.repository.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, "Invalid credentials");
    }

    if (!user.isVerified) {
      throw new AppError(403, "Account verification is required");
    }

    const token = generateAccessToken({ id: user.id, role: user.role });

    return { token, user: this.toPublicUser(user) };
  }

  async getAuthenticatedUser(userId: string): Promise<PublicUser> {
    const user = await this.repository.findUserById(userId);

    if (!user) {
      throw new AppError(401, "Authenticated user no longer exists");
    }

    return this.toPublicUser(user);
  }

  logout(): void {
    // Access-token-only logout is stateless; the client must discard its token.
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const email = this.normalizeEmail(input.email);
    const user = await this.repository.findUserByEmail(email);

    if (!user) return;

    await this.issueOtp(email, "password_reset");
    // TODO(Email Service): Send the password reset OTP to the account email address.
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const email = this.normalizeEmail(input.email);
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new AppError(400, "Invalid OTP");
    }

    await this.assertValidOtp(email, input.otp, "password_reset");
    const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);
    await this.repository.updateUserPassword(user.id, passwordHash);
    await this.repository.deleteOtp(email, "password_reset");
  }

  private async issueOtp(email: string, purpose: OtpPurpose): Promise<void> {
    const otp = generateOtp();
    const codeHash = await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60_000);

    await this.repository.saveOtp({ email, codeHash, purpose, expiresAt });
    logDevelopmentOtp({ email, purpose, otp });
  }

  private async assertValidOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
    const record = await this.repository.findOtp(email, purpose);

    if (!record) {
      throw new AppError(400, "Invalid OTP");
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.repository.deleteOtp(email, purpose);
      throw new AppError(400, "OTP has expired");
    }

    if (!(await bcrypt.compare(otp, record.codeHash))) {
      throw new AppError(400, "Invalid OTP");
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
