"use client";

import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useStorefront } from "./storefront-provider";
import { formatProductPrice } from "@/lib/storefront";
import { getProfileHref } from "@/lib/users";

export function ProductReference({ productId }: { productId: string }) {
  const { findProduct, ready } = useStorefront();
  const found = findProduct(productId);
  if (!ready) return <p className="mt-3 text-xs text-slate-400">Memuat produk…</p>;
  if (!found) return <p className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">Produk ini sudah tidak tersedia.</p>;
  const { product, owner } = found;
  const profileHref = owner ? getProfileHref(owner) : "/profile";
  return <Link href={`${profileHref}?tab=produk&product=${encodeURIComponent(product.id)}`} className="focus-ring mt-4 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-3 transition hover:border-violet-300 hover:bg-violet-50">
    {product.image ? <img src={product.image} alt={product.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" /> : <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-500"><ShoppingBag className="h-7 w-7" /></span>}
    <span className="min-w-0 flex-1"><span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">{owner ? `Toko ${owner.name.split(" ")[0]}` : "Produk dari toko"} {"\u00b7"} {product.status === "sold" ? "Terjual" : "Tersedia"}</span><b className="mt-1 block break-words text-sm text-slate-900">{product.name}</b><b className="mt-1 block text-sm text-violet-700">{formatProductPrice(product.price)}</b><span className="mt-1 block text-[11px] text-slate-500">Lihat detail produk</span></span>
    <ArrowUpRight className="h-4 w-4 shrink-0 text-violet-600" />
  </Link>;
}
