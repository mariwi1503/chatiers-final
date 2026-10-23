"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser } from "@/lib/data";

const storageKey = "chatiers-dummy-session";
export type AuthMode = "login" | "register";

const AuthContext = createContext<{ authMode: AuthMode | null; openAuth: (mode?: AuthMode) => void; closeAuth: () => void; user: typeof currentUser | null; ready: boolean; signedIn: boolean; signIn: (name?: string) => void; signOut: () => void; requireSession: () => boolean } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<typeof currentUser | null>(null);
  const signedIn = user !== null;
  const [ready, setReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const openAuth = useCallback((mode: AuthMode = "login") => setAuthMode(mode), []);
  const closeAuth = useCallback(() => setAuthMode(null), []);

  useEffect(() => {
    function restoreSession() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw === "active") setUser(currentUser);
        else {
          const saved: unknown = raw ? JSON.parse(raw) : null;
          setUser(saved && typeof saved === "object" && "name" in saved && typeof saved.name === "string" && saved.name.trim() ? { ...currentUser, name: saved.name.trim() } : null);
        }
      } catch { setUser(null); }
      setReady(true);
    }
    restoreSession();
    window.addEventListener("storage", restoreSession);
    return () => window.removeEventListener("storage", restoreSession);
  }, []);

  function updateSession(active: boolean, name?: string) {
    const nextUser = active ? { ...currentUser, name: name?.trim() || currentUser.name } : null;
    setUser(nextUser);
    try {
      if (active) localStorage.setItem(storageKey, JSON.stringify({ name: nextUser!.name }));
      else localStorage.removeItem(storageKey);
    } catch { /* Keep the in-memory session when storage is unavailable. */ }
  }

  const requireSession = useCallback(() => {
    if (signedIn) return true;
    openAuth();
    return false;
  }, [signedIn, openAuth]);

  return <AuthContext.Provider value={{ authMode, openAuth, closeAuth, user, ready, signedIn, signIn: (name) => updateSession(true, name), signOut: () => updateSession(false), requireSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth requires AuthProvider");
  return auth;
}
