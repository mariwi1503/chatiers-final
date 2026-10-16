"use client";

import { Bell, MessageCircle, Newspaper, UserRound } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { NotificationList } from "@/components/notifications";

type BottomSection = "feed" | "messages" | "profile";

export function MobileBottomNav({ active, messagesBadge = true }: { active?: BottomSection; messagesBadge?: boolean }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);

  function openNotifications() {
    setNotificationsOpen(true);
    setNotificationsSeen(true);
  }

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4 items-end">
          <BottomItem icon={Newspaper} label="Feed" href="/" active={active === "feed"} />
          <BottomItem icon={MessageCircle} label="Pesan" href="/messages" active={active === "messages"} badge={messagesBadge} />
          <BottomItem icon={Bell} label="Notifikasi" active={notificationsOpen} badge={!notificationsSeen} onClick={openNotifications} />
          <BottomItem icon={UserRound} label="Profil" href="/profile" active={active === "profile"} />
        </div>
      </nav>

      {notificationsOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/30 backdrop-blur-[2px] md:hidden" onMouseDown={(event) => event.target === event.currentTarget && setNotificationsOpen(false)}>
          <section className="max-h-[80vh] w-full animate-fade-up overflow-y-auto rounded-t-3xl bg-white px-2 pb-[max(16px,env(safe-area-inset-bottom))] pt-2 shadow-float" aria-label="Notifikasi">
            <button type="button" onClick={() => setNotificationsOpen(false)} className="mx-auto mb-1 flex h-5 w-full items-center justify-center" aria-label="Tutup notifikasi"><span className="h-1.5 w-10 rounded-full bg-slate-200" /></button>
            <NotificationList />
          </section>
        </div>
      )}
    </>
  );
}

function BottomItem({ icon: Icon, label, active, badge, href, onClick }: { icon: typeof Newspaper; label: string; active?: boolean; badge?: boolean; href?: string; onClick?: () => void }) {
  const className = clsx("relative flex flex-col items-center gap-1 py-1 text-[11px] font-semibold", active ? "text-brand-600" : "text-slate-400");
  const content = <>
    <span className={clsx("relative flex h-7 w-10 items-center justify-center rounded-full", active && "bg-brand-50")}><Icon className={clsx("h-5 w-5", active && "fill-brand-100")} />{badge && <span className="absolute right-1 top-0 h-2 w-2 rounded-full border border-white bg-rose-500" />}</span>
    {label}
  </>;
  if (href) return <Link href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} aria-expanded={active} className={className}>{content}</button>;
}
