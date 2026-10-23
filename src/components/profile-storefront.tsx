"use client";

import { ArrowUpRight, Building2, MessageCircle, ChevronDown, Clock, ImagePlus, Loader2, Package, Pencil, Plus, RotateCcw, Search, Send, ShoppingBag, Store, Tag, Trash2, X } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Avatar } from "./avatar";
import { useStorefront } from "./storefront-provider";
import { useAuth } from "@/components/auth-provider";
import { currentUser } from "@/lib/data";
import type { UserProfile } from "@/lib/users";
import { PRODUCT_CATEGORIES, SHARE_COOLDOWN_MS, formatProductPrice, formatShareDate, getNextShareAt, getProductShares, type Company, type Product, type ProductDraft } from "@/lib/storefront";

const inputClass = "focus-ring w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-300";
const primaryClass = "focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400";
const panelClass = "border-y border-slate-100 bg-white md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onCancel={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="inset-x-0 bottom-0 top-auto !m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border-0 bg-white p-0 text-slate-900 shadow-float backdrop:bg-slate-950/45 backdrop:backdrop-blur-sm sm:inset-y-0 sm:!m-auto sm:max-h-[90dvh] sm:w-[calc(100%_-_2rem)] sm:max-w-lg sm:rounded-3xl">
    <section><header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 id={titleId} className="font-extrabold">{title}</h2><button type="button" onClick={onClose} className="icon-button focus-ring bg-slate-100" aria-label="Tutup dialog"><X className="h-5 w-5" /></button></header><div className="p-5">{children}</div></section>
  </dialog>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_SIDE = 1080;
const chipClass = "focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition";

// Downscale uploads to a JPEG data URL so several products fit in browser storage.
function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Canvas tidak tersedia"));
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Foto tidak dapat dibaca")); };
    image.src = url;
  });
}

function ProductImage({ product, large = false }: { product: Pick<Product, "image" | "name" | "status">; large?: boolean }) {
  const sold = product.status === "sold";
  if (!product.image) return <span className={clsx("flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-violet-100 text-brand-300", large ? "aspect-[4/3] rounded-2xl" : "aspect-square")}><ShoppingBag className="h-10 w-10 stroke-[1.25]" /></span>;
  return <img src={product.image} alt={product.name} className={clsx("w-full bg-slate-100 object-cover", large ? "aspect-[4/3] rounded-2xl" : "aspect-square transition duration-300 group-hover:scale-105", sold && !large && "grayscale-[60%]")} />;
}

function ImageUpload({ value, onChange, onBusyChange }: { value?: string; onChange: (image: string) => void; onBusyChange: (busy: boolean) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file?: File) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return setError("Gunakan foto berformat JPG, PNG, atau WEBP.");
    if (file.size > MAX_UPLOAD_BYTES) return setError("Ukuran foto maksimal 10 MB.");
    setError(null);
    setBusy(true);
    onBusyChange(true);
    try {
      onChange(await compressImage(file));
    } catch {
      setError("Foto tidak dapat diproses. Coba gunakan foto lain.");
    } finally {
      setBusy(false);
      onBusyChange(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const dropHandlers = {
    onDragOver: (event: DragEvent) => { event.preventDefault(); setDragging(true); },
    onDragLeave: () => setDragging(false),
    onDrop: (event: DragEvent) => { event.preventDefault(); setDragging(false); void handleFile(event.dataTransfer.files[0]); },
  };

  return <div>
    <p className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600">Foto produk<span className="font-medium text-slate-400">Opsional</span></p>
    <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} tabIndex={-1} aria-hidden="true" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
    {value ? (
      <div {...dropHandlers} className={clsx("relative overflow-hidden rounded-2xl border bg-slate-100", dragging ? "border-brand-400 ring-4 ring-brand-100" : "border-slate-200")}>
        <img src={value} alt="Pratinjau foto produk" className="aspect-[4/3] w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-slate-950/60 to-transparent p-3 pt-10">
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-white"><ImagePlus className="h-3.5 w-3.5" />Ganti foto</button>
          <button type="button" disabled={busy} onClick={() => onChange("")} className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-white"><Trash2 className="h-3.5 w-3.5" />Hapus</button>
        </div>
        {busy && <span role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-white/70 text-xs font-bold text-slate-600 backdrop-blur-sm"><Loader2 className="h-4 w-4 animate-spin" />Memproses foto…</span>}
      </div>
    ) : (
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} {...dropHandlers} className={clsx("focus-ring flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-center transition", dragging ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50/70 hover:border-brand-300 hover:bg-brand-50/40")}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/80">{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}</span>
        <span className="text-sm font-extrabold text-slate-800">{busy ? "Memproses foto…" : dragging ? "Lepaskan untuk mengunggah" : "Unggah foto produk"}</span>
        <span className="text-[11px] leading-5 text-slate-400">Klik atau seret foto ke sini · JPG, PNG, WEBP · maks. 10 MB</span>
      </button>
    )}
    {error && <p role="alert" className="mt-2 text-xs text-rose-600">{error}</p>}
  </div>;
}

/** Without `seller` this is the signed-in user's editable store; with it, someone else's read-only store. */
/** Bumping `newProductRequest` opens the "Tambah produk" form from outside the panel (e.g. the compact profile header). */
export function ProductsPanel({ selectedId, onSelect, onToast, seller, newProductRequest = 0 }: { selectedId: string | null; onSelect: (id: string | null) => void; onToast: (message: string) => void; seller?: UserProfile; newProductRequest?: number }) {
  const store = useStorefront();
  const { posts, ready, error } = store;
  const products = seller ? seller.products : store.products;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [editor, setEditor] = useState<Product | "new" | null>(null);
  const [publishing, setPublishing] = useState<Product | null>(null);
  const shareCounts = posts.reduce((counts, post) => post.productId ? counts.set(post.productId, (counts.get(post.productId) ?? 0) + 1) : counts, new Map<string, number>());
  const categories = PRODUCT_CATEGORIES.filter((item) => products.some((product) => product.category === item));
  const activeCategory = categories.find((item) => item === category) ?? null;
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filteredProducts = products.filter((product) => (!activeCategory || product.category === activeCategory) && [product.name, product.category, product.description].some((value) => value.toLocaleLowerCase("id-ID").includes(normalizedQuery)));
  const availableCount = products.filter((product) => product.status === "available").length;
  const publishedCount = products.filter((product) => shareCounts.has(product.id)).length;
  const selected = products.find((product) => product.id === selectedId);

  useEffect(() => {
    if (newProductRequest && !seller && ready) setEditor("new");
  }, [newProductRequest, seller, ready]);

  return <div className="mt-3 animate-fade-up space-y-3">
    <section className={`${panelClass} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Store className="h-4 w-4 text-brand-600" />{seller ? `Etalase ${seller.name.split(" ")[0]}` : "Etalase toko"}</h2>
          <p className="mt-1 text-[11px] text-slate-400">{ready ? `${products.length} produk · ${availableCount} tersedia · ${publishedCount} di feed` : "Memuat etalase…"}</p>
        </div>
        {!seller && <button disabled={!ready} onClick={() => setEditor("new")} className="focus-ring inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-brand-600 px-4 text-xs font-bold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"><Plus aria-hidden="true" className="h-4 w-4" />Tambah<span className="hidden sm:inline"> produk</span></button>}
      </div>
      {products.length > 0 && <>
        <div className="relative mt-4">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" aria-label="Cari produk" placeholder="Cari di etalase…" value={query} onChange={(event) => setQuery(event.target.value)} className="focus-ring h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:bg-slate-100 focus:border-brand-300 focus:bg-white" />
        </div>
        {categories.length > 1 && <div role="group" aria-label="Filter kategori" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] sm:-mx-5 sm:px-5">
          {[null, ...categories].map((item) => <button key={item ?? "all"} aria-pressed={activeCategory === item} onClick={() => setCategory(item)} className={clsx(chipClass, activeCategory === item ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50")}>{item ?? "Semua"}</button>)}
        </div>}
      </>}
    </section>

    {!ready ? <p role="status" className="p-8 text-center text-sm text-slate-500">{error ? "Toko belum dapat dimuat." : "Memuat toko…"}</p> : filteredProducts.length ? (
      <section aria-label="Galeri produk" className={`${panelClass} grid grid-cols-2 gap-x-3 gap-y-5 p-4 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 sm:p-5`}>
        {filteredProducts.map((product) => {
          const sold = product.status === "sold";
          return <button key={product.id} onClick={() => onSelect(product.id)} className="focus-ring group flex min-w-0 flex-col rounded-2xl text-left" aria-label={`Lihat ${product.name}`}>
            <span className="relative block overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
              <ProductImage product={product} />
              {sold ? <span className="absolute left-2 top-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">Terjual</span> : shareCounts.has(product.id) && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-emerald-700 shadow-sm backdrop-blur-sm"><Send className="h-2.5 w-2.5" />Di feed{shareCounts.get(product.id)! > 1 && ` · ${shareCounts.get(product.id)}×`}</span>}
            </span>
            <span className="mt-2.5 block truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">{product.category}</span>
            <span className={clsx("mt-0.5 line-clamp-2 text-[13px] font-bold leading-5 transition group-hover:text-brand-600 sm:text-sm", sold ? "text-slate-500" : "text-slate-900")}>{product.name}</span>
            <span className={clsx("mt-1 block text-sm font-black", sold ? "text-slate-400 line-through" : "text-brand-600")}>{formatProductPrice(product.price)}</span>
          </button>;
        })}
      </section>
    ) : products.length ? (
      <section role="status" className={`${panelClass} px-5 py-14 text-center`}><Search className="mx-auto h-7 w-7 text-slate-300" /><h3 className="mt-3 text-sm font-extrabold">Produk tidak ditemukan</h3><p className="mt-2 text-xs text-slate-500">Coba kata kunci atau kategori lain.</p><button onClick={() => { setQuery(""); setCategory(null); }} className="focus-ring mt-4 rounded-full px-3 py-2 text-xs font-bold text-brand-600 transition hover:bg-brand-50">Tampilkan semua produk</button></section>
    ) : seller ? (
      <section className={`${panelClass} px-5 py-14 text-center`}><Package className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-extrabold">Belum ada produk</h3><p className="mt-2 text-xs text-slate-500">{seller.name} belum menambahkan produk ke etalasenya.</p></section>
    ) : (
      <section className={`${panelClass} px-5 py-14 text-center`}><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Package className="h-7 w-7" /></span><h3 className="mt-4 text-sm font-extrabold">Etalase pertamamu dimulai di sini</h3><p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-slate-500">Tambahkan barang, produk digital, atau jasa yang ingin kamu tawarkan.</p><button onClick={() => setEditor("new")} className={`${primaryClass} mt-5`}><Plus className="h-4 w-4" />Tambah produk pertama</button></section>
    )}

    {selectedId && ready && <Modal title="Detail produk" onClose={() => onSelect(null)}>{selected ? seller ? <ProductDetail product={selected} seller={seller} /> : <ProductDetail product={selected} onEdit={() => setEditor(selected)} onPublish={() => setPublishing(selected)} onDeleted={() => { onSelect(null); onToast("Produk dihapus dari toko"); }} onToast={onToast} /> : <p className="text-sm text-slate-500">Produk tidak ditemukan atau sudah tidak tersedia.</p>}</Modal>}
    {editor && <ProductEditor product={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); onToast("Produk disimpan di toko"); }} />}
    {publishing && <PublishModal product={publishing} onClose={() => setPublishing(null)} onPublished={() => { setPublishing(null); onToast("Produk dibagikan sebagai postingan baru di feed"); }} />}
  </div>;
}

function formatRemaining(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days) return hours ? `${days} hari ${hours} jam` : `${days} hari`;
  return hours ? `${hours} jam ${minutes % 60} menit` : `${minutes} menit`;
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

type OwnerActions = { onEdit: () => void; onPublish: () => void; onDeleted: () => void; onToast: (message: string) => void };

function ProductDetail(props: { product: Product; seller: UserProfile } | ({ product: Product; seller?: undefined } & OwnerActions)) {
  const { product, seller } = props;
  const { posts } = useStorefront();
  const shares = getProductShares({ posts }, product.id);
  const latestShare = shares.reduce<(typeof shares)[number] | undefined>((latest, post) => !latest || post.id > latest.id ? post : latest, undefined);
  const sold = product.status === "sold";
  const { user } = useAuth();
  const owner = seller ?? user ?? currentUser;

  return <>
    <ProductImage product={product} large />
    <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-bold">
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{product.category}</span>
      <span className={clsx("rounded-full px-2.5 py-1", sold ? "bg-slate-900 text-white" : "bg-emerald-50 text-emerald-700")}>{sold ? "Terjual" : "Tersedia"}</span>
      {shares.length > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-brand-700"><Send className="h-3 w-3" />Dibagikan {shares.length}×</span>}
    </div>
    <h3 className="mt-3 break-words text-xl font-extrabold leading-7">{product.name}</h3>
    <p className={clsx("mt-1 text-2xl font-black", sold ? "text-slate-400 line-through" : "text-brand-700")}>{formatProductPrice(product.price)}</p>
    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description}</p>
    <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><Avatar src={owner.avatar} alt={owner.name} /><div className="min-w-0"><p className="truncate text-xs font-extrabold text-slate-900">{owner.name}</p><p className="truncate text-[11px] text-slate-400">Pemilik toko · {owner.handle}</p></div></div>
    {seller ? (
      <div className="mt-5 space-y-2">
        {latestShare && <ShareSummary count={shares.length} when={`${latestShare.time} lalu`} postId={latestShare.id} />}
        {sold ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-xs font-bold text-slate-500">Produk ini sudah terjual</p> : <Link href="/messages" className={`${primaryClass} w-full py-3`}><MessageCircle className="h-4 w-4" />Chat penjual</Link>}
      </div>
    ) : <OwnerProductActions {...props} shares={shares.length} latestShareId={latestShare?.id} />}
  </>;
}

function ShareSummary({ count, when, postId }: { count: number; when: string; postId: number }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-3 py-2.5">
    <p className="min-w-0 text-[11px] leading-5 text-slate-500"><b className="font-bold text-slate-700">Dibagikan {count} kali</b><br />Terakhir {when}</p>
    <Link href={`/?post=${postId}`} className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50">Lihat di feed<ArrowUpRight className="h-3.5 w-3.5" /></Link>
  </div>;
}

function OwnerProductActions({ product, shares, latestShareId, onEdit, onPublish, onDeleted, onToast }: { product: Product; shares: number; latestShareId?: number } & OwnerActions) {
  const { products, posts, company, saveProduct, deleteProduct } = useStorefront();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const now = useNow();
  const nextShareAt = getNextShareAt({ products, posts, company }, product.id);
  const coolingDown = nextShareAt !== null && now < nextShareAt;
  const sold = product.status === "sold";
  const { id, lastSharedAt, ...draft } = product;
  const secondaryClass = "focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50";

  return <>
    {confirmingDelete ? (
      <div role="alertdialog" aria-label="Konfirmasi hapus produk" className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <p className="text-sm font-extrabold text-rose-700">Hapus produk ini?</p>
        <p className="mt-1 text-xs leading-5 text-rose-600/80">{shares ? `${shares === 1 ? "Postingan" : `Semua ${shares} postingan`} produk ini di feed juga akan dihapus. ` : ""}Tindakan ini tidak dapat dibatalkan.</p>
        <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => setConfirmingDelete(false)} className="focus-ring rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-slate-600">Batal</button><button onClick={() => { if (deleteProduct(id)) onDeleted(); }} className="focus-ring rounded-xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700">Ya, hapus</button></div>
      </div>
    ) : (
      <div className="mt-5 space-y-2">
        {latestShareId !== undefined && <ShareSummary count={shares} when={formatShareDate(lastSharedAt ?? latestShareId)} postId={latestShareId} />}
        <button disabled={sold || coolingDown} onClick={onPublish} className={`${primaryClass} w-full py-3`}>{coolingDown ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}{sold ? "Produk terjual tidak dapat dibagikan" : coolingDown ? `Bisa dibagikan lagi dalam ${formatRemaining(nextShareAt - now)}` : shares ? "Bagikan lagi ke feed" : "Bagikan ke feed"}</button>
        {coolingDown && !sold && <p className="text-center text-[11px] leading-5 text-slate-400">Produk yang sama bisa dibagikan ulang setiap {SHARE_COOLDOWN_MS / 86_400_000} hari · tersedia lagi {formatShareDate(nextShareAt)}</p>}
        <div className="grid grid-cols-3 gap-2">
          <button onClick={onEdit} className={secondaryClass}><Pencil className="h-3.5 w-3.5" />Edit</button>
          <button onClick={() => { if (saveProduct({ ...draft, status: sold ? "available" : "sold" }, id)) onToast(sold ? "Produk ditandai tersedia" : "Produk ditandai terjual"); }} aria-label={sold ? "Tandai tersedia" : "Tandai terjual"} title={sold ? "Tandai tersedia" : "Tandai terjual"} className={secondaryClass}>{sold ? <RotateCcw className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}{sold ? "Tersedia" : "Terjual"}</button>
          <button onClick={() => setConfirmingDelete(true)} className={clsx(secondaryClass, "text-rose-600 hover:border-rose-200 hover:bg-rose-50")}><Trash2 className="h-3.5 w-3.5" />Hapus</button>
        </div>
      </div>
    )}
  </>;
}

function ProductEditor({ product, onClose, onSaved }: { product?: Product; onClose: () => void; onSaved: () => void }) {
  const { saveProduct, error } = useStorefront();
  const [draft, setDraft] = useState<ProductDraft>(() => product ? { name: product.name, description: product.description, price: product.price, category: (PRODUCT_CATEGORIES as readonly string[]).includes(product.category) ? product.category : "", image: product.image ?? "", status: product.status } : { name: "", description: "", price: 0, category: "", image: "", status: "available" });
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [uploading, setUploading] = useState(false);

  return <Modal title={product ? "Edit produk" : "Tambah produk"} onClose={onClose}><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (!uploading && saveProduct({ ...draft, image: draft.image || undefined, price: Number(price) }, product?.id)) onSaved(); }}>
    <ImageUpload value={draft.image} onChange={(image) => setDraft((value) => ({ ...value, image }))} onBusyChange={setUploading} />
    <Field label="Nama produk"><input required maxLength={120} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={inputClass} placeholder="Contoh: UI Kit Dashboard" /></Field>
    <Field label="Harga">
      <span className="relative block"><span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span><input required inputMode="numeric" autoComplete="off" value={price ? Number(price).toLocaleString("id-ID") : ""} onChange={(event) => setPrice(event.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 15))} className={`${inputClass} pl-10`} placeholder="150.000" /></span>
    </Field>
    <Field label="Kategori">
      <span className="relative block"><select required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className={clsx(inputClass, "cursor-pointer appearance-none pr-10", !draft.category && "!text-slate-400")}><option value="" disabled>Pilih kategori</option>{PRODUCT_CATEGORIES.map((item) => <option key={item} value={item} className="text-slate-800">{item}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></span>
    </Field>
    <Field label="Deskripsi produk"><textarea required rows={4} maxLength={3000} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className={`${inputClass} resize-none`} placeholder="Ceritakan detail, kondisi, dan cara mendapatkan produkmu…" /></Field>
    <p className="-mt-2 text-right text-[11px] text-slate-400">{draft.description.length}/3000</p>
    <fieldset>
      <legend className="mb-1.5 text-xs font-bold text-slate-600">Ketersediaan</legend>
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">{([["available", "Tersedia"], ["sold", "Terjual"]] as const).map(([value, label]) => <label key={value} className={clsx("cursor-pointer rounded-lg py-2 text-center text-xs font-bold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500", draft.status === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}><input type="radio" name="product-status" value={value} checked={draft.status === value} onChange={() => setDraft({ ...draft, status: value })} className="sr-only" />{label}</label>)}</div>
    </fieldset>
    {!product && <p className="text-xs leading-5 text-slate-500">Produk yang disimpan akan tampil di etalase. Kamu bisa memublikasikannya ke feed setelah disimpan.</p>}
    {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
    <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-slate-100 bg-white px-5 py-4"><button type="submit" disabled={uploading} className={`${primaryClass} w-full py-3`}>{uploading ? <><Loader2 className="h-4 w-4 animate-spin" />Memproses foto…</> : product ? "Simpan perubahan" : "Simpan produk"}</button></div>
  </form></Modal>;
}

function PublishModal({ product, onClose, onPublished }: { product: Product; onClose: () => void; onPublished: () => void }) {
  const { publishProduct, error, posts } = useStorefront();
  const [caption, setCaption] = useState(`Temukan ${product.name} di toko saya.`);
  const submitted = useRef(false);
  const shareCount = getProductShares({ posts }, product.id).length;
  return <Modal title={shareCount ? "Bagikan lagi ke feed" : "Bagikan produk ke feed"} onClose={onClose}><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (submitted.current) return; submitted.current = true; if (publishProduct(product.id, caption)) onPublished(); else submitted.current = false; }}><p className="text-xs leading-6 text-slate-500">Setiap kali dibagikan, produk ini tampil sebagai postingan baru di feed{shareCount ? ` (ini yang ke-${shareCount + 1})` : ""}. Setelah itu, produk bisa dibagikan lagi {SHARE_COOLDOWN_MS / 86_400_000} hari kemudian.</p><div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-3"><span className="w-16 shrink-0 overflow-hidden rounded-xl"><ProductImage product={product} /></span><div className="min-w-0"><h3 className="truncate text-sm font-extrabold">{product.name}</h3><p className="mt-1 text-sm font-bold text-violet-700">{formatProductPrice(product.price)}</p></div></div><Field label="Teks postingan"><textarea rows={4} maxLength={3000} value={caption} onChange={(event) => setCaption(event.target.value)} className={`${inputClass} resize-none`} /></Field>{error && <p role="alert" className="text-xs text-rose-600">{error}</p>}<button type="submit" className={`${primaryClass} w-full py-3`}><Send className="h-4 w-4" />Bagikan sekarang</button></form></Modal>;
}

function CompanyDetails({ company }: { company: Company }) {
  return <div className="mt-5 flex gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Building2 className="h-7 w-7" /></span><div className="min-w-0"><h3 className="break-words font-extrabold">{company.name}</h3><p className="mt-1 text-xs text-slate-500">{company.industry} · {company.location}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{company.description}</p></div></div>;
}

/** Someone else's company, shown read-only on their profile. */
export function CompanyView({ owner }: { owner: UserProfile }) {
  return <section className="surface mt-3 animate-fade-up rounded-none p-5 md:rounded-2xl"><h2 className="text-sm font-extrabold">Perusahaan</h2>{owner.company ? <CompanyDetails company={owner.company} /> : <div className="py-10 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 text-sm font-bold">Belum ada perusahaan</h3><p className="mt-2 text-xs leading-6 text-slate-500">{owner.name} belum menambahkan informasi perusahaan.</p></div>}</section>;
}

export function CompanyPanel({ onToast }: { onToast: (message: string) => void }) {
  const { company, ready, saveCompany, error } = useStorefront();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Company>({ name: "", industry: "", description: "", location: "" });
  return <section className="surface mt-3 animate-fade-up rounded-none p-5 md:rounded-2xl"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-extrabold">Perusahaan</h2><button disabled={!ready} onClick={() => { setDraft(company ?? { name: "", industry: "", description: "", location: "" }); setEditing(true); }} className="focus-ring flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600 disabled:opacity-50">{company ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}{company ? "Edit perusahaan" : "Tambah perusahaan"}</button></div>{company ? <CompanyDetails company={company} /> : <div className="py-10 text-center"><Building2 className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-4 text-sm font-bold">{ready ? "Kenalkan perusahaanmu" : "Memuat perusahaan…"}</h3><p className="mt-2 text-xs leading-6 text-slate-500">Tampilkan bisnis yang kamu miliki atau kelola di profilmu.</p></div>}{editing && <Modal title="Informasi perusahaan" onClose={() => setEditing(false)}><form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (saveCompany(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, value.trim()])) as Company)) { setEditing(false); onToast("Informasi perusahaan disimpan"); } }}>{([{ key: "name", label: "Nama perusahaan" }, { key: "industry", label: "Bidang usaha" }, { key: "location", label: "Lokasi perusahaan" }, { key: "description", label: "Tentang perusahaan" }] as const).map(({ key, label }) => <Field key={key} label={label}>{key === "description" ? <textarea required rows={4} maxLength={2000} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className={inputClass} /> : <input required pattern=".*\S.*" maxLength={120} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} className={inputClass} />}</Field>)}{error && <p role="alert" className="text-xs text-rose-600">{error}</p>}<button className={`${primaryClass} w-full`} type="submit">Simpan perusahaan</button></form></Modal>}</section>;
}
