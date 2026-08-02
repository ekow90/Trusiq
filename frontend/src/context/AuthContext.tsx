import React, { createContext, useContext, useState, ReactNode } from "react";

type User = {
  id: string;
  name: string;
  roles: string[]; // e.g. ['customer'], ['owner'], ['admin']
  companyId?: string; // if the user is an owner, associated company id
};

type AuthContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Try to hydrate from window (if server injects) or localStorage; fallback to a default mock
  const initial = (() => {
    try {
      const raw = localStorage.getItem("trusiq_current_user");
      if (raw) return JSON.parse(raw) as User;
    } catch (e) {
      /* ignore */
    }
    // default: not signed in (null)
    return null;
  })();

  const [user, setUserState] = useState<User | null>(initial);

  function setUser(u: User | null) {
    try {
      if (u) localStorage.setItem("trusiq_current_user", JSON.stringify(u));
      else localStorage.removeItem("trusiq_current_user");
    } catch (e) {
      /* ignore */
    }
    setUserState(u);
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Helper to check roles
export function hasRole(user: User | null, required: string) {
  if (!user) return false;
  return user.roles.includes(required);
}

export default AuthContext;
