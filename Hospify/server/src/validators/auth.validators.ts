import type { RequestHandler } from "express";

import { AUTH_ROLES } from "../constants/auth.constants";
import { AppError, type ValidationDetail } from "../errors/app-error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;
const OTP_PATTERN = /^\d{6}$/;

type Body = Record<string, unknown>;
type BodyValidator = (body: Body) => ValidationDetail[];

const isBody = (value: unknown): value is Body =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const validateEmail = (value: unknown, errors: ValidationDetail[]): void => {
  if (typeof value !== "string" || !EMAIL_PATTERN.test(value.trim())) {
    errors.push({ field: "email", message: "A valid email is required" });
  }
};

const validatePassword = (
  value: unknown,
  field: "password" | "newPassword",
  errors: ValidationDetail[],
): void => {
  if (typeof value !== "string" || value.length < 8) {
    errors.push({ field, message: "Password must be at least 8 characters" });
    return;
  }

  if (!PASSWORD_LETTER_PATTERN.test(value)) {
    errors.push({ field, message: "Password must contain at least one letter" });
  }

  if (!PASSWORD_NUMBER_PATTERN.test(value)) {
    errors.push({ field, message: "Password must contain at least one number" });
  }
};

const validateOtp = (value: unknown, errors: ValidationDetail[]): void => {
  if (typeof value !== "string" || !OTP_PATTERN.test(value)) {
    errors.push({ field: "otp", message: "OTP must be a 6-digit string" });
  }
};

const createValidator = (validate: BodyValidator): RequestHandler =>
  (request, _response, next) => {
    if (!isBody(request.body)) {
      next(new AppError(400, "Validation failed", [{ field: "body", message: "A JSON object is required" }]));
      return;
    }

    const errors = validate(request.body);

    if (errors.length > 0) {
      next(new AppError(400, "Validation failed", errors));
      return;
    }

    next();
  };

export const validateRegister = createValidator((body) => {
  const errors: ValidationDetail[] = [];

  if (typeof body.fullName !== "string" || body.fullName.trim().length < 3) {
    errors.push({ field: "fullName", message: "Full name must be at least 3 characters" });
  }

  validateEmail(body.email, errors);
  validatePassword(body.password, "password", errors);

  if (typeof body.role !== "string" || !AUTH_ROLES.some((role) => role === body.role)) {
    errors.push({ field: "role", message: "Role must be patient or doctor" });
  }

  return errors;
});

export const validateLogin = createValidator((body) => {
  const errors: ValidationDetail[] = [];
  validateEmail(body.email, errors);

  if (typeof body.password !== "string" || body.password.length === 0) {
    errors.push({ field: "password", message: "Password is required" });
  }

  return errors;
});

export const validateVerifyOtp = createValidator((body) => {
  const errors: ValidationDetail[] = [];
  validateEmail(body.email, errors);
  validateOtp(body.otp, errors);
  return errors;
});

export const validateForgotPassword = createValidator((body) => {
  const errors: ValidationDetail[] = [];
  validateEmail(body.email, errors);
  return errors;
});

export const validateResetPassword = createValidator((body) => {
  const errors: ValidationDetail[] = [];
  validateEmail(body.email, errors);
  validateOtp(body.otp, errors);
  validatePassword(body.newPassword, "newPassword", errors);
  return errors;
});
