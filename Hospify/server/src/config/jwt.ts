import jwt, { type JwtPayload } from "jsonwebtoken";

import { JWT_ACCESS_TOKEN_EXPIRES_IN, USER_ROLES } from "../constants/auth.constants";
import type { UserRole } from "../models/user.model";
import { env } from "./env";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && USER_ROLES.some((role) => role === value);

export const generateAccessToken = ({ id, role }: AuthenticatedUser): string =>
  jwt.sign(
    { role },
    env.jwtSecret,
    { subject: id, expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN },
  );

export const verifyAccessToken = (token: string): AuthenticatedUser => {
  const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

  if (typeof payload.sub !== "string" || !isUserRole(payload.role)) {
    throw new Error("Invalid access token payload");
  }

  return { id: payload.sub, role: payload.role };
};
