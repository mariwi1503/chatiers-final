import type { Metadata } from "next";
import { ProfilePage } from "@/views/profile-page";

export const metadata: Metadata = {
  title: "Profil Arya Pratama",
  description: "Profil Arya Pratama di Chatiers.",
};

export default function Page() {
  return <ProfilePage />;
}
