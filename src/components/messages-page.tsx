"use client";

import {
  BellOff,
  Check,
  CheckCheck,
  ChevronLeft,
  Download,
  FileText,
  Image as ImageIcon,
  MapPin,
  Mic,
  MoreVertical,
  Pause,
  PenLine,
  Phone,
  PhoneOff,
  Play,
  Plus,
  Search,
  Send,
  Smile,
  Trash2,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AppHeader } from "@/components/app-header";
import { Avatar } from "@/components/avatar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { conversations as initialConversations, type ChatMessage, type ChatMessageContent, type Conversation } from "@/lib/data";

type ChatFilter = "all" | "unread" | "groups";

const chatEmojis = ["😀", "😂", "😍", "🥹", "👍", "🙏", "🔥", "🎉", "💡", "🚀", "❤️", "✨", "👋", "😎", "🤝", "💼"];
const waveform = [6, 12, 18, 10, 22, 14, 26, 16, 9, 20, 28, 12, 18, 24, 10, 16, 22, 8, 14, 20, 12, 18, 9, 6];

function nowLabel() {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function firstName(name: string) {
  return name.split(" ")[0];
}

function getPreview(conversation: Conversation): { icon?: LucideIcon; prefix?: string; text: string } {
  const last = conversation.messages.at(-1);
  if (!last) return { text: "Belum ada pesan" };
  const prefix = last.from === "me" ? "Kamu: " : last.author ? `${last.author.name}: ` : undefined;
  if (last.kind === "image") return { icon: ImageIcon, prefix, text: last.caption ?? "Foto" };
  if (last.kind === "voice") return { icon: Mic, prefix, text: `Pesan suara (${formatDuration(last.duration)})` };
  if (last.kind === "file") return { icon: FileText, prefix, text: last.name };
  return { prefix, text: last.text };
}

export function MessagesPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState<ChatFilter>("all");
  const [query, setQuery] = useState("");
  const [muted, setMuted] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selected = conversations.find((item) => item.id === selectedId) ?? conversations[0];
  const unreadTotal = conversations.reduce((total, item) => total + item.unread, 0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id-ID");
    return conversations.filter((item) => {
      if (filter === "unread" && item.unread === 0) return false;
      if (filter === "groups" && !item.isGroup) return false;
      if (!normalized) return true;
      return [item.name, item.role, getPreview(item).text].some((value) => value.toLocaleLowerCase("id-ID").includes(normalized));
    });
  }, [conversations, filter, query]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function openConversation(id: string) {
    setSelectedId(id);
    setMobileOpen(true);
    setConversations((items) => items.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
  }

  function sendMessage(content: ChatMessageContent) {
    const id = `msg-${Date.now()}`;
    const message = { ...content, id, from: "me", time: nowLabel(), status: "sent" } as ChatMessage;
    const target = selected;

    setConversations((items) => {
      const current = items.find((item) => item.id === target.id);
      if (!current) return items;
      return [{ ...current, time: message.time, unread: 0, messages: [...current.messages, message] }, ...items.filter((item) => item.id !== target.id)];
    });

    window.setTimeout(() => {
      setConversations((items) => items.map((item) => item.id !== target.id ? item : {
        ...item,
        messages: item.messages.map((entry) => (entry.id === id ? { ...entry, status: target.online ? "read" : "delivered" } : entry)),
      }));
    }, 1200);
  }

  function clearConversation() {
    setConversations((items) => items.map((item) => (item.id === selected.id ? { ...item, messages: [] } : item)));
    showToast("Riwayat chat dihapus");
  }

  function toggleMuted() {
    const isMuted = muted.includes(selected.id);
    setMuted((items) => (isMuted ? items.filter((id) => id !== selected.id) : [...items, selected.id]));
    showToast(isMuted ? "Notifikasi diaktifkan kembali" : "Notifikasi chat dibisukan");
  }

  function toggleBlocked() {
    const isBlocked = blocked.includes(selected.id);
    setBlocked((items) => (isBlocked ? items.filter((id) => id !== selected.id) : [...items, selected.id]));
    showToast(isBlocked ? `${firstName(selected.name)} dibuka blokirnya` : `${firstName(selected.name)} diblokir`);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <AppHeader active="messages" />

      <main className="mx-auto w-full max-w-[1200px] md:px-4 md:py-4">
        <section className="bg-white md:grid md:h-[calc(100vh-96px)] md:min-h-[560px] md:grid-cols-[320px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:overflow-hidden md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card lg:grid-cols-[360px_minmax(0,1fr)]">
          <ConversationList
            conversations={filtered}
            selectedId={selected.id}
            unreadTotal={unreadTotal}
            filter={filter}
            onFilter={setFilter}
            query={query}
            onQuery={setQuery}
            muted={muted}
            onOpen={openConversation}
            onNewChat={() => setNewChatOpen(true)}
          />

          <div className={clsx(mobileOpen ? "fixed inset-0 z-50 flex animate-fade-up" : "hidden", "min-h-0 min-w-0 flex-col bg-white md:static md:z-auto md:flex md:animate-none")}>
            <ConversationView
              key={selected.id}
              conversation={selected}
              muted={muted.includes(selected.id)}
              blocked={blocked.includes(selected.id)}
              onBack={() => setMobileOpen(false)}
              onSend={sendMessage}
              onClear={clearConversation}
              onToggleMuted={toggleMuted}
              onToggleBlocked={toggleBlocked}
              onToast={showToast}
            />
          </div>
        </section>
      </main>

      <MobileBottomNav active="messages" composeLabel="Baru" messagesBadge={false} onCompose={() => setNewChatOpen(true)} />

      {newChatOpen && (
        <NewChatSheet
          conversations={conversations}
          onClose={() => setNewChatOpen(false)}
          onPick={(id) => { setNewChatOpen(false); openConversation(id); }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[80] -translate-x-1/2 animate-fade-up rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-float md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function ConversationAvatar({ conversation, size = "lg" }: { conversation: Conversation; size?: "md" | "lg" }) {
  if (conversation.isGroup) {
    return (
      <span className={clsx("flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-white", size === "lg" ? "h-12 w-12" : "h-10 w-10")}>
        <Users className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      </span>
    );
  }
  return <Avatar src={conversation.avatar ?? ""} alt={conversation.name} size={size} online={conversation.online} />;
}

function ConversationList({ conversations, selectedId, unreadTotal, filter, onFilter, query, onQuery, muted, onOpen, onNewChat }: {
  conversations: Conversation[];
  selectedId: string;
  unreadTotal: number;
  filter: ChatFilter;
  onFilter: (value: ChatFilter) => void;
  query: string;
  onQuery: (value: string) => void;
  muted: string[];
  onOpen: (id: string) => void;
  onNewChat: () => void;
}) {
  const filters: { id: ChatFilter; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "unread", label: unreadTotal > 0 ? `Belum dibaca · ${unreadTotal}` : "Belum dibaca" },
    { id: "groups", label: "Grup" },
  ];

  return (
    <aside className="flex min-h-0 flex-col md:border-r md:border-slate-200/80">
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">Pesan</h1>
            <p className="mt-0.5 text-xs text-slate-500">{unreadTotal > 0 ? `${unreadTotal} pesan belum dibaca` : "Semua pesan sudah dibaca"}</p>
          </div>
          <button type="button" onClick={onNewChat} className="icon-button focus-ring bg-brand-50 text-brand-600 hover:bg-brand-100" aria-label="Mulai chat baru"><PenLine className="h-[18px] w-[18px]" /></button>
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Cari chat, nama, atau pesan..." aria-label="Cari percakapan" className="focus-ring h-11 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:bg-slate-100 focus:border-brand-300 focus:bg-white" />
        </label>

        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto p-1 [scrollbar-width:none]">
          {filters.map((item) => (
            <button key={item.id} type="button" onClick={() => onFilter(item.id)} aria-pressed={filter === item.id} className={clsx("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold transition", filter === item.id ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800")}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        {conversations.map((conversation) => {
          const preview = getPreview(conversation);
          const isSelected = conversation.id === selectedId;
          const hasUnread = conversation.unread > 0;
          return (
            <button key={conversation.id} type="button" onClick={() => onOpen(conversation.id)} className={clsx("group flex w-full items-center gap-3 px-4 text-left transition hover:bg-slate-50", isSelected && "md:bg-brand-50/70 md:hover:bg-brand-50")}>
              <ConversationAvatar conversation={conversation} />
              <span className={clsx("flex min-w-0 flex-1 items-center gap-3 border-b py-3.5", isSelected ? "border-transparent md:border-transparent" : "border-slate-100")}>
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <b className="min-w-0 truncate text-sm font-bold text-slate-900">{conversation.name}</b>
                    {muted.includes(conversation.id) && <BellOff className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-label="Dibisukan" />}
                  </span>
                  <span className={clsx("mt-0.5 flex min-w-0 items-center gap-1 text-xs", hasUnread ? "font-semibold text-slate-700" : "text-slate-500")}>
                    {preview.prefix && <span className={clsx("shrink-0", hasUnread ? "text-slate-800" : "text-slate-600")}>{preview.prefix}</span>}
                    {preview.icon && <preview.icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    <span className="min-w-0 truncate">{preview.text}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5 self-start pt-0.5">
                  <span className={clsx("text-[11px]", hasUnread ? "font-bold text-brand-600" : "text-slate-400")}>{conversation.time}</span>
                  {hasUnread ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{conversation.unread}</span> : <span className="h-5" />}
                </span>
              </span>
            </button>
          );
        })}

        {conversations.length === 0 && (
          <div className="px-6 py-14 text-center">
            <Search className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Percakapan tidak ditemukan.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ConversationView({ conversation, muted, blocked, onBack, onSend, onClear, onToggleMuted, onToggleBlocked, onToast }: {
  conversation: Conversation;
  muted: boolean;
  blocked: boolean;
  onBack: () => void;
  onSend: (content: ChatMessageContent) => void;
  onClear: () => void;
  onToggleMuted: () => void;
  onToggleBlocked: () => void;
  onToast: (message: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [call, setCall] = useState<"voice" | "video" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = conversation.isGroup
    ? `${conversation.members} anggota`
    : conversation.online ? "Online" : `Terakhir aktif ${conversation.lastSeen ?? "baru-baru ini"}`;

  useEffect(() => {
    if (!menuOpen) return;
    function close(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menuOpen]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [conversation.messages.length]);

  const menuItems: { label: string; onClick: () => void; danger?: boolean }[] = [
    { label: "Lihat profil", onClick: () => onToast(`${conversation.name} · ${conversation.role}`) },
    { label: muted ? "Aktifkan notifikasi" : "Bisukan notifikasi", onClick: onToggleMuted },
    { label: "Hapus chat", onClick: onClear, danger: true },
    ...(conversation.isGroup ? [] : [{ label: blocked ? "Buka blokir" : "Blokir", onClick: onToggleBlocked, danger: !blocked }]),
  ];

  return (
    <>
      <header className="relative z-30 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white/95 px-2 backdrop-blur-xl md:gap-3 md:px-4">
        <button type="button" onClick={onBack} className="icon-button md:hidden" aria-label="Kembali ke daftar pesan"><ChevronLeft className="h-6 w-6" /></button>
        <ConversationAvatar conversation={conversation} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-extrabold text-slate-900">{conversation.name}{muted && <BellOff className="h-3.5 w-3.5 text-slate-400" />}</p>
          <p className={clsx("truncate text-[11px] font-medium", conversation.online && !conversation.isGroup ? "text-emerald-500" : "text-slate-400")}>{status}</p>
        </div>
        <button type="button" onClick={() => setCall("voice")} disabled={blocked} className="icon-button disabled:opacity-40" aria-label="Panggilan suara"><Phone className="h-[18px] w-[18px]" /></button>
        <button type="button" onClick={() => setCall("video")} disabled={blocked} className="icon-button disabled:opacity-40" aria-label="Panggilan video"><Video className="h-5 w-5" /></button>
        <div ref={menuRef} className="relative">
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="icon-button" aria-label="Menu lainnya" aria-expanded={menuOpen}><MoreVertical className="h-5 w-5" /></button>
          {menuOpen && (
            <>
              <div className="absolute right-0 top-12 z-20 w-52 animate-fade-up rounded-2xl border border-slate-200 bg-white p-1.5 shadow-float">
                {menuItems.map((item) => (
                  <button key={item.label} type="button" onClick={() => { item.onClick(); setMenuOpen(false); }} className={clsx("w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition", item.danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50")}>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50 bg-[radial-gradient(circle_at_80%_0%,rgba(47,140,255,.07),transparent_22rem)] px-3 py-5 md:px-6">
        {conversation.messages.length > 0 ? (
          <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
            <p className="mx-auto mb-3 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200/70">Hari ini</p>
            {conversation.messages.map((message, index) => {
              const previous = conversation.messages[index - 1];
              const next = conversation.messages[index + 1];
              const startsRun = !previous || previous.from !== message.from || previous.author?.name !== message.author?.name;
              const endsRun = !next || next.from !== message.from || next.author?.name !== message.author?.name;
              return <MessageRow key={message.id} message={message} conversation={conversation} showAuthor={Boolean(conversation.isGroup && startsRun)} showAvatar={endsRun} spaced={startsRun && index > 0} />;
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ConversationAvatar conversation={conversation} />
            <p className="mt-3 text-sm font-bold text-slate-800">Belum ada pesan</p>
            <p className="mt-1 text-xs text-slate-500">Sapa {firstName(conversation.name)} dan mulai percakapan 👋</p>
          </div>
        )}
      </div>

      {blocked ? (
        <div className="border-t border-slate-200/80 bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-center">
          <p className="text-xs text-slate-500">Kamu memblokir {conversation.name}. Kamu tidak bisa mengirim pesan.</p>
          <button type="button" onClick={onToggleBlocked} className="mt-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100">Buka blokir</button>
        </div>
      ) : (
        <Composer recipient={firstName(conversation.name)} onSend={onSend} />
      )}

      {call && <CallOverlay conversation={conversation} type={call} onEnd={() => { setCall(null); onToast("Panggilan berakhir"); }} />}
    </>
  );
}

function MessageRow({ message, conversation, showAuthor, showAvatar, spaced }: { message: ChatMessage; conversation: Conversation; showAuthor: boolean; showAvatar: boolean; spaced: boolean }) {
  const mine = message.from === "me";
  const avatar = message.author?.avatar ?? conversation.avatar;
  const bubble = clsx(
    "relative max-w-full",
    mine ? "bg-brand-600 text-white" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/70",
    mine ? (showAvatar ? "rounded-2xl rounded-br-md" : "rounded-2xl") : (showAvatar ? "rounded-2xl rounded-bl-md" : "rounded-2xl")
  );

  return (
    <div className={clsx("flex items-end gap-2", mine ? "justify-end" : "justify-start", spaced && "mt-2.5")}>
      {!mine && (
        <span className="w-8 shrink-0">
          {showAvatar && avatar && <Avatar src={avatar} alt={message.author?.name ?? conversation.name} size="sm" />}
        </span>
      )}
      <div className={clsx("flex min-w-0 max-w-[78%] flex-col md:max-w-[65%]", mine ? "items-end" : "items-start")}>
        {showAuthor && message.author && <span className="mb-1 ml-1 text-[11px] font-bold text-brand-600">{message.author.name}</span>}
        {message.kind === "text" && (
          <p className={clsx(bubble, "flex flex-wrap items-end gap-x-3 px-3.5 py-2 text-[13px] leading-5 md:text-sm")}>
            <span className="whitespace-pre-wrap break-words">{message.text}</span>
            <MessageMeta message={message} />
          </p>
        )}
        {message.kind === "image" && (
          <div className={clsx(bubble, "overflow-hidden p-1")}>
            <img src={message.url} alt={message.caption ?? "Foto yang dikirim"} className="aspect-[4/3] w-[240px] max-w-full rounded-xl object-cover md:w-[300px]" />
            <span className="absolute bottom-2.5 right-2.5 rounded-full bg-slate-950/45 px-2 py-0.5 text-white backdrop-blur-sm"><MessageMeta message={message} light /></span>
          </div>
        )}
        {message.kind === "voice" && (
          <div className={clsx(bubble, "px-3 py-2.5")}>
            <VoicePlayer duration={message.duration} mine={mine} />
            <div className="mt-1 flex justify-end"><MessageMeta message={message} /></div>
          </div>
        )}
        {message.kind === "file" && (
          <div className={clsx(bubble, "w-[260px] p-2")}>
            <div className={clsx("flex items-center gap-3 rounded-xl p-2.5", mine ? "bg-white/15" : "bg-slate-50")}>
              <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", mine ? "bg-white text-brand-600" : "bg-brand-50 text-brand-600")}><FileText className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><b className="block truncate text-xs">{message.name}</b><span className={clsx("text-[10px]", mine ? "text-blue-100" : "text-slate-400")}>{formatFileSize(message.size)}</span></span>
              <Download className={clsx("h-4 w-4 shrink-0", mine ? "text-blue-100" : "text-slate-400")} />
            </div>
            <div className="mt-1 flex justify-end px-1"><MessageMeta message={message} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageMeta({ message, light }: { message: ChatMessage; light?: boolean }) {
  const mine = message.from === "me";
  const StatusIcon = message.status === "sent" ? Check : CheckCheck;
  return (
    <span className={clsx("ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] leading-5", light || mine ? "text-blue-100" : "text-slate-400")}>
      {message.time}
      {mine && message.status && <StatusIcon className={clsx("h-3.5 w-3.5", message.status === "read" ? "text-sky-300" : "text-blue-100")} aria-label={message.status === "read" ? "Dibaca" : message.status === "delivered" ? "Terkirim" : "Dikirim"} />}
    </span>
  );
}

function VoicePlayer({ duration, mine }: { duration: number; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => {
        const next = value + 0.1;
        if (next >= duration) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, duration]);

  const progress = elapsed / duration;
  return (
    <div className="flex w-[210px] max-w-full items-center gap-3 md:w-[240px]">
      <button type="button" onClick={() => setPlaying((value) => !value)} className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-95", mine ? "bg-white text-brand-600" : "bg-brand-50 text-brand-600 hover:bg-brand-100")} aria-label={playing ? "Jeda pesan suara" : "Putar pesan suara"}>
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
      </button>
      <span className="flex h-7 flex-1 items-center gap-[3px]" aria-hidden="true">
        {waveform.map((height, index) => (
          <span key={index} style={{ height }} className={clsx("w-[3px] rounded-full transition-colors", index / waveform.length < progress ? (mine ? "bg-white" : "bg-brand-600") : (mine ? "bg-white/40" : "bg-brand-200"))} />
        ))}
      </span>
      <span className={clsx("w-8 text-right text-[11px] font-semibold tabular-nums", mine ? "text-white" : "text-slate-600")}>{formatDuration(playing || elapsed > 0 ? elapsed : duration)}</span>
    </div>
  );
}

function Composer({ recipient, onSend }: { recipient: string; onSend: (content: ChatMessageContent) => void }) {
  const [text, setText] = useState("");
  const [panel, setPanel] = useState<"emoji" | "attach" | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) return;
    onSend({ kind: "text", text: text.trim() });
    setText("");
    setPanel(null);
  }

  function sendImages(files: FileList | null) {
    Array.from(files ?? []).filter((file) => file.type.startsWith("image/")).forEach((file) => onSend({ kind: "image", url: URL.createObjectURL(file) }));
    setPanel(null);
  }

  function sendFiles(files: FileList | null) {
    Array.from(files ?? []).forEach((file) => onSend({ kind: "file", name: file.name, size: file.size }));
    setPanel(null);
  }

  function stopRecording(send: boolean) {
    if (send) onSend({ kind: "voice", duration: Math.max(1, seconds) });
    setRecording(false);
    setSeconds(0);
  }

  const attachOptions = [
    { label: "Dokumen", icon: FileText, color: "bg-brand-50 text-brand-600", onClick: () => fileInput.current?.click() },
    { label: "Galeri", icon: ImageIcon, color: "bg-violet-50 text-violet-600", onClick: () => imageInput.current?.click() },
    { label: "Lokasi", icon: MapPin, color: "bg-emerald-50 text-emerald-600", onClick: () => { onSend({ kind: "text", text: "📍 Lokasi saya: Jakarta Selatan" }); setPanel(null); } },
  ];

  return (
    <div className="relative shrink-0 border-t border-slate-200/80 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 md:px-4">
      <input ref={imageInput} type="file" accept="image/*" multiple hidden onChange={(event) => { sendImages(event.target.files); event.target.value = ""; }} />
      <input ref={fileInput} type="file" multiple hidden onChange={(event) => { sendFiles(event.target.files); event.target.value = ""; }} />

      {panel === "emoji" && (
        <div className="absolute bottom-full left-3 right-3 mb-2 grid animate-fade-up grid-cols-8 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-float md:left-auto md:w-80">
          {chatEmojis.map((emoji) => (
            <button key={emoji} type="button" onClick={() => { setText((value) => value + emoji); textInput.current?.focus(); }} className="flex h-9 items-center justify-center rounded-lg text-xl transition hover:bg-slate-100">{emoji}</button>
          ))}
        </div>
      )}
      {panel === "attach" && (
        <div className="absolute bottom-full left-3 mb-2 w-56 animate-fade-up rounded-2xl border border-slate-200 bg-white p-1.5 shadow-float">
          {attachOptions.map((option) => (
            <button key={option.label} type="button" onClick={option.onClick} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50">
              <span className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", option.color)}><option.icon className="h-4 w-4" /></span>
              {option.label}
            </button>
          ))}
        </div>
      )}

      {recording ? (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => stopRecording(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100" aria-label="Batalkan rekaman"><Trash2 className="h-[18px] w-[18px]" /></button>
          <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full bg-slate-100 px-4">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
            <span className="text-sm font-semibold tabular-nums text-slate-700">{formatDuration(seconds)}</span>
            <span className="truncate text-xs text-slate-400">Merekam pesan suara...</span>
          </div>
          <button type="button" onClick={() => stopRecording(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 active:scale-95" aria-label="Kirim pesan suara"><Send className="h-[18px] w-[18px]" /></button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex items-center gap-2">
          <button type="button" onClick={() => setPanel((value) => (value === "attach" ? null : "attach"))} aria-expanded={panel === "attach"} className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition active:scale-95", panel === "attach" ? "rotate-45 bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600")} aria-label="Tambah lampiran"><Plus className="h-5 w-5" /></button>
          <div className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-slate-200 bg-slate-100/80 pl-4 pr-1.5 transition focus-within:border-brand-300 focus-within:bg-white">
            <input ref={textInput} value={text} onChange={(event) => setText(event.target.value)} placeholder={`Ketik pesan ke ${recipient}...`} aria-label="Ketik pesan" className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
            <button type="button" onClick={() => setPanel((value) => (value === "emoji" ? null : "emoji"))} className={clsx("flex h-8 w-8 items-center justify-center rounded-full transition", panel === "emoji" ? "text-brand-600" : "text-slate-400 hover:text-brand-600")} aria-label="Pilih emoji"><Smile className="h-5 w-5" /></button>
            <button type="button" onClick={() => imageInput.current?.click()} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-brand-600" aria-label="Kirim gambar"><ImageIcon className="h-5 w-5" /></button>
          </div>
          {text.trim() ? (
            <button type="submit" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 active:scale-95" aria-label="Kirim pesan"><Send className="h-[18px] w-[18px]" /></button>
          ) : (
            <button type="button" onClick={() => { setPanel(null); setRecording(true); }} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100 active:scale-95" aria-label="Rekam pesan suara"><Mic className="h-5 w-5" /></button>
          )}
        </form>
      )}
    </div>
  );
}

function CallOverlay({ conversation, type, onEnd }: { conversation: Conversation; type: "voice" | "video"; onEnd: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex animate-fade-up flex-col items-center justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-brand-700 px-6 py-16 text-white">
      <div className="text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200">{type === "video" ? "Panggilan video" : "Panggilan suara"}</p>
        <div className="mt-8 flex justify-center"><span className="animate-soft-pulse rounded-full"><ConversationAvatar conversation={conversation} /></span></div>
        <h2 className="mt-5 text-2xl font-black">{conversation.name}</h2>
        <p className="mt-1 text-sm text-blue-200">Memanggil...</p>
      </div>
      <button type="button" onClick={onEnd} className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 shadow-lg shadow-rose-900/40 transition hover:bg-rose-600 active:scale-95" aria-label="Akhiri panggilan"><PhoneOff className="h-7 w-7" /></button>
    </div>
  );
}

function NewChatSheet({ conversations, onClose, onPick }: { conversations: Conversation[]; onClose: () => void; onPick: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("id-ID");
  const people = conversations.filter((item) => [item.name, item.role].some((value) => value.toLocaleLowerCase("id-ID").includes(normalized)));

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/30 backdrop-blur-[2px] md:items-center" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="max-h-[80vh] w-full animate-fade-up overflow-hidden rounded-t-3xl bg-white shadow-float md:w-[420px] md:rounded-3xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="text-base font-extrabold text-slate-900">Chat baru</h2><p className="text-[11px] text-slate-400">Pilih koneksi atau grup</p></div>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Tutup"><X className="h-5 w-5" /></button>
        </header>
        <div className="p-4 pb-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama" className="focus-ring h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-10 pr-4 text-sm outline-none focus:border-brand-300 focus:bg-white" />
          </label>
        </div>
        <div className="max-h-[50vh] overflow-y-auto px-2 pb-[max(12px,env(safe-area-inset-bottom))]">
          {people.map((person) => (
            <button key={person.id} type="button" onClick={() => onPick(person.id)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-50">
              <ConversationAvatar conversation={person} size="md" />
              <span className="min-w-0 flex-1"><b className="block truncate text-sm text-slate-900">{person.name}</b><span className="block truncate text-[11px] text-slate-400">{person.isGroup ? `${person.members} anggota` : person.role}</span></span>
            </button>
          ))}
          {people.length === 0 && <p className="py-8 text-center text-xs text-slate-400">Tidak ada hasil.</p>}
        </div>
      </section>
    </div>
  );
}
