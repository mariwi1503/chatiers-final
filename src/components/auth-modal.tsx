"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";

export function AuthModal() {
  const { authMode, closeAuth, signedIn } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pointerStartedOutside = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const open = authMode !== null;

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (signedIn) closeAuth();
  }, [signedIn, closeAuth]);

  function dismiss() {
    closeAuth();
    if (pathname === "/login" || pathname === "/register") router.replace("/");
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="auth-title" aria-describedby="auth-description" onCancel={(event) => { event.preventDefault(); dismiss(); }} onPointerDown={(event) => { pointerStartedOutside.current = event.target === event.currentTarget; }} onClick={(event) => { if (pointerStartedOutside.current && event.target === event.currentTarget) dismiss(); }} className="auth-dialog m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[440px] overflow-y-auto overscroll-contain rounded-[28px] border border-white/80 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm">
      {authMode && <>
        <button type="button" onClick={dismiss} aria-label="Tutup login atau pendaftaran" className="focus-ring absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-700"><X className="h-[18px] w-[18px]" /></button>
        <AuthForm key={authMode} mode={authMode} onSuccess={dismiss} />
      </>}
    </dialog>
  );
}
