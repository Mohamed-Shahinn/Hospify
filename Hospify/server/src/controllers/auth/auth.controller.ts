import type { Request, Response } from "express";

import { AppError } from "../../errors/app-error";
import type { AuthService } from "../../services/auth.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "../../types/auth.types";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (request: Request, response: Response): Promise<void> => {
    await this.authService.register(request.body as RegisterInput);
    response.status(201).json({
      success: true,
      message: "Registration successful. Verification is required.",
      verificationRequired: true,
    });
  };

  verifyOtp = async (request: Request, response: Response): Promise<void> => {
    await this.authService.verifyOtp(request.body as VerifyOtpInput);
    response.status(200).json({ success: true, message: "Account verified successfully" });
  };

  login = async (request: Request, response: Response): Promise<void> => {
    const result = await this.authService.login(request.body as LoginInput);
    response.status(200).json({ success: true, ...result });
  };

  me = async (request: Request, response: Response): Promise<void> => {
    if (!request.user) {
      throw new AppError(401, "Authentication required");
    }

    const user = await this.authService.getAuthenticatedUser(request.user.id);
    response.status(200).json({ success: true, user });
  };

  logout = async (_request: Request, response: Response): Promise<void> => {
    this.authService.logout();
    response.status(200).json({ success: true, message: "Logged out successfully" });
  };

  forgotPassword = async (request: Request, response: Response): Promise<void> => {
    await this.authService.forgotPassword(request.body as ForgotPasswordInput);
    response.status(200).json({
      success: true,
      message: "If an account exists for this email, a password reset OTP has been generated.",
    });
  };

  resetPassword = async (request: Request, response: Response): Promise<void> => {
    await this.authService.resetPassword(request.body as ResetPasswordInput);
    response.status(200).json({ success: true, message: "Password reset successfully" });
  };
}
