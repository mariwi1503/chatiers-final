"use client";

import {
  Bookmark,
  Check,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  Search,
  Send,
  UserRound,
  Users,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Avatar } from "@/components/avatar";
import { AppHeader } from "@/components/app-header";
import { contacts, posts as initialPosts, type Post } from "@/lib/data";

export type SectionKind = "messages" | "communities" | "saved";

const headerNavigation = [
  { id: "feed", label: "Feed", href: "/", icon: Newspaper },
  { id: "messages", label: "Pesan", href: "/messages", icon: MessageCircle },
  { id: "communities", label: "Komunitas", href: "/communities", icon: Users },
] as const;

const mobileNavigation = [
  ...headerNavigation,
  { id: "saved", label: "Tersimpan", href: "/saved", icon: Bookmark },
  { id: "profile", label: "Profil", href: "/profile", icon: UserRound },
] as const;

const communities = [
  { id: 1, name: "Product Design Indonesia", description: "Diskusi desain produk, riset, dan pengembangan karier.", members: "12,8 rb anggota", icon: "✦", color: "from-violet-500 to-brand-600" },
  { id: 2, name: "Developer Nusantara", description: "Berbagi pengalaman membangun perangkat lunak yang berdampak.", members: "24,1 rb anggota", icon: "</>", color: "from-slate-800 to-cyan-600" },
  { id: 3, name: "UMKM Naik Kelas", description: "Ruang bertumbuh untuk pemilik usaha dan kreator lokal.", members: "8,6 rb anggota", icon: "↗", color: "from-amber-500 to-rose-500" },
  { id: 4, name: "Karier & Kerja Remote", description: "Peluang kerja, ulasan CV, dan persiapan wawancara.", members: "17,3 rb anggota", icon: "◎", color: "from-emerald-500 to-teal-700" },
];

export function SectionPage({ section }: { section: SectionKind }) {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <AppHeader
        active={section}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Cari di halaman ini"
      />

      <main className="mx-auto w-full max-w-[1200px] px-0 py-0 md:px-4 md:pt-4">
        {section === "messages" && <MessagesSection query={query} />}
        {section === "communities" && <CommunitiesSection query={query} />}
        {section === "saved" && <SavedSection query={query} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        {mobileNavigation.map((item) => {
          const active = item.id === section;
          return (
            <Link key={item.id} href={item.href} aria-current={active ? "page" : undefined} className={clsx("flex flex-col items-center gap-1 py-1 text-[10px] font-semibold", active ? "text-brand-600" : "text-slate-400")}>
              <span className={clsx("flex h-7 w-10 items-center justify-center rounded-full", active && "bg-brand-50")}><item.icon className="h-5 w-5" /></span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function MessagesSection({ query }: { query: string }) {
  const [selectedName, setSelectedName] = useState(contacts[0].name);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const selected = contacts.find((item) => item.name === selectedName) ?? contacts[0];
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filteredContacts = contacts.filter((item) => [item.name, item.role].some((value) => value.toLocaleLowerCase("id-ID").includes(normalizedQuery)));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setSent((items) => [...items, message.trim()]);
    setMessage("");
  }

  return (
    <section className="grid min-h-[calc(100vh-105px)] overflow-hidden bg-white md:min-h-[680px] md:grid-cols-[300px_minmax(0,1fr)] md:rounded-3xl md:border md:border-slate-200 md:shadow-card">
      <aside className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between"><div><h1 className="text-lg font-black">Pesan</h1><p className="text-[11px] text-slate-400">Percakapan terbarumu</p></div><button className="icon-button"><MoreHorizontal className="h-5 w-5" /></button></div>
        <div className="mt-4 space-y-1">
          {filteredContacts.map((contact) => <button key={contact.name} onClick={() => setSelectedName(contact.name)} className={clsx("flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition", selected.name === contact.name ? "bg-brand-50" : "hover:bg-slate-50")}><Avatar src={contact.avatar} alt={contact.name} size="sm" online={contact.online} /><span className="min-w-0 flex-1"><b className="block truncate text-xs">{contact.name}</b><span className="block truncate text-[10px] text-slate-400">{contact.role}</span></span></button>)}
          {filteredContacts.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Kontak tidak ditemukan.</p>}
        </div>
      </aside>

      <div className="flex min-h-[480px] flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 px-4"><Avatar src={selected.avatar} alt={selected.name} size="sm" online={selected.online} /><div><p className="text-sm font-extrabold">{selected.name}</p><p className={clsx("text-[10px]", selected.online ? "text-emerald-500" : "text-slate-400")}>{selected.online ? "Aktif sekarang" : "Sedang offline"}</p></div></header>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50/60 p-4">
          <p className="mx-auto rounded-full bg-white px-3 py-1 text-[9px] font-semibold text-slate-400 shadow-sm">Hari ini</p>
          <div className="flex items-end gap-2"><Avatar src={selected.avatar} alt={selected.name} size="sm" /><p className="max-w-[76%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-xs leading-5 text-slate-700 shadow-sm">Hai Arya! Senang bisa terhubung denganmu di Chatiers 👋</p></div>
          <div className="flex justify-end"><p className="max-w-[76%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-xs leading-5 text-white">Hai! Senang juga bisa terhubung. Apa kabar?</p></div>
          {sent.map((text, index) => <div key={`${text}-${index}`} className="flex justify-end"><p className="max-w-[76%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-xs leading-5 text-white">{text}</p></div>)}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={`Kirim pesan ke ${selected.name.split(" ")[0]}...`} className="min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-100" /><button type="submit" disabled={!message.trim()} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white disabled:bg-slate-200" aria-label="Kirim pesan"><Send className="h-4 w-4" /></button></form>
      </div>
    </section>
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

function getPostTitle(post: Post) {
  if (post.details.type === "sell" || post.details.type === "buy") return post.details.title;
  if (post.details.type === "vacancy") return post.details.position;
  if (post.details.type === "job-search") return post.details.targetRole;
  return post.details.topic ?? "Utas komunitas";
}

function EmptySearch({ text }: { text: string }) {
  return <div className="surface mt-3 rounded-2xl py-14 text-center"><Search className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">{text}</p></div>;
}
