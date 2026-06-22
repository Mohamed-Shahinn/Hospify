import { randomInt } from "node:crypto";

import { OTP_LENGTH } from "../constants/auth.constants";

export const generateOtp = (): string =>
  randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
