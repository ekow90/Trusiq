import { createContext, useContext } from "react";

export type User = {
  id: string;
  name: string;
  roles: string[];
  companyId?: string;
  profileImage?: string;
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token?: string | null) => void;
  signOut: () => void;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function hasRole(user: User | null, required: string) {
  return Boolean(user?.roles.includes(required));
}
