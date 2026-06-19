import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "client" | "admin" | null;

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string;
  login: (email: string, password: string, role: UserRole) => void;
  register: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");

  const login = (_email: string, _password: string, loginRole: UserRole) => {
    setIsAuthenticated(true);
    setRole(loginRole);
    setUserName(loginRole === "admin" ? "Dr. Admin" : "John Doe");
  };

  const register = (name: string, _email: string, _password: string, regRole: UserRole) => {
    setIsAuthenticated(true);
    setRole(regRole);
    setUserName(name);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUserName("");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, userName, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
