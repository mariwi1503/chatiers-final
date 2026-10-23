"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { isValidLoginIdentifier } from "@/lib/auth";

export function AuthForm({ mode, onSuccess }: { mode: "login" | "register"; onSuccess: () => void }) {
  const registering = mode === "register";
  const { signIn, openAuth } = useAuth();
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (submitTimerRef.current !== null) clearTimeout(submitTimerRef.current);
  }, []);
  const identifierRef = useRef<HTMLInputElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitTimerRef.current !== null) return;
    if (registering && !fullName.trim()) {
      setNameError("Masukkan nama lengkapmu.");
      nameRef.current?.focus();
      return;
    }
    if (!isValidLoginIdentifier(identifier)) {
      setError("Gunakan format email yang benar atau nomor telepon dengan 8–15 digit.");
      identifierRef.current?.focus();
      return;
    }
    if (registering && password !== confirmPassword) {
      setConfirmError("Konfirmasi password harus sama dengan password.");
      confirmRef.current?.focus();
      return;
    }
    setSubmitting(true);
    submitTimerRef.current = setTimeout(() => {
      signIn(registering ? fullName.trim() : undefined);
      onSuccess();
    }, 1400);
  }

  const inputClass = "block w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100";

  return (
    <div className="relative px-6 pb-7 pt-10 sm:px-10 sm:pb-9 sm:pt-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 rounded-t-[28px] bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_#eff6ff_35%,_transparent_75%)]" />
      <div className="relative text-center">
        <Logo compact className="mx-auto w-40 sm:w-44" />
        <div className="mb-4 mt-6 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-[10px] font-bold tracking-wide text-brand-600"><Sparkles className="h-3 w-3" />KONEKSI DIMULAI DI SINI</div>
        <h1 id="auth-title" className="text-[26px] font-extrabold tracking-tight text-slate-950 sm:text-[28px]">{registering ? "Cerita baru dimulai di sini." : "Senang bertemu lagi."}</h1>
        <p id="auth-description" className="mx-auto mt-2 max-w-[290px] text-sm leading-6 text-slate-500">{registering ? "Temukan teman, bagikan ide, dan tumbuh bersama komunitasmu." : "Masuk dan lanjutkan obrolan, ide, serta koneksi yang berarti."}</p>
      </div>
      <form onSubmit={submit} aria-busy={submitting} className="relative mt-7 space-y-5">
        {registering && <div>
          <label htmlFor="full-name" className="mb-2 block text-xs font-bold text-slate-700">Nama lengkap</label>
          <div className="relative">
            <UserRound aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-slate-400" />
            <input ref={nameRef} id="full-name" name="name" autoComplete="name" required disabled={submitting} value={fullName} onChange={(event) => { setFullName(event.target.value); setNameError(""); }} placeholder="Nama yang tampil di profilmu" aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "name-error" : undefined} className={inputClass} />
          </div>
          {nameError && <p id="name-error" role="alert" className="mt-2 text-xs leading-5 text-rose-600">{nameError}</p>}
        </div>}
        <div>
          <label htmlFor="identifier" className="mb-2 block text-xs font-bold text-slate-700">Email atau nomor telepon</label>
          <div className="relative">
            <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-slate-400" />
            <input ref={identifierRef} id="identifier" name="identifier" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} disabled={submitting} required value={identifier} onChange={(event) => { setIdentifier(event.target.value); setError(""); }} placeholder="nama@email.com atau 0812…" aria-invalid={Boolean(error)} aria-describedby={error ? "identifier-error" : undefined} className={inputClass} />
          </div>
          {error && <p id="identifier-error" role="alert" className="mt-2 text-xs leading-5 text-rose-600">{error}</p>}
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-bold text-slate-700">Password</label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-slate-400" />
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} disabled={submitting} required value={password} onChange={(event) => { setPassword(event.target.value); setConfirmError(""); }} placeholder="Masukkan password" className={`${inputClass} pr-12`} />
            <button type="button" disabled={submitting} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} aria-pressed={showPassword} className="focus-ring icon-button absolute right-1.5 top-1.5">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        {registering && <div>
          <label htmlFor="confirm-password" className="mb-2 block text-xs font-bold text-slate-700">Konfirmasi password</label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-[18px] w-[18px] text-slate-400" />
            <input ref={confirmRef} id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required disabled={submitting} value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setConfirmError(""); }} placeholder="Ulangi password" aria-invalid={Boolean(confirmError)} aria-describedby={confirmError ? "confirm-error" : undefined} className={inputClass} />
          </div>
          {confirmError && <p id="confirm-error" role="alert" className="mt-2 text-xs leading-5 text-rose-600">{confirmError}</p>}
        </div>}
        <button type="submit" disabled={submitting} className="focus-ring group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-blue-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-75">{submitting ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />{registering ? "Sedang membuat akun…" : "Sedang masuk…"}</> : <>{registering ? "Buat akun" : "Masuk ke Chatiers"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" /></>}</button>
        <p className="text-center text-[11px] leading-5 text-slate-400">Versi demo · Email/telepon berformat valid, password bebas.</p>
      </form>
      <p role="status" aria-live="polite" className="sr-only">{submitting ? (registering ? "Sedang membuat akun, mohon tunggu." : "Sedang masuk, mohon tunggu.") : ""}</p>
      <div className="relative mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">{registering ? "Sudah punya akun?" : "Baru di Chatiers?"} <button type="button" disabled={submitting} onClick={() => openAuth(registering ? "login" : "register")} className="focus-ring rounded font-bold text-brand-600 hover:text-brand-700 disabled:cursor-wait disabled:opacity-50">{registering ? "Masuk" : "Daftar sekarang"}</button></div>
    </div>
  );
}
