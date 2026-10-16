"use client";

import clsx from "clsx";
import { useState } from "react";
import { Avatar } from "@/components/avatar";

const notifications = [
  { name: "Nadia Putri", text: "menyukai ide yang kamu bagikan.", time: "2m", avatar: "https://i.pravatar.cc/160?img=47" },
  { name: "TechCorp", text: "mengunggah lowongan baru untukmu.", time: "18m", avatar: "https://i.pravatar.cc/160?img=13" },
  { name: "Siti Rahma", text: "membalas komentarmu.", time: "1j", avatar: "https://i.pravatar.cc/160?img=32" },
];

export function NotificationList({ className }: { className?: string }) {
  const [read, setRead] = useState(false);

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="font-bold text-slate-900">Notifikasi</h3>
        <button type="button" onClick={() => setRead(true)} disabled={read} className="text-xs font-semibold text-brand-600 disabled:text-slate-400">{read ? "Semua sudah dibaca" : "Tandai dibaca"}</button>
      </div>
      {notifications.map((item) => (
        <button key={item.name} type="button" className={clsx("flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50", !read && "bg-brand-50/50")}>
          <Avatar src={item.avatar} alt={item.name} />
          <span className="min-w-0 text-xs leading-5 text-slate-600"><b className="text-slate-900">{item.name}</b> {item.text}<span className="block font-medium text-brand-600">{item.time}</span></span>
        </button>
      ))}
    </div>
  );
}
