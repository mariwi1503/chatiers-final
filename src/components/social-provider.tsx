"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

type Relations = { following: string[]; blocked: string[] };
const empty: Relations = { following: [], blocked: [] };
const SocialContext = createContext<{
  following: string[];
  blocked: string[];
  toggleFollow: (name: string) => void;
  toggleBlock: (name: string) => void;
} | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user, requireSession } = useAuth();
  const key = user ? `chatiers-relations:${user.username}:${user.name}` : null;
  const [saved, setSaved] = useState<{ key: string | null; value: Relations }>({ key: null, value: empty });
  const relations = saved.key === key ? saved.value : empty;

  useEffect(() => {
    function restore() {
      let value = empty;
      try {
        const raw = key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
        if (raw && Array.isArray(raw.following) && Array.isArray(raw.blocked)) {
          value = { following: raw.following.filter((item: unknown) => typeof item === "string"), blocked: raw.blocked.filter((item: unknown) => typeof item === "string") };
        }
      } catch { /* Keep defaults when storage is unavailable. */ }
      setSaved({ key, value });
    }
    restore();
    window.addEventListener("storage", restore);
    return () => window.removeEventListener("storage", restore);
  }, [key]);

  function update(field: keyof Relations, name: string) {
    if (!requireSession() || !key) return;
    const exists = relations[field].includes(name);
    const value = { ...relations, [field]: exists ? relations[field].filter((item) => item !== name) : [...relations[field], name] };
    if (field === "blocked" && !exists) value.following = value.following.filter((item) => item !== name);
    if (field === "following" && relations.blocked.includes(name)) return;
    setSaved({ key, value });
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Keep in-memory changes. */ }
  }

  return <SocialContext.Provider value={{ ...relations, toggleFollow: (name) => update("following", name), toggleBlock: (name) => update("blocked", name) }}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const value = useContext(SocialContext);
  if (!value) throw new Error("useSocial requires SocialProvider");
  return value;
}
