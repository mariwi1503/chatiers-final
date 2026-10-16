"use client";

import {
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleEllipsis,
  Globe2,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/avatar";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { currentUser, suggestions } from "@/lib/data";

const profilePosts = [
  {
    id: 1,
    time: "2 jam",
    text: "Baru saja menyelesaikan eksplorasi desain untuk pengalaman onboarding yang lebih manusiawi. Pelajaran terbesarnya: jangan minta pengguna memahami produk kita—bantu produk memahami mereka.",
    tags: ["#ProductDesign", "#UXIndonesia"],
    likes: 184,
    comments: 32,
    shares: 11,
  },
  {
    id: 2,
    time: "2 hari",
    text: "Senang bisa berbagi tentang membangun design system yang bertumbuh bersama tim di Product Talks kemarin. Terima kasih untuk semua pertanyaan dan diskusinya!",
    tags: ["#DesignSystem", "#Community"],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
    likes: 267,
    comments: 41,
    shares: 28,
  },
];

type ProfileState = {
  name: string;
  handle: string;
  role: string;
  bio: string;
  location: string;
};

export function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({
    name: currentUser.name,
    handle: currentUser.handle,
    role: "Product Designer",
    bio: "Merancang produk digital yang sederhana, hangat, dan berguna. Suka berbagi soal desain, teknologi, dan proses membangun sesuatu dari nol.",
    location: "Jakarta, Indonesia",
  });
  const [activeTab, setActiveTab] = useState("postingan");
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <AppHeader active="profile" />

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 px-0 md:px-4 md:pt-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <ProfileHero profile={profile} onEdit={() => setEditOpen(true)} onToast={showToast} />
          <ProfileTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === "postingan" && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between px-4 md:px-1">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Postingan terbaru</h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">Aktivitas dan cerita dari {profile.name.split(" ")[0]}</p>
                </div>
                <button className="focus-ring flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-slate-500 hover:bg-white">
                  Terbaru <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              {profilePosts.map((post, index) => (
                <ProfilePost key={post.id} post={post} index={index} name={profile.name} onToast={showToast} />
              ))}
            </div>
          )}

          {activeTab === "tentang" && <AboutPanel profile={profile} />}
          {activeTab === "media" && <MediaPanel />}
        </section>

        <ProfileRightRail onToast={showToast} />
      </main>

      <MobileBottomNav active="profile" />
      <EditProfileModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSave={(value) => {
          setProfile(value);
          setEditOpen(false);
          showToast("Profil berhasil diperbarui");
        }}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 animate-fade-up whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function ProfileHero({ profile, onEdit, onToast }: { profile: ProfileState; onEdit: () => void; onToast: (message: string) => void }) {
  return (
    <article className="overflow-hidden border-y border-slate-200 bg-white md:rounded-3xl md:border md:shadow-card">
      <div className="group relative h-36 overflow-hidden bg-[radial-gradient(circle_at_82%_20%,rgba(255,255,255,.26),transparent_20%),linear-gradient(120deg,#0f172a_0%,#123a84_48%,#5b5ce2_100%)] sm:h-44">
        <div className="absolute -left-10 top-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute left-20 top-24 h-32 w-32 rounded-full border border-white/10" />
        <div className="absolute right-8 top-6 max-w-[190px] text-right text-white/80"><p className="text-[10px] font-bold uppercase tracking-[0.25em]">Create · Connect</p><p className="mt-2 text-lg font-black leading-5 text-white">Ideas grow better together.</p></div>
        <button onClick={() => onToast("Penggantian cover akan segera tersedia")} className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-slate-950/40 px-3 py-2 text-[11px] font-bold text-white backdrop-blur-md transition hover:bg-slate-950/60"><Camera className="h-3.5 w-3.5" /><span className="hidden sm:inline">Ganti sampul</span></button>
      </div>

      <div className="px-4 pb-5 sm:px-6">
        <div className="flex items-end justify-between">
          <div className="relative z-10 -mt-12 rounded-full bg-white p-1.5 shadow-sm sm:-mt-14"><img src={currentUser.avatar} alt={profile.name} className="h-24 w-24 rounded-full object-cover ring-1 ring-slate-200 sm:h-28 sm:w-28" /></div>
          <div className="flex items-center gap-2 pb-1">
            <button onClick={onEdit} className="focus-ring flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-brand-700"><Pencil className="h-3.5 w-3.5" /> Edit profil</button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2"><h1 className="text-xl font-black text-slate-950 sm:text-2xl">{profile.name}</h1><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white"><Check className="h-3 w-3 stroke-[3]" /></span></div>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">{profile.role} <span className="font-normal text-slate-300">·</span> {profile.handle}</p>
          <p className="mt-3 max-w-xl text-[13px] leading-6 text-slate-600 sm:text-sm">{profile.bio}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-slate-500 sm:text-xs">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{profile.location}</span>
            <a href="https://aryapratama.design" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-bold text-brand-600 hover:underline"><Link2 className="h-3.5 w-3.5" />aryapratama.design</a>
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />Bergabung Mei 2023</span>
          </div>
        </div>

        <div className="mt-5 flex gap-6 border-t border-slate-100 pt-4 sm:gap-10">
          {[["128", "Postingan"], ["1.284", "Koneksi"], ["892", "Mengikuti"]].map(([value, label]) => <button key={label} className="text-left"><b className="block text-sm font-black text-slate-900 sm:text-base">{value}</b><span className="text-[10px] font-medium text-slate-400 sm:text-xs">{label}</span></button>)}
        </div>
      </div>
    </article>
  );
}

function ProfileTabs({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return (
    <div className="sticky top-16 z-20 mt-2 flex border-y border-slate-100 bg-white/95 px-4 backdrop-blur-md md:rounded-2xl md:border md:px-5 md:shadow-card">
      {[["postingan", "Postingan"], ["tentang", "Tentang"], ["media", "Media"]].map(([id, label]) => <button key={id} onClick={() => onChange(id)} className={clsx("relative flex-1 py-3.5 text-xs font-extrabold transition sm:flex-none sm:px-6", active === id ? "text-brand-700" : "text-slate-400 hover:text-slate-700")}>{label}{active === id && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand-600" />}</button>)}
    </div>
  );
}

function ProfilePost({ post, index, name, onToast }: { post: (typeof profilePosts)[number]; index: number; name: string; onToast: (message: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-up border-y border-slate-100 bg-white md:rounded-2xl md:border md:shadow-card">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar src={currentUser.avatar} alt={name} size="lg" />
          <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h3 className="truncate text-sm font-extrabold">{name}</h3><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-600 text-white"><Check className="h-2 w-2 stroke-[3]" /></span></div><p className="text-[11px] text-slate-400">Product Designer · {post.time}</p></div>
          <button className="icon-button -mr-2 -mt-2" aria-label="Opsi postingan"><MoreHorizontal className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-[13px] leading-6 text-slate-600 sm:text-sm">{post.text}</p>
        <p className="mt-2 text-xs font-bold text-brand-600">{post.tags.join("  ")}</p>
        {post.image && <img src={post.image} alt="Dokumentasi acara Product Talks" className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover" />}
      </div>
      <div className="grid grid-cols-4 border-t border-slate-100 px-2 py-1.5 sm:px-4">
        <PostAction icon={Heart} text={`${post.likes + (liked ? 1 : 0)}`} active={liked} onClick={() => setLiked((value) => !value)} />
        <PostAction icon={MessageCircle} text={`${post.comments}`} onClick={() => onToast("Kolom komentar dibuka")} />
        <PostAction icon={Share2} text={`${post.shares}`} onClick={() => onToast("Tautan postingan disalin")} />
        <PostAction icon={Bookmark} text="Simpan" active={saved} onClick={() => { setSaved((value) => !value); onToast(saved ? "Dihapus dari simpanan" : "Disimpan untuk nanti"); }} />
      </div>
    </article>
  );
}

function PostAction({ icon: Icon, text, active, onClick }: { icon: typeof Heart; text: string; active?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={clsx("flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition hover:bg-slate-50", active ? "text-brand-600" : "text-slate-500")}><Icon className={clsx("h-[17px] w-[17px]", active && "fill-current")} /><span>{text}</span></button>;
}

function AboutPanel({ profile }: { profile: ProfileState }) {
  return (
    <div className="mt-3 animate-fade-up space-y-3">
      <section className="surface rounded-none p-5 md:rounded-2xl"><h2 className="text-sm font-extrabold">Tentang {profile.name.split(" ")[0]}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{profile.bio}</p></section>
      <section className="surface rounded-none p-5 md:rounded-2xl"><h2 className="text-sm font-extrabold">Pengalaman</h2><div className="mt-4 flex gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="text-sm font-bold">Senior Product Designer</p><p className="text-xs text-slate-500">Nusa Digital · Penuh waktu</p><p className="mt-1 text-[11px] text-slate-400">2022 – Sekarang · Jakarta</p></div></div></section>
    </div>
  );
}

function MediaPanel() {
  const images = [profilePosts[1].image, "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=80", "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80"];
  return <section className="surface mt-3 animate-fade-up rounded-none p-4 md:rounded-2xl"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Foto & media</h2><span className="text-[11px] font-semibold text-slate-400">3 item</span></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{images.map((src, index) => <img key={src} src={src} alt={`Media profil ${index + 1}`} className="aspect-square w-full rounded-xl object-cover transition hover:opacity-90" />)}</div></section>;
}

function ProfileRightRail({ onToast }: { onToast: (message: string) => void }) {
  return (
    <aside className="sticky top-20 hidden self-start space-y-3 pb-4 lg:block">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-blue-700 to-violet-700 p-4 text-white shadow-card">
        <div className="flex items-center justify-between"><span className="text-xs font-extrabold">Kekuatan profil</span><span className="text-xs font-black">85%</span></div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[85%] rounded-full bg-white" /></div>
        <p className="mt-3 text-[11px] leading-5 text-blue-100">Tambahkan keahlian agar profilmu lebih mudah ditemukan.</p>
        <button onClick={() => onToast("Editor keahlian akan segera tersedia")} className="mt-3 w-full rounded-xl bg-white py-2.5 text-[11px] font-extrabold text-brand-700">Lengkapi profil</button>
      </section>

      <section className="surface rounded-2xl p-4">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Mungkin kamu kenal</h2><button className="text-brand-600"><CircleEllipsis className="h-4 w-4" /></button></div>
        <div className="mt-4 space-y-4">{suggestions.map((person) => <Suggestion key={person.name} person={person} onToast={onToast} />)}</div>
      </section>

      <section className="surface rounded-2xl p-4"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-emerald-500" /><h2 className="text-sm font-extrabold">Profil publik</h2></div><p className="mt-2 text-[11px] leading-5 text-slate-500">Profilmu dapat dilihat siapa pun di dalam komunitas Chatiers.</p><button className="mt-3 text-[11px] font-bold text-brand-600">Atur visibilitas →</button></section>
    </aside>
  );
}

function Suggestion({ person, onToast }: { person: (typeof suggestions)[number]; onToast: (message: string) => void }) {
  const [connected, setConnected] = useState(false);
  return <div className="flex items-center gap-3"><Avatar src={person.avatar} alt={person.name} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-extrabold">{person.name}</p><p className="truncate text-[10px] text-slate-400">{person.role}</p></div><button onClick={() => { setConnected((value) => !value); onToast(connected ? "Koneksi dibatalkan" : `Undangan dikirim ke ${person.name}`); }} className={clsx("flex h-8 w-8 items-center justify-center rounded-full border transition", connected ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-brand-200 text-brand-600 hover:bg-brand-50")} aria-label={`Hubungkan dengan ${person.name}`}>{connected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</button></div>;
}

function EditProfileModal({ open, profile, onClose, onSave }: { open: boolean; profile: ProfileState; onClose: () => void; onSave: (value: ProfileState) => void }) {
  const [draft, setDraft] = useState(profile);
  if (!open) return null;

  const fields: { key: keyof ProfileState; label: string; multiline?: boolean }[] = [
    { key: "name", label: "Nama lengkap" },
    { key: "handle", label: "Username" },
    { key: "role", label: "Profesi" },
    { key: "bio", label: "Bio", multiline: true },
    { key: "location", label: "Lokasi" },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-float sm:max-w-lg sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><div><h2 className="font-extrabold">Edit profil</h2><p className="text-[11px] text-slate-400">Perbarui informasi yang dilihat komunitas</p></div><button onClick={onClose} className="icon-button bg-slate-100"><X className="h-5 w-5" /></button></header>
        <div className="space-y-4 p-5">
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">{field.label}</span>
              {field.multiline ? <textarea value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} rows={4} className="focus-ring w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-300" /> : <input value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} className="focus-ring h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-brand-300" />}
            </label>
          ))}
          <button onClick={() => onSave(draft)} disabled={!draft.name.trim() || !draft.bio.trim()} className="h-12 w-full rounded-xl bg-brand-600 text-sm font-extrabold text-white transition hover:bg-brand-700 disabled:bg-slate-200">Simpan perubahan</button>
        </div>
      </section>
    </div>
  );
}
