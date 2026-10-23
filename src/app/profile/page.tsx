import { SessionRequired } from "@/components/session-required";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfilePage } from "@/views/profile-page";

export const metadata: Metadata = {
  title: "Profil",
  description: "Profil di Chatiers.",
};

export default function Page() {
  return <Suspense fallback={<p role="status" className="p-10 text-center text-sm text-slate-500">Memuat profil…</p>}><SessionRequired><ProfilePage /></SessionRequired></Suspense>;
}
