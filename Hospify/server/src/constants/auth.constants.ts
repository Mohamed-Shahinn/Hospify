export const AUTH_ROLES = ["patient", "doctor"] as const;
export const USER_ROLES = ["patient", "doctor", "admin"] as const;

export const BCRYPT_SALT_ROUNDS = 12;
export const OTP_LENGTH = 6;
export const OTP_EXPIRATION_MINUTES = 10;
export const JWT_ACCESS_TOKEN_EXPIRES_IN = "1h";
