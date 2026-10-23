"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type AuthMode } from "@/components/auth-provider";
import { ChatiersApp } from "@/components/chatiers-app";

/** Direct authentication URLs open the same modal over the public feed. */
export function AuthEntry({ mode }: { mode: AuthMode }) {
  const { ready, signedIn, openAuth, closeAuth } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    if (signedIn) router.replace("/");
    else openAuth(mode);
    return closeAuth;
  }, [ready, signedIn, mode, openAuth, closeAuth, router]);
  return <ChatiersApp />;
}
