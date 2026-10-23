"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Bookmark, ChevronDown, LogOut, UserRound } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/avatar";
import { useAuth } from "@/components/auth-provider";

export function AccountMenu({ active, onOpen }: { active?: boolean; onOpen: () => void }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    function outside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function dismiss() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function navigateMenu(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      dismiss();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const current = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  }

  if (!user) return null;
  const itemClass = "focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:bg-brand-50 focus-visible:text-brand-700";

  return (
    <div ref={rootRef} className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={navigateMenu}>
      <button ref={triggerRef} type="button" aria-label="Menu akun" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); event.stopPropagation(); if (!open) { onOpen(); setOpen(true); } else panelRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus(); } }} onClick={() => { if (!open) onOpen(); setOpen(!open); }} className={clsx("focus-ring flex h-10 items-center gap-1.5 rounded-full p-1 transition md:pr-2", open ? "bg-brand-50 ring-1 ring-brand-100" : "hover:bg-slate-100")}>
        <Avatar src={user.avatar} alt="" size="sm" ring={active} />
        <ChevronDown aria-hidden="true" className={clsx("hidden h-3.5 w-3.5 text-slate-400 transition-transform motion-reduce:transition-none md:block", open && "rotate-180")} />
      </button>
      {open && <div id={menuId} ref={panelRef} role="menu" aria-label="Akun saya" className="absolute right-0 top-[calc(100%+12px)] z-50 w-[272px] max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200/80 bg-white p-2 shadow-float">
        <div role="presentation" className="mb-1 flex items-center gap-3 border-b border-slate-100 px-3 pb-4 pt-3">
          <Avatar src={user.avatar} alt="" size="sm" />
          <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{user.name}</p><p className="mt-0.5 truncate text-xs text-slate-400">{user.handle}</p></div>
        </div>
        <Link href="/profile" role="menuitem" onClick={dismiss} className={itemClass}><UserRound className="h-[18px] w-[18px] text-slate-400" />Lihat profil</Link>
        <Link href="/saved" role="menuitem" onClick={dismiss} className={itemClass}><Bookmark className="h-[18px] w-[18px] text-slate-400" />Tersimpan</Link>
        <div role="separator" className="my-1 border-t border-slate-100" />
        <button type="button" role="menuitem" onClick={() => { dismiss(); signOut(); }} className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:bg-rose-50"><LogOut className="h-[18px] w-[18px]" />Keluar</button>
      </div>}
    </div>
  );
}
