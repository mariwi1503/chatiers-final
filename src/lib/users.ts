import { currentUser } from "./data";
import type { Company, Product } from "./storefront";

export type ProfilePost = {
  id: number;
  time: string;
  text: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  likes: number;
  comments: number;
  shares: number;
};

export type Experience = { title: string; company: string; type: string; period: string; location: string };

export type UserProfile = {
  username: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  bio: string;
  location: string;
  website?: string;
  joined: string;
  verified?: boolean;
  stats: { posts: string; connections: string; following: string };
  experience: Experience[];
  skills: string[];
  company: Company | null;
  products: Product[];
  posts: ProfilePost[];
};

const unsplash = (id: string, size = "w=800&h=800") => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&${size}&q=85`;

// The signed-in user. Their company and products live in the editable storefront store instead.
export const ownProfile: UserProfile = {
  username: currentUser.username,
  name: currentUser.name,
  handle: currentUser.handle,
  avatar: currentUser.avatar,
  role: "Product Designer",
  bio: "Merancang produk digital yang sederhana, hangat, dan berguna. Suka berbagi soal desain, teknologi, dan proses membangun sesuatu dari nol.",
  location: "Jakarta, Indonesia",
  website: "aryapratama.design",
  joined: "Mei 2023",
  verified: true,
  stats: { posts: "128", connections: "1.284", following: "892" },
  experience: [
    { title: "Senior Product Designer", company: "Nusa Digital", type: "Penuh waktu", period: "2022 – Sekarang", location: "Jakarta" },
    { title: "UI/UX Designer", company: "Kreasi Labs", type: "Penuh waktu", period: "2019 – 2022", location: "Bandung" },
  ],
  skills: ["Product Design", "Design System", "UX Research", "Figma", "Prototyping"],
  company: null,
  products: [],
  posts: [
    {
      id: 1,
      time: "2 jam",
      text: "Baru saja menyelesaikan eksplorasi desain untuk pengalaman onboarding yang lebih manusiawi. Pelajaran terbesarnya: jangan minta pengguna memahami produk kita—bantu produk memahami mereka.",
      tags: ["#ProductDesign", "#UXIndonesia"],
      likes: 184,
      comments: 32,
      shares: 11,
    },
    {
      id: 2,
      time: "2 hari",
      text: "Senang bisa berbagi tentang membangun design system yang bertumbuh bersama tim di Product Talks kemarin. Terima kasih untuk semua pertanyaan dan diskusinya!",
      tags: ["#DesignSystem", "#Community"],
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
      imageAlt: "Dokumentasi acara Product Talks",
      likes: 267,
      comments: 41,
      shares: 28,
    },
  ],
};

export const otherUsers: UserProfile[] = [
  {
    username: "rianardiansyah",
    name: "Rian Ardiansyah",
    handle: "@rianardiansyah",
    avatar: "https://i.pravatar.cc/160?img=11",
    role: "Owner at Sneakerhead ID",
    bio: "Kolektor dan reseller sneakers sejak 2016. Semua barang dicek keasliannya satu per satu sebelum dijual. Bisa COD area Jakarta Selatan, kirim ke seluruh Indonesia.",
    location: "Jakarta Selatan",
    website: "sneakerhead.id",
    joined: "Februari 2023",
    verified: true,
    stats: { posts: "342", connections: "2.917", following: "418" },
    experience: [
      { title: "Founder & Owner", company: "Sneakerhead ID", type: "Wiraswasta", period: "2018 – Sekarang", location: "Jakarta Selatan" },
      { title: "Retail Supervisor", company: "Urban Footwear", type: "Penuh waktu", period: "2015 – 2018", location: "Jakarta" },
    ],
    skills: ["Legit check sneakers", "Retail", "Social commerce", "Negosiasi"],
    company: {
      name: "Sneakerhead ID",
      industry: "Retail sepatu & streetwear",
      location: "Jakarta Selatan",
      description: "Toko sneakers kurasi untuk kolektor dan pemakai harian. Kami menjual sneakers baru dan bekas berkualitas yang sudah melalui pengecekan keaslian, lengkap dengan garansi uang kembali bila terbukti tidak original.",
    },
    products: [
      { id: "rian-new-balance-574", name: "New Balance 574 Olive", description: "New Balance 574 warna olive, size 43. Kondisi bekas pakai 3 kali, sol masih tebal dan tidak ada noda. Lengkap dengan box dan kertas asli.", price: 1150000, category: "Fashion", image: unsplash("1539185441755-769473a23570"), status: "available" },
      { id: "rian-air-max-1", name: "Nike Air Max 1 Infrared", description: "Nike Air Max 1 colorway Infrared, size 42. Brand new in box, belum pernah dipakai. Cocok untuk koleksi maupun pemakaian harian.", price: 2300000, category: "Fashion", image: unsplash("1600185365483-26d7a4cc7519"), status: "available" },
      { id: "rian-vans-old-skool", name: "Vans Old Skool Maroon", description: "Vans Old Skool maroon, size 41. Kondisi 90%, ada sedikit tanda pemakaian di bagian toe box. Sudah dicuci bersih.", price: 550000, category: "Fashion", image: unsplash("1525966222134-fcfa99b8ae77"), status: "available" },
      { id: "rian-chuck-70", name: "Converse Chuck 70 Hi Red", description: "Converse Chuck 70 high top merah, size 42. Kondisi baru, hanya dicoba di dalam ruangan.", price: 899000, category: "Fashion", image: unsplash("1607522370275-f14206abe5d3"), status: "sold" },
    ],
    posts: [
      { id: 101, time: "1 hari", text: "Restock minggu ini sudah masuk! Beberapa pasang langsung diambil teman-teman komunitas. Terima kasih sudah percaya belanja di Sneakerhead ID 🙏", tags: ["#Sneakers", "#UMKMNaikKelas"], image: unsplash("1556906781-9a412961c28c", "w=1200&h=675"), imageAlt: "Sepasang sneakers dipakai di jalan", likes: 312, comments: 45, shares: 17 },
      { id: 102, time: "4 hari", text: "Tips legit check sederhana: perhatikan jahitan, font pada tag ukuran, dan bau lem. Kalau ragu, jangan sungkan minta foto detail ke penjual.", tags: ["#LegitCheck", "#TipsBelanja"], likes: 489, comments: 63, shares: 102 },
    ],
  },
  {
    username: "nadiaputri",
    name: "Nadia Putri",
    handle: "@nadiaputri",
    avatar: "https://i.pravatar.cc/160?img=47",
    role: "Product Designer · Creator",
    bio: "Product designer yang suka membuat aset desain siap pakai. Membantu startup dan UMKM merilis produk digital yang rapi dan konsisten tanpa harus mulai dari nol.",
    location: "Bandung, Jawa Barat",
    website: "nadiaputri.studio",
    joined: "Agustus 2022",
    verified: true,
    stats: { posts: "516", connections: "4.102", following: "735" },
    experience: [
      { title: "Lead Product Designer", company: "Rupa Studio", type: "Penuh waktu", period: "2021 – Sekarang", location: "Bandung" },
      { title: "Product Designer", company: "Halo Belanja", type: "Penuh waktu", period: "2018 – 2021", location: "Jakarta" },
    ],
    skills: ["UI Design", "Design System", "Figma", "Brand Identity", "UX Writing"],
    company: {
      name: "Rupa Studio",
      industry: "Studio desain digital",
      location: "Bandung, Jawa Barat",
      description: "Studio desain kecil yang fokus pada identitas brand dan desain produk digital untuk startup tahap awal serta UMKM. Kami juga merilis UI kit dan template yang bisa langsung dipakai tim produk.",
    },
    products: [
      { id: "nadia-ui-kit-dashboard", name: "UI Kit Dashboard Pro", description: "Lebih dari 300 komponen Figma untuk aplikasi dashboard dan mobile: tabel, grafik, form, hingga 40 layar contoh siap pakai. Mendukung auto layout dan variable mode gelap/terang. File dikirim lewat email setelah pembayaran.", price: 249000, category: "Produk Digital", image: unsplash("1551650975-87deedd944c3"), status: "available" },
      { id: "nadia-brand-kit", name: "Brand Starter Kit UMKM", description: "Template logo, palet warna, tipografi, dan 20 desain konten media sosial yang mudah diedit di Figma maupun Canva. Cocok untuk UMKM yang baru membangun identitas brand.", price: 149000, category: "Produk Digital", image: unsplash("1561070791-2526d30994b5"), status: "available" },
      { id: "nadia-ux-audit", name: "Jasa Audit UX Aplikasi", description: "Audit menyeluruh terhadap alur utama aplikasi atau website kamu. Hasilnya berupa laporan temuan, prioritas perbaikan, dan rekomendasi desain. Pengerjaan 5 hari kerja.", price: 1500000, category: "Jasa", image: unsplash("1586717791821-3f44a563fa4c"), status: "available" },
    ],
    posts: [
      { id: 201, time: "6 jam", text: "Belajar dari audit UX minggu ini: sebagian besar pengguna gagal checkout bukan karena tombolnya, tapi karena biaya kirim baru muncul di langkah terakhir. Transparansi itu bagian dari desain.", tags: ["#UXIndonesia", "#ProductDesign"], likes: 538, comments: 71, shares: 64 },
      { id: 202, time: "3 hari", text: "Sudut kerja baru di studio. Akhirnya punya meja yang cukup untuk sketsa dan tablet sekaligus ✏️", tags: ["#WorkspaceTour"], image: unsplash("1586717791821-3f44a563fa4c", "w=1200&h=675"), imageAlt: "Meja kerja dengan tablet berisi sketsa wireframe", likes: 276, comments: 22, shares: 5 },
    ],
  },
  {
    username: "sitirahma",
    name: "Siti Rahma",
    handle: "@sitirahma",
    avatar: "https://i.pravatar.cc/160?img=32",
    role: "Software Engineer at Tokopedia",
    bio: "Frontend engineer yang senang menulis dan mengajar. Sedang mendalami performa web dan arsitektur aplikasi skala besar. Membuka sesi mentoring untuk teman-teman yang baru mulai.",
    location: "Jakarta Barat",
    website: "sitirahma.dev",
    joined: "Januari 2024",
    stats: { posts: "89", connections: "1.530", following: "264" },
    experience: [
      { title: "Software Engineer", company: "Tokopedia", type: "Penuh waktu", period: "2021 – Sekarang", location: "Jakarta" },
      { title: "Frontend Developer", company: "Bukit Teknologi", type: "Penuh waktu", period: "2019 – 2021", location: "Yogyakarta" },
    ],
    skills: ["React", "Next.js", "TypeScript", "Web Performance", "Mentoring"],
    company: null,
    products: [
      { id: "siti-keychron-k2", name: "Keychron K2 Preloved", description: "Keyboard mekanikal Keychron K2 switch brown, layout 75%, bisa Bluetooth dan kabel. Dipakai 1 tahun untuk kerja, semua tombol normal. Bonus keycap PBT putih.", price: 850000, category: "Elektronik", image: unsplash("1618384887929-16ec33fab9ef"), status: "available" },
      { id: "siti-ebook-nextjs", name: "E-book Belajar Next.js dari Nol", description: "E-book 180 halaman berbahasa Indonesia tentang dasar-dasar Next.js App Router, lengkap dengan studi kasus membangun aplikasi katalog. Format PDF, update gratis seumur hidup.", price: 99000, category: "Buku", image: unsplash("1495446815901-a7297e633e8d"), status: "available" },
      { id: "siti-mentoring", name: "Mentoring Karier Frontend (1 Jam)", description: "Sesi mentoring privat via video call: review CV, portofolio, atau persiapan interview teknis frontend. Jadwal fleksibel di hari kerja malam dan akhir pekan.", price: 200000, category: "Jasa", image: unsplash("1498050108023-c5249f4df085"), status: "available" },
    ],
    posts: [
      { id: 301, time: "1 hari", text: "Hari ini berhasil menurunkan waktu muat halaman katalog dari 3,1 detik ke 1,4 detik. Kuncinya: berhenti memuat data yang belum terlihat di layar.", tags: ["#WebPerformance", "#IndonesiaTech"], likes: 402, comments: 58, shares: 37 },
    ],
  },
  {
    username: "dimassurya",
    name: "Dimas Surya",
    handle: "@dimassurya",
    avatar: "https://i.pravatar.cc/160?img=8",
    role: "Product Builder · Founder Seduh Bareng",
    bio: "Membangun produk kecil yang menyelesaikan masalah nyata. Saat ini sedang mengembangkan Seduh Bareng, kedai kopi sekaligus ruang kolaborasi untuk komunitas kreatif.",
    location: "Yogyakarta",
    joined: "Oktober 2023",
    stats: { posts: "203", connections: "1.876", following: "590" },
    experience: [
      { title: "Founder", company: "Seduh Bareng", type: "Wiraswasta", period: "2023 – Sekarang", location: "Yogyakarta" },
      { title: "Product Manager", company: "Jalan Pintas", type: "Penuh waktu", period: "2019 – 2023", location: "Jakarta" },
    ],
    skills: ["Product Management", "Validasi Ide", "No-code", "Community Building"],
    company: {
      name: "Seduh Bareng",
      industry: "Kedai kopi & ruang kolaborasi",
      location: "Yogyakarta",
      description: "Kedai kopi dengan biji kopi lokal pilihan sekaligus ruang kerja bersama. Setiap minggu kami mengadakan sesi berbagi dan skill-swap untuk komunitas kreatif di Yogyakarta.",
    },
    products: [
      { id: "dimas-kopi-gayo", name: "Kopi Arabika Gayo 250 g", description: "Biji kopi arabika Gayo roasting medium dengan catatan rasa cokelat, gula aren, dan sedikit jeruk. Di-roasting setiap minggu agar selalu segar. Tersedia pilihan biji utuh atau digiling.", price: 95000, category: "Makanan & Minuman", image: unsplash("1559056199-641a0ac8b55e"), status: "available" },
      { id: "dimas-house-blend", name: "House Blend Seduh Bareng 1 kg", description: "Racikan arabika dan robusta lokal yang dipakai di kedai kami. Seimbang untuk espresso maupun kopi susu.", price: 280000, category: "Makanan & Minuman", image: unsplash("1447933601403-0c6688de566e"), status: "available" },
      { id: "dimas-workshop", name: "Workshop Validasi Ide Bisnis", description: "Workshop tatap muka 3 jam di Seduh Bareng: cara menguji ide bisnis dengan biaya kecil sebelum membangun produk. Termasuk kopi dan template validasi.", price: 175000, category: "Jasa", image: unsplash("1556761175-5973dc0f32e7"), status: "available" },
    ],
    posts: [
      { id: 401, time: "2 hari", text: "Sesi skill-swap pertama di Seduh Bareng diikuti 24 orang! Desainer bertukar ilmu dengan penulis, developer dengan pemilik UMKM. Terima kasih semuanya ☕", tags: ["#SkillSwap", "#KomunitasJogja"], image: unsplash("1556761175-5973dc0f32e7", "w=1200&h=675"), imageAlt: "Sesi berbagi di ruang kolaborasi", likes: 365, comments: 40, shares: 21 },
    ],
  },
];

export function findUserByUsername(username: string) {
  return otherUsers.find((user) => user.username === username);
}

export function findUserByName(name: string) {
  return name === ownProfile.name ? ownProfile : otherUsers.find((user) => user.name === name);
}

export function getProfileHref(user: Pick<UserProfile, "username">) {
  return user.username === ownProfile.username ? "/profile" : `/profile/${user.username}`;
}

/** Products from other people's stores, which the signed-in user can view but not edit. */
export function findOtherUserProduct(productId: string) {
  for (const owner of otherUsers) {
    const product = owner.products.find((item) => item.id === productId);
    if (product) return { product, owner };
  }
  return undefined;
}
