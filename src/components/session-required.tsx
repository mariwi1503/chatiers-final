"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";

export function SessionRequired({ children }: { children: ReactNode }) {
  const { signedIn, ready, openAuth } = useAuth();
  useEffect(() => {
    if (ready && !signedIn) openAuth();
  }, [ready, signedIn, openAuth]);
  if (!ready) return <p role="status" className="p-10 text-center text-sm text-slate-500">Memuat sesi…</p>;
  if (!signedIn) return <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center"><h1 className="text-xl font-bold">Masuk untuk melanjutkan</h1><p className="text-sm text-slate-500">Halaman ini tersedia setelah kamu masuk ke Chatiers.</p><button type="button" onClick={() => openAuth()} className="focus-ring rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white">Masuk</button><Link href="/" className="focus-ring rounded text-sm text-slate-500 hover:text-brand-600">Kembali ke feed</Link></main>;
  return children;
}
