export type OtpPurpose = "account_verification" | "password_reset";

export interface OtpRecord {
  email: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
}
