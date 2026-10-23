"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export const GUEST_FEED_LIMIT = 10;

export function GuestFeedGate() {
  const { ready, signedIn, openAuth } = useAuth();
  const gateRef = useRef<HTMLElement>(null);
  const promptedRef = useRef(false);

  useEffect(() => {
    if (!ready || signedIn || promptedRef.current) return;
    const gate = gateRef.current;
    if (!gate) return;
    let visible = false;
    function prompt() {
      // Opening a short filtered feed should not immediately interrupt the visitor.
      if (!visible || window.scrollY < 200 || promptedRef.current) return;
      promptedRef.current = true;
      openAuth();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      prompt();
    }, { threshold: 0.25 });
    observer.observe(gate);
    window.addEventListener("scroll", prompt, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", prompt);
    };
  }, [ready, signedIn, openAuth]);

  return (
    <section ref={gateRef} aria-label="Masuk untuk melanjutkan feed" className="surface relative overflow-hidden rounded-2xl px-6 py-8 text-center sm:py-10">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-50 to-transparent" />
      <div className="relative">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600 shadow-sm"><LockKeyhole className="h-5 w-5" /></span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight text-slate-950">Masih banyak cerita untukmu</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Masuk untuk melanjutkan membaca, berbagi ide, dan terhubung dengan komunitas Chatiers.</p>
        <button type="button" onClick={() => openAuth()} className="focus-ring mx-auto mt-5 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700">Masuk untuk melanjutkan<ArrowRight className="h-4 w-4" /></button>
        <p className="mt-4 text-xs text-slate-500">Belum punya akun? <button type="button" onClick={() => openAuth("register")} className="focus-ring rounded font-bold text-brand-600 hover:underline">Daftar sekarang</button></p>
      </div>
    </section>
  );
}
