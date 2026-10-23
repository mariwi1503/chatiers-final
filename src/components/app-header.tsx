"use client";

import { Bell, Menu, MessageCircle, Newspaper, Users } from "lucide-react";
import clsx from "clsx";
import { AuthLink as Link } from "@/components/auth-link";
import { useState, type ReactNode } from "react";
import { HeaderSearch } from "@/components/header-search";
import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { NotificationList } from "@/components/notifications";
import { useAuth } from "@/components/auth-provider";

export type HeaderSection = "feed" | "messages" | "communities" | "saved" | "profile";

const headerNavigation = [
  { id: "feed", label: "Feed", href: "/", icon: Newspaper },
  { id: "messages", label: "Pesan", href: "/messages", icon: MessageCircle },
  { id: "communities", label: "Komunitas", href: "/communities", icon: Users },
] as const;

/** `compact` swaps the mobile header bar for page-specific content, e.g. the profile being viewed. */
export function AppHeader({ active, searchQuery, onSearchChange, searchPlaceholder = "Cari di Chatiers", compact, mobileTitle }: { active?: HeaderSection; searchQuery?: string; onSearchChange?: (value: string) => void; searchPlaceholder?: string; compact?: { visible: boolean; content: ReactNode }; mobileTitle?: string }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { signedIn } = useAuth();
  const compactVisible = Boolean(compact?.visible);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4">
        <button type="button" className={clsx("icon-button -ml-2 shrink-0 transition-opacity duration-200 lg:hidden", compactVisible && "max-md:opacity-0")} onClick={() => setMenuOpen(true)} aria-label="Buka menu" aria-expanded={menuOpen}><Menu className="h-5 w-5" /></button>

        <Link href="/" aria-label="Kembali ke feed" className={clsx("flex shrink-0 items-center transition-opacity duration-200 max-md:mr-auto", mobileTitle && "max-md:hidden", compactVisible && "max-md:opacity-0")}>
          <Logo compact className="w-[104px] shrink-0 md:w-[160px]" />
        </Link>

        {mobileTitle && <p className={clsx("absolute left-16 max-w-[calc(100%-200px)] truncate text-base font-bold text-slate-950 transition-opacity duration-200 md:hidden", compactVisible && "opacity-0")}>{mobileTitle}</p>}

        <HeaderSearch value={searchQuery ?? ""} onChange={onSearchChange} placeholder={searchPlaceholder} compact={compactVisible} />

        {compact && (
          <div inert={!compactVisible} aria-hidden={!compactVisible} className={clsx("absolute inset-0 z-20 flex items-center gap-1 py-0 pl-2 pr-16 transition duration-200 ease-out motion-reduce:transition-none md:hidden", compactVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
            {compact.content}
          </div>
        )}

        <div className="ml-auto flex h-full items-center gap-1">
          <nav className="hidden h-full items-stretch lg:flex" aria-label="Navigasi utama">
            {headerNavigation.map((item) => {
              const isActive = item.id === active;
              return (
                <Link key={item.id} href={item.id === "messages" && !signedIn ? "/login" : item.href} aria-current={isActive ? "page" : undefined} className={clsx("group relative flex min-w-[66px] flex-col items-center justify-center gap-1 px-1.5 text-[11px] font-bold transition xl:min-w-[74px]", isActive ? "text-brand-700" : "text-slate-500 hover:text-slate-950")}>
                  <span className={clsx("relative flex h-7 w-10 items-center justify-center rounded-lg transition", isActive ? "bg-brand-50" : "group-hover:bg-slate-100")}><item.icon className={clsx("h-[17px] w-[17px]", isActive && item.id === "feed" && "fill-brand-100")} /></span>
                  {item.label}
                  {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-600" />}
                </Link>
              );
            })}
          </nav>

          {signedIn && <div className="relative hidden h-full min-w-10 md:block lg:min-w-[66px] xl:min-w-[74px]">
            <button type="button" className="group flex h-full w-full flex-col items-center justify-center gap-1 px-1.5 text-[11px] font-bold text-slate-500 transition hover:text-slate-950" onClick={() => setNotificationsOpen((current) => !current)} aria-label="Notifikasi" aria-expanded={notificationsOpen}>
              <span className="relative flex h-7 w-10 items-center justify-center rounded-lg transition group-hover:bg-slate-100"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-0.5 top-0 h-2 w-2 rounded-full border-2 border-white bg-rose-500" /></span>
              <span className="hidden lg:inline">Notifikasi</span>
            </button>
            {notificationsOpen && <HeaderNotifications />}
          </div>}

          {signedIn && <div className="relative z-30 ml-2 flex shrink-0 items-center md:ml-3 md:border-l md:border-slate-200 md:pl-3">
            <AccountMenu active={active === "profile"} onOpen={() => setNotificationsOpen(false)} />
          </div>}
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
