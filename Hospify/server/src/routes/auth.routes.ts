import { Router } from "express";

import { AuthController } from "../controllers/auth/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { MockAuthRepository } from "../repositories/mock-auth.repository";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerifyOtp,
} from "../validators/auth.validators";

const authRepository = new MockAuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", validateRegister, asyncHandler(authController.register));
authRouter.post("/login", validateLogin, asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/verify-otp", validateVerifyOtp, asyncHandler(authController.verifyOtp));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
authRouter.post(
  "/forgot-password",
  validateForgotPassword,
  asyncHandler(authController.forgotPassword),
);
authRouter.post(
  "/reset-password",
  validateResetPassword,
  asyncHandler(authController.resetPassword),
);
