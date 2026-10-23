"use client";

import { Bell, MessageCircle, Newspaper, UserRound } from "lucide-react";
import clsx from "clsx";
import { AuthLink as Link } from "@/components/auth-link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NotificationList } from "@/components/notifications";
import { useAuth } from "@/components/auth-provider";

type BottomSection = "feed" | "messages" | "profile";

const TOP_REVEAL_Y = 64;
const HIDE_AFTER_Y = 160;
const HIDE_SCROLL_DISTANCE = 80;
const SHOW_SCROLL_DISTANCE = 16;

export function MobileBottomNav({ active, messagesBadge = true }: { active?: BottomSection; messagesBadge?: boolean }) {
  const { user, signedIn, requireSession } = useAuth();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsSeen, setNotificationsSeen] = useState(false);
  const navHidden = hidden && !notificationsOpen;

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    // Clamp Safari's overscroll so bouncing at either edge cannot reverse the direction.
    const scrollY = () => Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight));
    let previousY = scrollY();
    let direction = 0;
    let distance = 0;
    let frame = 0;

    function reveal() {
      setHidden(false);
      previousY = scrollY();
      direction = 0;
      distance = 0;
    }

    function update() {
      frame = 0;
      const currentY = scrollY();
      const focused = document.activeElement;
      if (!mobile.matches || notificationsOpen || currentY <= TOP_REVEAL_Y || (navRef.current?.contains(focused) && focused?.matches(":focus-visible"))) {
        reveal();
        return;
      }
      const delta = currentY - previousY;
      if (Math.abs(delta) < 2) return;
      previousY = currentY;
      const nextDirection = delta > 0 ? 1 : -1;
      distance = nextDirection === direction ? distance + Math.abs(delta) : Math.abs(delta);
      direction = nextDirection;

      if (direction === 1 && currentY > HIDE_AFTER_Y && distance >= HIDE_SCROLL_DISTANCE) {
        setHidden(true);
        distance = 0;
      } else if (direction === -1 && distance >= SHOW_SCROLL_DISTANCE) {
        setHidden(false);
        distance = 0;
      }
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab") reveal();
    }

    reveal();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    mobile.addEventListener("change", reveal);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      mobile.removeEventListener("change", reveal);
    };
  }, [pathname, notificationsOpen]);

  function openNotifications() {
    if (!requireSession()) return;
    setNotificationsOpen(true);
    setNotificationsSeen(true);
  }

  return (
    <>
      <nav ref={navRef} aria-label="Navigasi bawah" aria-hidden={navHidden} inert={navHidden} onFocusCapture={() => setHidden(false)} className={clsx("fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[calc(4px+env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl transition-[transform,opacity] motion-reduce:transition-none motion-reduce:duration-0 md:hidden", navHidden ? "pointer-events-none translate-y-[calc(100%+2px)] opacity-0 duration-200 ease-in" : "translate-y-0 opacity-100 duration-300 ease-out")}>
        <div className="grid grid-cols-4">
          <BottomItem icon={Newspaper} label="Feed" href="/" active={active === "feed"} />
          <BottomItem icon={MessageCircle} label="Pesan" href={signedIn ? "/messages" : "/login"} active={active === "messages"} badge={signedIn && messagesBadge} />
          <BottomItem icon={Bell} label="Notifikasi" active={signedIn && notificationsOpen} badge={signedIn && !notificationsSeen} onClick={openNotifications} />
          <BottomItem icon={UserRound} label={signedIn ? "Profil" : "Masuk"} href={signedIn ? "/profile" : "/login"} active={active === "profile"} avatarSrc={user?.avatar} />
        </div>
      </nav>

      {signedIn && notificationsOpen && (
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

function BottomItem({ icon: Icon, label, active, badge, href, onClick, avatarSrc }: { icon: typeof Newspaper; label: string; active?: boolean; badge?: boolean; href?: string; onClick?: () => void; avatarSrc?: string }) {
  const [failedAvatarSrc, setFailedAvatarSrc] = useState<string>();
  const className = clsx("focus-ring relative flex h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-semibold leading-3 transition-colors", active ? "text-brand-600" : "text-slate-500");
  const content = <>
    <span className={clsx("relative flex h-6 w-9 items-center justify-center rounded-full", active && "bg-brand-50")}>
      {avatarSrc && avatarSrc !== failedAvatarSrc ? (
        <img src={avatarSrc} alt="" width={24} height={24} onError={() => setFailedAvatarSrc(avatarSrc)} className={clsx("h-6 w-6 rounded-full bg-slate-100 object-cover", active && "ring-2 ring-brand-500 ring-offset-1")} />
      ) : (
        <Icon className={clsx("h-[18px] w-[18px]", active && "fill-brand-100")} />
      )}
      {badge && <span className="absolute right-1 top-0 h-2 w-2 rounded-full border border-white bg-rose-500" />}
    </span>
    {label}
  </>;
  if (href) return <Link href={href} aria-current={active ? "page" : undefined} className={className}>{content}</Link>;
  return <button type="button" onClick={onClick} aria-expanded={active} className={className}>{content}</button>;
}
