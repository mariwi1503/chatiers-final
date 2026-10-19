import { currentUser, type Post } from "./data";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  status: "available" | "sold";
  lastSharedAt?: number;
};

// Categories are fixed by the system; users can only pick one of these.
export const PRODUCT_CATEGORIES = [
  "Elektronik",
  "Fotografi",
  "Fashion",
  "Aksesori",
  "Tas",
  "Rumah & Dekorasi",
  "Kecantikan",
  "Olahraga",
  "Hobi & Koleksi",
  "Buku",
  "Makanan & Minuman",
  "Produk Digital",
  "Jasa",
  "Lainnya",
] as const;

export type ProductDraft = Omit<Product, "id" | "lastSharedAt">;

export const SHARE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
export type Company = { name: string; industry: string; description: string; location: string };
export type Storefront = { products: Product[]; posts: Post[]; company: Company | null };

export function saveProduct(store: Storefront, draft: ProductDraft, id: string): Storefront {
  if (!draft.name.trim() || !draft.description.trim() || !draft.category.trim() || !Number.isSafeInteger(draft.price) || draft.price < 0) {
    throw new Error("Lengkapi nama, deskripsi, kategori, dan harga produk yang valid.");
  }
  if (!(PRODUCT_CATEGORIES as readonly string[]).includes(draft.category)) throw new Error("Pilih kategori produk dari daftar yang tersedia.");
  if (draft.image && !isSafeProductImage(draft.image)) throw new Error("Foto produk tidak valid. Unggah ulang fotonya.");
  // Share history belongs to the system, not the edit form, so it survives every edit.
  const existing = store.products.find((item) => item.id === id);
  const product: Product = { name: draft.name.trim(), description: draft.description.trim(), price: draft.price, category: draft.category, image: draft.image, status: draft.status, id, ...(existing?.lastSharedAt ? { lastSharedAt: existing.lastSharedAt } : {}) };
  return { ...store, products: store.products.some((item) => item.id === id) ? store.products.map((item) => item.id === id ? product : item) : [product, ...store.products] };
}

// Accept remote demo images and photos uploaded from the device (stored as base64 data URLs).
export function isSafeProductImage(image: string) {
  return /^https?:\/\//i.test(image) || /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/]+=*$/i.test(image);
}

export function deleteProduct(store: Storefront, productId: string): Storefront {
  if (!store.products.some((item) => item.id === productId)) throw new Error("Produk tidak ditemukan.");
  // A product's feed post only exists to point at it, so it is removed together with the product.
  return { ...store, products: store.products.filter((item) => item.id !== productId), posts: store.posts.filter((post) => post.productId !== productId) };
}

export function getProductShares(store: Pick<Storefront, "posts">, productId: string) {
  return store.posts.filter((post) => post.productId === productId);
}

// The earliest moment a product may be shared again, or null when it has never been shared.
export function getNextShareAt(store: Storefront, productId: string): number | null {
  const product = store.products.find((item) => item.id === productId);
  // Shares made before lastSharedAt existed: their post ids were created from Date.now().
  const lastSharedAt = product?.lastSharedAt ?? Math.max(0, ...getProductShares(store, productId).map((post) => post.id));
  return lastSharedAt ? lastSharedAt + SHARE_COOLDOWN_MS : null;
}

export function publishProduct(store: Storefront, productId: string, caption: string, postId: number, now: number): Storefront {
  const product = store.products.find((item) => item.id === productId);
  if (!product) throw new Error("Produk tidak ditemukan.");
  if (product.status !== "available") throw new Error("Produk terjual tidak dapat dibagikan.");
  const nextShareAt = getNextShareAt(store, productId);
  if (nextShareAt !== null && now < nextShareAt) throw new Error(`Produk ini baru bisa dibagikan lagi pada ${formatShareDate(nextShareAt)}.`);
  const post: Post = {
    id: postId, productId, author: currentUser.name, avatar: currentUser.avatar,
    role: "Pemilik toko", time: "Baru saja", category: "sell",
    text: caption.trim() || `Temukan ${product.name} di toko saya.`,
    details: { type: "sell", title: product.name, pricingType: "fixed", price: product.price, condition: "Lihat detail produk", itemCategory: product.category, status: product.status },
    likes: 0, comments: 0, commentItems: [], shares: 0,
  };
  return { ...store, products: store.products.map((item) => item.id === productId ? { ...item, lastSharedAt: now } : item), posts: [post, ...store.posts] };
}

export function formatShareDate(timestamp: number) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(timestamp);
}

export function formatProductPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}
