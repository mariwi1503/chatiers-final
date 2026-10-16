"use client";

import {
  ChevronLeft,
  ChevronRight,
  Globe2,
  Heart,
  Image as ImageIcon,
  Pause,
  Plus,
  Send,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/avatar";
import {
  initialStories,
  type StoryAudience,
  type StoryGroup,
  type StoryItem,
} from "@/lib/data";

const STORY_DURATION_MS = 6000;
const MAX_STORY_SIZE = 5 * 1024 * 1024;

type NewStory = Pick<StoryItem, "mediaUrl" | "caption" | "audience">;

type StoryEntry = {
  group: StoryGroup;
  item: StoryItem;
  groupIndex: number;
  itemIndex: number;
};

export function Stories({ onToast }: { onToast: (message: string) => void }) {
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>(initialStories);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const uploadedUrlsRef = useRef<string[]>([]);

  const viewerOpen = activeGroupIndex !== null;
  const activeGroup = activeGroupIndex === null ? null : storyGroups[activeGroupIndex];
  const activeItem = activeGroup?.items[activeItemIndex] ?? null;
  const canGoPrevious =
    activeGroupIndex !== null &&
    (activeItemIndex > 0 || storyGroups.slice(0, activeGroupIndex).some((group) => group.items.length > 0));
  const storyEntries: StoryEntry[] = storyGroups.flatMap((group, groupIndex) =>
    group.items.map((item, itemIndex) => ({ group, item, groupIndex, itemIndex }))
  );
  const activeEntryIndex = activeGroup && activeItem
    ? storyEntries.findIndex((entry) => entry.group.id === activeGroup.id && entry.item.id === activeItem.id)
    : -1;
  const previousStories = activeEntryIndex > 0 ? storyEntries.slice(Math.max(0, activeEntryIndex - 2), activeEntryIndex) : [];
  const nextStories = activeEntryIndex >= 0 ? storyEntries.slice(activeEntryIndex + 1, activeEntryIndex + 3) : [];

  useEffect(() => {
    if (!viewerOpen && !composerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [viewerOpen, composerOpen]);

  useEffect(() => {
    return () => {
      uploadedUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!activeGroup || !activeItem || activeItem.viewed) return;
    setStoryGroups((groups) =>
      groups.map((group) =>
        group.id === activeGroup.id
          ? {
              ...group,
              items: group.items.map((item) =>
                item.id === activeItem.id ? { ...item, viewed: true } : item
              ),
            }
          : group
      )
    );
  }, [activeGroup?.id, activeItem?.id, activeItem?.viewed]);

  function openStory(groupIndex: number) {
    const group = storyGroups[groupIndex];
    if (!group.items.length) {
      if (group.own) setComposerOpen(true);
      else onToast(`${group.name} belum memiliki cerita aktif`);
      return;
    }

    const firstUnseen = group.items.findIndex((item) => !item.viewed);
    setActiveGroupIndex(groupIndex);
    setActiveItemIndex(firstUnseen >= 0 ? firstUnseen : 0);
  }

  function closeViewer() {
    setActiveGroupIndex(null);
    setActiveItemIndex(0);
  }

  function selectStory(entry: StoryEntry) {
    setActiveGroupIndex(entry.groupIndex);
    setActiveItemIndex(entry.itemIndex);
  }

  function moveNext() {
    if (activeGroupIndex === null || !activeGroup) return;
    if (activeItemIndex < activeGroup.items.length - 1) {
      setActiveItemIndex((index) => index + 1);
      return;
    }

    for (let index = activeGroupIndex + 1; index < storyGroups.length; index += 1) {
      if (storyGroups[index].items.length) {
        setActiveGroupIndex(index);
        setActiveItemIndex(0);
        return;
      }
    }
    closeViewer();
  }

  function movePrevious() {
    if (activeGroupIndex === null) return;
    if (activeItemIndex > 0) {
      setActiveItemIndex((index) => index - 1);
      return;
    }

    for (let index = activeGroupIndex - 1; index >= 0; index -= 1) {
      if (storyGroups[index].items.length) {
        setActiveGroupIndex(index);
        setActiveItemIndex(storyGroups[index].items.length - 1);
        return;
      }
    }
  }

  function addStory(story: NewStory) {
    const item: StoryItem = {
      ...story,
      id: `story-${Date.now()}`,
      time: "Baru saja",
      viewed: false,
    };
    uploadedUrlsRef.current.push(story.mediaUrl);
    setStoryGroups((groups) =>
      groups.map((group) =>
        group.own ? { ...group, items: [...group.items, item] } : group
      )
    );
    setComposerOpen(false);
    setActiveGroupIndex(0);
    setActiveItemIndex(storyGroups[0].items.length);
    onToast("Cerita berhasil dibagikan");
  }

  function deleteActiveStory() {
    if (!activeGroup?.own || !activeItem) return;
    if (!window.confirm("Hapus cerita ini? Tindakan ini tidak dapat dibatalkan.")) return;
    if (activeItem.mediaUrl.startsWith("blob:")) {
      URL.revokeObjectURL(activeItem.mediaUrl);
      uploadedUrlsRef.current = uploadedUrlsRef.current.filter((url) => url !== activeItem.mediaUrl);
    }

    const remainingItems = activeGroup.items.filter((item) => item.id !== activeItem.id);
    setStoryGroups((groups) =>
      groups.map((group) =>
        group.id === activeGroup.id ? { ...group, items: remainingItems } : group
      )
    );

    if (!remainingItems.length) closeViewer();
    else setActiveItemIndex(Math.min(activeItemIndex, remainingItems.length - 1));
    onToast("Cerita dihapus");
  }

  return (
    <>
      <section aria-labelledby="stories-title" className="border-b border-slate-100 bg-white px-4 py-3.5 md:rounded-2xl md:border md:border-slate-200/80 md:shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 id="stories-title" className="text-xs font-extrabold text-slate-900">Cerita</h2>
            <p className="mt-0.5 text-[10px] text-slate-400">Kabar singkat dari koneksimu</p>
          </div>
          <button type="button" onClick={() => setComposerOpen(true)} className="focus-ring rounded-full px-3 py-1.5 text-[10px] font-bold text-brand-600 transition hover:bg-brand-50">
            + Buat cerita
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {storyGroups.map((story, groupIndex) => {
            const hasStories = story.items.length > 0;
            const allViewed = hasStories && story.items.every((item) => item.viewed);

            return (
              <div key={story.id} className="relative w-[62px] shrink-0">
                <button
                  type="button"
                  onClick={() => openStory(groupIndex)}
                  className="focus-ring group flex w-full flex-col items-center gap-2 rounded-xl"
                  aria-label={story.own ? (hasStories ? "Lihat cerita kamu" : "Buat cerita kamu") : `Lihat cerita ${story.name}`}
                >
                  <span
                    className={clsx(
                      "relative rounded-full p-[3px] transition",
                      !hasStories || story.own
                        ? "bg-slate-100"
                        : allViewed
                          ? "bg-slate-300"
                          : "bg-gradient-to-tr from-violet-600 via-brand-500 to-cyan-400"
                    )}
                  >
                    <Avatar src={story.avatar} alt={story.name} size="xl" className="rounded-full border-[3px] border-white transition group-hover:scale-105" />
                  </span>
                  <span className={clsx("w-full truncate text-center text-[10px] font-semibold", allViewed ? "text-slate-400" : "text-slate-600")}>{story.name}</span>
                </button>

                {story.own && (
                  <button
                    type="button"
                    onClick={() => setComposerOpen(true)}
                    aria-label="Tambah cerita baru"
                    className="focus-ring absolute right-[-1px] top-11 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm transition hover:bg-brand-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {activeGroup && activeItem && (
        <StoryViewer
          group={activeGroup}
          item={activeItem}
          itemIndex={activeItemIndex}
          canGoPrevious={canGoPrevious}
          previousStories={previousStories}
          nextStories={nextStories}
          onClose={closeViewer}
          onNext={moveNext}
          onPrevious={movePrevious}
          onDelete={deleteActiveStory}
          onReact={(emoji) => onToast(`${emoji} Reaksi terkirim ke ${activeGroup.name}`)}
          onReply={(message) => onToast(`Balasan “${message}” terkirim ke ${activeGroup.name}`)}
          onSelectStory={selectStory}
        />
      )}

      {composerOpen && (
        <StoryComposer
          onClose={() => setComposerOpen(false)}
          onSubmit={addStory}
          onError={onToast}
        />
      )}
    </>
  );
}

function StoryViewer({
  group,
  item,
  itemIndex,
  canGoPrevious,
  previousStories,
  nextStories,
  onClose,
  onNext,
  onPrevious,
  onDelete,
  onReact,
  onReply,
  onSelectStory,
}: {
  group: StoryGroup;
  item: StoryItem;
  itemIndex: number;
  canGoPrevious: boolean;
  previousStories: StoryEntry[];
  nextStories: StoryEntry[];
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
  onReply: (message: string) => void;
  onSelectStory: (entry: StoryEntry) => void;
}) {
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const touchStartXRef = useRef<number | null>(null);
  const pressStartedAtRef = useRef<number | null>(null);
  const suppressTapRef = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft" && canGoPrevious) onPrevious();
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGoPrevious, onClose, onNext, onPrevious]);

  useEffect(() => {
    setPaused(false);
    setReply("");
  }, [item.id]);

  function handleTouchStart(event: React.TouchEvent) {
    if (event.target instanceof HTMLElement && event.target.closest("[data-story-ui]")) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    pressStartedAtRef.current = performance.now();
    setPaused(true);
  }

  function suppressNextTap() {
    suppressTapRef.current = true;
    window.setTimeout(() => {
      suppressTapRef.current = false;
    }, 300);
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;
    const pressDuration = pressStartedAtRef.current === null ? 0 : performance.now() - pressStartedAtRef.current;
    touchStartXRef.current = null;
    pressStartedAtRef.current = null;
    if (startX === null) return;
    setPaused(false);
    if (endX === undefined || Math.abs(endX - startX) < 48) {
      if (pressDuration > 220) suppressNextTap();
      return;
    }

    suppressNextTap();
    if (endX < startX) onNext();
    else if (canGoPrevious) onPrevious();
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (event.pointerType !== "mouse" || (event.target instanceof HTMLElement && event.target.closest("[data-story-ui]"))) return;
    pressStartedAtRef.current = performance.now();
    setPaused(true);
  }

  function handlePointerUp(event: React.PointerEvent) {
    if (event.pointerType !== "mouse" || (event.target instanceof HTMLElement && event.target.closest("[data-story-ui]"))) return;
    const pressDuration = pressStartedAtRef.current === null ? 0 : performance.now() - pressStartedAtRef.current;
    pressStartedAtRef.current = null;
    setPaused(false);
    if (pressDuration > 220) suppressNextTap();
  }

  function handlePreviousTap() {
    if (!suppressTapRef.current && canGoPrevious) onPrevious();
  }

  function handleNextTap() {
    if (!suppressTapRef.current) onNext();
  }

  function sendReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = reply.trim();
    if (!message) return;
    onReply(message);
    setReply("");
    setPaused(false);
  }

  const audienceLabel = item.audience === "public" ? "Publik" : "Koneksi";
  const AudienceIcon = item.audience === "public" ? Globe2 : UserRound;

  function renderReplyForm() {
    return <form onSubmit={sendReply} className="flex min-w-0 flex-1 items-center gap-2">
      <input
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-label={`Balas cerita ${group.name}`}
        placeholder="Balas cerita..."
        className="h-11 min-w-0 flex-1 rounded-full border border-white/55 bg-black/10 px-4 text-xs text-white outline-none backdrop-blur placeholder:text-white/70 focus:border-white focus:bg-white/10"
      />
      <button type="submit" disabled={!reply.trim()} aria-label="Kirim balasan" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:bg-white/10 disabled:text-white/35">
        <Send className="h-4 w-4" />
      </button>
    </form>;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={`Cerita ${group.name}`} className="fixed inset-0 z-[90] overflow-hidden bg-[#191919]" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <button type="button" onClick={onClose} aria-label="Tutup cerita" className="fixed right-5 top-5 z-[100] hidden h-11 w-11 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white md:flex"><X className="h-7 w-7" /></button>

      <div className="relative flex h-full w-full items-center justify-center gap-8 px-0 md:px-12 lg:gap-10 xl:gap-14 2xl:px-20">
        <div className="hidden min-w-0 flex-1 items-center justify-end gap-7 lg:flex">
          {previousStories.map((entry, index) => (
            <StoryPreviewCard key={`${entry.group.id}-${entry.item.id}`} entry={entry} onSelect={onSelectStory} far={previousStories.length > 1 && index === 0} />
          ))}
        </div>

        <section
          className="relative h-[100dvh] w-full shrink-0 touch-pan-y overflow-hidden bg-black shadow-2xl md:h-[min(90dvh,900px)] md:w-auto md:aspect-[9/16] md:rounded-lg md:ring-1 md:ring-white/10"
          aria-label="Media cerita"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setPaused(false)}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") { pressStartedAtRef.current = null; setPaused(false); } }}
        >
          <img src={item.mediaUrl} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl" aria-hidden="true" />
          <div className="absolute inset-0 bg-black/30" />
          <img src={item.mediaUrl} alt={item.caption || `Cerita dari ${group.name}`} className="relative h-full w-full object-contain" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/85" />

          <div data-story-ui className="absolute inset-x-0 top-0 z-30 p-3.5 md:p-4">
            <div className="flex gap-1.5">
              {group.items.map((storyItem, index) => (
                <span key={storyItem.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/35">
                  <span
                    key={`${item.id}-${index}`}
                    className={clsx("block h-full origin-left rounded-full bg-white", index < itemIndex && "w-full", index > itemIndex && "w-0")}
                    style={index === itemIndex ? { animation: `story-progress ${STORY_DURATION_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" } : undefined}
                    onAnimationEnd={index === itemIndex ? onNext : undefined}
                  />
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2.5 text-white">
              <Avatar src={group.avatar} alt={group.name} size="sm" className="ring-2 ring-white/80" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold">{group.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/70"><AudienceIcon className="h-3 w-3" />{item.time} · {audienceLabel}</p>
              </div>
              {group.own && <button type="button" onClick={onDelete} aria-label="Hapus cerita" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-rose-600"><Trash2 className="h-4 w-4" /></button>}
              <button type="button" onClick={onClose} aria-label="Tutup cerita" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white transition hover:bg-black/45 md:hidden"><X className="h-5 w-5" /></button>
            </div>
          </div>

          <button type="button" onClick={handlePreviousTap} disabled={!canGoPrevious} aria-label="Cerita sebelumnya" className="absolute inset-y-24 left-0 z-10 w-1/3 cursor-w-resize disabled:cursor-default" />
          <button type="button" onClick={handleNextTap} aria-label="Cerita berikutnya" className="absolute inset-y-24 right-0 z-10 w-1/3 cursor-e-resize" />

          <button data-story-ui type="button" onClick={onPrevious} disabled={!canGoPrevious} aria-label="Cerita sebelumnya" className="absolute -left-14 top-1/2 z-40 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:scale-105 hover:bg-white/30 disabled:hidden lg:flex"><ChevronLeft className="h-5 w-5" /></button>
          <button data-story-ui type="button" onClick={onNext} aria-label="Cerita berikutnya" className="absolute -right-14 top-1/2 z-40 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:scale-105 hover:bg-white/30 lg:flex"><ChevronRight className="h-5 w-5" /></button>

          {paused && <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur"><Pause className="h-6 w-6 fill-current" /></div>}

          <div data-story-ui className="absolute inset-x-0 bottom-0 z-30 p-4 pb-[max(16px,env(safe-area-inset-bottom))] text-white">
            {item.caption && <p className="mb-3 text-sm font-semibold leading-6 drop-shadow-md">{item.caption}</p>}
            {!group.own && (
              <div className="flex items-center gap-2">
                {renderReplyForm()}
                <button type="button" onClick={() => onReact("❤️")} aria-label="Sukai cerita" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15"><Heart className="h-6 w-6" /></button>
              </div>
            )}
          </div>
        </section>

        <div className="hidden min-w-0 flex-1 items-center justify-start gap-7 lg:flex">
          {nextStories.map((entry, index) => (
            <StoryPreviewCard key={`${entry.group.id}-${entry.item.id}`} entry={entry} onSelect={onSelectStory} far={index === 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryPreviewCard({ entry, onSelect, far }: { entry: StoryEntry; onSelect: (entry: StoryEntry) => void; far: boolean }) {
  return (
    <button type="button" onClick={() => onSelect(entry)} aria-label={`Buka cerita ${entry.group.name}`} className={clsx("group relative aspect-[9/16] w-[150px] shrink-0 overflow-hidden rounded-lg bg-black text-white shadow-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/30 xl:w-[180px] 2xl:w-[205px]", far && "hidden 2xl:block")}>
      <img src={entry.item.mediaUrl} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-lg" aria-hidden="true" />
      <img src={entry.item.mediaUrl} alt={`Pratinjau cerita ${entry.group.name}`} className="relative h-full w-full object-contain opacity-70 transition group-hover:opacity-85" />
      <span className="absolute inset-0 bg-black/35 transition group-hover:bg-black/20" />
      <span className="absolute inset-0 flex flex-col items-center justify-center px-3">
        <span className="rounded-full bg-gradient-to-tr from-violet-600 via-brand-500 to-cyan-400 p-0.5"><Avatar src={entry.group.avatar} alt={entry.group.name} size="lg" className="border-2 border-[#191919]" /></span>
        <b className="mt-3 max-w-full truncate text-xs drop-shadow">{entry.group.name}</b>
        <span className="mt-1 text-[10px] text-white/75">{entry.item.time}</span>
      </span>
    </button>
  );
}

function StoryComposer({
  onClose,
  onSubmit,
  onError,
}: {
  onClose: () => void;
  onSubmit: (story: NewStory) => void;
  onError: (message: string) => void;
}) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<StoryAudience>("public");
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (!submittedRef.current && mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  function selectImage(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Pilih file gambar untuk cerita");
      return;
    }
    if (file.size > MAX_STORY_SIZE) {
      onError("Ukuran gambar maksimal 5 MB");
      return;
    }
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaUrl(URL.createObjectURL(file));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mediaUrl) {
      onError("Tambahkan gambar terlebih dahulu");
      return;
    }
    submittedRef.current = true;
    onSubmit({ mediaUrl, caption: caption.trim() || undefined, audience });
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="story-composer-title" className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} className="flex max-h-[95dvh] w-full animate-fade-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-float sm:max-w-xl sm:rounded-3xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 id="story-composer-title" className="font-extrabold text-slate-900">Buat cerita</h2>
            <p className="mt-0.5 text-[11px] text-slate-400">Cerita aktif selama 24 jam</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="icon-button bg-slate-100"><X className="h-5 w-5" /></button>
        </header>

        <div className="overflow-y-auto p-5">
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => selectImage(event.target.files)} />

          {mediaUrl ? (
            <div className="group relative mx-auto max-h-[52dvh] max-w-sm overflow-hidden rounded-2xl bg-slate-950">
              <img src={mediaUrl} alt="Pratinjau cerita" className="max-h-[52dvh] min-h-72 w-full object-contain" />
              <button type="button" onClick={() => inputRef.current?.click()} className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-2 text-[10px] font-bold text-white backdrop-blur transition hover:bg-black/75">
                <ImageIcon className="h-3.5 w-3.5" /> Ganti gambar
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => inputRef.current?.click()} className="focus-ring flex min-h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/60 px-6 text-center transition hover:border-brand-400 hover:bg-brand-50">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm"><Upload className="h-6 w-6" /></span>
              <span className="mt-4 text-sm font-extrabold text-slate-800">Pilih gambar cerita</span>
              <span className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG, atau WebP · maksimal 5 MB</span>
            </button>
          )}

          <label className="mt-4 block">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-600">Caption (opsional)</span>
            <textarea value={caption} maxLength={200} onChange={(event) => setCaption(event.target.value)} placeholder="Ceritakan momen ini..." className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 p-3 text-sm leading-5 outline-none transition placeholder:text-slate-300 focus:border-brand-300 focus:ring-4 focus:ring-brand-50" />
            <span className="mt-1 block text-right text-[9px] text-slate-400">{caption.length}/200</span>
          </label>

          <fieldset className="mt-3">
            <legend className="mb-2 text-[10px] font-bold text-slate-600">Siapa yang dapat melihat?</legend>
            <div className="grid grid-cols-2 gap-2">
              {([
                ["public", "Publik", "Semua anggota", Globe2],
                ["connections", "Koneksi", "Koneksi kamu", UserRound],
              ] as const).map(([value, label, description, Icon]) => (
                <label key={value} className={clsx("flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition", audience === value ? "border-brand-300 bg-brand-50" : "border-slate-200 hover:bg-slate-50")}>
                  <input type="radio" name="story-audience" value={value} checked={audience === value} onChange={() => setAudience(value)} className="sr-only" />
                  <span className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", audience === value ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500")}><Icon className="h-4 w-4" /></span>
                  <span><b className="block text-xs text-slate-800">{label}</b><span className="text-[9px] text-slate-400">{description}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={!mediaUrl} className="mt-5 h-12 w-full rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
            Bagikan cerita
          </button>
        </div>
      </form>
    </div>
  );
}
