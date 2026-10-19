"use client";

import { Bell, ChevronDown, Menu, MessageCircle, Newspaper, Search, Users } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Avatar } from "@/components/avatar";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { NotificationList } from "@/components/notifications";
import { currentUser } from "@/lib/data";

export type HeaderSection = "feed" | "messages" | "communities" | "saved" | "profile";

const headerNavigation = [
  { id: "feed", label: "Feed", href: "/", icon: Newspaper },
  { id: "messages", label: "Pesan", href: "/messages", icon: MessageCircle },
  { id: "communities", label: "Komunitas", href: "/communities", icon: Users },
] as const;

/** `compact` swaps the mobile header bar for page-specific content, e.g. the profile being viewed. */
export function AppHeader({ active, searchQuery, onSearchChange, searchPlaceholder = "Cari di Chatiers", compact }: { active?: HeaderSection; searchQuery?: string; onSearchChange?: (value: string) => void; searchPlaceholder?: string; compact?: { visible: boolean; content: ReactNode } }) {
  const [localSearch, setLocalSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const value = searchQuery ?? localSearch;
  const compactVisible = Boolean(compact?.visible);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  function closeSearch() {
    changeSearch("");
    setSearchOpen(false);
  }

  function changeSearch(nextValue: string) {
    if (onSearchChange) onSearchChange(nextValue);
    else setLocalSearch(nextValue);
  }

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
        <button type="button" className={clsx("icon-button -ml-2 shrink-0 transition-opacity duration-200 lg:hidden", compactVisible && "max-md:opacity-0")} onClick={() => setMenuOpen(true)} aria-label="Buka menu" aria-expanded={menuOpen}><Menu className="h-5 w-5" /></button>

        <Link href="/" aria-label="Kembali ke feed" className={clsx("flex shrink-0 items-center transition-opacity duration-200 max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2", compactVisible && "max-md:opacity-0")}>
          <Logo compact className="w-[120px] shrink-0 md:w-[160px]" />
        </Link>

        <form className={clsx("min-w-0 max-w-[280px] flex-1 md:relative md:block", searchOpen ? "max-md:absolute max-md:inset-0 max-md:z-10 max-md:flex max-md:max-w-none max-md:items-center max-md:gap-2 max-md:bg-white max-md:px-4" : "hidden")} role="search" onSubmit={(event) => event.preventDefault()}>
          <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input ref={searchInput} type="search" value={value} onKeyDown={(event) => event.key === "Escape" && closeSearch()} onChange={(event) => changeSearch(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="focus-ring h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:bg-slate-100 focus:border-brand-300 focus:bg-white" />
          </div>
          <button type="button" onClick={closeSearch} className="shrink-0 rounded-full px-2 py-2 text-sm font-semibold text-brand-600 md:hidden">Batal</button>
        </form>

        {compact && (
          <div inert={!compactVisible} aria-hidden={!compactVisible} className={clsx("absolute inset-0 z-20 flex items-center gap-1 px-2 transition duration-200 ease-out motion-reduce:transition-none md:hidden", compactVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
            {compact.content}
          </div>
        )}

        <div className="ml-auto flex h-full items-center gap-1">
          <button type="button" className={clsx("icon-button relative -mr-2 transition-opacity duration-200 md:hidden", compactVisible && "opacity-0")} onClick={() => setSearchOpen(true)} aria-label={searchPlaceholder} aria-expanded={searchOpen}>
            <Search className="h-5 w-5" />
            {value && <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-brand-600" />}
          </button>
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

          <div className="relative hidden h-full min-w-10 md:block lg:min-w-[66px] xl:min-w-[74px]">
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
    <MobileMenu open={menuOpen} active={active} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function HeaderNotifications() {
  return <NotificationList className="absolute right-0 top-14 w-[min(340px,calc(100vw-24px))] animate-fade-up rounded-2xl border border-slate-200 bg-white p-2 shadow-float" />;
}
