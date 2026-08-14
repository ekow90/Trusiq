import { createContext, useContext, useState, type ReactNode } from "react";

type User = {
  id: string;
  name: string;
  roles: string[]; // e.g. ['customer'], ['owner'], ['admin']
  companyId?: string; // if the user is an owner, associated company id
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token?: string | null) => void;
  signOut: () => void;
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

  // also hydrate token
  const initialToken = (() => {
    try {
      const raw = localStorage.getItem("trusiq_token");
      if (raw) return raw as string;
    } catch (e) {
      /* ignore */
    }
    return null;
  })();

  const [user, setUserState] = useState<User | null>(initial);
  const [token, setTokenState] = useState<string | null>(initialToken);

  function setAuth(u: User | null, t: string | null = null) {
    try {
      if (u) localStorage.setItem("trusiq_current_user", JSON.stringify(u));
      else localStorage.removeItem("trusiq_current_user");
      if (t) localStorage.setItem("trusiq_token", t);
      else localStorage.removeItem("trusiq_token");
    } catch (e) {
      /* ignore */
    }
    setUserState(u);
    setTokenState(t);
  }

  function signOut() {
    setAuth(null, null);
  }

  return (
    <AuthContext.Provider value={{ user, token, setAuth, signOut }}>
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
