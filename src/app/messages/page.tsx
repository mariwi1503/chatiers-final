import { SessionRequired } from "@/components/session-required";
import type { Metadata } from "next";
import { MessagesPage } from "@/components/messages-page";

export const metadata: Metadata = {
  title: "Pesan",
  description: "Percakapan dan pesan pribadi di Chatiers.",
};

export default function Page() {
  return <SessionRequired><MessagesPage /></SessionRequired>;
}
