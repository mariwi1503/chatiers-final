import type { Metadata } from "next";
import "./globals.css";
import { StorefrontProvider } from "@/components/storefront-provider";

export const metadata: Metadata = {
  title: {
    default: "Chatiers — Connect, Share, Grow",
    template: "%s | Chatiers",
  },
  description:
    "Komunitas digital untuk berbagi ide, menemukan peluang, dan membangun koneksi bermakna.",
  applicationName: "Chatiers",
  keywords: [
    "media sosial Indonesia",
    "komunitas profesional",
    "lowongan kerja",
    "marketplace komunitas",
    "utas online",
    "Chatiers",
  ],
  creator: "Chatiers",
  publisher: "Chatiers",
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Chatiers — Connect, Share, Grow",
    description: "Temukan koneksi, peluang, barang, dan ide baru dalam satu komunitas.",
    siteName: "Chatiers",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Chatiers — Connect, Share, Grow",
    description: "Temukan koneksi, peluang, barang, dan ide baru dalam satu komunitas.",
  },
  category: "social network",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body><StorefrontProvider>{children}</StorefrontProvider></body>
    </html>
  );
}
