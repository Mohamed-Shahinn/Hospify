import type { OtpPurpose } from "../models/otp.model";
import { env } from "./env";

interface DevelopmentOtpLog {
  email: string;
  purpose: OtpPurpose;
  otp: string;
}

const DEVELOPMENT_LOG_SEPARATOR = "=".repeat(36);

export const logDevelopmentOtp = ({ email, purpose, otp }: DevelopmentOtpLog): void => {
  if (env.nodeEnv !== "development") return;

  console.info([
    DEVELOPMENT_LOG_SEPARATOR,
    "🔐 Hospify Development OTP",
    `Email: ${email}`,
    `Purpose: ${purpose}`,
    `OTP: ${otp}`,
    DEVELOPMENT_LOG_SEPARATOR,
  ].join("\n"));
};

// TODO(Logging): Replace this development helper with structured Winston or Pino logging.
