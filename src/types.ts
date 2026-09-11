export interface CartItem {
  name: string;
  variant: string;
  price: number;
  costPrice?: number;
  qty: number;
}

export interface MenuItem {
  id: string;
  category: 'snack' | 'es' | string;
  name: string;
  description: string;
  price: number;
  costPrice?: number; // Modal awal / HPP (Harga Pokok Penjualan) per satuan/porsi
  stock?: number; // Jumlah stok barang tersedia (input stok)
  badge: string;
  imageUrl?: string;
  variants: string[];
  keywords?: string;
  available?: boolean;
  promoInfo?: string;
  promoPrice?: number; // Contoh: 5000 untuk paket promo
  promoMinQty?: number; // Contoh: 2 (beli 2 hanya Rp5.000)
  promoActive?: boolean; // Toggle aktifkan perhitungan harga promo otomatis
}

export interface HeroCardConfig {
  id: string; // 'snack' | 'es'
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  icon?: string; // Emoji atau simbol ikon (misal: 🍟, 🥤, 🍕, dll)
  bgGradient?: string;
  accentColor?: string;
  productId?: string; // ID produk menu terkait yang dipilih dari daftar katalog
}

export interface FeatureItem {
  title: string;
  description: string;
  icon: string; // Emoji
}

export interface TeamMember {
  id: string;
  name: string;
  absen: string;
  role: string;
  description: string;
  initial?: string;
  avatarUrl?: string;
  themeColor?: 'amber' | 'sky' | 'rose' | 'emerald' | 'purple';
}

export interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  reason: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  autoSchedule?: boolean;
  allowBypass?: boolean;
  estimatedTime?: string;
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dayName: string; // e.g. "Senin", "Selasa", dll.
  isOpen: boolean;
  openTime: string; // "08:00"
  closeTime: string; // "21:00"
}

export interface StoreScheduleConfig {
  statusMode: 'auto' | 'force_open' | 'force_closed';
  closedTitle: string;
  closedMessage: string;
  allowPreorderWhatsApp: boolean;
  weeklySchedule: DaySchedule[];
  specialNote?: string;
}

export interface SiteSettings {
  siteTitle: string;
  heroHeadline: string;
  heroHighlight: string;
  heroSubtitle: string;
  announcement: string;
  whatsappNumber: string;
  features?: FeatureItem[];
  googleDriveWebhookUrl?: string; // Webhook / Google Apps Script URL for direct Google Drive image upload
  googleDriveProductFolderId?: string; // ID Folder Google Drive khusus Menu Produk
  googleDriveCardFolderId?: string; // ID Folder Google Drive khusus 2 Card Landing Page
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutBadge?: string;
  maintenance?: MaintenanceConfig;
  storeSchedule?: StoreScheduleConfig;
}

export interface OrderItem {
  name: string;
  variant: string;
  price: number;
  costPrice?: number;
  qty: number;
}

export interface Order {
  id: string;
  pembeli: string;
  waktu: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}
