import type { Metadata } from "next";
import { SectionPage } from "@/components/section-page";

export const metadata: Metadata = {
  title: "Komunitas",
  description: "Temukan dan ikuti komunitas di Chatiers.",
};

export default function Page() {
  return <SectionPage section="communities" />;
}
