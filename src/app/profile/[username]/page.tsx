import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { findUserByUsername, otherUsers } from "@/lib/users";
import { ProfilePage } from "@/views/profile-page";

// Only the demo profiles exist; any other username is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return otherUsers.map((user) => ({ username: user.username }));
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const user = findUserByUsername((await params).username);
  return user ? { title: `${user.name} (${user.handle})`, description: user.bio } : {};
}

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const user = findUserByUsername((await params).username);
  if (!user) notFound();
  return <Suspense fallback={<p role="status" className="p-10 text-center text-sm text-slate-500">Memuat profil…</p>}><ProfilePage user={user} /></Suspense>;
}
