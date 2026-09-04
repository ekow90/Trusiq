import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type User } from "./auth";

const INACTIVITY_LIMIT = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  // Try to hydrate from window (if server injects) or localStorage; fallback to a default mock
  const initial = (() => {
    try {
      const raw = localStorage.getItem("trusiq_current_user");
      if (raw) return JSON.parse(raw) as User;
    } catch {
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
    } catch {
      /* ignore */
    }
    return null;
  })();

  const [user, setUserState] = useState<User | null>(
    initialToken ? initial : null,
  );
  const [token, setTokenState] = useState<string | null>(initialToken);
  const [sessionExpired, setSessionExpired] = useState(false);

  function setAuth(u: User | null, t: string | null = null) {
    try {
      if (u) localStorage.setItem("trusiq_current_user", JSON.stringify(u));
      else localStorage.removeItem("trusiq_current_user");
      if (t) localStorage.setItem("trusiq_token", t);
      else localStorage.removeItem("trusiq_token");
    } catch {
      /* ignore */
    }
    setUserState(u);
    setTokenState(t);
    if (u && t) setSessionExpired(false);
  }

  function signOut() {
    setAuth(null, null);
  }

  useEffect(() => {
    if (!user || !token) return;

    let timeoutId: number;
    const logoutForInactivity = () => {
      setAuth(null, null);
      setSessionExpired(true);
    };
    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(logoutForInactivity, INACTIVITY_LIMIT);
    };
    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer, { passive: true }),
    );
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer),
      );
    };
  }, [user, token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setAuth,
        signOut,
        sessionExpired,
        clearSessionExpired: () => setSessionExpired(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
