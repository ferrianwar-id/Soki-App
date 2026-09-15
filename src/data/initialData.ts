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
  googleDriveWebhookUrl: "https://script.google.com/macros/s/AKfycbzTdjm1kGrnWqrMFpQASK4HSMk55mVLBDPDosNgLeuapc8DZjEFgVYevje0FUtVdl5nKw/exec",
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
    title: "Snack Soba",
    subtitle: "Nikmati kelezatan lengkap dari varian Ayam Bakar yang gurih menggugah selera, pedas mantap Sambal Balado khas Nusantara, serta gurihnya Potato yang renyah dan pas untuk menemani waktu santaimu.",
    badge: "Cemilan Renyah",
    imageUrl: "https://lh3.googleusercontent.com/d/146I0x5mQcd_LVtdwq85q8FzBMUzSGWKY",
    icon: "🍟",
    bgGradient: "from-amber-400 to-orange-500",
    accentColor: "#ea580c",
    productId: "item-1789379742094"
  },
  {
    id: "es",
    title: "Es Kiko",
    subtitle: "Es Kiko adalah es loli jadul legendaris berbentuk tabung plastik panjang yang dibekukan, populer di era 90-an hingga 2000-an dengan berbagai pilihan rasa buah manis seperti stroberi, jeruk, melon, dan anggur, serta sensasi menyegarkan yang praktis dinikmati hanya dengan memotong bagian ujung plastiknya.",
    badge: "Terlaris 🔥",
    imageUrl: "https://lh3.googleusercontent.com/d/1rbYol0QyfLcFkCppDGYwVPY0ppsnf6lD",
    icon: "🥤",
    bgGradient: "from-cyan-400 to-blue-500",
    accentColor: "#0284c7",
    productId: "item-1789331799209"
  }
];

export const defaultMenuItems: MenuItem[] = [
  {
    id: "item-1789331799209",
    category: "minuman",
    name: "Es Kiko",
    description: "Es Kiko adalah es loli jadul legendaris berbentuk tabung plastik panjang yang dibekukan, populer di era 90-an hingga 2000-an dengan berbagai pilihan rasa buah manis seperti stroberi, jeruk, melon, dan anggur, serta sensasi menyegarkan yang praktis dinikmati hanya dengan memotong bagian ujung plastiknya.",
    price: 3000,
    costPrice: 0,
    stock: 10,
    badge: "Terlaris 🔥",
    imageUrl: "https://lh3.googleusercontent.com/d/1rbYol0QyfLcFkCppDGYwVPY0ppsnf6lD",
    variants: ["Stroberi", "Jeruk", "Melon", "Anggur", "Cokelat"],
    keywords: "es kiko, es loli, minuman dingin, es buah",
    available: true,
    promoType: "bundle_price",
    promoInfo: "beli 2 hanya Rp5.000!!",
    promoPrice: 5000,
    promoMinQty: 2,
    promoFreeQty: null,
    promoActive: true
  },
  {
    id: "item-1789379742094",
    category: "makanan",
    name: "Snack Soba",
    description: "Nikmati kelezatan lengkap dari varian Ayam Bakar yang gurih menggugah selera, pedas mantap Sambal Balado khas Nusantara, serta gurihnya Potato yang renyah dan pas untuk menemani waktu santaimu.",
    price: 3000,
    costPrice: 0,
    stock: 10,
    badge: "Cemilan Renyah",
    imageUrl: "https://lh3.googleusercontent.com/d/146I0x5mQcd_LVtdwq85q8FzBMUzSGWKY",
    variants: ["Ayam Bakar", "Sambal Balado", "Potato"],
    keywords: "snack soba, keripik gurih, cemilan renyah",
    available: true,
    promoType: "buy_x_get_y",
    promoInfo: "Beli 2 Gratis 1",
    promoPrice: null,
    promoMinQty: 2,
    promoFreeQty: 1,
    promoActive: true
  }
];

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
