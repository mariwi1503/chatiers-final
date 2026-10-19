import { BadgeDollarSign, BriefcaseBusiness, CircleDollarSign, Lightbulb, MessagesSquare, Search, ShoppingBag, UserSearch } from "lucide-react";

export const currentUser = {
  name: "Arya Pratama",
  handle: "@aryapratama",
  avatar: "https://i.pravatar.cc/160?img=12",
};

export type StoryAudience = "public" | "connections";

export type StoryItem = {
  id: string;
  mediaUrl: string;
  caption?: string;
  time: string;
  audience: StoryAudience;
  viewed: boolean;
};

export type StoryGroup = {
  id: string;
  name: string;
  avatar: string;
  own?: boolean;
  items: StoryItem[];
};

export const initialStories: StoryGroup[] = [
  { id: "current-user", name: "Cerita kamu", avatar: currentUser.avatar, own: true, items: [] },
  {
    id: "nadia",
    name: "Nadia",
    avatar: "https://i.pravatar.cc/160?img=47",
    items: [
      {
        id: "nadia-1",
        mediaUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85",
        caption: "Seru sekali bisa bertukar ide dengan teman-teman komunitas hari ini ✨",
        time: "15 menit",
        audience: "public",
        viewed: false,
      },
      {
        id: "nadia-2",
        mediaUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
        caption: "Sedikit suasana di balik layar sebelum sesi dimulai.",
        time: "12 menit",
        audience: "public",
        viewed: false,
      },
    ],
  },
  {
    id: "rian",
    name: "Rian",
    avatar: "https://i.pravatar.cc/160?img=11",
    items: [
      {
        id: "rian-1",
        mediaUrl: "https://images.unsplash.com/photo-1610022065010-5b4a4db9273e?auto=format&fit=crop&w=900&q=85",
        caption: "Detail barang baru yang baru saja masuk. Menurut kalian bagaimana?",
        time: "38 menit",
        audience: "connections",
        viewed: false,
      },
    ],
  },
  {
    id: "siska",
    name: "Siska",
    avatar: "https://i.pravatar.cc/160?img=32",
    items: [
      {
        id: "siska-1",
        mediaUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=85",
        caption: "Rapat singkat, ide besar. Semangat membangun bersama!",
        time: "1 jam",
        audience: "public",
        viewed: true,
      },
    ],
  },
  {
    id: "andi",
    name: "Andi",
    avatar: "https://i.pravatar.cc/160?img=15",
    items: [
      {
        id: "andi-1",
        mediaUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85",
        caption: "Menutup hari dengan merapikan rencana untuk minggu depan.",
        time: "2 jam",
        audience: "connections",
        viewed: true,
      },
    ],
  },
  { id: "maya", name: "Maya", avatar: "https://i.pravatar.cc/160?img=45", items: [] },
  { id: "fikri", name: "Fikri", avatar: "https://i.pravatar.cc/160?img=68", items: [] },
];

export const postCategories = [
  { id: "thread", label: "Utas", icon: MessagesSquare },
  { id: "sell", label: "Jual", icon: BadgeDollarSign },
  { id: "buy", label: "Beli", icon: CircleDollarSign },
  { id: "vacancy", label: "Lowongan", icon: BriefcaseBusiness },
  { id: "job-search", label: "Cari Kerja", icon: UserSearch },
] as const;

export const categories = [
  { id: "all", label: "Semua", icon: null },
  ...postCategories,
] as const;

export type PostCategory = (typeof postCategories)[number]["id"];

export type PricingType = "fixed" | "negotiable" | "free" | "contact";

export type PostImage = {
  id: string;
  name: string;
  url: string;
};

export type PostAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type PostCommentReply = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  replyToCommentId?: string;
  replyToAuthor?: string;
};

export type PostComment = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  replies?: PostCommentReply[];
};

export type PostDetails =
  | {
      type: "thread";
      topic?: string;
    }
  | {
      type: "sell";
      title: string;
      pricingType: PricingType;
      price?: number;
      condition: string;
      itemCategory?: string;
      delivery?: string;
      status: "available" | "reserved" | "sold";
    }
  | {
      type: "buy";
      title: string;
      budgetMin?: number;
      budgetMax?: number;
      desiredCondition?: string;
      deadline?: string;
      status: "looking" | "found" | "closed";
    }
  | {
      type: "vacancy";
      position: string;
      company: string;
      employmentType: string;
      workMode: string;
      salaryMin?: number;
      salaryMax?: number;
      skills?: string[];
      applicationUrl?: string;
      deadline?: string;
      status: "open" | "closed";
    }
  | {
      type: "job-search";
      targetRole: string;
      skills: string[];
      experienceLevel?: string;
      workPreference?: string;
      availability?: string;
      portfolioUrl?: string;
      expectedSalary?: number;
      status: "available" | "inactive";
    };

export type Post = {
  id: number;
  author: string;
  role: string;
  avatar: string;
  time: string;
  category: PostCategory;
  text: string;
  image?: string;
  images?: PostImage[];
  attachments?: PostAttachment[];
  location?: string;
  details: PostDetails;
  likes: number;
  comments: number;
  commentItems?: PostComment[];
  shares: number;
  liked?: boolean;
  saved?: boolean;
};

export const posts: Post[] = [
  {
    id: 1,
    author: "Rian Ardiansyah",
    role: "Owner at Sneakerhead ID",
    avatar: "https://i.pravatar.cc/160?img=11",
    time: "10 menit",
    category: "sell",
    text: "Lagi cari rumah baru untuk Air Jordan 1 Retro ini. Kondisi mulus 95%, size 42 lengkap dengan box asli. Bisa COD area Jakarta Selatan atau kirim ke seluruh Indonesia.",
    image: "https://images.unsplash.com/photo-1610022065010-5b4a4db9273e?auto=format&fit=crop&w=1200&q=85",
    location: "Jakarta Selatan",
    details: {
      type: "sell",
      title: "Air Jordan 1 Retro",
      pricingType: "fixed",
      price: 2450000,
      condition: "Bekas seperti baru",
      itemCategory: "Fashion",
      delivery: "COD atau kirim",
      status: "available",
    },
    likes: 128,
    comments: 24,
    commentItems: [
      {
        id: "1-1", author: "Nadia Putri", avatar: "https://i.pravatar.cc/160?img=47", text: "Masih tersedia, Kak? Untuk size-nya fit true to size?", time: "9 menit",
        replies: [
          { id: "1-1-1", author: "Rian Ardiansyah", avatar: "https://i.pravatar.cc/160?img=11", text: "Masih tersedia. Fit-nya normal, biasa pakai size 42 juga aman.", time: "8 menit", replyToAuthor: "Nadia Putri" },
          { id: "1-1-2", author: currentUser.name, avatar: currentUser.avatar, text: "Wah menarik, kondisinya kelihatan masih bagus banget. Bisa COD akhir pekan?", time: "5 menit", replyToAuthor: "Rian Ardiansyah" },
          { id: "1-1-3", author: "Rian Ardiansyah", avatar: "https://i.pravatar.cc/160?img=11", text: "Bisa, Arya. Sabtu siang area Blok M bagaimana?", time: "3 menit", replyToAuthor: currentUser.name },
        ],
      },
    ],
    shares: 8,
    liked: true,
  },
  {
    id: 2,
    author: "TechCorp Digital",
    role: "Human Resources · Teknologi",
    avatar: "https://i.pravatar.cc/160?img=13",
    time: "45 menit",
    category: "vacancy",
    text: "Kami membuka posisi Senior UI/UX Designer untuk bergabung bersama product team di Jakarta. Remote/hybrid, lingkungan kolaboratif, dan budget belajar tahunan. Portofolio kamu kami tunggu!",
    image: "https://cdn.prod.website-files.com/647f5603cf9435edd7285b62/6867c4d806f6cf20eaf1e96a_how-we-work-4.webp",
    location: "Jakarta",
    details: {
      type: "vacancy",
      position: "Senior UI/UX Designer",
      company: "TechCorp Digital",
      employmentType: "Penuh waktu",
      workMode: "Hybrid",
      skills: ["Figma", "Design System", "UX Research"],
      status: "open",
    },
    likes: 86,
    comments: 19,
    commentItems: [
      {
        id: "2-1", author: "Siska Maharani", avatar: "https://i.pravatar.cc/160?img=32", text: "Apakah posisi ini terbuka untuk kandidat dari luar Jakarta?", time: "31 menit",
        replies: [{ id: "2-1-1", author: "TechCorp Digital", avatar: "https://i.pravatar.cc/160?img=13", text: "Terbuka, Siska. Tim kami menerapkan sistem hybrid yang cukup fleksibel.", time: "28 menit", replyToAuthor: "Siska Maharani" }],
      },
      {
        id: "2-2", author: currentUser.name, avatar: currentUser.avatar, text: "Untuk proses wawancaranya dilakukan secara online atau perlu datang ke kantor?", time: "22 menit",
        replies: [{ id: "2-2-1", author: "TechCorp Digital", avatar: "https://i.pravatar.cc/160?img=13", text: "Tahap awal seluruhnya online. Pertemuan langsung baru dilakukan pada tahap akhir.", time: "20 menit", replyToAuthor: currentUser.name }],
      },
      { id: "2-3", author: "Bagas Mahendra", avatar: "https://i.pravatar.cc/160?img=14", text: "Sudah saya kirim portofolio melalui tautan kariernya 🙌", time: "18 menit" },
    ],
    shares: 12,
  },
  {
    id: 3,
    author: "Siti Rahma",
    role: "Software Engineer at Tokopedia",
    avatar: "https://i.pravatar.cc/160?img=32",
    time: "2 jam",
    category: "thread",
    text: "Menurut kalian, apakah stack frontend terbaik untuk produk dengan skala besar masih React/Next.js? Aku sedang membandingkan DX, performa, dan kemudahan maintenance. Penasaran dengan pengalaman teman-teman di sini.",
    details: { type: "thread", topic: "Teknologi" },
    likes: 214,
    comments: 48,
    commentItems: [
      {
        id: "3-1", author: "Dimas Surya", avatar: "https://i.pravatar.cc/160?img=8", text: "Menurutku tetap relevan, terutama kalau tim sudah nyaman dengan ekosistem dan tooling-nya.", time: "1 jam",
        replies: [{ id: "3-1-1", author: currentUser.name, avatar: currentUser.avatar, text: "Setuju. Faktor kemampuan tim sering lebih menentukan daripada sekadar memilih framework terbaru.", time: "48 menit", replyToAuthor: "Dimas Surya" }],
      },
      {
        id: "3-2", author: "Siti Rahma", avatar: "https://i.pravatar.cc/160?img=32", text: "Benar juga. Berarti konteks produk dan kesiapan tim harus jadi pertimbangan utama ya.", time: "35 menit",
        replies: [
          { id: "3-2-1", author: "Maya Lestari", avatar: "https://i.pravatar.cc/160?img=45", text: "Di timku Next.js masih efektif, tetapi kami cukup ketat membatasi penggunaan Client Component.", time: "20 menit", replyToAuthor: "Siti Rahma" },
          { id: "3-2-2", author: currentUser.name, avatar: currentUser.avatar, text: "Itu menarik. Pemisahan boundary server dan client memang sangat berpengaruh ke performa.", time: "12 menit", replyToAuthor: "Maya Lestari" },
        ],
      },
    ],
    shares: 18,
  },
  {
    id: 4,
    author: "Dimas Surya",
    role: "Product Builder",
    avatar: "https://i.pravatar.cc/160?img=8",
    time: "3 jam",
    category: "thread",
    text: "Ide kecil hari ini: ruang kerja bersama berbasis skill-swap. Kamu bantu seseorang soal desain, lalu dapat kredit untuk konsultasi legal atau marketing. Apakah model seperti ini menarik untuk dicoba?",
    details: { type: "thread", topic: "Ide bisnis" },
    likes: 167,
    comments: 36,
    commentItems: [
      {
        id: "4-1", author: "Maya Lestari", avatar: "https://i.pravatar.cc/160?img=45", text: "Menarik! Sistem reputasi dan kualitas pertukarannya akan jadi bagian paling penting.", time: "2 jam",
        replies: [{ id: "4-1-1", author: currentUser.name, avatar: currentUser.avatar, text: "Setuju. Mungkin setiap sesi selesai, kedua pihak bisa saling memberi ulasan.", time: "1 jam", replyToAuthor: "Maya Lestari" }],
      },
      {
        id: "4-2", author: "Dimas Surya", avatar: "https://i.pravatar.cc/160?img=8", text: "Nah, itu yang sedang aku pikirkan. Kredit baru cair setelah kedua pihak mengonfirmasi sesi selesai.", time: "55 menit",
        replies: [
          { id: "4-2-1", author: "Fikri Ramadhan", avatar: "https://i.pravatar.cc/160?img=68", text: "Aku tertarik mencoba. Bisa dimulai dari komunitas kecil dulu untuk menguji mekanismenya.", time: "40 menit", replyToAuthor: "Dimas Surya" },
          { id: "4-2-2", author: currentUser.name, avatar: currentUser.avatar, text: "Kalau ada versi uji cobanya, kabari ya. Aku bersedia ikut sebagai pengguna awal 🚀", time: "32 menit", replyToAuthor: "Fikri Ramadhan" },
        ],
      },
    ],
    shares: 21,
  },
];

export const trending = [
  { tag: "#KerjaRemote", posts: "2,4 rb obrolan" },
  { tag: "#IndonesiaTech", posts: "1,8 rb obrolan" },
  { tag: "#UMKMNaikKelas", posts: "986 obrolan" },
  { tag: "#BincangKarier", posts: "742 obrolan" },
];

export const contacts = [
  { name: "Nadia Putri", role: "Product Designer", avatar: "https://i.pravatar.cc/160?img=47", online: true },
  { name: "Rian Ardiansyah", role: "Sneakerhead ID", avatar: "https://i.pravatar.cc/160?img=11", online: true },
  { name: "Siti Rahma", role: "Software Engineer", avatar: "https://i.pravatar.cc/160?img=32", online: false },
  { name: "Dimas Surya", role: "Product Builder", avatar: "https://i.pravatar.cc/160?img=8", online: true },
];

export const suggestions = [
  { name: "Jessica Wijaya", role: "Recruiter at Gojek", avatar: "https://i.pravatar.cc/160?img=49" },
  { name: "Bagas Mahendra", role: "Founder at Tumbuh", avatar: "https://i.pravatar.cc/160?img=14" },
];

export const quickActions = [
  { label: "Cari peluang", icon: Search, color: "text-brand-600 bg-brand-50" },
  { label: "Jual barang", icon: ShoppingBag, color: "text-violet-600 bg-violet-50" },
  { label: "Bagikan ide", icon: Lightbulb, color: "text-amber-600 bg-amber-50" },
];

export type ChatMessageStatus = "sent" | "delivered" | "read";

export type ChatMessageContent =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string; caption?: string }
  | { kind: "voice"; duration: number }
  | { kind: "file"; name: string; size: number };

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  time: string;
  status?: ChatMessageStatus;
  author?: { name: string; avatar: string };
} & ChatMessageContent;

export type Conversation = {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isGroup?: boolean;
  members?: number;
  online?: boolean;
  lastSeen?: string;
  unread: number;
  time: string;
  messages: ChatMessage[];
};

export const conversations: Conversation[] = [
  {
    id: "nadia",
    name: "Nadia Putri",
    avatar: "https://i.pravatar.cc/160?img=47",
    role: "Product Designer",
    online: true,
    unread: 2,
    time: "09:40",
    messages: [
      { id: "n-1", from: "them", kind: "text", text: "Hai Arya, lagi apa nih?", time: "09:12" },
      { id: "n-2", from: "me", kind: "text", text: "Lagi ngerjain desain fitur chat nih. Kamu gimana?", time: "09:14", status: "read" },
      { id: "n-3", from: "them", kind: "text", text: "Wah keren! Bisa lihat hasilnya?", time: "09:15" },
      { id: "n-4", from: "me", kind: "image", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80", time: "09:16", status: "read" },
      { id: "n-5", from: "me", kind: "text", text: "Ini salah satu konsepnya", time: "09:16", status: "read" },
      { id: "n-6", from: "them", kind: "text", text: "Wah bagus banget!", time: "09:17" },
      { id: "n-7", from: "them", kind: "text", text: "Kapan selesai?", time: "09:17" },
      { id: "n-8", from: "me", kind: "text", text: "Mungkin minggu ini ya", time: "09:18", status: "read" },
      { id: "n-9", from: "them", kind: "voice", duration: 12, time: "09:19" },
      { id: "n-10", from: "them", kind: "text", text: "Oke, sampai nanti ya!", time: "09:40" },
    ],
  },
  {
    id: "rian",
    name: "Rian Ardiansyah",
    avatar: "https://i.pravatar.cc/160?img=11",
    role: "Owner at Sneakerhead ID",
    online: true,
    unread: 0,
    time: "08:12",
    messages: [
      { id: "r-1", from: "me", kind: "text", text: "Kak, Air Jordan-nya masih ada?", time: "08:02", status: "read" },
      { id: "r-2", from: "them", kind: "text", text: "Masih ada, Arya. Ini foto detail sol-nya ya.", time: "08:10" },
      { id: "r-3", from: "them", kind: "image", url: "https://images.unsplash.com/photo-1610022065010-5b4a4db9273e?auto=format&fit=crop&w=900&q=80", time: "08:12" },
    ],
  },
  {
    id: "chatiers-team",
    name: "Chatiers Team",
    role: "Grup resmi",
    isGroup: true,
    members: 128,
    unread: 1,
    time: "Kemarin",
    messages: [
      { id: "c-1", from: "them", kind: "text", text: "Pengumuman: fitur baru sudah bisa dicoba! Sekarang kamu bisa mengirim pesan suara dan gambar langsung dari chat.", time: "16:30", author: { name: "Chatiers", avatar: "https://i.pravatar.cc/160?img=5" } },
    ],
  },
  {
    id: "siti",
    name: "Siti Rahma",
    avatar: "https://i.pravatar.cc/160?img=32",
    role: "Software Engineer",
    online: false,
    lastSeen: "1 jam lalu",
    unread: 0,
    time: "Kemarin",
    messages: [
      { id: "s-1", from: "them", kind: "text", text: "Terima kasih masukannya di utas kemarin!", time: "19:20" },
      { id: "s-2", from: "me", kind: "text", text: "Sama-sama, Siti. Kapan kita ketemu lagi?", time: "19:24", status: "delivered" },
    ],
  },
  {
    id: "projek-design",
    name: "Projek Design",
    role: "Grup kerja",
    isGroup: true,
    members: 6,
    unread: 0,
    time: "Kemarin",
    messages: [
      { id: "p-1", from: "me", kind: "text", text: "Tolong kirim file revisinya ke grup ya.", time: "14:02", status: "read" },
      { id: "p-2", from: "them", kind: "file", name: "Revisi-Onboarding-v3.fig", size: 4_820_000, time: "14:20", author: { name: "Dimas", avatar: "https://i.pravatar.cc/160?img=8" } },
      { id: "p-3", from: "them", kind: "text", text: "File sudah aku kirim", time: "14:21", author: { name: "Dimas", avatar: "https://i.pravatar.cc/160?img=8" } },
    ],
  },
  {
    id: "dimas",
    name: "Dimas Surya",
    avatar: "https://i.pravatar.cc/160?img=8",
    role: "Product Builder",
    online: true,
    unread: 0,
    time: "Sen",
    messages: [
      { id: "d-1", from: "me", kind: "text", text: "Ide skill-swap kemarin keren, aku mau ikut uji coba.", time: "10:05", status: "read" },
      { id: "d-2", from: "them", kind: "text", text: "Siap, terima kasih!", time: "10:11" },
    ],
  },
  {
    id: "maya",
    name: "Maya Lestari",
    avatar: "https://i.pravatar.cc/160?img=45",
    role: "Frontend Engineer",
    online: false,
    lastSeen: "kemarin",
    unread: 0,
    time: "Sen",
    messages: [{ id: "m-1", from: "them", kind: "voice", duration: 27, time: "08:44" }],
  },
  {
    id: "fikri",
    name: "Fikri Ramadhan",
    avatar: "https://i.pravatar.cc/160?img=68",
    role: "Community Builder",
    online: false,
    lastSeen: "3 hari lalu",
    unread: 0,
    time: "Min",
    messages: [{ id: "f-1", from: "them", kind: "text", text: "Baik, nanti aku cek dulu.", time: "20:15" }],
  },
];
