import { SessionRequired } from "@/components/session-required";
import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";

export const metadata: Metadata = {
  title: "Tersimpan",
  description: "Koleksi postingan tersimpan di Chatiers.",
};

export default function Page() {
  return <SessionRequired><SectionPage section="saved" /></SessionRequired>;
}
