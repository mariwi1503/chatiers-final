import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";

export const metadata: Metadata = {
  title: "Tersimpan",
  description: "Koleksi postingan tersimpan di Chatiers.",
};

export default function Page() {
  return <SectionPage section="saved" />;
}
