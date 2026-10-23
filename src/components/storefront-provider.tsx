"use client";

import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useAuth } from "@/components/auth-provider";
import { posts, type Post } from "@/lib/data";
import { demoProducts } from "@/lib/demo-products";
import { deleteProduct, publishProduct, saveProduct, type Company, type Product, type ProductDraft, type Storefront } from "@/lib/storefront";
import { findOtherUserProduct, type UserProfile } from "@/lib/users";

const STORAGE_KEY = "chatiers-storefront-v1";
const initialStore: Storefront = { products: demoProducts, posts, company: null };

type StoreContext = Storefront & {
  ready: boolean;
  error: string | null;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  saveProduct: (draft: ProductDraft, id?: string) => boolean;
  publishProduct: (id: string, caption: string) => boolean;
  deleteProduct: (id: string) => boolean;
  saveCompany: (company: Company) => boolean;
  /** Looks up a product in any store; `owner` is undefined for the signed-in user's own products. */
  findProduct: (id: string) => { product: Product; owner?: UserProfile } | undefined;
};

const Context = createContext<StoreContext | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  const [store, setStore] = useState(initialStore);
  const storeRef = useRef(initialStore);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Storefront;
        if (!saved || !Array.isArray(saved.products) || !Array.isArray(saved.posts)) throw new Error("invalid storage");
        const restored = {
          ...saved,
          products: [...saved.products, ...demoProducts.filter((product) => !saved.products.some((item) => item.id === product.id))],
          // Keep the seed feed in its authored order, after the user's own newer posts.
          posts: [...saved.posts.filter((post) => !posts.some((seed) => seed.id === post.id)), ...posts.map((seed) => saved.posts.find((item) => item.id === seed.id) ?? seed)],
        };
        storeRef.current = restored;
        setStore(restored);
      }
      setReady(true);
    } catch {
      setError("Penyimpanan browser tidak dapat dibaca. Muat ulang atau periksa pengaturan penyimpanan browser.");
    }
  }, []);

  function commit(change: (value: Storefront) => Storefront) {
    if (!ready || !signedIn) return false;
    try {
      const next = change(storeRef.current);
      // Save the catalog and its feed references together, before reporting success.
      // Ordinary composer media uses temporary blob URLs; keep those posts in memory as before.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...next, posts: next.posts.filter((post) => post.productId) }));
      storeRef.current = next;
      setStore(next);
      setError(null);
      return true;
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : "Perubahan gagal disimpan. Periksa ruang penyimpanan browser lalu coba lagi.");
      return false;
    }
  }

  return <Context.Provider value={{
    ...store, ready, error,
    setPosts: (action) => { commit((value) => ({ ...value, posts: typeof action === "function" ? action(value.posts) : action })); },
    saveProduct: (draft, id) => commit((value) => saveProduct(value, draft, id ?? crypto.randomUUID())),
    publishProduct: (id, caption) => commit((value) => { const now = Date.now(); return publishProduct(value, id, caption, Math.max(now, ...value.posts.map((post) => post.id + 1)), now); }),
    deleteProduct: (id) => commit((value) => deleteProduct(value, id)),
    findProduct: (id) => {
      const own = store.products.find((product) => product.id === id);
      return own ? { product: own } : findOtherUserProduct(id);
    },
    saveCompany: (company) => commit((value) => {
      if (Object.values(company).some((field) => !field.trim())) throw new Error("Lengkapi informasi perusahaan.");
      return { ...value, company };
    }),
  }}>
    {error && <div role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">{error}</div>}
    {children}
  </Context.Provider>;
}

export function useStorefront() {
  const value = useContext(Context);
  if (!value) throw new Error("StorefrontProvider is required");
  return value;
}
