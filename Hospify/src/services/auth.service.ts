import { apiRequest, tokenStorage } from "@/services/api";
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";

const AUTH_USER_STORAGE_KEY = "hospify.authUser";

const userStorage = {
  get(): AuthUser | null {
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      return null;
    }
  },
  set(user: AuthUser): void {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  },
  clear(): void {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  },
};

export const authService = {
  getStoredToken(): string | null {
    return tokenStorage.get();
  },

  getStoredUser(): AuthUser | null {
    return userStorage.get();
  },

  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    return apiRequest<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    tokenStorage.set(response.token);
    userStorage.set(response.user);

    return response;
  },

  async verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    return apiRequest<VerifyOtpResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout(): void {
    tokenStorage.clear();
    userStorage.clear();
  },
};
