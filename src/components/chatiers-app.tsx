"use client";

import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  FileText,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  Link2,
  MapPin,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Plus,
  Search,
  Send,
  Share2,
  Smile,
  Sparkles,
  TrendingUp,
  Trash2,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import { AppHeader } from "@/components/app-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Stories } from "@/components/stories";
import { useStorefront } from "@/components/storefront-provider";
import { ProductReference } from "@/components/product-reference";
import {
  categories,
  contacts,
  currentUser,
  getPostTitle,
  postCategories,
  quickActions,
  suggestions,
  rentalPeriods,
  servicePriceUnits,
  trending,
  type Post,
  type PostAttachment,
  type PostCategory,
  type PostComment,
  type PostCommentReply,
  type PostDetails,
  type PostImage,
  type PricingType,
  type RentalPeriod,
  type ServicePriceUnit,
} from "@/lib/data";
import { findUserByName, getProfileHref } from "@/lib/users";
import { formatProductPrice } from "@/lib/storefront";

type ComposerPayload = {
  category: PostCategory;
  text: string;
  details: PostDetails;
  location?: string;
  images?: PostImage[];
  attachments?: PostAttachment[];
};

type CommentReplyTarget = {
  rootId: string;
  commentId: string;
  author: string;
  text: string;
};

const categoryStyles: Record<"all" | PostCategory, { active: string; inactive: string; badge: string }> = {
  all: {
    active: "bg-ink text-white shadow-sm",
    inactive: "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 hover:text-slate-800",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  thread: {
    active: "bg-brand-600 text-white shadow-sm shadow-brand-200",
    inactive: "bg-brand-50 text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100",
    badge: "bg-brand-50 text-brand-700 ring-brand-100",
  },
  sell: {
    active: "bg-violet-600 text-white shadow-sm shadow-violet-200",
    inactive: "bg-violet-50 text-violet-700 ring-1 ring-violet-100 hover:bg-violet-100",
    badge: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  buy: {
    active: "bg-rose-600 text-white shadow-sm shadow-rose-200",
    inactive: "bg-rose-50 text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100",
    badge: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  service: {
    active: "bg-amber-600 text-white shadow-sm shadow-amber-200",
    inactive: "bg-amber-50 text-amber-700 ring-1 ring-amber-100 hover:bg-amber-100",
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  rental: {
    active: "bg-indigo-600 text-white shadow-sm shadow-indigo-200",
    inactive: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 hover:bg-indigo-100",
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  vacancy: {
    active: "bg-cyan-600 text-white shadow-sm shadow-cyan-200",
    inactive: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100 hover:bg-cyan-100",
    badge: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  "job-search": {
    active: "bg-emerald-600 text-white shadow-sm shadow-emerald-200",
    inactive: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
};

function getCategoryStyles(category: "all" | PostCategory) {
  // A cached client or restored post may contain a category without a style yet.
  return categoryStyles[category] ?? categoryStyles.thread;
}

function formatPostTime(time: string) {
  const match = time.trim().match(/^(\d+)\s*(menit|jam|hari)$/i);

  if (!match) return time;

  const suffix = {
    menit: "m",
    jam: "j",
    hari: "h",
  }[match[2].toLocaleLowerCase("id-ID")];

  return `${match[1]}${suffix}`;
}

function getPostCategoryLabel(category: PostCategory) {
  return postCategories.find((item) => item.id === category)?.label ?? "Utas";
}

function getPostCity(location?: string) {
  return location?.split(/[,·]/)[0].trim().replace(/\s+/g, " ") ?? "";
}

function formatRupiah(value?: number) {
  if (value === undefined) return undefined;
  return formatProductPrice(value);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Matches Tailwind's `md` breakpoint: below it the detail is a pushed full-screen layer, above it it lives in the feed column.
function isDesktop() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function countLoadedComments(comments: PostComment[]) {
  return comments.reduce((total, item) => total + 1 + (item.replies?.length ?? 0), 0);
}

export function ChatiersApp() {
  const [activeCategory, setActiveCategory] = useState<"all" | PostCategory>("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get("q");
    if (query) setSearchQuery(query);
  }, []);
  const { posts, setPosts, findProduct } = useStorefront();
  const [composerOpen, setComposerOpen] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ id: number; focusComment: boolean } | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const detailCloseTimerRef = useRef<number | undefined>(undefined);
  const feedScrollRef = useRef(0);

  const cities = useMemo(() => {
    const names = new Map<string, string>();
    for (const post of posts) {
      const city = getPostCity(post.location);
      if (city) names.set(city.toLocaleLowerCase("id-ID"), city);
    }
    return Array.from(names, ([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const categoryPosts = posts.filter((post) =>
      (activeCategory === "all" || post.category === activeCategory)
      && (!selectedCity || getPostCity(post.location).toLocaleLowerCase("id-ID") === selectedCity)
    );
    const query = searchQuery.trim().toLocaleLowerCase("id-ID");

    if (!query) return categoryPosts;

    return categoryPosts.filter((post) => {
      const product = post.productId ? findProduct(post.productId)?.product : undefined;
      return [post.author, post.role, post.text, getPostTitle(post), getPostCategoryLabel(post.category), product?.name ?? "", product?.category ?? ""].some((value) =>
        value.toLocaleLowerCase("id-ID").includes(query)
      );
    });
  }, [activeCategory, selectedCity, posts, findProduct, searchQuery]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("buat") !== "1") return;
    setComposerOpen(true);
    url.searchParams.delete("buat");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  useEffect(() => {
    function syncDetailFromUrl() {
      const id = Number(new URL(window.location.href).searchParams.get("post"));
      window.clearTimeout(detailCloseTimerRef.current);
      if (id) {
        setDetailClosing(false);
        setDetail((current) => (current?.id === id ? current : { id, focusComment: false }));
        return;
      }
      setDetailClosing(true);
      // On desktop the feed was hidden behind the detail, so put the reader back where they left it.
      if (isDesktop()) window.requestAnimationFrame(() => window.scrollTo(0, feedScrollRef.current));
      detailCloseTimerRef.current = window.setTimeout(() => {
        setDetail(null);
        setDetailClosing(false);
      }, 260);
    }

    // A deep link to ?post= gets the feed placed underneath it, so "back" pops to the feed like a pushed screen.
    const url = new URL(window.location.href);
    const postParam = url.searchParams.get("post");
    if (postParam) {
      url.searchParams.delete("post");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      url.searchParams.set("post", postParam);
      window.history.pushState(null, "", url.pathname + url.search);
      syncDetailFromUrl();
    }

    window.addEventListener("popstate", syncDetailFromUrl);
    return () => {
      window.removeEventListener("popstate", syncDetailFromUrl);
      window.clearTimeout(detailCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!detail || isDesktop()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [detail]);

  function openPost(id: number, focusComment = false) {
    const url = new URL(window.location.href);
    url.searchParams.set("post", String(id));
    window.history.pushState(null, "", url.pathname + url.search);
    window.clearTimeout(detailCloseTimerRef.current);
    feedScrollRef.current = window.scrollY;
    setDetailClosing(false);
    setDetail({ id, focusComment });
    if (isDesktop()) window.scrollTo(0, 0);
  }

  function updatePost(id: number, change: (post: Post) => Post) {
    setPosts((items) => items.map((item) => (item.id === id ? change(item) : item)));
  }

  function toggleLike(id: number) {
    updatePost(id, (post) => ({ ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }));
  }

  function toggleSave(post: Post) {
    updatePost(post.id, (item) => ({ ...item, saved: !item.saved }));
    showToast(post.saved ? "Dihapus dari simpanan" : "Disimpan untuk nanti");
  }

  function addComment(postId: number, text: string, replyTarget: CommentReplyTarget | null) {
    const newId = `comment-${postId}-${Date.now()}`;
    updatePost(postId, (post) => {
      const items = post.commentItems ?? [];
      const commentItems = replyTarget
        ? items.map((item) => item.id === replyTarget.rootId
          ? { ...item, replies: [...(item.replies ?? []), { id: newId, author: currentUser.name, avatar: currentUser.avatar, text, time: "Baru saja", replyToCommentId: replyTarget.commentId, replyToAuthor: replyTarget.author }] }
          : item)
        : [...items, { id: newId, author: currentUser.name, avatar: currentUser.avatar, text, time: "Baru saja" }];
      return { ...post, commentItems, comments: post.comments + 1 };
    });
    showToast(replyTarget ? "Balasan berhasil dikirim" : "Komentar berhasil dikirim");
    return newId;
  }

  const detailPost = detail ? posts.find((post) => post.id === detail.id) : undefined;

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function addPost(payload: ComposerPayload) {
    const newPost: Post = {
      id: Date.now(),
      author: currentUser.name,
      role: "Community Member",
      avatar: currentUser.avatar,
      time: "Baru saja",
      category: payload.category,
      text: payload.text,
      details: payload.details,
      location: payload.location,
      images: payload.images,
      attachments: payload.attachments,
      likes: 0,
      comments: 0,
      commentItems: [],
      shares: 0,
    };
    setPosts((value) => [newPost, ...value]);
    setActiveCategory("all");
    showToast("Postinganmu sudah tayang");
  }

  return (
    <div className="min-h-screen pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
      <AppHeader
        active="feed"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 px-0 md:px-4 lg:grid-cols-[216px_minmax(0,1fr)] xl:grid-cols-[216px_minmax(0,1fr)_288px]">
        <LeftSidebar />

        <section className="w-full min-w-0 pb-10 md:max-w-[680px] md:justify-self-center md:pt-4 lg:max-w-none">
          <div className={clsx(detail && !detailClosing && "md:hidden")}>
          <Stories onToast={showToast} />
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} composerRef={composerRef} onCreatePost={() => setComposerOpen(true)} />
          <ComposerCard onOpen={() => setComposerOpen(true)} containerRef={composerRef} />

          <div className="mt-3 flex items-center justify-between gap-3 px-4 md:mt-3 md:px-1">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Feed terbaru</p>
              <p className="mt-0.5 text-xs text-slate-500">Pilihan terbaik dari komunitasmu</p>
            </div>
            <div className="relative max-w-[50%] shrink-0 text-slate-600">
              <select
                aria-label="Filter postingan berdasarkan kota"
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              >
                <option value="">Semua</option>
                {cities.map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}
              </select>
              <span aria-hidden="true" className="pointer-events-none flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold peer-hover:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate">{cities.find((city) => city.value === selectedCity)?.label ?? "Semua"}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              </span>
            </div>
          </div>

          <div className="mt-2.5 space-y-3">
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onOpen={(focusComment) => openPost(post.id, focusComment)}
                onLike={() => toggleLike(post.id)}
                onSave={() => toggleSave(post)}
                onShare={() => showToast("Tautan postingan disalin")}
              />
            ))}
            {filteredPosts.length === 0 && <EmptyFeed onReset={() => { setActiveCategory("all"); setSelectedCity(""); setSearchQuery(""); }} />}
          </div>
          </div>

          {detail && (
            <PostDetailScreen
              key={detail.id}
              post={detailPost}
              closing={detailClosing}
              autoFocusComment={detail.focusComment}
              onBack={() => window.history.back()}
              onLike={() => toggleLike(detail.id)}
              onSave={() => detailPost && toggleSave(detailPost)}
              onShare={() => showToast("Tautan postingan disalin")}
              onComment={(text, replyTarget) => addComment(detail.id, text, replyTarget)}
            />
          )}
        </section>

        <RightRail onChat={() => setChatOpen(true)} />
      </main>

      <MobileBottomNav active="feed" />

      <ComposerModal open={composerOpen} onClose={() => setComposerOpen(false)} onSubmit={addPost} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 animate-fade-up rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function LeftSidebar() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] flex-col py-4 lg:flex">
      <Link href="/profile" className="block rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-brand-700 p-4 text-white shadow-card transition hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" online />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{currentUser.name}</p>
            <p className="truncate text-xs text-blue-200">{currentUser.handle}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-center">
          <div><b className="block text-sm">1.284</b><span className="text-[10px] text-blue-200">Koneksi</span></div>
          <div><b className="block text-sm">8.6K</b><span className="text-[10px] text-blue-200">Jangkauan</span></div>
        </div>
      </Link>

      <section className="surface mt-3 rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-900">Akses cepat</h2>
          <span className="text-[9px] font-semibold text-slate-400">Personal</span>
        </div>
        <div className="mt-2 space-y-0.5">
          {[
            [Bookmark, "Tersimpan", "24", "/saved"],
            [Users, "Komunitasku", "8", "/communities"],
          ].map(([Icon, label, count, href]) => (
            <Link href={href as string} key={label as string} className="group flex w-full items-center gap-2.5 rounded-xl px-1.5 py-2 text-left transition hover:bg-slate-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-brand-50 group-hover:text-brand-600">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-[11px] font-bold text-slate-600 group-hover:text-slate-900">{label as string}</span>
              <span className="text-[9px] font-bold text-slate-400">{count as string}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-2xl bg-slate-950 p-3.5 text-white shadow-card">
        <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.12em] text-blue-300">
          <CalendarDays className="h-3.5 w-3.5" /> Agenda terdekat
        </div>
        <p className="mt-2 text-xs font-extrabold leading-5">Product Talks: Building for Community</p>
        <p className="mt-1 text-[9px] leading-4 text-slate-400">19 Oktober · 19.00 WIB · Online</p>
        <button className="mt-3 w-full rounded-lg bg-white/10 py-2 text-[10px] font-bold text-white transition hover:bg-white/20">Lihat detail</button>
      </section>

      <div className="mt-auto px-3 text-[10px] leading-5 text-slate-400">
        <p>Tentang · Bantuan · Privasi</p>
        <p>© 2026 Chatiers</p>
      </div>
    </aside>
  );
}

function CategoryTabs({ active, onChange, composerRef, onCreatePost }: { active: "all" | PostCategory; onChange: (value: "all" | PostCategory) => void; composerRef: React.RefObject<HTMLDivElement | null>; onCreatePost: () => void }) {
  const barRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    const composer = composerRef.current;
    if (!bar || !composer) return;
    let observer: IntersectionObserver | null = null;
    const observeComposer = () => {
      observer?.disconnect();
      const coveredTop = (Number.parseFloat(window.getComputedStyle(bar).top) || 0) + bar.offsetHeight;
      observer = new IntersectionObserver(([entry]) => {
        setShowCreate(!entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? coveredTop));
      }, { rootMargin: `-${coveredTop}px 0px 0px 0px` });
      observer.observe(composer);
    };
    const resizeObserver = new ResizeObserver(observeComposer);
    resizeObserver.observe(bar);
    observeComposer();
    return () => {
      observer?.disconnect();
      resizeObserver.disconnect();
    };
  }, [composerRef]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    function updateEdges() {
      if (!element) return;
      const left = element.scrollLeft > 2;
      const right = element.scrollWidth - element.clientWidth - element.scrollLeft > 2;
      setEdges((current) => current.left === left && current.right === right ? current : { left, right });
    }
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    element.addEventListener("scroll", updateEdges, { passive: true });
    updateEdges();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", updateEdges);
    };
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    const selected = element?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!element || !selected) return;
    const bounds = element.getBoundingClientRect();
    const button = selected.getBoundingClientRect();
    const inset = window.matchMedia("(min-width: 768px)").matches ? 44 : 16;
    const offset = button.left < bounds.left + inset ? button.left - bounds.left - inset : button.right > bounds.right - inset ? button.right - bounds.right + inset : 0;
    if (offset) element.scrollBy({ left: offset, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [active, showCreate]);

  function scrollFilters(direction: number) {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.7, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <div ref={barRef} className="sticky top-16 z-20 flex items-center border-b border-slate-100 bg-white/95 py-2 backdrop-blur-md md:mt-2 md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card">
      {showCreate && <div className="shrink-0 pl-4 pr-2"><button type="button" onClick={onCreatePost} aria-label="Buat postingan" title="Buat postingan" className="focus-ring flex h-10 w-10 animate-fade-in items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 motion-reduce:animate-none"><Plus aria-hidden="true" className="h-5 w-5" /></button></div>}
      <div className="relative min-w-0 flex-1">
      <div ref={scrollRef} role="group" aria-label="Filter jenis postingan" className={clsx("flex w-full snap-x snap-proximity scroll-pr-4 items-center gap-2 overflow-x-auto overscroll-x-contain pr-4 py-1 [scrollbar-width:none] md:scroll-px-12 md:gap-2.5 [&::-webkit-scrollbar]:hidden", showCreate ? "scroll-pl-1 pl-1" : "scroll-pl-4 pl-4")}>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => onChange(category.id)}
            aria-pressed={active === category.id}
            className={clsx(
              "focus-ring flex h-10 shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-full px-4 text-xs font-bold transition",
              active === category.id ? getCategoryStyles(category.id).active : getCategoryStyles(category.id).inactive
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div aria-hidden="true" className={clsx("pointer-events-none absolute inset-y-1 left-0 w-8 bg-gradient-to-r from-white to-transparent transition-opacity md:w-12 md:rounded-l-2xl", edges.left ? "opacity-100" : "opacity-0")} />
      <div aria-hidden="true" className={clsx("pointer-events-none absolute inset-y-1 right-0 w-8 bg-gradient-to-l from-white to-transparent transition-opacity md:w-12 md:rounded-r-2xl", edges.right ? "opacity-100" : "opacity-0")} />
      <button type="button" aria-label="Filter sebelumnya" disabled={!edges.left} onClick={() => scrollFilters(-1)} className="focus-ring absolute left-1.5 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-0 md:flex"><ChevronLeft className="h-4 w-4" /></button>
      <button type="button" aria-label="Filter berikutnya" disabled={!edges.right} onClick={() => scrollFilters(1)} className="focus-ring absolute right-1.5 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-0 md:flex"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function ComposerCard({ onOpen, containerRef }: { onOpen: () => void; containerRef: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={containerRef} className="mt-2 border-y border-slate-100 bg-white p-4 md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card">
      <div className="flex gap-3">
        <Avatar src={currentUser.avatar} alt={currentUser.name} size="lg" />
        <button onClick={onOpen} className="focus-ring flex-1 rounded-2xl bg-slate-100 px-4 text-left text-sm text-slate-500 transition hover:bg-slate-50 hover:ring-1 hover:ring-slate-200">
          Bagikan sesuatu ke komunitas, Arya...
        </button>
      </div>
    </div>
  );
}

type PostActionHandlers = {
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
};

function PostCard({ post, index, onOpen, onLike, onSave, onShare }: { post: Post; index: number; onOpen: (focusComment: boolean) => void } & PostActionHandlers) {
  function openFromCard(event: React.MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a, button, input, textarea, select, label")) return;
    if (window.getSelection()?.toString()) return;
    onOpen(false);
  }

  return (
    <article style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-up border-y border-slate-100 bg-white md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card">
      <div onClick={openFromCard} className="cursor-pointer p-4">
        <PostContent post={post} />
      </div>
      <PostActions post={post} onComment={() => onOpen(true)} onLike={onLike} onSave={onSave} onShare={onShare} />
    </article>
  );
}

function PostContent({ post, authorRef }: { post: Post; authorRef?: React.Ref<HTMLDivElement> }) {
  const authorProfile = findUserByName(post.author);
  const postImages = post.images ?? (post.image ? [{ id: `legacy-${post.id}`, name: "Lampiran postingan", url: post.image }] : []);

  return (
    <>
      <div ref={authorRef} className="flex items-start gap-3">
        {authorProfile ? <Link href={getProfileHref(authorProfile)} aria-label={`Lihat profil ${post.author}`} className="focus-ring shrink-0 rounded-full"><Avatar src={post.avatar} alt={post.author} size="lg" /></Link> : <Avatar src={post.avatar} alt={post.author} size="lg" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-bold text-slate-900">{authorProfile ? <Link href={getProfileHref(authorProfile)} className="focus-ring rounded hover:text-brand-600 hover:underline">{post.author}</Link> : post.author}</h3>
            {post.id === 2 && <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-600 text-[8px] font-bold text-white">✓</span>}
            <span className="shrink-0 text-[10px] font-medium text-slate-400">· {formatPostTime(post.time)}</span>
          </div>
          <p className="truncate text-[11px] text-slate-400">{post.role}</p>
        </div>
        <span className={clsx("rounded-full px-2.5 py-1 text-[10px] font-bold ring-1", getCategoryStyles(post.category).badge)}>{getPostCategoryLabel(post.category)}</span>
        <button className="icon-button -mr-2 -mt-2 h-9 w-9" aria-label="Opsi lainnya"><MoreHorizontal className="h-5 w-5" /></button>
      </div>

      <p className="mt-3.5 whitespace-pre-wrap text-[13px] leading-6 text-slate-650 md:text-sm">{post.text}</p>

      {post.productId ? <ProductReference productId={post.productId} /> : <PostDetailsPanel details={post.details} />}

      {post.location && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <MapPin className="h-4 w-4 text-rose-500" />
          {post.location}
        </div>
      )}

      {postImages.length > 0 && (
        <div className={clsx("relative mt-3.5 grid overflow-hidden rounded-2xl bg-slate-100", postImages.length > 1 && "grid-cols-2 gap-0.5")}>
          {postImages.slice(0, 4).map((image, imageIndex) => (
            <div key={image.id} className="relative overflow-hidden">
              <img src={image.url} alt={image.name} className={clsx("w-full object-cover transition duration-700 hover:scale-[1.02]", postImages.length === 1 ? "aspect-[16/9]" : "aspect-square")} />
              {imageIndex === 3 && postImages.length > 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-xl font-extrabold text-white">+{postImages.length - 4}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {post.attachments && post.attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          {post.attachments.map((attachment) => (
            <a key={attachment.id} href={attachment.url} download={attachment.name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-brand-200 hover:bg-brand-50">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm"><FileText className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1"><b className="block truncate text-xs text-slate-700">{attachment.name}</b><span className="text-[10px] text-slate-400">{formatFileSize(attachment.size)}</span></span>
              <span className="text-[10px] font-bold text-brand-600">Unduh</span>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function PostActions({ post, onComment, onLike, onSave, onShare }: { post: Post; onComment: () => void } & PostActionHandlers) {
  return (
    <div className="grid grid-cols-4 border-t border-slate-100 px-2 py-1.5 sm:px-4">
      <ActionButton icon={Heart} label="Suka" count={post.likes} active={Boolean(post.liked)} onClick={onLike} />
      <ActionButton icon={MessageCircle} label="Komentar" count={post.comments} onClick={onComment} />
      <ActionButton icon={Share2} label="Bagikan" count={post.shares} onClick={onShare} />
      <ActionButton icon={Bookmark} label="Simpan" active={Boolean(post.saved)} onClick={onSave} />
    </div>
  );
}

const SWIPE_EDGE = 24;

function PostDetailScreen({
  post,
  closing,
  autoFocusComment,
  onBack,
  onComment,
  ...actions
}: {
  post?: Post;
  closing: boolean;
  autoFocusComment: boolean;
  onBack: () => void;
  onComment: (text: string, replyTarget: CommentReplyTarget | null) => string;
} & PostActionHandlers) {
  const [comment, setComment] = useState("");
  const [replyTarget, setReplyTarget] = useState<CommentReplyTarget | null>(null);
  const [entered, setEntered] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; active: boolean } | null>(null);
  const commentsRef = useRef<HTMLElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const [authorScrolledAway, setAuthorScrolledAway] = useState(false);
  const commentItems = post?.commentItems ?? [];

  useEffect(() => {
    if (!autoFocusComment) return;
    // Wait for the push transition to finish so focusing doesn't jank the slide-in.
    const timer = window.setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      commentInputRef.current?.focus({ preventScroll: true });
    }, 340);
    return () => window.clearTimeout(timer);
  }, [autoFocusComment]);

  // Once the author row scrolls up under the header, the header takes over showing who wrote the post.
  useEffect(() => {
    const author = authorRef.current;
    const header = headerRef.current;
    if (!author || !header) return;
    // On desktop the detail header sticks below the 64px app header.
    const coveredTop = header.offsetHeight + (isDesktop() ? 64 : 0);
    const observer = new IntersectionObserver(
      ([entry]) => setAuthorScrolledAway(!entry.isIntersecting && entry.boundingClientRect.top < coveredTop),
      { rootMargin: `-${coveredTop}px 0px 0px 0px` }
    );
    observer.observe(author);
    return () => observer.disconnect();
  }, [post?.id]);

  function scrollToTop() {
    if (isDesktop()) window.scrollTo({ top: 0, behavior: "smooth" });
    else scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !closing) onBack();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closing, onBack]);

  function sendComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    const newId = onComment(comment.trim(), replyTarget);
    setComment("");
    setReplyTarget(null);
    window.setTimeout(() => document.getElementById(newId)?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 0);
  }

  function startReply(target: CommentReplyTarget) {
    setReplyTarget(target);
    window.setTimeout(() => commentInputRef.current?.focus(), 0);
  }

  function focusComposer() {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    commentInputRef.current?.focus({ preventScroll: true });
  }

  // Swipe from the left edge to go back, like a native stack navigator.
  function onTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    dragRef.current = !closing && !isDesktop() && touch.clientX <= SWIPE_EDGE ? { startX: touch.clientX, startY: touch.clientY, active: false } : null;
  }

  function onTouchMove(event: React.TouchEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const touch = event.touches[0];
    const dx = touch.clientX - drag.startX;
    if (!drag.active) {
      if (Math.abs(touch.clientY - drag.startY) > Math.abs(dx)) { dragRef.current = null; return; }
      if (dx < 8) return;
      drag.active = true;
      setDragging(true);
    }
    setDragX(Math.max(0, dx));
  }

  function onTouchEnd() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag?.active) return;
    setDragging(false);
    if (dragX > window.innerWidth * 0.33) onBack();
    else setDragX(0);
  }

  const screenStyle: React.CSSProperties | undefined = dragging
    ? { transform: `translateX(${dragX}px)`, transition: "none" }
    : dragX > 0
      ? { transform: closing ? "translateX(100%)" : "translateX(0)", transition: "transform .24s cubic-bezier(.32,.72,0,1)" }
      : undefined;
  const backdropOpacity = closing ? 0 : 1 - Math.min(1, dragX / (typeof window === "undefined" ? 1 : window.innerWidth));

  return (
    <div className={clsx("fixed inset-0 z-[70] md:static md:z-auto", closing && "md:hidden")}>
      <div className="absolute inset-0 animate-fade-in bg-slate-950/25 transition-opacity duration-300 md:hidden" style={{ opacity: backdropOpacity }} aria-hidden />
      <section
        aria-label="Detail postingan"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onAnimationEnd={(event) => event.target === event.currentTarget && setEntered(true)}
        style={screenStyle}
        className={clsx(
          "absolute inset-0 flex flex-col bg-white shadow-float motion-reduce:animate-none md:static md:bg-transparent md:shadow-none",
          closing ? dragX === 0 && "animate-screen-out" : !entered && "animate-screen-in md:animate-fade-up"
        )}
      >
        <header ref={headerRef} className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl md:sticky md:top-16 md:z-20 md:rounded-2xl md:border md:shadow-card">
          <div className="mx-auto flex h-14 w-full max-w-[680px] items-center gap-1 px-2">
            <button type="button" onClick={onBack} aria-label="Kembali" className="icon-button h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative h-10 min-w-0 flex-1 overflow-hidden">
              <div aria-hidden={authorScrolledAway} className={clsx("absolute inset-0 flex flex-col justify-center transition duration-300 ease-out motion-reduce:transition-none", authorScrolledAway ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100")}>
                <h2 className="text-sm font-extrabold text-slate-900">Postingan</h2>
                {post && <p className="truncate text-[11px] text-slate-400">oleh {post.author}</p>}
              </div>
              {post && (
                <button
                  type="button"
                  onClick={scrollToTop}
                  tabIndex={authorScrolledAway ? 0 : -1}
                  aria-hidden={!authorScrolledAway}
                  aria-label={`Postingan ${post.author}, kembali ke atas`}
                  className={clsx("absolute inset-0 flex items-center gap-2.5 text-left transition duration-300 ease-out motion-reduce:transition-none", authorScrolledAway ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0")}
                >
                  <Avatar src={post.avatar} alt="" size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-extrabold text-slate-900">{post.author}</span>
                    <span className="block truncate text-[11px] text-slate-400">{post.role}</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        {!post ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center md:mt-3 md:rounded-2xl md:border md:border-dashed md:border-slate-300 md:bg-white md:py-12">
            <Sparkles className="h-8 w-8 text-brand-500" />
            <h3 className="mt-3 font-bold">Postingan tidak ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">Mungkin sudah dihapus atau tautannya keliru.</p>
            <button onClick={onBack} className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white">Kembali ke feed</button>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:flex-none md:overflow-visible">
              <div className="mx-auto w-full max-w-[680px] md:pt-3">
                <article className="bg-white md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card">
                  <div className="p-4">
                    <PostContent post={post} authorRef={authorRef} />
                  </div>
                  <PostActions post={post} onComment={focusComposer} {...actions} />

                  <section ref={commentsRef} className="scroll-mt-2 md:scroll-mt-[136px] border-t border-slate-100 bg-slate-50/80 md:rounded-b-2xl">
                    <div className="border-b border-slate-200/70 px-4 py-3">
                      <h4 className="text-xs font-extrabold text-slate-800">Obrolan komentar</h4>
                      <p className="mt-0.5 text-[10px] text-slate-400">{countLoadedComments(commentItems)} ditampilkan dari {post.comments} komentar</p>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                      {commentItems.length === 0 ? (
                        <div className="py-6 text-center"><MessageCircle className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-xs font-semibold text-slate-500">Belum ada komentar</p><p className="mt-0.5 text-[10px] text-slate-400">Mulai obrolan pertama di postingan ini.</p></div>
                      ) : commentItems.map((item) => <CommentThread key={item.id} comment={item} onReply={startReply} />)}
                    </div>
                  </section>
                </article>
              </div>
            </div>

            <form onSubmit={sendComment} className="shrink-0 border-t border-slate-200/70 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:sticky md:bottom-4 md:z-10 md:mt-3 md:rounded-2xl md:border md:pb-3 md:shadow-card">
              <div className="mx-auto w-full max-w-[680px]">
                {replyTarget && (
                  <div className="mb-2 ml-10 flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-[10px] text-brand-700">
                    <span className="min-w-0 flex-1"><b>Membalas {replyTarget.author}</b><span className="ml-1 hidden truncate text-brand-500 sm:inline">· {replyTarget.text}</span></span>
                    <button type="button" onClick={() => setReplyTarget(null)} aria-label="Batalkan balasan" className="shrink-0 rounded-full p-1 hover:bg-white"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                  <div className="flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
                    <input ref={commentInputRef} value={comment} onChange={(event) => setComment(event.target.value)} className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none" placeholder={replyTarget ? `Balas ${replyTarget.author}...` : "Tulis komentar..."} aria-label={replyTarget ? `Balas ${replyTarget.author}` : "Tulis komentar"} />
                    <button type="submit" disabled={!comment.trim()} aria-label={replyTarget ? "Kirim balasan" : "Kirim komentar"} className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-slate-200"><Send className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function CommentThread({ comment, onReply }: { comment: PostComment; onReply: (target: CommentReplyTarget) => void }) {
  return (
    <div>
      <CommentBubble
        comment={comment}
        own={comment.author === currentUser.name}
        onReply={() => onReply({ rootId: comment.id, commentId: comment.id, author: comment.author, text: comment.text })}
      />
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2 border-l-2 border-slate-200 pl-3 sm:ml-10">
          {comment.replies.map((reply) => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              own={reply.author === currentUser.name}
              nested
              onReply={() => onReply({ rootId: comment.id, commentId: reply.id, author: reply.author, text: reply.text })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentBubble({ comment, own, nested, onReply }: { comment: PostComment | PostCommentReply; own: boolean; nested?: boolean; onReply: () => void }) {
  const replyToAuthor = "replyToAuthor" in comment ? comment.replyToAuthor : undefined;
  return (
    <div id={comment.id} className={clsx("flex items-end gap-2 scroll-mt-4", own ? "justify-end" : "justify-start")}>
      {!own && <Avatar src={comment.avatar} alt={comment.author} size="sm" />}
      <div className={clsx(nested ? "max-w-[82%]" : "max-w-[78%]", own && "text-right")}>
        <div className={clsx("rounded-2xl px-3.5 py-2.5 text-left shadow-sm", own ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700")}>
          <p className={clsx("mb-1 text-[10px] font-extrabold", own ? "text-blue-100" : "text-slate-500")}>{own ? "Kamu" : comment.author}</p>
          {replyToAuthor && <p className={clsx("mb-1 text-[9px] font-semibold", own ? "text-blue-100/80" : "text-brand-600")}>↪ membalas {replyToAuthor === currentUser.name ? "Kamu" : replyToAuthor}</p>}
          <p className="whitespace-pre-wrap break-words text-xs leading-5">{comment.text}</p>
        </div>
        <div className={clsx("mt-1 flex items-center gap-2 px-1 text-[9px]", own ? "justify-end" : "justify-start")}>
          <span className="text-slate-400">{formatPostTime(comment.time)}</span>
          <span className="text-slate-300">·</span>
          <button type="button" onClick={onReply} className="font-bold text-slate-500 transition hover:text-brand-600">Balas</button>
        </div>
      </div>
      {own && <Avatar src={comment.avatar} alt={comment.author} size="sm" />}
    </div>
  );
}

function PostDetailsPanel({ details }: { details: PostDetails }) {
  if (details.type === "thread") {
    return details.topic ? <span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-100">#{details.topic}</span> : null;
  }

  if (details.type === "sell") {
    const priceLabel = details.pricingType === "fixed" ? formatRupiah(details.price) : ({ negotiable: "Harga nego", free: "Gratis", contact: "Hubungi penjual" } as const)[details.pricingType];
    return (
      <div className="mt-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Barang dijual</p><h4 className="mt-1 text-sm font-extrabold text-slate-900">{details.title}</h4></div><b className="shrink-0 text-sm text-violet-700">{priceLabel}</b></div>
        <div className="mt-2 flex flex-wrap gap-1.5">{[details.condition, details.itemCategory, details.delivery].filter(Boolean).map((item) => <DetailChip key={item}>{item}</DetailChip>)}</div>
      </div>
    );
  }

  if (details.type === "buy") {
    const budget = details.budgetMin || details.budgetMax
      ? `${details.budgetMin ? formatRupiah(details.budgetMin) : "Mulai bebas"} – ${details.budgetMax ? formatRupiah(details.budgetMax) : "Fleksibel"}`
      : "Anggaran fleksibel";
    return (
      <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Sedang dicari</p><h4 className="mt-1 text-sm font-extrabold text-slate-900">{details.title}</h4>
        <p className="mt-1.5 text-xs font-bold text-rose-700">{budget}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{[details.desiredCondition, details.deadline && `Dicari sebelum ${details.deadline}`].filter(Boolean).map((item) => <DetailChip key={item}>{item}</DetailChip>)}</div>
      </div>
    );
  }

  if (details.type === "service" || details.type === "rental") {
    const isService = details.type === "service";
    const priceLabel = details.pricingType === "fixed"
      ? `${formatRupiah(details.price)} / ${isService ? details.priceUnit : details.rentalPeriod}`
      : ({ negotiable: "Tarif nego", free: "Gratis", contact: "Hubungi penyedia" } as const)[details.pricingType];
    const chips = details.type === "service"
      ? [details.serviceMode, details.turnaround && `Pengerjaan ${details.turnaround}`, details.status === "available" ? "Menerima pesanan" : "Jadwal penuh"]
      : [details.minimumDuration && `Minimal ${details.minimumDuration} ${details.rentalPeriod}`, details.deposit !== undefined && (details.deposit === 0 ? "Tanpa deposit" : `Deposit ${formatRupiah(details.deposit)}`), details.handover, details.status === "available" ? "Tersedia" : "Sedang disewa"];
    return (
      <div className={clsx("mt-3 rounded-2xl border p-3.5", isService ? "border-amber-100 bg-amber-50/60" : "border-indigo-100 bg-indigo-50/60")}>
        <p className={clsx("text-[10px] font-bold uppercase tracking-wider", isService ? "text-amber-600" : "text-indigo-600")}>{isService ? "Penawaran jasa" : "Disewakan"}</p>
        <h4 className="mt-1 break-words text-sm font-extrabold text-slate-900">{details.title}</h4>
        <p className={clsx("mt-1.5 text-sm font-bold", isService ? "text-amber-700" : "text-indigo-700")}>{priceLabel}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{chips.filter(Boolean).map((item) => <DetailChip key={String(item)}>{item}</DetailChip>)}</div>
      </div>
    );
  }

  if (details.type === "vacancy") {
    const salary = details.salaryMin || details.salaryMax ? `${details.salaryMin ? formatRupiah(details.salaryMin) : ""}${details.salaryMin && details.salaryMax ? " – " : ""}${details.salaryMax ? formatRupiah(details.salaryMax) : "+"}` : undefined;
    return (
      <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">Lowongan pekerjaan</p><h4 className="mt-1 text-sm font-extrabold text-slate-900">{details.position}</h4><p className="mt-0.5 text-xs text-slate-500">{details.company}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{[details.employmentType, details.workMode, salary, ...(details.skills ?? []), details.deadline && `Tutup ${details.deadline}`].filter(Boolean).map((item) => <DetailChip key={item}>{item}</DetailChip>)}</div>
        {details.applicationUrl && <a href={details.applicationUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-cyan-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-cyan-700">Lamar sekarang →</a>}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Terbuka untuk peluang</p><h4 className="mt-1 text-sm font-extrabold text-slate-900">{details.targetRole}</h4>
      <div className="mt-2 flex flex-wrap gap-1.5">{[...details.skills, details.experienceLevel, details.workPreference, details.availability, details.expectedSalary && `Ekspektasi ${formatRupiah(details.expectedSalary)}`].filter(Boolean).map((item) => <DetailChip key={item}>{item}</DetailChip>)}</div>
      {details.portfolioUrl && <a href={details.portfolioUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700">Lihat portofolio →</a>}
    </div>
  );
}

function DetailChip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200/80">{children}</span>;
}

function ActionButton({ icon: Icon, label, count, active, onClick }: { icon: typeof Heart; label: string; count?: number; active?: boolean; onClick: () => void }) {
  return (
    <button aria-label={count === undefined ? label : `${label}: ${count}`} onClick={onClick} className={clsx("flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition hover:bg-slate-50", active ? "text-brand-600" : "text-slate-500")}>
      <Icon className={clsx("h-[17px] w-[17px]", active && label === "Suka" && "fill-brand-600")} />
      <span>{count ?? label}</span>
    </button>
  );
}

function EmptyFeed({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-4 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center md:mx-0">
      <Sparkles className="mx-auto h-8 w-8 text-brand-500" />
      <h3 className="mt-3 font-bold">Belum ada postingan di sini</h3>
      <p className="mt-1 text-sm text-slate-500">Coba kota, kategori, atau kata pencarian lain.</p>
      <button onClick={onReset} className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white">Kembali ke feed</button>
    </div>
  );
}

function RightRail({ onChat }: { onChat: () => void }) {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-96px)] space-y-3 overflow-y-auto py-4 [scrollbar-width:none] xl:block">
      <section className="rounded-2xl bg-gradient-to-br from-brand-700 via-blue-700 to-violet-700 p-4 text-white shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-100"><Sparkles className="h-4 w-4" /> MULAI DARI SINI</div>
        <h2 className="mt-3 text-xl font-extrabold leading-tight">Apa yang ingin kamu capai hari ini?</h2>
        <p className="mt-2 text-xs leading-5 text-blue-100">Komunitas Chatiers siap membantu langkah berikutmu.</p>
        <div className="mt-3 space-y-2">
          {quickActions.map((action) => (
            <button key={action.label} className="flex w-full items-center gap-3 rounded-xl bg-white/95 p-2.5 text-left text-xs font-bold text-slate-800 transition hover:translate-x-1">
              <span className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", action.color)}><action.icon className="h-4 w-4" /></span>
              {action.label}<span className="ml-auto text-slate-400">→</span>
            </button>
          ))}
        </div>
      </section>

      <section className="surface rounded-2xl p-3.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold"><TrendingUp className="h-4 w-4 text-rose-500" /> Sedang ramai</h2>
          <button><CircleEllipsis className="h-4 w-4 text-slate-400" /></button>
        </div>
        <div className="mt-2 divide-y divide-slate-100">
          {trending.map((item, index) => (
            <button key={item.tag} className="flex w-full items-start gap-3 py-2.5 text-left">
              <span className="mt-0.5 text-xs font-bold text-slate-300">0{index + 1}</span>
              <span><b className="block text-xs text-slate-800">{item.tag}</b><span className="text-[10px] text-slate-400">{item.posts}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="surface rounded-2xl p-3.5">
        <div className="flex items-center justify-between"><h2 className="text-sm font-bold">Orang yang mungkin kamu kenal</h2><button className="text-[10px] font-bold text-brand-600">Semua</button></div>
        <div className="mt-3 space-y-3">
          {suggestions.map((person) => (
            <div key={person.name} className="flex items-center gap-3">
              <Avatar src={person.avatar} alt={person.name} />
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{person.name}</p><p className="truncate text-[10px] text-slate-400">{person.role}</p></div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-200 text-brand-600 hover:bg-brand-50"><Plus className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <button onClick={onChat} className="surface flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:border-brand-200">
        <span className="flex -space-x-2">{contacts.slice(0, 3).map((person) => <Avatar key={person.name} src={person.avatar} alt={person.name} size="sm" className="ring-2 ring-white" />)}</span>
        <span className="flex-1"><b className="block text-xs">3 teman aktif</b><span className="text-[10px] text-slate-400">Mulai percakapan</span></span>
        <MessageCircle className="h-5 w-5 text-brand-600" />
      </button>
    </aside>
  );
}

type ComposerFormState = {
  text: string;
  category: PostCategory;
  topic: string;
  title: string;
  pricingType: PricingType;
  price: string;
  condition: string;
  itemCategory: string;
  delivery: string;
  priceUnit: ServicePriceUnit;
  serviceMode: string;
  turnaround: string;
  rentalPeriod: RentalPeriod;
  minimumDuration: string;
  deposit: string;
  budgetMin: string;
  budgetMax: string;
  desiredCondition: string;
  buyDeadline: string;
  position: string;
  company: string;
  employmentType: string;
  workMode: string;
  salaryMin: string;
  salaryMax: string;
  vacancySkills: string;
  applicationUrl: string;
  vacancyDeadline: string;
  targetRole: string;
  jobSkills: string;
  experienceLevel: string;
  workPreference: string;
  availability: string;
  portfolioUrl: string;
  expectedSalary: string;
  location: string;
};

const initialComposerForm: ComposerFormState = {
  text: "", category: "thread", topic: "", title: "", pricingType: "fixed", price: "", condition: "Bekas seperti baru", itemCategory: "", delivery: "",
  priceUnit: "proyek", serviceMode: "Online", turnaround: "", rentalPeriod: "hari", minimumDuration: "1", deposit: "",
  budgetMin: "", budgetMax: "", desiredCondition: "", buyDeadline: "", position: "", company: "", employmentType: "Penuh waktu", workMode: "Hybrid",
  salaryMin: "", salaryMax: "", vacancySkills: "", applicationUrl: "", vacancyDeadline: "", targetRole: "", jobSkills: "", experienceLevel: "",
  workPreference: "Fleksibel", availability: "Segera", portfolioUrl: "", expectedSalary: "", location: "",
};

const composerEmojis = ["😀", "🎉", "💡", "🚀", "❤️", "🙏", "👍", "🔥", "✨", "📣", "💼", "🛍️"];

function ComposerModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (payload: ComposerPayload) => void }) {
  const [form, setForm] = useState<ComposerFormState>(initialComposerForm);
  const [images, setImages] = useState<PostImage[]>([]);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function update<K extends keyof ComposerFormState>(key: K, value: ComposerFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
  }

  function numberValue(value: string) {
    const number = Number(value);
    return value && Number.isFinite(number) ? number : undefined;
  }

  function buildDetails(): PostDetails | null {
    if (form.category === "thread") return { type: "thread", topic: form.topic.trim() || undefined };
    if (form.category === "sell") {
      if (!form.title.trim()) { setFormError("Nama barang wajib diisi."); return null; }
      if (form.pricingType === "fixed" && !numberValue(form.price)) { setFormError("Masukkan harga barang yang valid."); return null; }
      return { type: "sell", title: form.title.trim(), pricingType: form.pricingType, price: form.pricingType === "fixed" ? numberValue(form.price) : undefined, condition: form.condition, itemCategory: form.itemCategory.trim() || undefined, delivery: form.delivery.trim() || undefined, status: "available" };
    }
    if (form.category === "buy") {
      if (!form.title.trim()) { setFormError("Nama barang yang dicari wajib diisi."); return null; }
      const budgetMin = numberValue(form.budgetMin);
      const budgetMax = numberValue(form.budgetMax);
      if (budgetMin && budgetMax && budgetMin > budgetMax) { setFormError("Anggaran minimum tidak boleh melebihi anggaran maksimum."); return null; }
      return { type: "buy", title: form.title.trim(), budgetMin, budgetMax, desiredCondition: form.desiredCondition.trim() || undefined, deadline: form.buyDeadline || undefined, status: "looking" };
    }
    if (form.category === "service" || form.category === "rental") {
      if (!form.title.trim()) { setFormError(form.category === "service" ? "Nama jasa wajib diisi." : "Nama barang atau ruang yang disewakan wajib diisi."); return null; }
      const price = numberValue(form.price);
      if (form.pricingType === "fixed" && (price === undefined || !Number.isSafeInteger(price) || price <= 0)) { setFormError("Masukkan tarif berupa angka rupiah yang lebih besar dari nol."); return null; }
      const pricing = { title: form.title.trim(), pricingType: form.pricingType, price: form.pricingType === "fixed" ? price : undefined };
      if (form.category === "service") return { type: "service", ...pricing, priceUnit: form.priceUnit, serviceMode: form.serviceMode, turnaround: form.turnaround.trim() || undefined, status: "available" };
      const minimumDuration = numberValue(form.minimumDuration);
      const deposit = numberValue(form.deposit);
      if (form.minimumDuration.trim() && (minimumDuration === undefined || !Number.isSafeInteger(minimumDuration) || minimumDuration < 1)) { setFormError("Minimum sewa harus berupa bilangan bulat minimal 1."); return null; }
      if (form.deposit.trim() && (deposit === undefined || !Number.isSafeInteger(deposit) || deposit < 0)) { setFormError("Deposit harus berupa angka rupiah nol atau lebih."); return null; }
      return { type: "rental", ...pricing, rentalPeriod: form.rentalPeriod, minimumDuration, deposit, handover: form.delivery.trim() || undefined, status: "available" };
    }
    if (form.category === "vacancy") {
      if (!form.position.trim() || !form.company.trim()) { setFormError("Posisi dan nama perusahaan wajib diisi."); return null; }
      const salaryMin = numberValue(form.salaryMin);
      const salaryMax = numberValue(form.salaryMax);
      if (salaryMin && salaryMax && salaryMin > salaryMax) { setFormError("Gaji minimum tidak boleh melebihi gaji maksimum."); return null; }
      return { type: "vacancy", position: form.position.trim(), company: form.company.trim(), employmentType: form.employmentType, workMode: form.workMode, salaryMin, salaryMax, skills: splitTags(form.vacancySkills), applicationUrl: normalizeUrl(form.applicationUrl), deadline: form.vacancyDeadline || undefined, status: "open" };
    }
    if (!form.targetRole.trim() || splitTags(form.jobSkills).length === 0) { setFormError("Posisi tujuan dan minimal satu keahlian wajib diisi."); return null; }
    return { type: "job-search", targetRole: form.targetRole.trim(), skills: splitTags(form.jobSkills), experienceLevel: form.experienceLevel || undefined, workPreference: form.workPreference || undefined, availability: form.availability || undefined, portfolioUrl: normalizeUrl(form.portfolioUrl), expectedSalary: numberValue(form.expectedSalary), status: "available" };
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.text.trim()) { setFormError("Tulis isi postingan terlebih dahulu."); return; }
    const details = buildDetails();
    if (!details) return;
    onSubmit({ category: form.category, text: form.text.trim(), details, location: form.location.trim() || undefined, images: images.length ? images : undefined, attachments: attachments.length ? attachments : undefined });
    setForm(initialComposerForm);
    setImages([]);
    setAttachments([]);
    setLocationOpen(false);
    setEmojiOpen(false);
    setFormError("");
    onClose();
  }

  function addImages(files: FileList | null) {
    if (!files) return;
    const availableSlots = Math.max(0, 4 - images.length);
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024).slice(0, availableSlots);
    if (validFiles.length < Math.min(files.length, availableSlots)) setFormError("Sebagian gambar dilewati. Gunakan gambar maksimal 5 MB, hingga 4 gambar.");
    setImages((current) => [...current, ...validFiles.map((file, index) => ({ id: `image-${Date.now()}-${index}-${file.name}`, name: file.name, url: URL.createObjectURL(file) }))]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function addAttachments(files: FileList | null) {
    if (!files) return;
    const availableSlots = Math.max(0, 5 - attachments.length);
    const validFiles = Array.from(files).filter((file) => file.size <= 10 * 1024 * 1024).slice(0, availableSlots);
    if (validFiles.length < Math.min(files.length, availableSlots)) setFormError("Sebagian lampiran dilewati. Ukuran maksimal 10 MB, hingga 5 file.");
    setAttachments((current) => [...current, ...validFiles.map((file, index) => ({ id: `file-${Date.now()}-${index}-${file.name}`, name: file.name, size: file.size, type: file.type, url: URL.createObjectURL(file) }))]);
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  }

  function openLocation() {
    setLocationOpen(true);
    window.setTimeout(() => locationInputRef.current?.focus(), 0);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} className="flex max-h-[94vh] w-full animate-fade-up flex-col rounded-t-3xl bg-white shadow-float sm:max-w-2xl sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="font-extrabold">Buat postingan</h2><p className="text-[11px] text-slate-400">Bagikan kabar, peluang, atau ide barumu</p></div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="icon-button bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="flex items-center gap-3"><Avatar src={currentUser.avatar} alt={currentUser.name} /><div><p className="text-sm font-bold">{currentUser.name}</p><p className="text-[10px] text-slate-400">Dibagikan secara publik</p></div></div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {postCategories.map((item) => (
              <button type="button" key={item.id} onClick={() => update("category", item.id)} className={clsx("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition", form.category === item.id ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>
                <item.icon className="h-3.5 w-3.5" />{item.label}
              </button>
            ))}
          </div>

          <textarea autoFocus value={form.text} onChange={(event) => update("text", event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") event.currentTarget.form?.requestSubmit(); }} placeholder="Apa yang ingin kamu bagikan?" className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-brand-300 focus:ring-4 focus:ring-brand-50" />

          <CategoryFields form={form} update={update} />

          {locationOpen && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 p-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-rose-500" /><input ref={locationInputRef} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Contoh: Jakarta Selatan" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
              <button type="button" onClick={() => { update("location", ""); setLocationOpen(false); }} aria-label="Hapus lokasi" className="text-slate-400 hover:text-rose-600"><X className="h-4 w-4" /></button>
            </div>
          )}

          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {images.map((image) => <div key={image.id} className="group relative overflow-hidden rounded-xl bg-slate-100"><img src={image.url} alt={image.name} className="aspect-square w-full object-cover" /><button type="button" aria-label={`Hapus ${image.name}`} onClick={() => { URL.revokeObjectURL(image.url); setImages((items) => items.filter((item) => item.id !== image.id)); }} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white opacity-90 backdrop-blur hover:bg-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
            </div>
          )}

          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((attachment) => <div key={attachment.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><FileText className="h-4 w-4 shrink-0 text-brand-600" /><span className="min-w-0 flex-1"><b className="block truncate text-xs text-slate-700">{attachment.name}</b><span className="text-[10px] text-slate-400">{formatFileSize(attachment.size)}</span></span><button type="button" aria-label={`Hapus ${attachment.name}`} onClick={() => { URL.revokeObjectURL(attachment.url); setAttachments((items) => items.filter((item) => item.id !== attachment.id)); }} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>)}
            </div>
          )}

          {emojiOpen && <div className="mt-3 grid grid-cols-6 gap-1 rounded-2xl border border-amber-100 bg-amber-50/60 p-2 sm:grid-cols-12">{composerEmojis.map((emoji) => <button type="button" key={emoji} onClick={() => update("text", `${form.text}${form.text && !form.text.endsWith(" ") ? " " : ""}${emoji}`)} className="rounded-lg p-2 text-lg hover:bg-white">{emoji}</button>)}</div>}

          <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => addImages(event.target.files)} />
          <input ref={attachmentInputRef} type="file" multiple hidden onChange={(event) => addAttachments(event.target.files)} />

          <div className="mt-3 flex items-center rounded-2xl border border-slate-200 p-2">
            <span className="ml-2 hidden text-xs font-semibold text-slate-500 sm:inline">Tambahkan</span>
            <div className="ml-auto flex">
              <ComposerAction label="Tambah gambar" onClick={() => imageInputRef.current?.click()} active={images.length > 0}><ImageIcon className="h-5 w-5 text-emerald-600" /></ComposerAction>
              <ComposerAction label="Tambah lokasi" onClick={openLocation} active={locationOpen}><MapPin className="h-5 w-5 text-rose-500" /></ComposerAction>
              <ComposerAction label="Tambah lampiran" onClick={() => attachmentInputRef.current?.click()} active={attachments.length > 0}><Paperclip className="h-5 w-5 text-brand-600" /></ComposerAction>
              <ComposerAction label="Tambah emoji" onClick={() => setEmojiOpen((value) => !value)} active={emojiOpen}><Smile className="h-5 w-5 text-amber-500" /></ComposerAction>
            </div>
          </div>

          {formError && <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{formError}</p>}
          <button type="submit" className="mt-4 h-12 w-full rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700">Bagikan sekarang</button>
          <p className="mt-2 text-center text-[10px] text-slate-400">Tekan Ctrl/⌘ + Enter untuk membagikan</p>
        </div>
      </form>
    </div>
  );
}

function splitTags(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function CategoryFields({ form, update }: { form: ComposerFormState; update: <K extends keyof ComposerFormState>(key: K, value: ComposerFormState[K]) => void }) {
  if (form.category === "thread") return <ComposerField label="Topik (opsional)" value={form.topic} onChange={(value) => update("topic", value)} placeholder="Contoh: Teknologi, Ide bisnis" />;

  if (form.category === "sell") return (
    <div className="mt-3 grid gap-3 rounded-2xl bg-violet-50/70 p-3.5 sm:grid-cols-2">
      <ComposerField label="Nama barang *" value={form.title} onChange={(value) => update("title", value)} placeholder="Contoh: Air Jordan 1 Retro" />
      <ComposerSelect label="Skema harga *" value={form.pricingType} onChange={(value) => update("pricingType", value as PricingType)} options={[["fixed", "Harga tetap"], ["negotiable", "Bisa dinego"], ["free", "Gratis"], ["contact", "Hubungi penjual"]]} />
      {form.pricingType === "fixed" && <ComposerField label="Harga (Rp) *" value={form.price} onChange={(value) => update("price", value)} placeholder="2450000" type="number" />}
      <ComposerSelect label="Kondisi *" value={form.condition} onChange={(value) => update("condition", value)} options={[["Baru", "Baru"], ["Bekas seperti baru", "Bekas seperti baru"], ["Bekas baik", "Bekas baik"], ["Perlu perbaikan", "Perlu perbaikan"]]} />
      <ComposerField label="Kategori barang" value={form.itemCategory} onChange={(value) => update("itemCategory", value)} placeholder="Elektronik, Fashion, dll." />
      <ComposerField label="Pengiriman" value={form.delivery} onChange={(value) => update("delivery", value)} placeholder="COD, kurir, ambil di tempat" />
    </div>
  );

  if (form.category === "buy") return (
    <div className="mt-3 grid gap-3 rounded-2xl bg-rose-50/70 p-3.5 sm:grid-cols-2">
      <div className="sm:col-span-2"><ComposerField label="Barang yang dicari *" value={form.title} onChange={(value) => update("title", value)} placeholder="Contoh: Kamera mirrorless" /></div>
      <ComposerField label="Anggaran minimum (Rp)" value={form.budgetMin} onChange={(value) => update("budgetMin", value)} placeholder="3000000" type="number" />
      <ComposerField label="Anggaran maksimum (Rp)" value={form.budgetMax} onChange={(value) => update("budgetMax", value)} placeholder="5000000" type="number" />
      <ComposerField label="Kondisi yang diinginkan" value={form.desiredCondition} onChange={(value) => update("desiredCondition", value)} placeholder="Baru atau bekas baik" />
      <ComposerField label="Dicari sebelum" value={form.buyDeadline} onChange={(value) => update("buyDeadline", value)} type="date" />
    </div>
  );

  if (form.category === "service" || form.category === "rental") {
    const isService = form.category === "service";
    return (
      <div className={clsx("mt-3 grid gap-3 rounded-2xl p-3.5 sm:grid-cols-2", isService ? "bg-amber-50/70" : "bg-indigo-50/70")}>
        <div className="sm:col-span-2"><ComposerField label={isService ? "Nama jasa *" : "Barang / ruang yang disewakan *"} value={form.title} onChange={(value) => update("title", value)} placeholder={isService ? "Contoh: Desain identitas brand" : "Contoh: Sony A6400 + lensa kit"} /></div>
        <ComposerSelect label="Skema tarif *" value={form.pricingType} onChange={(value) => update("pricingType", value as PricingType)} options={[["fixed", "Tarif tetap"], ["negotiable", "Bisa dinego"], ["free", "Gratis"], ["contact", "Hubungi penyedia"]]} />
        {isService
          ? <ComposerSelect label="Satuan tarif" value={form.priceUnit} onChange={(value) => update("priceUnit", value as ServicePriceUnit)} options={servicePriceUnits.map((unit) => [unit, `Per ${unit}`] as const)} />
          : <ComposerSelect label="Durasi tarif sewa" value={form.rentalPeriod} onChange={(value) => update("rentalPeriod", value as RentalPeriod)} options={rentalPeriods.map((period) => [period, `Per ${period}`] as const)} />}
        {form.pricingType === "fixed" && <ComposerField label="Tarif (Rp) *" value={form.price} onChange={(value) => update("price", value)} placeholder={isService ? "1500000" : "175000"} type="number" />}
        {isService ? <>
          <ComposerSelect label="Cara pengerjaan" value={form.serviceMode} onChange={(value) => update("serviceMode", value)} options={[["Online", "Online"], ["Di lokasi", "Di lokasi"], ["Online & di lokasi", "Online & di lokasi"]]} />
          <ComposerField label="Estimasi pengerjaan" value={form.turnaround} onChange={(value) => update("turnaround", value)} placeholder="Contoh: 5–7 hari kerja" />
        </> : <>
          <ComposerField label={`Minimum sewa (${form.rentalPeriod})`} value={form.minimumDuration} onChange={(value) => update("minimumDuration", value)} placeholder="1" type="number" />
          <ComposerField label="Deposit (Rp)" value={form.deposit} onChange={(value) => update("deposit", value)} placeholder="Opsional, isi 0 jika tanpa deposit" type="number" />
          <ComposerField label="Serah terima" value={form.delivery} onChange={(value) => update("delivery", value)} placeholder="Ambil di tempat, diantar, atau di lokasi" />
        </>}
      </div>
    );
  }

  if (form.category === "vacancy") return (
    <div className="mt-3 grid gap-3 rounded-2xl bg-cyan-50/70 p-3.5 sm:grid-cols-2">
      <ComposerField label="Nama posisi *" value={form.position} onChange={(value) => update("position", value)} placeholder="Senior UI/UX Designer" />
      <ComposerField label="Perusahaan *" value={form.company} onChange={(value) => update("company", value)} placeholder="Nama perusahaan" />
      <ComposerSelect label="Tipe pekerjaan" value={form.employmentType} onChange={(value) => update("employmentType", value)} options={[["Penuh waktu", "Penuh waktu"], ["Paruh waktu", "Paruh waktu"], ["Kontrak", "Kontrak"], ["Magang", "Magang"], ["Freelance", "Freelance"]]} />
      <ComposerSelect label="Sistem kerja" value={form.workMode} onChange={(value) => update("workMode", value)} options={[["On-site", "On-site"], ["Hybrid", "Hybrid"], ["Remote", "Remote"]]} />
      <ComposerField label="Gaji minimum (Rp)" value={form.salaryMin} onChange={(value) => update("salaryMin", value)} placeholder="8000000" type="number" />
      <ComposerField label="Gaji maksimum (Rp)" value={form.salaryMax} onChange={(value) => update("salaryMax", value)} placeholder="12000000" type="number" />
      <ComposerField label="Keahlian" value={form.vacancySkills} onChange={(value) => update("vacancySkills", value)} placeholder="Figma, UX Research (pisahkan koma)" />
      <ComposerField label="Batas lamaran" value={form.vacancyDeadline} onChange={(value) => update("vacancyDeadline", value)} type="date" />
      <div className="sm:col-span-2"><ComposerField label="Tautan lamaran" value={form.applicationUrl} onChange={(value) => update("applicationUrl", value)} placeholder="https://perusahaan.com/karier" type="url" /></div>
    </div>
  );

  return (
    <div className="mt-3 grid gap-3 rounded-2xl bg-emerald-50/70 p-3.5 sm:grid-cols-2">
      <ComposerField label="Posisi yang dicari *" value={form.targetRole} onChange={(value) => update("targetRole", value)} placeholder="Product Designer" />
      <ComposerField label="Keahlian utama *" value={form.jobSkills} onChange={(value) => update("jobSkills", value)} placeholder="Figma, UI Design (pisahkan koma)" />
      <ComposerSelect label="Tingkat pengalaman" value={form.experienceLevel} onChange={(value) => update("experienceLevel", value)} options={[["", "Pilih level"], ["Pemula", "Pemula"], ["Menengah", "Menengah"], ["Senior", "Senior"], ["Lead", "Lead"]]} />
      <ComposerSelect label="Preferensi kerja" value={form.workPreference} onChange={(value) => update("workPreference", value)} options={[["Fleksibel", "Fleksibel"], ["On-site", "On-site"], ["Hybrid", "Hybrid"], ["Remote", "Remote"]]} />
      <ComposerSelect label="Ketersediaan" value={form.availability} onChange={(value) => update("availability", value)} options={[["Segera", "Segera"], ["Dalam 2 minggu", "Dalam 2 minggu"], ["Dalam 1 bulan", "Dalam 1 bulan"], ["Masih menjajaki", "Masih menjajaki"]]} />
      <ComposerField label="Ekspektasi gaji (Rp)" value={form.expectedSalary} onChange={(value) => update("expectedSalary", value)} placeholder="10000000" type="number" />
      <div className="sm:col-span-2"><ComposerField label="Tautan CV / portofolio" value={form.portfolioUrl} onChange={(value) => update("portfolioUrl", value)} placeholder="https://portofolio.com" type="url" /></div>
    </div>
  );
}

function ComposerField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: "text" | "number" | "date" | "url" }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600">{label}</span><input type={type} min={type === "number" ? 0 : undefined} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-white bg-white px-3 text-xs text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-300 focus:ring-2 focus:ring-brand-300" /></label>;
}

function ComposerSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[] }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-slate-600">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-xl border border-white bg-white px-3 text-xs text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-brand-300">{options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}</select></label>;
}

function ComposerAction({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} aria-pressed={active} onClick={onClick} className={clsx("icon-button", active && "bg-slate-100 ring-1 ring-slate-200")}>{children}</button>;
}

function ChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  if (!open) return null;
  const person = contacts[active];

  function send() {
    if (!message.trim()) return;
    setSent((values) => [...values, message.trim()]);
    setMessage("");
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/30 backdrop-blur-[2px]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="absolute inset-0 flex animate-fade-up overflow-hidden bg-white shadow-float sm:inset-y-4 sm:left-auto sm:right-4 sm:w-[min(760px,calc(100vw-32px))] sm:rounded-3xl">
        <div className="hidden w-72 shrink-0 border-r border-slate-100 p-4 sm:block">
          <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Pesan</h2><button className="icon-button"><PenLine className="h-4 w-4" /></button></div>
          <label className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5"><Search className="h-4 w-4 text-slate-400" /><input className="min-w-0 bg-transparent text-xs outline-none" placeholder="Cari percakapan" /></label>
          <div className="mt-4 space-y-1">
            {contacts.map((contact, index) => (
              <button key={contact.name} onClick={() => setActive(index)} className={clsx("flex w-full items-center gap-3 rounded-xl p-2.5 text-left", active === index ? "bg-brand-50" : "hover:bg-slate-50")}>
                <Avatar src={contact.avatar} alt={contact.name} online={contact.online} />
                <span className="min-w-0 flex-1"><b className="block truncate text-xs">{contact.name}</b><span className="block truncate text-[10px] text-slate-400">{index === 0 ? "Oke, nanti aku kabari ya" : contact.role}</span></span>
                <span className="text-[9px] text-slate-400">{index + 1}m</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
            <button className="icon-button sm:hidden" onClick={onClose}><X className="h-5 w-5" /></button>
            <Avatar src={person.avatar} alt={person.name} size="sm" online={person.online} />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{person.name}</p><p className="text-[10px] text-emerald-500">{person.online ? "Aktif sekarang" : "Terakhir aktif 1 jam lalu"}</p></div>
            <button className="icon-button"><Search className="h-4 w-4" /></button><button onClick={onClose} className="icon-button hidden sm:flex"><X className="h-5 w-5" /></button>
          </header>
          <div className="flex flex-1 flex-col overflow-y-auto bg-[radial-gradient(circle_at_70%_10%,rgba(47,140,255,.08),transparent_18rem)] p-4">
            <p className="mx-auto rounded-full bg-slate-100 px-3 py-1 text-[9px] font-semibold text-slate-400">Hari ini</p>
            <div className="mt-auto space-y-3">
              <div className="flex gap-2"><Avatar src={person.avatar} alt={person.name} size="sm" /><div className="max-w-[75%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-xs leading-5">Hai Arya! Aku lihat postinganmu soal product design. Menarik banget 👋</div></div>
              <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-xs leading-5 text-white">Terima kasih! Aku juga sedang eksplorasi beberapa ide baru.</div>
              {sent.map((item, index) => <div key={index} className="ml-auto max-w-[75%] animate-fade-up rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-xs leading-5 text-white">{item}</div>)}
            </div>
          </div>
          <div className="border-t border-slate-100 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2"><button className="icon-button"><Plus className="h-5 w-5" /></button><div className="flex min-w-0 flex-1 items-center rounded-2xl bg-slate-100 px-4"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} className="min-w-0 flex-1 bg-transparent py-3 text-xs outline-none" placeholder="Ketik pesan..." /><button><Smile className="h-5 w-5 text-slate-400" /></button></div><button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"><Send className="h-4 w-4" /></button></div>
          </div>
        </div>
      </section>
    </div>
  );
}
