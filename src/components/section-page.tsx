"use client";

import {
  Bookmark,
  Check,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { getPostTitle, posts as initialPosts, type Post } from "@/lib/data";

export type SectionKind = "communities" | "saved";

const communities = [
  { id: 1, name: "Product Design Indonesia", description: "Diskusi desain produk, riset, dan pengembangan karier.", members: "12,8 rb anggota", icon: "✦", color: "from-violet-500 to-brand-600" },
  { id: 2, name: "Developer Nusantara", description: "Berbagi pengalaman membangun perangkat lunak yang berdampak.", members: "24,1 rb anggota", icon: "</>", color: "from-slate-800 to-cyan-600" },
  { id: 3, name: "UMKM Naik Kelas", description: "Ruang bertumbuh untuk pemilik usaha dan kreator lokal.", members: "8,6 rb anggota", icon: "↗", color: "from-amber-500 to-rose-500" },
  { id: 4, name: "Karier & Kerja Remote", description: "Peluang kerja, ulasan CV, dan persiapan wawancara.", members: "17,3 rb anggota", icon: "◎", color: "from-emerald-500 to-teal-700" },
];

export function SectionPage({ section }: { section: SectionKind }) {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-8">
      <AppHeader
        active={section}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Cari di halaman ini"
      />

      <main className="mx-auto w-full max-w-[1200px] px-0 py-0 md:px-4 md:pt-4">
        {section === "communities" && <CommunitiesSection query={query} />}
        {section === "saved" && <SavedSection query={query} />}
      </main>

      <MobileBottomNav />
    </div>
  );
}

function CommunitiesSection({ query }: { query: string }) {
  const [joined, setJoined] = useState<number[]>([1]);
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filtered = communities.filter((item) => [item.name, item.description].some((value) => value.toLocaleLowerCase("id-ID").includes(normalizedQuery)));

  return (
    <section className="p-4 md:p-0">
      <div className="mb-5"><h1 className="text-2xl font-black text-slate-950">Komunitas</h1><p className="mt-1 text-sm text-slate-500">Temukan ruang diskusi sesuai minat dan tujuanmu.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((community) => {
          const isJoined = joined.includes(community.id);
          return <article key={community.id} className="surface rounded-2xl p-4"><div className="flex items-start gap-3"><span className={clsx("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white", community.color)}>{community.icon}</span><div className="min-w-0"><h2 className="font-extrabold text-slate-900">{community.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{community.description}</p></div></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[10px] font-semibold text-slate-400">{community.members}</span><button onClick={() => setJoined((items) => isJoined ? items.filter((id) => id !== community.id) : [...items, community.id])} className={clsx("flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-bold transition", isJoined ? "bg-emerald-50 text-emerald-600" : "bg-brand-600 text-white hover:bg-brand-700")}>{isJoined && <Check className="h-3.5 w-3.5" />}{isJoined ? "Bergabung" : "Gabung"}</button></div></article>;
        })}
      </div>
      {filtered.length === 0 && <EmptySearch text="Komunitas tidak ditemukan." />}
    </section>
  );
}

function SavedSection({ query }: { query: string }) {
  const [savedPosts, setSavedPosts] = useState<Post[]>(initialPosts.slice(0, 3));
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filtered = savedPosts.filter((post) => [post.author, post.text, getPostTitle(post)].some((value) => value.toLocaleLowerCase("id-ID").includes(normalizedQuery)));

  return (
    <section className="w-full p-4 md:p-0">
      <div className="mb-5"><h1 className="text-2xl font-black text-slate-950">Tersimpan</h1><p className="mt-1 text-sm text-slate-500">Postingan yang ingin kamu baca atau buka kembali.</p></div>
      <div className="space-y-3">
        {filtered.map((post) => <article key={post.id} className="surface overflow-hidden rounded-2xl"><div className="p-4"><div className="flex items-center gap-3"><Avatar src={post.avatar} alt={post.author} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold">{post.author}</p><p className="text-[10px] text-slate-400">{post.role} · {post.time}</p></div><button onClick={() => setSavedPosts((items) => items.filter((item) => item.id !== post.id))} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-rose-50 hover:text-rose-600" aria-label="Hapus dari tersimpan"><Bookmark className="h-4 w-4 fill-current" /></button></div><h2 className="mt-3 text-sm font-extrabold">{getPostTitle(post)}</h2><p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600">{post.text}</p></div>{post.image && <img src={post.image} alt="Media postingan tersimpan" className="aspect-[16/7] w-full object-cover" />}</article>)}
      </div>
      {filtered.length === 0 && <EmptySearch text={savedPosts.length === 0 ? "Belum ada postingan tersimpan." : "Postingan tidak ditemukan."} />}
    </section>
  );
}

function EmptySearch({ text }: { text: string }) {
  return <div className="surface mt-3 rounded-2xl py-14 text-center"><Search className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">{text}</p></div>;
}
