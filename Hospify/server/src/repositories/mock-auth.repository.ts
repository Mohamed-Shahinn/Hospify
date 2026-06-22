import { randomUUID } from "node:crypto";

import type { AuthRepository, CreateUserData } from "../interfaces/auth.repository";
import type { OtpPurpose, OtpRecord } from "../models/otp.model";
import type { User } from "../models/user.model";

const cloneUser = (user: User): User => ({
  ...user,
  createdAt: new Date(user.createdAt),
  updatedAt: new Date(user.updatedAt),
});

const cloneOtp = (record: OtpRecord): OtpRecord => ({
  ...record,
  expiresAt: new Date(record.expiresAt),
});

export class MockAuthRepository implements AuthRepository {
  // TODO(MongoDB): Replace these maps with users and OTP collections.
  private readonly users = new Map<string, User>();
  private readonly otpCodes = new Map<string, OtpRecord>();

  async findUserByEmail(email: string): Promise<User | null> {
    const user = this.users.get(email);
    return user ? cloneUser(user) : null;
  }

  async findUserById(userId: string): Promise<User | null> {
    // TODO(MongoDB): Replace this in-memory lookup with a users collection query by ID.
    const user = [...this.users.values()].find((candidate) => candidate.id === userId);
    return user ? cloneUser(user) : null;
  }

  async createUser(data: CreateUserData): Promise<User> {
    // TODO(MongoDB): Enforce a unique normalized-email index at the database level.
    if (this.users.has(data.email)) {
      throw new Error("Duplicate user email");
    }

    const now = new Date();
    const user: User = {
      id: randomUUID(),
      ...data,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.email, user);
    return cloneUser(user);
  }

  async setUserVerified(userId: string): Promise<void> {
    const user = this.findStoredUserById(userId);
    user.isVerified = true;
    user.updatedAt = new Date();
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    const user = this.findStoredUserById(userId);
    user.passwordHash = passwordHash;
    user.updatedAt = new Date();
  }

  async saveOtp(record: OtpRecord): Promise<void> {
    // TODO(MongoDB): Use a TTL index for expiry and an atomic upsert by email/purpose.
    this.otpCodes.set(this.getOtpKey(record.email, record.purpose), cloneOtp(record));
  }

  async findOtp(email: string, purpose: OtpPurpose): Promise<OtpRecord | null> {
    const record = this.otpCodes.get(this.getOtpKey(email, purpose));
    return record ? cloneOtp(record) : null;
  }

  async deleteOtp(email: string, purpose: OtpPurpose): Promise<void> {
    this.otpCodes.delete(this.getOtpKey(email, purpose));
  }

  private findStoredUserById(userId: string): User {
    const user = [...this.users.values()].find((candidate) => candidate.id === userId);

    if (!user) {
      throw new Error("User not found in mock repository");
    }

    return user;
  }

  private getOtpKey(email: string, purpose: OtpPurpose): string {
    return `${purpose}:${email}`;
  }
}
