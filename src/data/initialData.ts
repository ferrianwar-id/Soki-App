import { MenuItem, HeroCardConfig, SiteSettings, TeamMember } from '../types';
import { defaultStoreSchedule } from '../utils/scheduleHelper';

export const defaultSiteSettings: SiteSettings = {
  siteTitle: "Soki - Snack Renyah & Aneka Es Segar",
  heroHeadline: "Renyahnya Bikin Nagih, Segarnya Balikin Mood!",
  heroHighlight: "Renyahnya, Segarnya",
  heroSubtitle: "Kami dari kelas 8B kelompok 3 menyediakan beberapa varian menu makanan untuk hari Rabu. Temukan kombinasi cemilan renyah gurih dan aneka es manis segar favoritmu di Soki.",
  announcement: "Kelas 8B Kelompok 3 • Menu Hari Rabu",
  whatsappNumber: "+6281384998659",
  aboutTitle: "Tim Pengelola Soki (Kelompok 3)",
  aboutSubtitle: "Toko Soki dikelola bersama oleh siswa-siswi Kelas 8B Kelompok 3 untuk menyajikan aneka jajanan renyah dan es manis segar pilihan.",
  aboutBadge: "Kelas 8B Kelompok 3",
  googleDriveWebhookUrl: "",
  googleDriveProductFolderId: "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n",
  googleDriveCardFolderId: "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn",
  maintenance: {
    enabled: false,
    title: "Website Sedang Dalam Pemeliharaan",
    reason: "Pembaruan Menu Produk & Promo Diskon",
    message: "Halo! Kami sedang memperbarui daftar menu produk baru dan penyesuaian promo menarik untuk kamu. Website akan segera dibuka kembali!",
    autoSchedule: false,
    allowBypass: true,
    scheduledStart: "",
    scheduledEnd: "",
    estimatedTime: "Segera Hadir"
  },
  storeSchedule: defaultStoreSchedule
};

export const defaultHeroCards: HeroCardConfig[] = [
  {
    id: "snack",
    title: "Aneka Cemilan Renyah",
    subtitle: "Renyah gurih bumbu mantap",
    badge: "Cemilan Renyah",
    imageUrl: "",
    icon: "🍟",
    bgGradient: "from-amber-400 to-orange-500",
    accentColor: "#ea580c"
  },
  {
    id: "es",
    title: "Aneka Minuman Segar",
    subtitle: "Manis beku pelepas dahaga",
    badge: "Es Pelepas Dahaga",
    imageUrl: "",
    icon: "🥤",
    bgGradient: "from-cyan-400 to-blue-500",
    accentColor: "#0284c7"
  }
];

export const defaultMenuItems: MenuItem[] = [];

export const defaultTeamMembers: TeamMember[] = [
  {
    id: "member-valentino",
    name: "Valentino",
    absen: "8B/20",
    initial: "V",
    role: "",
    description: "",
    themeColor: "amber"
  },
  {
    id: "member-kleinegan",
    name: "Kleinegan",
    absen: "8B/12",
    initial: "K",
    role: "",
    description: "",
    themeColor: "sky"
  },
  {
    id: "member-karin",
    name: "Karin",
    absen: "8B/11",
    initial: "K",
    role: "",
    description: "",
    themeColor: "rose"
  },
  {
    id: "member-rina",
    name: "Rina",
    absen: "8B/17",
    initial: "R",
    role: "",
    description: "",
    themeColor: "emerald"
  }
];
