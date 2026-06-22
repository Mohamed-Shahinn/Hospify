import type { AUTH_ROLES, USER_ROLES } from "../constants/auth.constants";

export type RegistrationRole = (typeof AUTH_ROLES)[number];
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicUser = Omit<User, "passwordHash">;
