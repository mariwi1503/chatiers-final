"use client";

import { Bell, ChevronDown, Menu, MessageCircle, Newspaper, Search, Users } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Logo } from "@/components/logo";
import { currentUser } from "@/lib/data";

export type HeaderSection = "feed" | "messages" | "communities" | "saved" | "profile";

const headerNavigation = [
  { id: "feed", label: "Feed", href: "/", icon: Newspaper },
  { id: "messages", label: "Pesan", href: "/messages", icon: MessageCircle },
  { id: "communities", label: "Komunitas", href: "/communities", icon: Users },
] as const;

export function AppHeader({ active, searchQuery, onSearchChange, searchPlaceholder = "Cari di Chatiers", onMenu }: { active: HeaderSection; searchQuery?: string; onSearchChange?: (value: string) => void; searchPlaceholder?: string; onMenu?: () => void }) {
  const [localSearch, setLocalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const value = searchQuery ?? localSearch;

  function changeSearch(nextValue: string) {
    if (onSearchChange) onSearchChange(nextValue);
    else setLocalSearch(nextValue);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
        {onMenu ? (
          <button type="button" className="icon-button -ml-2 lg:hidden" onClick={onMenu} aria-label="Buka menu"><Menu className="h-5 w-5" /></button>
        ) : (
          <span className="-ml-2 h-10 w-10 shrink-0 lg:hidden" aria-hidden="true" />
        )}

        <Link href="/" aria-label="Kembali ke feed" className="flex shrink-0 items-center">
          <Logo compact className="w-[120px] shrink-0 md:w-[160px]" />
        </Link>

        <form className="relative min-w-0 max-w-[280px] flex-1" role="search" onSubmit={(event) => event.preventDefault()}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" value={value} onChange={(event) => changeSearch(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="focus-ring h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:bg-slate-100 focus:border-brand-300 focus:bg-white" />
        </form>

        <div className="ml-auto flex h-full items-center gap-1">
          <nav className="hidden h-full items-stretch lg:flex" aria-label="Navigasi utama">
            {headerNavigation.map((item) => {
              const isActive = item.id === active;
              return (
                <Link key={item.id} href={item.href} aria-current={isActive ? "page" : undefined} className={clsx("group relative flex min-w-[66px] flex-col items-center justify-center gap-1 px-1.5 text-[11px] font-bold transition xl:min-w-[74px]", isActive ? "text-brand-700" : "text-slate-500 hover:text-slate-950")}>
                  <span className={clsx("relative flex h-7 w-10 items-center justify-center rounded-lg transition", isActive ? "bg-brand-50" : "group-hover:bg-slate-100")}><item.icon className={clsx("h-[17px] w-[17px]", isActive && item.id === "feed" && "fill-brand-100")} /></span>
                  {item.label}
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />}
                </Link>
              );
            })}
          </nav>

          <div className="relative h-full min-w-10 lg:min-w-[66px] xl:min-w-[74px]">
            <button type="button" className="group flex h-full w-full flex-col items-center justify-center gap-1 px-1.5 text-[11px] font-bold text-slate-500 transition hover:text-slate-950" onClick={() => setNotificationsOpen((current) => !current)} aria-label="Notifikasi" aria-expanded={notificationsOpen}>
              <span className="relative flex h-7 w-10 items-center justify-center rounded-lg transition group-hover:bg-slate-100"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-0.5 top-0 h-2 w-2 rounded-full border-2 border-white bg-rose-500" /></span>
              <span className="hidden lg:inline">Notifikasi</span>
            </button>
            {notificationsOpen && <HeaderNotifications />}
          </div>

          <Link href="/profile" aria-label={active === "profile" ? "Profil aktif" : "Buka profil"} aria-current={active === "profile" ? "page" : undefined} className="relative ml-1 hidden h-full items-center gap-2 rounded-full px-1 hover:bg-slate-100 md:flex">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" online ring={active === "profile"} />
            <ChevronDown className="mr-1 h-3.5 w-3.5 text-slate-400" />
            {active === "profile" && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-600" />}
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeaderNotifications() {
  return (
    <div className="absolute right-0 top-14 w-[min(340px,calc(100vw-24px))] animate-fade-up rounded-2xl border border-slate-200 bg-white p-2 shadow-float">
      <div className="flex items-center justify-between px-3 py-2"><h3 className="font-bold text-slate-900">Notifikasi</h3><button className="text-xs font-semibold text-brand-600">Tandai dibaca</button></div>
      {[
        ["Nadia Putri", "menyukai ide yang kamu bagikan.", "2m", "https://i.pravatar.cc/160?img=47"],
        ["TechCorp", "mengunggah lowongan baru untukmu.", "18m", "https://i.pravatar.cc/160?img=13"],
        ["Siti Rahma", "membalas komentarmu.", "1j", "https://i.pravatar.cc/160?img=32"],
      ].map(([name, text, time, avatar]) => <button key={name} className="flex w-full gap-3 rounded-xl p-3 text-left hover:bg-slate-50"><Avatar src={avatar} alt={name} /><span className="min-w-0 text-xs leading-5 text-slate-600"><b className="text-slate-900">{name}</b> {text}<span className="block font-medium text-brand-600">{time}</span></span></button>)}
    </div>
  );
}
