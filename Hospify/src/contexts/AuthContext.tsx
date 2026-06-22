import { createContext, useContext, useState, ReactNode } from "react";

import { authService } from "@/services/auth.service";
import type { AuthUser, RegisterPayload, UserRole } from "@/types/auth";

type AuthRole = UserRole | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: AuthRole;
  userName: string;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<{ verificationRequired: boolean; message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(authService.getStoredToken() && authService.getStoredUser()));
  const [role, setRole] = useState<AuthRole>(() => authService.getStoredUser()?.role ?? null);
  const [userName, setUserName] = useState(() => authService.getStoredUser()?.fullName ?? "");

  const applyAuthenticatedUser = (authenticatedUser: AuthUser) => {
    setIsAuthenticated(true);
    setRole(authenticatedUser.role);
    setUserName(authenticatedUser.fullName);
    setUser(authenticatedUser);
  };

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    applyAuthenticatedUser(response.user);
    return response.user;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    return {
      verificationRequired: response.verificationRequired,
      message: response.message,
    };
  };

  const verifyOtp = async (email: string, otp: string) => {
    await authService.verifyOtp({ email, otp });
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setRole(null);
    setUserName("");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userName, user, login, register, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
