import type { Metadata } from "next";
import { AuthEntry } from "@/components/auth-entry";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return <AuthEntry mode="register" />;
}
