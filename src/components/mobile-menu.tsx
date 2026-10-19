"use client";

import { Bookmark, MessageCircle, Newspaper, UserRound, Users, X } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Logo } from "@/components/logo";
import { currentUser } from "@/lib/data";

export type MenuSection = "feed" | "messages" | "communities" | "saved" | "profile";

const menuItems = [
  { id: "feed", label: "Feed", icon: Newspaper, href: "/" },
  { id: "messages", label: "Pesan", icon: MessageCircle, href: "/messages" },
  { id: "communities", label: "Komunitas", icon: Users, href: "/communities" },
  { id: "saved", label: "Tersimpan", icon: Bookmark, href: "/saved" },
  { id: "profile", label: "Profil", icon: UserRound, href: "/profile" },
] as const;

export function MobileMenu({ open, active, onClose }: { open: boolean; active?: MenuSection; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/40 lg:hidden" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="h-full w-[min(320px,88vw)] animate-fade-up overflow-y-auto bg-white p-5 shadow-float">
        <div className="flex items-center justify-between"><Logo compact className="w-28" /><button type="button" onClick={onClose} className="icon-button" aria-label="Tutup menu"><X className="h-5 w-5" /></button></div>
        <Link href="/profile" onClick={onClose} className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white"><Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" online /><div><p className="text-sm font-bold">{currentUser.name}</p><p className="text-xs text-slate-400">{currentUser.handle}</p></div></Link>
        <nav className="mt-5 space-y-1" aria-label="Menu">
          {menuItems.map((item) => (
            <Link key={item.id} href={item.href} onClick={onClose} aria-current={item.id === active ? "page" : undefined} className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold", item.id === active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50")}>
              <item.icon className="h-5 w-5" />{item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
}
