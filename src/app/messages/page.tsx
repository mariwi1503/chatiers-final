import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";

export const metadata: Metadata = {
  title: "Pesan",
  description: "Percakapan dan pesan pribadi di Chatiers.",
};

export default function Page() {
  return <SectionPage section="messages" />;
}
