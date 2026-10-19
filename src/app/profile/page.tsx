import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfilePage } from "@/views/profile-page";

export const metadata: Metadata = {
  title: "Profil Arya Pratama",
  description: "Profil Arya Pratama di Chatiers.",
};

export default function Page() {
  return <Suspense fallback={<p role="status" className="p-10 text-center text-sm text-slate-500">Memuat profil…</p>}><ProfilePage /></Suspense>;
}
