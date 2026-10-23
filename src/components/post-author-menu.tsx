"use client";

import { Ban, MessageCircle, MoreHorizontal, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useSocial } from "@/components/social-provider";
import { currentUser, type Post } from "@/lib/data";

export function PostAuthorMenu({ post }: { post: Post }) {
  const { user, requireSession } = useAuth();
  const { following, toggleFollow, toggleBlock } = useSocial();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const followed = following.includes(post.author);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  if (post.author === currentUser.name || post.author === user?.name) return null;

  function act(action: () => void) {
    setOpen(false);
    trigger.current?.focus();
    if (requireSession()) action();
  }

  const itemClass = "focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-slate-50 focus:bg-slate-50";
  return (
    <div ref={root} className="relative -mr-2 -mt-2 shrink-0" onClick={(event) => event.stopPropagation()} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        if (!open) { setOpen(true); return; }
        const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
        items[next]?.focus();
      }
    }}>
      <button ref={trigger} type="button" className="icon-button focus-ring h-9 w-9" aria-label={`Opsi untuk ${post.author}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)}><MoreHorizontal className="h-5 w-5" /></button>
      {open && <div id={id} role="menu" aria-label={`Opsi untuk ${post.author}`} className="absolute right-0 top-full z-30 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-float">
        <button type="button" role="menuitem" className={itemClass} onClick={() => act(() => toggleFollow(post.author))}>{followed ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}{followed ? "Batal ikuti" : "Ikuti"}</button>
        <button type="button" role="menuitem" className={itemClass} onClick={() => act(() => router.push(`/messages?to=${encodeURIComponent(post.author)}&post=${post.id}`))}><MessageCircle className="h-4 w-4" />Hubungi</button>
        <div className="my-1 border-t border-slate-100" />
        <button type="button" role="menuitem" className={`${itemClass} text-rose-600`} onClick={() => act(() => toggleBlock(post.author))}><Ban className="h-4 w-4" />Blokir</button>
      </div>}
    </div>
  );
}
