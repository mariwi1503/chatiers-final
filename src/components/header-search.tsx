"use client";

import { Clock3, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/components/auth-provider";

const recommendations = ["Desain", "Teknologi", "Kerja Remote", "UI Kit", "Fotografi", "Sneaker", "Kopi", "Landing Page", "Bisnis", "Lowongan", "Komunitas", "Keyboard"];
const normalize = (value: string) => value.trim().toLocaleLowerCase("id-ID");

export function HeaderSearch({ value, onChange, placeholder, compact }: { value: string; onChange?: (value: string) => void; placeholder: string; compact: boolean }) {
  const { user } = useAuth();
  const historyKey = `chatiers:search-history:${user?.username ?? "guest"}`;
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    setHistory([]);
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(historyKey) ?? "[]");
      if (Array.isArray(stored)) setHistory(stored.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).slice(0, 10));
    } catch { /* Search stays usable when browser storage is unavailable. */ }
  }, [historyKey]);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function outside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  function saveHistory(next: string[]) {
    setHistory(next);
    try { localStorage.setItem(historyKey, JSON.stringify(next)); } catch { /* Keep in-memory history. */ }
  }
  function search(term: string) {
    const query = term.trim();
    if (query) saveHistory([query, ...history.filter((item) => normalize(item) !== normalize(query))].slice(0, 10));
    setDraft(query);
    setOpen(false);
    inputRef.current?.blur();
    if (onChange) onChange(query);
    else router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }
  function cancel() {
    setOpen(false);
    setDraft("");
    onChange?.("");
    inputRef.current?.blur();
  }
  const recent = history.filter((item) => normalize(item).includes(normalize(draft)));
  const suggested = recommendations.filter((item) => normalize(item).includes(normalize(draft)));

  return (
    <div ref={containerRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setOpen(false); inputRef.current?.blur(); } }} className={clsx("min-w-0 md:relative md:block md:max-w-[280px] md:flex-1", open ? "max-md:absolute max-md:inset-0 max-md:z-40 max-md:bg-white" : user ? "max-md:absolute max-md:right-24" : "max-md:absolute max-md:right-4", compact && !open && "max-md:invisible")}>
      <button type="button" onClick={() => setOpen(true)} aria-label={placeholder} aria-expanded={open} className={clsx("icon-button -mr-2 md:hidden", open && "hidden")}><Search className="h-5 w-5" />{value && <span className="absolute right-0 top-1 h-2 w-2 rounded-full bg-brand-600" />}</button>
      <form role="search" onSubmit={(event) => { event.preventDefault(); search(draft); }} className={clsx("items-center gap-2 max-md:h-16 max-md:px-4 md:flex", open ? "flex" : "hidden")}>
        <div className="relative min-w-0 flex-1">
          <button type="submit" aria-label="Jalankan pencarian" className="focus-ring absolute left-0 top-0 flex h-10 w-9 items-center justify-center rounded-full text-slate-400 hover:text-brand-600"><Search className="h-4 w-4" /></button>
          <input ref={inputRef} type="search" enterKeyHint="search" autoComplete="off" value={draft} onFocus={() => setOpen(true)} onChange={(event) => { setDraft(event.target.value); setOpen(true); }} placeholder={placeholder} aria-label={placeholder} aria-expanded={open} aria-controls={open ? "header-search-panel" : undefined} className="focus-ring h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-9 pr-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-300 focus:bg-white" />
        </div>
        <button type="button" onClick={cancel} className="focus-ring rounded-full px-2 py-2 text-sm font-semibold text-brand-600 md:hidden">Batal</button>
      </form>
      {open && (
        <section id="header-search-panel" aria-label="Riwayat dan saran pencarian" className="absolute top-full z-50 overflow-y-auto overscroll-contain border-slate-200 bg-white max-md:inset-x-0 max-md:h-[calc(100dvh-4rem)] max-md:pb-24 md:left-0 md:mt-3 md:max-h-[70vh] md:w-[min(420px,calc(100vw-2rem))] md:rounded-2xl md:border md:shadow-float">
          {draft.trim() && <button type="button" onClick={() => search(draft)} className="focus-ring flex w-full items-center gap-3 border-b border-slate-100 px-5 py-4 text-left text-sm text-brand-700 hover:bg-brand-50"><Search className="h-4 w-4 shrink-0" /><span className="break-words">Cari “{draft.trim()}”</span></button>}
          <div className="p-5">
            <div className="mb-2 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-950">Pencarian Terakhir</h2>{history.length > 0 && <button type="button" onClick={() => saveHistory([])} className="focus-ring rounded px-1 py-2 text-xs font-semibold text-brand-600">Hapus Semua</button>}</div>
            {recent.length ? <ul>{recent.map((term) => <li key={term} className="flex items-center border-b border-slate-100"><button type="button" onClick={() => search(term)} className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 text-left text-sm hover:text-brand-600"><Clock3 className="h-5 w-5 shrink-0 text-slate-400" /><span className="truncate">{term}</span></button><button type="button" onClick={() => saveHistory(history.filter((item) => item !== term))} aria-label={`Hapus pencarian ${term}`} className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"><X className="h-4 w-4" /></button></li>)}</ul> : <p className="py-4 text-xs leading-5 text-slate-500">{history.length ? "Tidak ada riwayat yang cocok." : "Belum ada pencarian. Pencarian yang kamu jalankan akan muncul di sini."}</p>}
          </div>
          <div className="border-t border-slate-100 p-5">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-950">Rekomendasi Pencarian</h2>{suggested.length > 6 && <button type="button" onClick={() => setShowAll(!showAll)} className="focus-ring shrink-0 rounded py-1 text-xs font-semibold text-brand-600">{showAll ? "Lebih Sedikit" : "Lihat Semua"}</button>}</div>
            <div className="grid grid-cols-2 gap-2">{suggested.slice(0, showAll ? undefined : 6).map((term) => <button key={term} type="button" onClick={() => search(term)} className="focus-ring flex items-center gap-2 rounded-full bg-brand-50 px-3 py-3 text-left text-xs font-medium text-slate-700 transition hover:bg-brand-100"><TrendingUp className="h-4 w-4 shrink-0 text-brand-600" />{term}</button>)}</div>
            {!suggested.length && <p className="text-xs leading-5 text-slate-500">Belum ada saran yang cocok. Tekan Enter untuk mencari kata kunci ini.</p>}
          </div>
        </section>
      )}
    </div>
  );
}
