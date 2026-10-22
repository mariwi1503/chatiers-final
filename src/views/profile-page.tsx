"use client";

import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleEllipsis,
  Eye,
  Globe2,
  Grid3X3,
  Heart,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  ShoppingBag,
  Sparkles,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { suggestions } from "@/lib/data";
import { CompanyPanel, CompanyView, ProductsPanel } from "@/components/profile-storefront";
import { ProductReference } from "@/components/product-reference";
import { useStorefront } from "@/components/storefront-provider";
import { demoProfileViews, ownProfile, type ProfilePost as ProfilePostData, type UserProfile } from "@/lib/users";

type ProfileState = Pick<UserProfile, "name" | "handle" | "role" | "bio" | "location">;

const HEADER_HEIGHT = 64;

/** True once the element has scrolled up underneath the sticky app header. */
function useScrolledUnderHeader(ref: RefObject<HTMLElement | null>) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setHidden(!entry.isIntersecting && entry.boundingClientRect.top < HEADER_HEIGHT), { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return hidden;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/** Without `user` this renders the signed-in user's editable profile; with it, someone else's profile. */
export function ProfilePage({ user }: { user?: UserProfile }) {
  const isOwner = !user;
  const { posts, products: ownProducts } = useStorefront();
  const router = useRouter();
  const nameRef = useRef<HTMLDivElement>(null);
  const compact = useScrolledUnderHeader(nameRef);
  const [connected, setConnected] = useState(false);
  const [newProductRequest, setNewProductRequest] = useState(0);
  const [ownState, setOwnState] = useState<ProfileState>({
    name: ownProfile.name,
    handle: ownProfile.handle,
    role: ownProfile.role,
    bio: ownProfile.bio,
    location: ownProfile.location,
  });
  const profile: UserProfile = user ?? { ...ownProfile, ...ownState };
  // Feed posts keep the author's original name, even after the own profile is renamed.
  const productPosts = posts.filter((post) => post.productId && post.author === (user ?? ownProfile).name);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeTab = tab && ["postingan", "tentang", "perusahaan", "produk"].includes(tab) ? tab : "postingan";
  const selectedProduct = searchParams.get("product");
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const firstName = profile.name.split(" ")[0];

  function navigateTab(tab: string, productId: string | null = null) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    if (productId) url.searchParams.set("product", productId);
    else url.searchParams.delete("product");
    window.history.pushState(null, "", url.pathname + url.search);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function toggleConnect() {
    setConnected((value) => !value);
    showToast(connected ? "Permintaan koneksi dibatalkan" : `Permintaan koneksi dikirim ke ${profile.name}`);
  }

  const productCount = user ? user.products.length : ownProducts.length;
  const compactSubtitle = activeTab === "produk" ? `${productCount} produk` : profile.handle;
  const compactHeader = (
    <>
      {!isOwner && <button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))} className="icon-button shrink-0" aria-label="Kembali"><ArrowLeft className="h-5 w-5" /></button>}
      <button type="button" onClick={scrollToTop} aria-label={`Profil ${profile.name}, kembali ke atas`} className={clsx("focus-ring flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-1 pr-2 text-left", isOwner && "pl-2")}>
        <Avatar src={profile.avatar} alt="" size="sm" />
        <span className="min-w-0">
          <span className="flex items-center gap-1"><span className="truncate text-sm font-extrabold text-slate-900">{profile.name}</span>{profile.verified && <VerifiedBadge small />}</span>
          <span className="block truncate text-[11px] text-slate-400">{compactSubtitle}</span>
        </span>
      </button>
      {!isOwner ? (
        <button type="button" onClick={toggleConnect} aria-pressed={connected} className={clsx("focus-ring flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition", connected ? "bg-emerald-50 text-emerald-700" : "bg-brand-600 text-white")}>{connected ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}{connected ? "Diminta" : "Hubungkan"}</button>
      ) : activeTab === "produk" ? (
        <button type="button" onClick={() => setNewProductRequest((value) => value + 1)} className="focus-ring flex h-8 shrink-0 items-center gap-1 rounded-full bg-brand-600 px-3 text-xs font-bold text-white"><Plus className="h-3.5 w-3.5" />Tambah</button>
      ) : (
        <button type="button" onClick={() => setEditOpen(true)} className="focus-ring flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-slate-950 px-3 text-xs font-bold text-white"><Pencil className="h-3 w-3" />Edit</button>
      )}
    </>
  );

  return (
    <div className="min-h-screen pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-8">
      <AppHeader active={isOwner ? "profile" : undefined} mobileTitle={profile.handle.replace(/^@/, "")} compact={{ visible: compact, content: compactHeader }} />

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 px-0 md:px-4 md:pt-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <ProfileHero profile={profile} isOwner={isOwner} nameRef={nameRef} connected={connected} onToggleConnect={toggleConnect} onEdit={() => setEditOpen(true)} />
          <ProfileTabs active={activeTab} onChange={navigateTab} profile={profile} showIdentity={compact} />

          {activeTab === "postingan" && (
            <div id="profile-panel-postingan" role="tabpanel" aria-labelledby="profile-tab-postingan" className="mt-3 space-y-3">
              <div className="flex items-center justify-between px-4 md:px-1">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Postingan terbaru</h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">Aktivitas dan cerita dari {firstName}</p>
                </div>
                <button className="focus-ring flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-slate-500 hover:bg-white">
                  Terbaru <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              {productPosts.map((post) => (
                <article key={post.id} className="surface rounded-none p-4 sm:p-5 md:rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Avatar src={profile.avatar} alt={profile.name} />
                    <div>
                      <p className="text-sm font-extrabold">{profile.name}</p>
                      <p className="text-[11px] text-slate-400">Membagikan produk · {post.time}</p>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{post.text}</p>
                  <ProductReference productId={post.productId!} />
                  <Link href={`/?post=${post.id}`} className="focus-ring mt-4 inline-block rounded-lg text-xs font-bold text-brand-600">Lihat postingan di feed →</Link>
                </article>
              ))}
              {profile.posts.map((post, index) => (
                <ProfilePost key={post.id} post={post} index={index} profile={profile} onToast={showToast} />
              ))}
              {!productPosts.length && !profile.posts.length && <p className="surface rounded-none p-10 text-center text-sm text-slate-500 md:rounded-2xl">{firstName} belum membuat postingan.</p>}
            </div>
          )}

          {activeTab === "tentang" && <div id="profile-panel-tentang" role="tabpanel" aria-labelledby="profile-tab-tentang"><AboutPanel profile={profile} /></div>}
          {activeTab === "perusahaan" && <div id="profile-panel-perusahaan" role="tabpanel" aria-labelledby="profile-tab-perusahaan">{user ? <CompanyView owner={user} /> : <CompanyPanel onToast={showToast} />}</div>}
          {activeTab === "produk" && <div id="profile-panel-produk" role="tabpanel" aria-labelledby="profile-tab-produk"><ProductsPanel seller={user} newProductRequest={newProductRequest} selectedId={selectedProduct} onSelect={(id) => navigateTab("produk", id)} onToast={showToast} /></div>}
        </section>

        <ProfileRightRail profile={profile} isOwner={isOwner} onToast={showToast} />
      </main>

      <MobileBottomNav active={isOwner ? "profile" : undefined} />
      {isOwner && (
        <EditProfileModal
          open={editOpen}
          profile={ownState}
          onClose={() => setEditOpen(false)}
          onSave={(value) => {
            setOwnState(value);
            setEditOpen(false);
            showToast("Profil berhasil diperbarui");
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[90] -translate-x-1/2 animate-fade-up whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function VerifiedBadge({ small = false }: { small?: boolean }) {
  return <span className={clsx("flex shrink-0 items-center justify-center rounded-full bg-brand-600 text-white", small ? "h-3.5 w-3.5" : "h-5 w-5")} title="Akun terverifikasi"><Check className={clsx("stroke-[3]", small ? "h-2 w-2" : "h-3 w-3")} /></span>;
}

function ProfileHero({ profile, isOwner, nameRef, connected, onToggleConnect, onEdit }: { profile: UserProfile; isOwner: boolean; nameRef: RefObject<HTMLDivElement | null>; connected: boolean; onToggleConnect: () => void; onEdit: () => void }) {
  return (
    <article className="bg-white px-4 pb-5 pt-4 md:rounded-3xl md:border md:border-slate-200 md:p-6 md:shadow-card">
      <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-5">
        <img src={profile.avatar} alt={profile.name} className="col-start-1 row-start-1 h-20 w-20 rounded-full object-cover ring-1 ring-slate-200 md:h-24 md:w-24" />

        <div className="col-span-2 col-start-1 row-start-2 mt-3 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1 md:mt-0">
          <div ref={nameRef} className="flex items-center gap-2">
            <h1 className="min-w-0 text-sm font-bold text-slate-950 [overflow-wrap:anywhere] md:text-2xl md:font-black md:tracking-tight">{profile.name}</h1>
            {profile.verified && <VerifiedBadge />}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 [overflow-wrap:anywhere] md:mt-1 md:text-sm md:font-semibold md:text-slate-600">{profile.role}</p>
          <p className="mt-0.5 hidden text-xs text-slate-400 [overflow-wrap:anywhere] md:block">{profile.handle}</p>
        </div>

        <p className="col-span-2 col-start-1 row-start-3 mt-1 max-w-2xl text-[13px] leading-5 text-slate-600 [overflow-wrap:anywhere] md:col-span-3 md:row-start-2 md:mt-4 md:text-sm md:leading-6">{profile.bio}</p>
        <ProfileFacts profile={profile} summary className="col-span-2 col-start-1 row-start-4 mt-2 md:col-span-3 md:row-start-3 md:mt-3" />

        <div className="col-span-2 col-start-1 row-start-5 mt-4 flex items-center gap-2 md:col-span-1 md:col-start-3 md:row-start-1 md:mt-0">
          {isOwner ? (
            <button type="button" onClick={onEdit} className="focus-ring flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-100 px-4 text-xs font-bold text-slate-900 transition hover:bg-slate-200 md:h-11 md:flex-none md:rounded-full md:bg-slate-950 md:text-white md:hover:bg-brand-700"><Pencil className="hidden h-3.5 w-3.5 md:block" />Edit profil</button>
          ) : (
            <>
              <Link href="/messages" className="focus-ring order-2 flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-200 md:order-1 md:h-11 md:flex-none md:rounded-full md:border md:border-slate-200 md:bg-white md:hover:bg-slate-50"><MessageCircle className="hidden h-4 w-4 md:block" />Pesan</Link>
              <button type="button" onClick={onToggleConnect} aria-pressed={connected} className={clsx("focus-ring order-1 flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-bold transition md:order-2 md:h-11 md:flex-none md:gap-2 md:rounded-full md:px-4", connected ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-brand-600 text-white hover:bg-brand-700")}>{connected ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="hidden h-3.5 w-3.5 md:block" />}{connected ? "Diminta" : "Hubungkan"}</button>
            </>
          )}
        </div>

        <div className="col-start-2 row-start-1 grid min-w-0 grid-cols-3 gap-1 md:col-span-3 md:col-start-1 md:row-start-4 md:mt-5 md:flex md:gap-10 md:border-t md:border-slate-100 md:pt-4">
          {[[profile.stats.posts, "Postingan"], [profile.stats.connections, "Koneksi"], [profile.stats.following, "Mengikuti"]].map(([value, label]) => <button key={label} type="button" className="min-w-0 text-center md:text-left"><b className="block text-base font-bold text-slate-900 md:font-black">{value}</b><span className="text-[10px] text-slate-600 min-[375px]:text-[11px] md:text-xs md:font-medium md:text-slate-400">{label}</span></button>)}
        </div>
      </div>
    </article>
  );
}

function ProfileFacts({ profile, className, summary = false }: { profile: UserProfile; className?: string; summary?: boolean }) {
  return (
    <div className={clsx("flex min-w-0 flex-wrap gap-x-4 text-[11px] font-medium text-slate-500 sm:text-xs", summary ? "flex-col items-start gap-y-1 md:flex-row md:items-center md:gap-y-2" : "gap-y-2", className)}>
      <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" />{profile.location}</span>
      {profile.website && <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="flex max-w-full items-center gap-1.5 font-bold text-brand-600 [overflow-wrap:anywhere] hover:underline"><Link2 className="h-3.5 w-3.5 shrink-0" />{profile.website}</a>}
      <span className={clsx("items-center gap-1.5", summary ? "hidden md:flex" : "flex")}><CalendarDays className="h-3.5 w-3.5 text-slate-400" />Bergabung {profile.joined}</span>
      <span className="flex items-center gap-1.5"><Eye aria-hidden="true" className="h-3.5 w-3.5 text-slate-400" /><span><span className="font-semibold text-slate-700">{(demoProfileViews[profile.username] ?? 0).toLocaleString("id-ID")}</span> tayangan profil</span></span>
    </div>
  );
}

function ProfileTabs({ active, onChange, profile, showIdentity }: { active: string; onChange: (value: string) => void; profile: UserProfile; showIdentity: boolean }) {
  return (
    <div className="sticky top-16 z-20 flex items-stretch border-y border-slate-200 bg-white/95 backdrop-blur-md md:mt-2 md:rounded-2xl md:border md:px-3 md:shadow-card">
      {/* Desktop keeps the global header, so the profile identity slides into the tab bar instead. */}
      <button type="button" onClick={scrollToTop} inert={!showIdentity} aria-hidden={!showIdentity} aria-label={`Profil ${profile.name}, kembali ke atas`} className={clsx("focus-ring hidden shrink-0 items-center gap-2 overflow-hidden rounded-xl transition-all duration-300 ease-out motion-reduce:transition-none md:flex", showIdentity ? "my-1.5 mr-2 max-w-[240px] pl-1 pr-3 opacity-100" : "max-w-0 opacity-0")}>
        <Avatar src={profile.avatar} alt="" size="sm" />
        <span className="truncate text-sm font-extrabold text-slate-900">{profile.name}</span>
        {profile.verified && <VerifiedBadge small />}
      </button>
      <div role="tablist" aria-label="Bagian profil" className="grid min-w-0 flex-1 grid-cols-4 md:px-2">
        {([["postingan", "Postingan", Grid3X3], ["tentang", "Tentang", UserRound], ["perusahaan", "Perusahaan", Building2], ["produk", "Produk", ShoppingBag]] as const).map(([id, label, Icon], index, tabs) => <button key={id} id={`profile-tab-${id}`} role="tab" title={label} aria-selected={active === id} aria-controls={`profile-panel-${id}`} tabIndex={active === id ? 0 : -1} onKeyDown={(event) => { const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null; if (next !== null) { event.preventDefault(); onChange(tabs[next][0]); document.getElementById(`profile-tab-${tabs[next][0]}`)?.focus(); } }} onClick={() => onChange(id)} className={clsx("focus-ring relative flex min-h-12 flex-1 items-center justify-center py-3 text-xs font-extrabold transition md:min-h-0 md:px-6 md:py-3.5", active === id ? "text-slate-950 md:text-brand-700" : "text-slate-400 hover:text-slate-700")}><Icon aria-hidden="true" className="h-5 w-5 md:hidden" /><span className="sr-only md:not-sr-only">{label}</span>{active === id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-950 md:inset-x-4 md:rounded-full md:bg-brand-600" />}</button>)}
      </div>
    </div>
  );
}

function ProfilePost({ post, index, profile, onToast }: { post: ProfilePostData; index: number; profile: UserProfile; onToast: (message: string) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-up border-y border-slate-100 bg-white md:rounded-2xl md:border md:shadow-card">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar src={profile.avatar} alt={profile.name} size="lg" />
          <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><h3 className="truncate text-sm font-extrabold">{profile.name}</h3>{profile.verified && <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-600 text-white"><Check className="h-2 w-2 stroke-[3]" /></span>}</div><p className="truncate text-[11px] text-slate-400">{profile.role} · {post.time}</p></div>
          <button className="icon-button -mr-2 -mt-2" aria-label="Opsi postingan"><MoreHorizontal className="h-5 w-5" /></button>
        </div>
        <p className="mt-4 text-[13px] leading-6 text-slate-600 sm:text-sm">{post.text}</p>
        <p className="mt-2 text-xs font-bold text-brand-600">{post.tags.join("  ")}</p>
        {post.image && <img src={post.image} alt={post.imageAlt ?? ""} className="mt-4 aspect-[16/9] w-full rounded-2xl object-cover" />}
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

function AboutPanel({ profile }: { profile: UserProfile }) {
  return (
    <div className="mt-3 animate-fade-up space-y-3">
      <section className="surface rounded-none p-5 md:rounded-2xl">
        <h2 className="text-sm font-extrabold">Tentang {profile.name.split(" ")[0]}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{profile.bio}</p>
        <ProfileFacts profile={profile} className="mt-4 border-t border-slate-100 pt-4" />
      </section>
      <section className="surface rounded-none p-5 md:rounded-2xl">
        <h2 className="text-sm font-extrabold">Pengalaman</h2>
        <ol className="mt-4 space-y-5">
          {profile.experience.map((item) => (
            <li key={`${item.company}-${item.title}`} className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><BriefcaseBusiness className="h-5 w-5" /></span>
              <div className="min-w-0"><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-slate-500">{item.company} · {item.type}</p><p className="mt-1 text-[11px] text-slate-400">{item.period} · {item.location}</p></div>
            </li>
          ))}
        </ol>
      </section>
      {profile.skills.length > 0 && (
        <section className="surface rounded-none p-5 md:rounded-2xl">
          <h2 className="flex items-center gap-2 text-sm font-extrabold"><Sparkles className="h-4 w-4 text-amber-500" />Keahlian</h2>
          <div className="mt-4 flex flex-wrap gap-2">{profile.skills.map((skill) => <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">{skill}</span>)}</div>
        </section>
      )}
    </div>
  );
}

function ProfileRightRail({ profile, isOwner, onToast }: { profile: UserProfile; isOwner: boolean; onToast: (message: string) => void }) {
  return (
    <aside className="sticky top-20 hidden self-start space-y-3 pb-4 lg:block">
      {isOwner && (
        <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-blue-700 to-violet-700 p-4 text-white shadow-card">
          <div className="flex items-center justify-between"><span className="text-xs font-extrabold">Kekuatan profil</span><span className="text-xs font-black">85%</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-[85%] rounded-full bg-white" /></div>
          <p className="mt-3 text-[11px] leading-5 text-blue-100">Tambahkan keahlian agar profilmu lebih mudah ditemukan.</p>
          <button onClick={() => onToast("Editor keahlian akan segera tersedia")} className="mt-3 w-full rounded-xl bg-white py-2.5 text-[11px] font-extrabold text-brand-700">Lengkapi profil</button>
        </section>
      )}

      {!isOwner && profile.company && (
        <section className="surface rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perusahaan</p>
          <p className="mt-2 text-sm font-extrabold">{profile.company.name}</p>
          <p className="mt-1 text-[11px] text-slate-500">{profile.company.industry} · {profile.company.location}</p>
        </section>
      )}

      <section className="surface rounded-2xl p-4">
        <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Mungkin kamu kenal</h2><button className="text-brand-600"><CircleEllipsis className="h-4 w-4" /></button></div>
        <div className="mt-4 space-y-4">{suggestions.map((person) => <Suggestion key={person.name} person={person} onToast={onToast} />)}</div>
      </section>

      {isOwner && <section className="surface rounded-2xl p-4"><div className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-emerald-500" /><h2 className="text-sm font-extrabold">Profil publik</h2></div><p className="mt-2 text-[11px] leading-5 text-slate-500">Profilmu dapat dilihat siapa pun di dalam komunitas Chatiers.</p><button className="mt-3 text-[11px] font-bold text-brand-600">Atur visibilitas →</button></section>}
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
