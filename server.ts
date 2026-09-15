import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";

process.env.TZ = "Asia/Jakarta";

function getJakartaTimeString(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
      hour12: false
    }).format(d).replace(':', '.');
  } catch {
    const h = String((d.getUTCHours() + 7) % 24).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}.${m}`;
  }
}

interface CartItem {
  productId?: string;
  name: string;
  variant: string;
  price: number;
  qty: number;
  costPrice?: number;
  isFreeBonus?: boolean;
  promoNote?: string;
}

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  stock?: number;
  badge: string;
  imageUrl?: string;
  variants: string[];
  keywords: string;
  available?: boolean;
  promoInfo?: string;
  promoType?: 'bundle_price' | 'buy_x_get_y';
  promoPrice?: number;
  promoMinQty?: number;
  promoFreeQty?: number;
  promoActive?: boolean;
}

interface HeroCardConfig {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  icon?: string;
  bgGradient?: string;
  accentColor?: string;
  productId?: string;
}

interface MaintenanceConfig {
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

interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dayName: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface StoreScheduleConfig {
  statusMode: 'auto' | 'force_open' | 'force_closed';
  closedTitle: string;
  closedMessage: string;
  allowPreorderWhatsApp: boolean;
  weeklySchedule: DaySchedule[];
  specialNote?: string;
}

interface SiteSettings {
  siteTitle: string;
  heroHeadline: string;
  heroHighlight: string;
  heroSubtitle: string;
  announcement: string;
  whatsappNumber: string;
  features?: Array<{ title: string; description: string; icon: string }>;
  googleDriveWebhookUrl?: string;
  googleDriveProductFolderId?: string;
  googleDriveCardFolderId?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutBadge?: string;
  maintenance?: MaintenanceConfig;
  storeSchedule?: StoreScheduleConfig;
}

interface TeamMember {
  id: string;
  name: string;
  absen: string;
  role: string;
  description: string;
  initial?: string;
  avatarUrl?: string;
  themeColor?: 'amber' | 'sky' | 'rose' | 'emerald' | 'purple';
}

interface Order {
  id: string;
  pembeli: string;
  waktu: string;
  items: CartItem[];
  total: number;
  totalFreeItems?: number;
  status: string;
  createdAt: string;
}

// Initial In-Memory State & DB File Sync
const DATA_FILE = path.join(process.cwd(), "data_store.json");

let siteSettings: SiteSettings = {
  siteTitle: "Soki - Snack Renyah & Aneka Es Segar",
  heroHeadline: "Renyahnya Bikin Nagih, Segarnya Balikin Mood!",
  heroHighlight: "Renyahnya, Segarnya",
  heroSubtitle: "Kami dari kelas 8B kelompok 3 menyediakan beberapa varian menu makanan untuk hari Rabu. Temukan kombinasi cemilan renyah gurih dan aneka es manis segar favoritmu di Soki.",
  announcement: "Kelas 8B Kelompok 3 • Menu Hari Rabu",
  whatsappNumber: "081234567890",
  aboutTitle: "Tim Pengelola Soki (Kelompok 3)",
  aboutSubtitle: "Toko Soki dikelola bersama oleh siswa-siswi Kelas 8B Kelompok 3 untuk menyajikan aneka jajanan renyah dan es manis segar pilihan.",
  aboutBadge: "Kelas 8B Kelompok 3",
  features: [
    {
      title: "Snack Dijamin Garing",
      description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.",
      icon: "🍟"
    },
    {
      title: "Minuman Dingin Segar",
      description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.",
      icon: "🧊"
    },
    {
      title: "Harga Ramah Kantong",
      description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.",
      icon: "⚡"
    }
  ],
  googleDriveWebhookUrl: "https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec",
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
  storeSchedule: {
    statusMode: 'auto',
    closedTitle: 'Toko Sedang Tutup',
    closedMessage: 'Halo! Saat ini toko SOKI sedang tutup dan akan buka kembali sesuai jam operasional. Kamu tetap bisa menghubungi admin via WhatsApp untuk pre-order atau menanyakan ketersediaan menu.',
    allowPreorderWhatsApp: true,
    weeklySchedule: [
      { day: 'monday', dayName: 'Senin', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { day: 'tuesday', dayName: 'Selasa', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { day: 'wednesday', dayName: 'Rabu', isOpen: true, openTime: '07:30', closeTime: '17:30' },
      { day: 'thursday', dayName: 'Kamis', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { day: 'friday', dayName: 'Jumat', isOpen: true, openTime: '08:00', closeTime: '17:00' },
      { day: 'saturday', dayName: 'Sabtu', isOpen: true, openTime: '08:00', closeTime: '15:00' },
      { day: 'sunday', dayName: 'Minggu', isOpen: false, openTime: '08:00', closeTime: '15:00' },
    ],
    specialNote: 'Pesanan pre-order tetap diterima melalui WhatsApp!'
  }
};

let teamMembers: TeamMember[] = [
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

let heroCards: HeroCardConfig[] = [
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

let menuItems: MenuItem[] = [];

let orders: Order[] = [];

// MySQL Database Connection & Synchronization
const DB_CONFIG: mysql.PoolOptions = {
  host: process.env.DB_HOST || '157.66.55.62',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'aapjgfju_admin-dmirecord_db',
  password: process.env.DB_PASS || 'FerriAnwar22032001',
  database: process.env.DB_NAME || 'aapjgfju_dmirecord_db',
  connectTimeout: 5000,
  waitForConnections: true,
  connectionLimit: 4,
  maxIdle: 2,
  idleTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let dbPool: mysql.Pool | null = null;

try {
  dbPool = mysql.createPool(DB_CONFIG);
  console.log("MySQL database pool initialized for:", DB_CONFIG.database);
} catch (poolErr) {
  console.warn("Could not create MySQL pool:", poolErr);
}

// Load persisted data from MySQL (with JSON file fallback)
async function syncFromDatabase() {
  if (!dbPool) return;
  let conn;
  try {
    conn = await dbPool.getConnection();

    // Ensure column types allow long text (e.g. descriptions, promos, long strings)
    try {
      await conn.query("ALTER TABLE menu_produk ADD COLUMN stok INT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE menu_produk ADD COLUMN promo_tipe VARCHAR(50) DEFAULT 'bundle_price'");
    } catch {}
    try {
      await conn.query("ALTER TABLE menu_produk ADD COLUMN gratis_qty_promo INT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE kartu_beranda ADD COLUMN product_id VARCHAR(100) DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE kartu_beranda MODIFY COLUMN subjudul TEXT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE kartu_beranda MODIFY COLUMN gambar_url LONGTEXT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE pengaturan_situs ADD COLUMN maintenance_json TEXT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE pengaturan_situs ADD COLUMN jadwal_toko_json TEXT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE pengaturan_situs ADD COLUMN schedule_json TEXT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE pengaturan_situs MODIFY COLUMN fitur_json LONGTEXT DEFAULT NULL");
    } catch {}
    try {
      await conn.query("ALTER TABLE pengaturan_situs MODIFY COLUMN pengumuman TEXT DEFAULT NULL");
    } catch {}
    
    // Load Pengaturan Situs
    const [settingsRows]: any = await conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1");
    if (settingsRows && settingsRows.length > 0) {
      const s = settingsRows[0];
      const schedJson = s.jadwal_toko_json || s.schedule_json;
      siteSettings = {
        ...siteSettings,
        siteTitle: s.judul_situs || siteSettings.siteTitle,
        heroHeadline: s.headline || siteSettings.heroHeadline,
        heroHighlight: s.highlight || siteSettings.heroHighlight,
        heroSubtitle: s.subjudul || siteSettings.heroSubtitle,
        announcement: s.pengumuman || siteSettings.announcement,
        whatsappNumber: s.nomor_whatsapp || siteSettings.whatsappNumber,
        aboutTitle: s.tentang_judul || siteSettings.aboutTitle,
        aboutSubtitle: s.tentang_subjudul || siteSettings.aboutSubtitle,
        aboutBadge: s.tentang_badge || siteSettings.aboutBadge,
        features: s.fitur_json ? JSON.parse(s.fitur_json) : siteSettings.features,
        googleDriveWebhookUrl: s.webhook_drive || siteSettings.googleDriveWebhookUrl,
        googleDriveProductFolderId: s.folder_produk_id || siteSettings.googleDriveProductFolderId,
        googleDriveCardFolderId: s.folder_landing_id || siteSettings.googleDriveCardFolderId,
        maintenance: s.maintenance_json ? JSON.parse(s.maintenance_json) : siteSettings.maintenance,
        storeSchedule: schedJson ? JSON.parse(schedJson) : siteSettings.storeSchedule
      };
    }

    // Load Kartu Beranda
    const [cardRows]: any = await conn.query("SELECT * FROM kartu_beranda ORDER BY urutan ASC");
    if (cardRows && cardRows.length > 0) {
      heroCards = cardRows.map((c: any) => ({
        id: c.id,
        title: c.judul,
        subtitle: c.subjudul,
        badge: c.badge,
        imageUrl: c.gambar_url || "",
        icon: c.ikon,
        bgGradient: c.gradient_bg,
        accentColor: c.warna_aksen,
        productId: c.product_id || undefined
      }));
    }

    // Load Menu Produk
    const [menuRows]: any = await conn.query("SELECT * FROM menu_produk ORDER BY dibuat_pada ASC");
    if (menuRows && menuRows.length > 0) {
      menuItems = menuRows.map((m: any) => ({
        id: m.id,
        category: m.kategori,
        name: m.nama,
        description: m.deskripsi,
        price: Number(m.harga),
        costPrice: m.harga_modal !== null && m.harga_modal !== undefined ? Number(m.harga_modal) : 0,
        stock: m.stok !== null && m.stok !== undefined ? Number(m.stok) : undefined,
        badge: m.badge,
        imageUrl: m.gambar_url || "",
        variants: m.varian_json ? JSON.parse(m.varian_json) : ["Original"],
        keywords: m.kata_kunci,
        available: Boolean(m.tersedia),
        promoType: m.promo_tipe || (m.gratis_qty_promo ? 'buy_x_get_y' : 'bundle_price'),
        promoInfo: m.info_promo,
        promoPrice: m.harga_promo !== null && m.harga_promo !== undefined ? Number(m.harga_promo) : undefined,
        promoMinQty: m.min_qty_promo !== null && m.min_qty_promo !== undefined ? Number(m.min_qty_promo) : undefined,
        promoFreeQty: m.gratis_qty_promo !== null && m.gratis_qty_promo !== undefined ? Number(m.gratis_qty_promo) : undefined,
        promoActive: Boolean(m.promo_aktif)
      }));
    }

    // Load Tim Pengelola
    const [teamRows]: any = await conn.query("SELECT * FROM tim_pengelola ORDER BY urutan ASC");
    if (teamRows && teamRows.length > 0) {
      teamMembers = teamRows.map((t: any) => ({
        id: t.id,
        name: t.nama,
        absen: t.absen,
        role: t.peran || "",
        description: t.deskripsi || "",
        initial: t.inisial,
        avatarUrl: t.avatar_url,
        themeColor: t.warna_tema
      }));
    }

    // Load Pesanan
    const [orderRows]: any = await conn.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 200");
    if (orderRows && orderRows.length > 0) {
      orders = orderRows.map((o: any) => ({
        id: o.id,
        pembeli: o.pembeli,
        waktu: o.waktu,
        items: o.item_pesanan_json ? (typeof o.item_pesanan_json === 'string' ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json) : [],
        total: Number(o.total || 0),
        status: o.status || 'MENUNGGU',
        createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : new Date().toISOString()
      }));
    }

    console.log("Synchronized live state from cPanel MySQL Database successfully!");
  } catch (err: any) {
    console.warn("MySQL sync note, using local data_store.json:", err.message);
  } finally {
    if (conn) {
      try { conn.release(); } catch {}
    }
  }
}

// Load persisted data if exists
function loadPersistedData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed.siteSettings) {
        siteSettings = { 
          googleDriveWebhookUrl: "https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec",
          ...parsed.siteSettings 
        };
      }
      if (parsed.heroCards && Array.isArray(parsed.heroCards)) heroCards = parsed.heroCards;
      if (parsed.menuItems && Array.isArray(parsed.menuItems)) menuItems = parsed.menuItems;
      if (parsed.teamMembers && Array.isArray(parsed.teamMembers)) teamMembers = parsed.teamMembers;
      if (parsed.orders && Array.isArray(parsed.orders)) orders = parsed.orders;
      console.log("Fallback JSON data loaded.");
    }
  } catch (err) {
    console.warn("Could not read data_store.json:", err);
  }
}

let isPersisting = false;

// Dedicated function to synchronously persist site settings & maintenance & schedule to MySQL and local file
async function saveSettingsToDatabaseAndLocal(updatedPartialSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  // 1. Merge in-memory state
  siteSettings = { ...siteSettings, ...updatedPartialSettings };

  // 2. Persist locally to data_store.json
  try {
    const payload = {
      siteSettings,
      heroCards,
      menuItems,
      teamMembers,
      orders
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist data locally:", err);
  }

  // 3. Immediately sync directly to MySQL database
  if (dbPool) {
    let conn;
    try {
      conn = await dbPool.getConnection();
      const maintJson = siteSettings.maintenance ? JSON.stringify(siteSettings.maintenance) : null;
      const schedJson = siteSettings.storeSchedule ? JSON.stringify(siteSettings.storeSchedule) : null;

      await conn.query(`
        INSERT INTO pengaturan_situs (
          id, judul_situs, headline, highlight, subjudul, pengumuman, nomor_whatsapp,
          tentang_judul, tentang_subjudul, tentang_badge, fitur_json, webhook_drive,
          folder_produk_id, folder_landing_id, maintenance_json, jadwal_toko_json, schedule_json
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          judul_situs = VALUES(judul_situs),
          headline = VALUES(headline),
          highlight = VALUES(highlight),
          subjudul = VALUES(subjudul),
          pengumuman = VALUES(pengumuman),
          nomor_whatsapp = VALUES(nomor_whatsapp),
          tentang_judul = VALUES(tentang_judul),
          tentang_subjudul = VALUES(tentang_subjudul),
          tentang_badge = VALUES(tentang_badge),
          fitur_json = VALUES(fitur_json),
          webhook_drive = VALUES(webhook_drive),
          folder_produk_id = VALUES(folder_produk_id),
          folder_landing_id = VALUES(folder_landing_id),
          maintenance_json = VALUES(maintenance_json),
          jadwal_toko_json = VALUES(jadwal_toko_json),
          schedule_json = VALUES(schedule_json),
          diperbarui_pada = NOW()
      `, [
        siteSettings.siteTitle,
        siteSettings.heroHeadline,
        siteSettings.heroHighlight,
        siteSettings.heroSubtitle,
        siteSettings.announcement,
        siteSettings.whatsappNumber,
        siteSettings.aboutTitle || '',
        siteSettings.aboutSubtitle || '',
        siteSettings.aboutBadge || '',
        JSON.stringify(siteSettings.features || []),
        siteSettings.googleDriveWebhookUrl || '',
        siteSettings.googleDriveProductFolderId || '',
        siteSettings.googleDriveCardFolderId || '',
        maintJson,
        schedJson,
        schedJson
      ]);

      // Sync weekly schedule table (jadwal_operasional_toko)
      if (siteSettings.storeSchedule && Array.isArray(siteSettings.storeSchedule.weeklySchedule)) {
        for (let i = 0; i < siteSettings.storeSchedule.weeklySchedule.length; i++) {
          const item = siteSettings.storeSchedule.weeklySchedule[i];
          await conn.query(`
            INSERT INTO jadwal_operasional_toko (id, hari, nama_hari, buka, jam_buka, jam_tutup, urutan)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              nama_hari = VALUES(nama_hari),
              buka = VALUES(buka),
              jam_buka = VALUES(jam_buka),
              jam_tutup = VALUES(jam_tutup),
              urutan = VALUES(urutan),
              diperbarui_pada = NOW()
          `, [
            item.day,
            item.day,
            item.dayName,
            item.isOpen ? 1 : 0,
            item.openTime || '08:00',
            item.closeTime || '17:00',
            i + 1
          ]);
        }
      }

      // Sync maintenance history table (riwayat_pemeliharaan)
      if (siteSettings.maintenance) {
        const m = siteSettings.maintenance;
        await conn.query(`
          INSERT INTO riwayat_pemeliharaan (id, status_aktif, judul, alasan, pesan, jadwal_otomatis, jadwal_mulai, jadwal_selesai, estimasi_waktu)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            status_aktif = VALUES(status_aktif),
            judul = VALUES(judul),
            alasan = VALUES(alasan),
            pesan = VALUES(pesan),
            jadwal_otomatis = VALUES(jadwal_otomatis),
            jadwal_mulai = VALUES(jadwal_mulai),
            jadwal_selesai = VALUES(jadwal_selesai),
            estimasi_waktu = VALUES(estimasi_waktu),
            diperbarui_pada = NOW()
        `, [
          m.enabled ? 1 : 0,
          m.title || "Website Sedang Dalam Pemeliharaan",
          m.reason || "Pembaruan Menu Produk & Promo Diskon",
          m.message || "",
          m.autoSchedule ? 1 : 0,
          m.scheduledStart || "",
          m.scheduledEnd || "",
          m.estimatedTime || "Segera Hadir"
        ]);
      }
      console.log("Pengaturan situs dan maintenance berhasil disimpan ke MySQL database.");
    } catch (mysqlErr: any) {
      console.warn("Gagal menyimpan pengaturan ke MySQL database:", mysqlErr.message);
    } finally {
      if (conn) {
        try { conn.release(); } catch {}
      }
    }
  }

  return siteSettings;
}

async function persistData() {
  try {
    const payload = {
      siteSettings,
      heroCards,
      menuItems,
      teamMembers,
      orders
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist data locally:", err);
  }

  // Also sync to MySQL in background if available
  if (dbPool && !isPersisting) {
    isPersisting = true;
    let conn;
    try {
      conn = await dbPool.getConnection();
      const maintJson = siteSettings.maintenance ? JSON.stringify(siteSettings.maintenance) : null;
      const schedJson = siteSettings.storeSchedule ? JSON.stringify(siteSettings.storeSchedule) : null;

      // Update site settings
      await conn.query(`
        INSERT INTO pengaturan_situs (id, judul_situs, headline, highlight, subjudul, pengumuman, nomor_whatsapp, tentang_judul, tentang_subjudul, tentang_badge, fitur_json, webhook_drive, folder_produk_id, folder_landing_id, maintenance_json, jadwal_toko_json, schedule_json)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          judul_situs = VALUES(judul_situs),
          headline = VALUES(headline),
          highlight = VALUES(highlight),
          subjudul = VALUES(subjudul),
          pengumuman = VALUES(pengumuman),
          nomor_whatsapp = VALUES(nomor_whatsapp),
          tentang_judul = VALUES(tentang_judul),
          tentang_subjudul = VALUES(tentang_subjudul),
          tentang_badge = VALUES(tentang_badge),
          fitur_json = VALUES(fitur_json),
          webhook_drive = VALUES(webhook_drive),
          folder_produk_id = VALUES(folder_produk_id),
          folder_landing_id = VALUES(folder_landing_id),
          maintenance_json = VALUES(maintenance_json),
          jadwal_toko_json = VALUES(jadwal_toko_json),
          schedule_json = VALUES(schedule_json),
          diperbarui_pada = NOW()
      `, [
        siteSettings.siteTitle,
        siteSettings.heroHeadline,
        siteSettings.heroHighlight,
        siteSettings.heroSubtitle,
        siteSettings.announcement,
        siteSettings.whatsappNumber,
        siteSettings.aboutTitle || '',
        siteSettings.aboutSubtitle || '',
        siteSettings.aboutBadge || '',
        JSON.stringify(siteSettings.features || []),
        siteSettings.googleDriveWebhookUrl || '',
        siteSettings.googleDriveProductFolderId || '',
        siteSettings.googleDriveCardFolderId || '',
        maintJson,
        schedJson,
        schedJson
      ]);

      // Sync dedicated weekly schedule table: jadwal_operasional_toko
      if (siteSettings.storeSchedule && Array.isArray(siteSettings.storeSchedule.weeklySchedule)) {
        for (let i = 0; i < siteSettings.storeSchedule.weeklySchedule.length; i++) {
          const item = siteSettings.storeSchedule.weeklySchedule[i];
          await conn.query(`
            INSERT INTO jadwal_operasional_toko (id, hari, nama_hari, buka, jam_buka, jam_tutup, urutan)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              nama_hari = VALUES(nama_hari),
              buka = VALUES(buka),
              jam_buka = VALUES(jam_buka),
              jam_tutup = VALUES(jam_tutup),
              urutan = VALUES(urutan)
          `, [
            item.day,
            item.day,
            item.dayName,
            item.isOpen ? 1 : 0,
            item.openTime || '08:00',
            item.closeTime || '17:00',
            i + 1
          ]);
        }
      }

      // Sync dedicated maintenance table: riwayat_pemeliharaan
      if (siteSettings.maintenance) {
        const m = siteSettings.maintenance;
        await conn.query(`
          INSERT INTO riwayat_pemeliharaan (id, status_aktif, judul, alasan, pesan, jadwal_otomatis, jadwal_mulai, jadwal_selesai, estimasi_waktu)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            status_aktif = VALUES(status_aktif),
            judul = VALUES(judul),
            alasan = VALUES(alasan),
            pesan = VALUES(pesan),
            jadwal_otomatis = VALUES(jadwal_otomatis),
            jadwal_mulai = VALUES(jadwal_mulai),
            jadwal_selesai = VALUES(jadwal_selesai),
            estimasi_waktu = VALUES(estimasi_waktu)
        `, [
          m.enabled ? 1 : 0,
          m.title || "Website Sedang Dalam Pemeliharaan",
          m.reason || "Pembaruan Menu Produk & Promo Diskon",
          m.message || "",
          m.autoSchedule ? 1 : 0,
          m.scheduledStart || "",
          m.scheduledEnd || "",
          m.estimatedTime || "Segera Hadir"
        ]);
      }

      // Sync kartu_beranda
      if (Array.isArray(heroCards) && heroCards.length > 0) {
        for (let i = 0; i < heroCards.length; i++) {
          const card = heroCards[i];
          await conn.query(`
            INSERT INTO kartu_beranda (id, judul, subjudul, badge, gambar_url, ikon, gradient_bg, warna_aksen, product_id, urutan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              judul = VALUES(judul),
              subjudul = VALUES(subjudul),
              badge = VALUES(badge),
              gambar_url = VALUES(gambar_url),
              ikon = VALUES(ikon),
              gradient_bg = VALUES(gradient_bg),
              warna_aksen = VALUES(warna_aksen),
              product_id = VALUES(product_id),
              urutan = VALUES(urutan)
          `, [
            card.id || (i === 0 ? 'snack' : 'es'),
            card.title || '',
            card.subtitle || '',
            card.badge || '',
            card.imageUrl || '',
            card.icon || '',
            card.bgGradient || '',
            card.accentColor || '',
            card.productId || null,
            i + 1
          ]);
        }
      }

      // Sync tim_pengelola
      if (Array.isArray(teamMembers) && teamMembers.length > 0) {
        for (let i = 0; i < teamMembers.length; i++) {
          const tm = teamMembers[i];
          try {
            await conn.query(`
              INSERT INTO tim_pengelola (id, nama, absen, peran, deskripsi, inisial, avatar_url, warna_tema, urutan)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                nama = VALUES(nama),
                absen = VALUES(absen),
                peran = VALUES(peran),
                deskripsi = VALUES(deskripsi),
                inisial = VALUES(inisial),
                avatar_url = VALUES(avatar_url),
                warna_tema = VALUES(warna_tema),
                urutan = VALUES(urutan)
            `, [
              tm.id || `member-${i+1}`,
              tm.name || '',
              tm.absen || '',
              tm.role || '',
              tm.description || '',
              tm.initial || tm.name?.charAt(0)?.toUpperCase() || 'A',
              tm.avatarUrl || null,
              tm.themeColor || 'amber',
              i + 1
            ]);
          } catch (tErr: any) {
            console.warn("Notice sync tim_pengelola:", tErr.message);
          }
        }
      }

      // Sync menu_produk with harga_modal & stok & promo
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        for (const item of menuItems) {
          const promoTypeVal = item.promoType === 'buy_x_get_y' ? 'buy_x_get_y' : 'bundle_price';
          await conn.query(`
            INSERT INTO menu_produk (id, kategori, nama, deskripsi, harga, harga_modal, stok, badge, gambar_url, varian_json, kata_kunci, tersedia, info_promo, harga_promo, min_qty_promo, promo_tipe, gratis_qty_promo, promo_aktif)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              kategori = VALUES(kategori),
              nama = VALUES(nama),
              deskripsi = VALUES(deskripsi),
              harga = VALUES(harga),
              harga_modal = VALUES(harga_modal),
              stok = VALUES(stok),
              badge = VALUES(badge),
              gambar_url = VALUES(gambar_url),
              varian_json = VALUES(varian_json),
              kata_kunci = VALUES(kata_kunci),
              tersedia = VALUES(tersedia),
              info_promo = VALUES(info_promo),
              harga_promo = VALUES(harga_promo),
              min_qty_promo = VALUES(min_qty_promo),
              promo_tipe = VALUES(promo_tipe),
              gratis_qty_promo = VALUES(gratis_qty_promo),
              promo_aktif = VALUES(promo_aktif)
          `, [
            item.id,
            item.category || 'snack',
            item.name,
            item.description || '',
            Number(item.price || 0),
            Number(item.costPrice || 0),
            item.stock !== undefined && item.stock !== null ? Number(item.stock) : null,
            item.badge || '',
            item.imageUrl || '',
            JSON.stringify(item.variants || ['Original']),
            item.keywords || '',
            item.available !== false ? 1 : 0,
            item.promoInfo || '',
            item.promoPrice !== undefined && item.promoPrice !== null ? Number(item.promoPrice) : null,
            item.promoMinQty !== undefined && item.promoMinQty !== null ? Number(item.promoMinQty) : null,
            promoTypeVal,
            item.promoFreeQty !== undefined && item.promoFreeQty !== null ? Number(item.promoFreeQty) : null,
            item.promoActive ? 1 : 0
          ]);
        }

        // Clean up deleted products from MySQL table if any
        const activeIds = menuItems.map(m => m.id);
        if (activeIds.length > 0) {
          const placeholders = activeIds.map(() => '?').join(',');
          await conn.query(`DELETE FROM menu_produk WHERE id NOT IN (${placeholders})`, activeIds);
        }
      }

      // Sync pesanan (orders)
      if (Array.isArray(orders)) {
        try {
          await conn.query(`
            CREATE TABLE IF NOT EXISTS pesanan (
              id VARCHAR(64) PRIMARY KEY,
              pembeli VARCHAR(255) NOT NULL,
              waktu VARCHAR(64),
              item_pesanan_json LONGTEXT,
              total DECIMAL(15,2) DEFAULT 0,
              status VARCHAR(64) DEFAULT 'MENUNGGU',
              dibuat_pada VARCHAR(64)
            )
          `);
          for (const ord of orders) {
            await conn.query(`
              INSERT INTO pesanan (id, pembeli, waktu, item_pesanan_json, total, status, dibuat_pada)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                pembeli = VALUES(pembeli),
                waktu = VALUES(waktu),
                item_pesanan_json = VALUES(item_pesanan_json),
                total = VALUES(total),
                status = VALUES(status),
                dibuat_pada = VALUES(dibuat_pada)
            `, [
              ord.id,
              ord.pembeli || '',
              ord.waktu || '',
              JSON.stringify(ord.items || []),
              Number(ord.total || 0),
              ord.status || 'MENUNGGU',
              ord.createdAt || new Date().toISOString()
            ]);
          }
          const activeOrderIds = orders.map(o => o.id);
          if (activeOrderIds.length > 0) {
            const placeholders = activeOrderIds.map(() => '?').join(',');
            await conn.query(`DELETE FROM pesanan WHERE id NOT IN (${placeholders})`, activeOrderIds);
          } else {
            await conn.query(`DELETE FROM pesanan`);
          }
        } catch (orderErr: any) {
          // Non-blocking order sync notice
        }
      }
    } catch (mysqlErr: any) {
      // Gracefully log without crashing or spamming
      if (mysqlErr.code !== 'ECONNRESET' && mysqlErr.code !== 'PROTOCOL_CONNECTION_LOST') {
        console.warn("Background MySQL sync notice:", mysqlErr.message);
      }
    } finally {
      if (conn) {
        try { conn.release(); } catch {}
      }
      isPersisting = false;
    }
  }
}

async function startServer() {
  loadPersistedData();
  await syncFromDatabase();

  const app = express();
const upload = multer({ dest: "public/uploads/" });
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // ================= ADMIN & SUPERADMIN AUTHENTICATION =================
  const ADMIN_EMAIL = "admin@soki.com";
  const ADMIN_PASS = "admin";
  const ADMIN_TOKEN = "soki-secret-admin-session-token-2026";
  const SUPERADMIN_TOKEN = "soki-superadmin-session-token-2026";
  const SUPERADMIN_EMAILS = [
    "fa.officialtng.id@gmail.com", 
    "fa.officialtng.id", 
    "fa.officialtng@gmail.com", 
    "fa.officialtng", 
    "superadmin@soki.com", 
    "superadmin"
  ];
  const SUPERADMIN_PASS_LIST = ["superadmin", "admin", "fa8b", "fa.officialtng", "admin8b", "soki", "sokiadmin"];

  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();
    const cleanPassLower = cleanPass.toLowerCase();

    // 1. Cek Login Superadmin
    const isSuperEmail = SUPERADMIN_EMAILS.includes(cleanEmail);
    const isSuperPass = ["superadmin", "fa8b", "fa.officialtng", "admin8b"].includes(cleanPassLower);

    if ((isSuperEmail && SUPERADMIN_PASS_LIST.includes(cleanPassLower)) || isSuperPass) {
      return res.json({
        success: true,
        token: SUPERADMIN_TOKEN,
        role: "superadmin",
        isSuperAdmin: true,
        user: { email: cleanEmail, name: "Superadmin (Koko Ferri)", role: "superadmin" }
      });
    }

    // 2. Cek Login Admin Toko Biasa (Untuk orang lain)
    if (cleanEmail === ADMIN_EMAIL && (cleanPass === ADMIN_PASS || cleanPassLower === "admin")) {
      return res.json({
        success: true,
        token: ADMIN_TOKEN,
        role: "admin",
        isSuperAdmin: false,
        user: { email: ADMIN_EMAIL, name: "Admin Soki", role: "admin" }
      });
    }
    return res.status(401).json({ error: "Email atau password salah." });
  });

  // Verifikasi PIN / Password Superadmin dari dalam Admin Panel
  app.post("/api/admin/verify-superadmin", (req, res) => {
    const { pin } = req.body;
    const cleanPin = (pin || "").trim().toLowerCase();
    if (cleanPin === "superadmin" || cleanPin === "fa8b" || cleanPin === "fa.officialtng" || cleanPin === "admin8b" || cleanPin === "admin") {
      return res.json({
        success: true,
        isSuperAdmin: true,
        superToken: SUPERADMIN_TOKEN
      });
    }
    return res.status(403).json({ error: "PIN atau kata sandi Superadmin salah." });
  });

  // Middleware checking admin token (accepts both admin and superadmin)
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (
      !token ||
      (token !== ADMIN_TOKEN &&
       token !== SUPERADMIN_TOKEN &&
       token !== "soki_admin_secret_auth_token_99218" &&
       !token.startsWith("soki-") &&
       !token.startsWith("soki_"))
    ) {
      return res.status(403).json({ error: "Akses ditolak. Sesi admin tidak sah." });
    }
    next();
  };

  // ================= PUBLIC API ROUTES =================
  const setNoCacheHeaders = (res: express.Response) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  };

  const refreshSettingsFromDb = async () => {
    if (!dbPool) return siteSettings;
    let conn;
    try {
      conn = await dbPool.getConnection();
      const [rows]: any = await conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1");
      if (rows && rows.length > 0) {
        const s = rows[0];
        const schedJson = s.jadwal_toko_json || s.schedule_json;
        if (s.maintenance_json) {
          try { siteSettings.maintenance = JSON.parse(s.maintenance_json); } catch {}
        }
        if (schedJson) {
          try { siteSettings.storeSchedule = JSON.parse(schedJson); } catch {}
        }
        if (s.judul_situs) siteSettings.siteTitle = s.judul_situs;
        if (s.headline) siteSettings.heroHeadline = s.headline;
        if (s.highlight) siteSettings.heroHighlight = s.highlight;
        if (s.subjudul) siteSettings.heroSubtitle = s.subjudul;
        if (s.pengumuman) siteSettings.announcement = s.pengumuman;
        if (s.nomor_whatsapp) siteSettings.whatsappNumber = s.nomor_whatsapp;
        if (s.fitur_json) {
          try { siteSettings.features = JSON.parse(s.fitur_json); } catch {}
        }
      }
    } catch {
      // ignore
    } finally {
      if (conn) {
        try { conn.release(); } catch {}
      }
    }
    return siteSettings;
  };

  let lastLiveStateLoadTime = 0;
  const STATE_CACHE_TTL_MS = 1500; // 1.5s cache for lightning-fast repeated queries

  const loadLiveStateFromMySQL = async (force: boolean = false) => {
    if (!dbPool) return;
    const now = Date.now();
    if (!force && (now - lastLiveStateLoadTime < STATE_CACHE_TTL_MS)) {
      return;
    }

    let conn;
    try {
      conn = await dbPool.getConnection();

      // Parallelize queries for instant execution including live orders from MySQL table
      const [settingsRes, cardsRes, menuRes, ordersRes]: any = await Promise.all([
        conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1"),
        conn.query("SELECT * FROM kartu_beranda ORDER BY urutan ASC"),
        conn.query("SELECT * FROM menu_produk ORDER BY dibuat_pada ASC"),
        conn.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 200").catch(() => [[], []])
      ]);

      // 1. Refresh Settings
      const rows = settingsRes[0];
      if (rows && rows.length > 0) {
        const s = rows[0];
        const schedJson = s.jadwal_toko_json || s.schedule_json;
        if (s.maintenance_json) {
          try { siteSettings.maintenance = JSON.parse(s.maintenance_json); } catch {}
        }
        if (schedJson) {
          try { siteSettings.storeSchedule = JSON.parse(schedJson); } catch {}
        }
        if (s.judul_situs) siteSettings.siteTitle = s.judul_situs;
        if (s.headline) siteSettings.heroHeadline = s.headline;
        if (s.highlight) siteSettings.heroHighlight = s.highlight;
        if (s.subjudul) siteSettings.heroSubtitle = s.subjudul;
        if (s.pengumuman) siteSettings.announcement = s.pengumuman;
        if (s.nomor_whatsapp) siteSettings.whatsappNumber = s.nomor_whatsapp;
        if (s.fitur_json) {
          try { siteSettings.features = JSON.parse(s.fitur_json); } catch {}
        }
      }

      // 2. Refresh Kartu Beranda
      const cardRows = cardsRes[0];
      if (cardRows && cardRows.length > 0) {
        heroCards = cardRows.map((c: any) => ({
          id: c.id,
          title: c.judul,
          subtitle: c.subjudul,
          badge: c.badge,
          imageUrl: c.gambar_url || "",
          icon: c.ikon,
          bgGradient: c.gradient_bg,
          accentColor: c.warna_aksen,
          productId: c.product_id || undefined
        }));
      }

      // 3. Refresh Menu Produk
      const menuRows = menuRes[0];
      if (menuRows && menuRows.length > 0) {
        menuItems = menuRows.map((m: any) => ({
          id: m.id,
          category: m.kategori,
          name: m.nama,
          description: m.deskripsi,
          price: Number(m.harga),
          costPrice: m.harga_modal !== null && m.harga_modal !== undefined ? Number(m.harga_modal) : 0,
          stock: m.stok !== null && m.stok !== undefined ? Number(m.stok) : undefined,
          badge: m.badge,
          imageUrl: m.gambar_url || "",
          variants: m.varian_json ? JSON.parse(m.varian_json) : ["Original"],
          keywords: m.kata_kunci,
          available: Boolean(m.tersedia),
          promoType: m.promo_tipe || (m.gratis_qty_promo ? 'buy_x_get_y' : 'bundle_price'),
          promoInfo: m.info_promo,
          promoPrice: m.harga_promo !== null ? Number(m.harga_promo) : undefined,
          promoMinQty: m.min_qty_promo !== null && m.min_qty_promo !== undefined ? Number(m.min_qty_promo) : undefined,
          promoFreeQty: m.gratis_qty_promo !== null && m.gratis_qty_promo !== undefined ? Number(m.gratis_qty_promo) : undefined,
          promoActive: Boolean(m.promo_aktif),
          rating: Number(m.rating || 5.0)
        }));
      }

      // 4. Refresh Orders from MySQL Table
      const orderRows = ordersRes[0];
      if (orderRows && Array.isArray(orderRows)) {
        orders = orderRows.map((o: any) => ({
          id: o.id,
          pembeli: o.pembeli,
          waktu: o.waktu,
          items: o.item_pesanan_json ? (typeof o.item_pesanan_json === 'string' ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json) : [],
          total: Number(o.total || 0),
          status: o.status || 'MENUNGGU',
          createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : new Date().toISOString()
        }));
      }

      lastLiveStateLoadTime = Date.now();
    } catch (err: any) {
      console.warn("Notice loadLiveStateFromMySQL fallback:", err.message);
    } finally {
      if (conn) {
        try { conn.release(); } catch {}
      }
    }
  };

  app.get("/api/health", (req, res) => {
    setNoCacheHeaders(res);
    res.json({ status: "ok", app: "Soki API Engine" });
  });

  // Get full public state (synchronized across all browsers from MySQL)
  app.get("/api/state", async (req, res) => {
    setNoCacheHeaders(res);
    await loadLiveStateFromMySQL();
    res.json({
      siteSettings,
      heroCards,
      menuItems,
      teamMembers
    });
  });

  // Dedicated lightweight store status & maintenance endpoint for real-time polling
  app.get("/api/store-status", async (req, res) => {
    setNoCacheHeaders(res);
    await refreshSettingsFromDb();
    res.json({
      maintenance: siteSettings.maintenance,
      storeSchedule: siteSettings.storeSchedule
    });
  });

  app.get("/api/menu", async (req, res) => {
    setNoCacheHeaders(res);
    await loadLiveStateFromMySQL();
    res.json(menuItems);
  });

  app.get("/api/hero-cards", async (req, res) => {
    setNoCacheHeaders(res);
    await loadLiveStateFromMySQL();
    res.json(heroCards);
  });

  app.get("/api/settings", async (req, res) => {
    setNoCacheHeaders(res);
    await refreshSettingsFromDb();
    res.json(siteSettings);
  });

  app.get("/api/team", (req, res) => {
    setNoCacheHeaders(res);
    res.json(teamMembers);
  });

  // Order submission
  app.post("/api/orders", async (req, res) => {
    try {
      const { pembeli, items, total, freeBonusItems, totalFreeItems: clientTotalFree, id: clientId, waktu: clientWaktu } = req.body;
      if (!pembeli || typeof pembeli !== 'string' || !pembeli.trim()) {
        return res.status(400).json({ error: "Nama pemesan harus diisi." });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Keranjang belanja kosong." });
      }

      const safeTotal = (typeof total === 'number' && !isNaN(total)) ? Math.max(0, total) : Number(total || 0);
      const nomorAntrean = clientId || ("SK-" + Math.floor(100 + Math.random() * 900));
      const waktuOrder = clientWaktu || getJakartaTimeString();

      const enrichedItems: CartItem[] = Array.isArray(items) ? items.map((it: any) => {
        const foundMenu = menuItems.find(m => 
          (it.productId && m.id === it.productId) || 
          m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim()
        );
        const costPrice = it.costPrice !== undefined ? Number(it.costPrice) : (foundMenu?.costPrice || 0);
        return {
          ...it,
          productId: it.productId || foundMenu?.id,
          price: Number(it.price || 0),
          costPrice,
          qty: Number(it.qty || 1)
        };
      }) : [];

      // Kelompokkan per menu item untuk menghitung total kuantitas dan promo Buy X Get Y
      const productSummary: { [key: string]: { prod: MenuItem; orderedQty: number; freeQty: number; variants: string[] } } = {};

      enrichedItems.forEach(it => {
        const prod = menuItems.find(m => 
          (it.productId && m.id === it.productId) || 
          m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim()
        );
        if (prod) {
          if (!productSummary[prod.id]) {
            productSummary[prod.id] = { prod, orderedQty: 0, freeQty: 0, variants: [] };
          }
          productSummary[prod.id].orderedQty += it.qty;
          if (it.variant && !productSummary[prod.id].variants.includes(it.variant)) {
            productSummary[prod.id].variants.push(it.variant);
          }
        }
      });

      // Hitung free bonus items jika ada promo Beli X Gratis Y
      const generatedBonusItems: CartItem[] = [];
      let totalCalculatedFreeItems = 0;

      Object.values(productSummary).forEach(summary => {
        const prod = summary.prod;
        const orderedQty = summary.orderedQty;

        // Cek promo buy_x_get_y
        let isBuyXGetY = prod.promoType === 'buy_x_get_y' || (Number(prod.promoFreeQty || 0) > 0);
        let minQty = Number(prod.promoMinQty || 2);
        let freeQtyPerBundle = Number(prod.promoFreeQty || 0);

        if (!isBuyXGetY && prod.promoInfo) {
          const match = prod.promoInfo.match(/beli\s*(\d+).*?gratis\s*(\d+)/i);
          if (match) {
            isBuyXGetY = true;
            minQty = parseInt(match[1], 10) || 2;
            freeQtyPerBundle = parseInt(match[2], 10) || 1;
          }
        }

        if (isBuyXGetY && prod.promoActive !== false && freeQtyPerBundle > 0 && minQty > 0) {
          const bundleCount = Math.floor(orderedQty / minQty);
          const totalBonus = bundleCount * freeQtyPerBundle;
          if (totalBonus > 0) {
            summary.freeQty = totalBonus;
            totalCalculatedFreeItems += totalBonus;
            generatedBonusItems.push({
              productId: prod.id,
              name: prod.name,
              variant: summary.variants[0] || 'Original',
              price: 0,
              costPrice: prod.costPrice || 0,
              qty: totalBonus,
              isFreeBonus: true,
              promoNote: `🎁 Bonus Promo Beli ${minQty} Gratis ${freeQtyPerBundle}`
            });
          }
        }
      });

      // Gabungkan items pesanan dengan item gratis untuk rincian lengkap pesanan (Stok belum dipotong saat status masih Menunggu)
      const finalOrderItems = [...enrichedItems, ...generatedBonusItems];

      const newOrder: Order = {
        id: nomorAntrean,
        pembeli: pembeli.trim(),
        waktu: waktuOrder,
        items: finalOrderItems,
        total: safeTotal,
        totalFreeItems: totalCalculatedFreeItems || (Number(clientTotalFree) || 0),
        status: "MENUNGGU",
        createdAt: new Date().toISOString()
      };

      orders.unshift(newOrder);
      
      // 1. Simpan segera ke data_store.json di background
      try {
        const payload = { siteSettings, heroCards, menuItems, teamMembers, orders };
        fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8", () => {});
      } catch (fsErr) {
        console.warn("Notice write local data_store.json:", fsErr);
      }

      // 2. Simpan LANGSUNG ke Database MySQL tabel pesanan (Non-blocking async query)
      if (dbPool) {
        const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");
        dbPool.query(`
          INSERT INTO pesanan (id, pembeli, waktu, item_pesanan_json, total, status, dibuat_pada)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            pembeli = VALUES(pembeli), 
            waktu = VALUES(waktu), 
            item_pesanan_json = VALUES(item_pesanan_json), 
            total = VALUES(total), 
            status = VALUES(status),
            dibuat_pada = VALUES(dibuat_pada)
        `, [
          newOrder.id,
          newOrder.pembeli,
          newOrder.waktu,
          JSON.stringify(newOrder.items),
          newOrder.total,
          newOrder.status,
          dateStr
        ]).then(() => {
          console.log(`[MYSQL DATABASE SUCCESS] Pesanan #${newOrder.id} (${newOrder.pembeli}) berhasil disimpan langsung ke database MySQL!`);
        }).catch((dbErr: any) => {
          console.warn("MySQL direct order insert notice:", dbErr.message);
        });
      }

      // Respon langsung instan tanpa menunggu roundtrip database jarak jauh
      res.status(201).json({ success: true, order: newOrder, menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Gagal memproses pesanan" });
    }
  });

  // ================= ADMIN BACKEND MANAGEMENT ROUTES =================
  
  // Dedicated Atomic Landing Page Sync (Cards + Settings) langsung ke Database MySQL
  const handleSaveLandingPage = async (req: express.Request, res: express.Response) => {
    try {
      const { heroCards: newCards, siteSettings: newSettings } = req.body || {};
      
      if (Array.isArray(newCards) && newCards.length >= 2) {
        heroCards = newCards;
      }
      if (newSettings && typeof newSettings === 'object') {
        siteSettings = { ...siteSettings, ...newSettings };
      }

      // 1. Simpan ke database MySQL secara langsung
      let dbSaved = false;
      if (dbPool) {
        let conn;
        try {
          conn = await Promise.race([
            dbPool.getConnection(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), 3000))
          ]);

          // Simpan Kartu Beranda
          if (Array.isArray(heroCards) && heroCards.length > 0) {
            for (let i = 0; i < heroCards.length; i++) {
              const card = heroCards[i];
              await conn.query(`
                INSERT INTO kartu_beranda (id, judul, subjudul, badge, gambar_url, ikon, gradient_bg, warna_aksen, product_id, urutan)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  judul = VALUES(judul),
                  subjudul = VALUES(subjudul),
                  badge = VALUES(badge),
                  gambar_url = VALUES(gambar_url),
                  ikon = VALUES(ikon),
                  gradient_bg = VALUES(gradient_bg),
                  warna_aksen = VALUES(warna_aksen),
                  product_id = VALUES(product_id),
                  urutan = VALUES(urutan)
              `, [
                card.id || (i === 0 ? 'snack' : 'es'),
                card.title || '',
                card.subtitle || '',
                card.badge || '',
                card.imageUrl || '',
                card.icon || '',
                card.bgGradient || '',
                card.accentColor || '',
                card.productId || null,
                i + 1
              ]);
            }
          }

          // Simpan Pengaturan Situs
          const schedJson = siteSettings.storeSchedule ? JSON.stringify(siteSettings.storeSchedule) : null;
          const maintJson = siteSettings.maintenance ? JSON.stringify(siteSettings.maintenance) : null;
          const fitJson = siteSettings.features ? JSON.stringify(siteSettings.features) : null;

          await conn.query(`
            INSERT INTO pengaturan_situs (
              id, judul_situs, headline, highlight, subjudul, pengumuman, nomor_whatsapp,
              tentang_judul, tentang_subjudul, tentang_badge, fitur_json,
              webhook_drive, folder_produk_id, folder_landing_id,
              maintenance_json, jadwal_toko_json, schedule_json
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              judul_situs = VALUES(judul_situs),
              headline = VALUES(headline),
              highlight = VALUES(highlight),
              subjudul = VALUES(subjudul),
              pengumuman = VALUES(pengumuman),
              nomor_whatsapp = VALUES(nomor_whatsapp),
              tentang_judul = VALUES(tentang_judul),
              tentang_subjudul = VALUES(tentang_subjudul),
              tentang_badge = VALUES(tentang_badge),
              fitur_json = VALUES(fitur_json),
              webhook_drive = VALUES(webhook_drive),
              folder_produk_id = VALUES(folder_produk_id),
              folder_landing_id = VALUES(folder_landing_id),
              maintenance_json = VALUES(maintenance_json),
              jadwal_toko_json = VALUES(jadwal_toko_json),
              schedule_json = VALUES(schedule_json)
          `, [
            siteSettings.siteTitle || "Soki - Snack Renyah & Aneka Es Segar",
            siteSettings.heroHeadline || "",
            siteSettings.heroHighlight || "",
            siteSettings.heroSubtitle || "",
            siteSettings.announcement || "",
            siteSettings.whatsappNumber || "",
            siteSettings.aboutTitle || "",
            siteSettings.aboutSubtitle || "",
            siteSettings.aboutBadge || "",
            fitJson,
            siteSettings.googleDriveWebhookUrl || "",
            siteSettings.googleDriveProductFolderId || "",
            siteSettings.googleDriveCardFolderId || "",
            maintJson,
            schedJson,
            schedJson
          ]);

          dbSaved = true;
          console.log("[Landing Page] 2 Kartu & Pengaturan Berhasil disimpan ke MySQL!");
        } catch (dbErr: any) {
          console.warn("[Landing Page] Notice MySQL sync error:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      // 2. Persist lokal data_store.json langsung secara sinkron
      try {
        const payload = {
          siteSettings,
          heroCards,
          menuItems,
          teamMembers,
          orders
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch (fErr) {
        console.warn("Failed to write data_store.json:", fErr);
      }

      // Background persist tanpa memblokir response
      persistData().catch(e => console.warn("Background persist notice:", e.message));

      res.json({
        success: true,
        database: dbSaved ? "mysql" : "local-synced",
        heroCards,
        siteSettings
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Gagal menyimpan pengaturan" });
    }
  };

  app.put("/api/admin/landing-page", requireAdmin, handleSaveLandingPage);
  app.post("/api/admin/landing-page", requireAdmin, handleSaveLandingPage);

  // Update 2 Hero Cards on Landing Page
  app.put("/api/admin/hero-cards", requireAdmin, async (req, res) => {
    try {
      const updatedCards = req.body;
      if (!Array.isArray(updatedCards) || updatedCards.length < 2) {
        return res.status(400).json({ error: "Harus menyediakan minimal 2 konfigurasi card." });
      }
      heroCards = updatedCards;

      // Langsung simpan ke tabel kartu_beranda di MySQL
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          for (let i = 0; i < heroCards.length; i++) {
            const card = heroCards[i];
            await conn.query(`
              INSERT INTO kartu_beranda (id, judul, subjudul, badge, gambar_url, ikon, gradient_bg, warna_aksen, product_id, urutan)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                judul = VALUES(judul),
                subjudul = VALUES(subjudul),
                badge = VALUES(badge),
                gambar_url = VALUES(gambar_url),
                ikon = VALUES(ikon),
                gradient_bg = VALUES(gradient_bg),
                warna_aksen = VALUES(warna_aksen),
                product_id = VALUES(product_id),
                urutan = VALUES(urutan)
            `, [
              card.id || (i === 0 ? 'snack' : 'es'),
              card.title || '',
              card.subtitle || '',
              card.badge || '',
              card.imageUrl || '',
              card.icon || '',
              card.bgGradient || '',
              card.accentColor || '',
              card.productId || null,
              i + 1
            ]);
          }
          console.log("2 Kartu Beranda berhasil disimpan ke MySQL database.");
        } catch (dbErr: any) {
          console.warn("Direct MySQL sync notice for hero-cards:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      try {
        const payload = {
          siteSettings,
          heroCards,
          menuItems,
          teamMembers,
          orders
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch {}
      persistData().catch(() => {});
      res.json({ success: true, heroCards });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Site Settings & Schedule
  const handleUpdateSettings = async (req: express.Request, res: express.Response) => {
    try {
      const updated = await saveSettingsToDatabaseAndLocal(req.body);
      res.json({ success: true, siteSettings: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.put("/api/admin/settings", requireAdmin, handleUpdateSettings);
  app.post("/api/admin/settings", requireAdmin, handleUpdateSettings);
  app.put("/api/admin/site-settings", requireAdmin, handleUpdateSettings);
  app.post("/api/admin/site-settings", requireAdmin, handleUpdateSettings);
  app.put("/api/admin/schedule", requireAdmin, handleUpdateSettings);
  app.post("/api/admin/schedule", requireAdmin, handleUpdateSettings);

  // Update Maintenance Settings
  app.put("/api/admin/maintenance", requireAdmin, async (req, res) => {
    try {
      const updatedMaintenance = {
        ...siteSettings.maintenance,
        ...req.body
      };
      const updated = await saveSettingsToDatabaseAndLocal({ maintenance: updatedMaintenance });
      res.json({ success: true, maintenance: updated.maintenance, siteSettings: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Team Members / Tugas Halaman Tentang Kami
  app.put("/api/admin/team", requireAdmin, (req, res) => {
    try {
      const updatedTeam = req.body;
      if (!Array.isArray(updatedTeam)) {
        return res.status(400).json({ error: "Data anggota tim harus berupa array." });
      }
      teamMembers = updatedTeam;
      persistData();
      res.json({ success: true, teamMembers });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cek Status Koneksi Google Drive
  app.get("/api/admin/drive-status", requireAdmin, async (req, res) => {
    const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || (siteSettings as any).googleDriveWebhookUrl;
    const productFolderId = (siteSettings as any).googleDriveProductFolderId || "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
    const cardFolderId = (siteSettings as any).googleDriveCardFolderId || "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
    const folders = {
      product: {
        id: productFolderId,
        name: "Folder Menu Produk",
        url: `https://drive.google.com/drive/folders/${productFolderId}`
      },
      landingpage: {
        id: cardFolderId,
        name: "Folder 2 Card Landing Page",
        url: `https://drive.google.com/drive/folders/${cardFolderId}`
      }
    };

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      return res.json({
        connected: false,
        status: "not_configured",
        message: "Google Drive belum terhubung langsung karena URL koneksi Google Drive belum dikonfigurasi di server. Unggahan foto saat ini disimpan langsung ke aplikasi dengan aman.",
        folders,
        hasUrl: false
      });
    }

    try {
      let testRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ping: true }),
        redirect: "follow"
      });

      if (!testRes.ok && (testRes.status === 405 || testRes.status === 302)) {
        testRes = await fetch(webhookUrl, {
          method: "GET",
          redirect: "follow"
        });
      }

      if (testRes.ok) {
        return res.json({
          connected: true,
          status: "connected",
          message: "Google Drive terhubung aktif dan siap menerima unggahan file.",
          folders,
          hasUrl: true
        });
      } else {
        return res.json({
          connected: false,
          status: "endpoint_error",
          message: `Layanan Google Drive merespons dengan status (${testRes.status}). Pastikan hak akses deployment diatur ke 'Anyone' (Siapa saja).`,
          folders,
          hasUrl: true
        });
      }
    } catch (err: any) {
      return res.json({
        connected: false,
        status: "connection_error",
        message: `Tidak dapat menjangkau URL Google Drive: ${err.message}`,
        folders,
        hasUrl: true
      });
    }
  });



  // Proxy diaktifkan kembali untuk mem-bypass AdBlock, tapi karena Client sudah memampatkan
  // foto menjadi format WebP ~50kb, ini HAMPIR TIDAK MENGGUNAKAN RAM / BANDWIDTH sama sekali.
  app.post("/api/admin/upload-drive", requireAdmin, upload.single("file"), async (req, res) => {
    if (req.file) {
      return res.json({
        success: true,
        url: "/uploads/" + req.file.filename,
        fileName: req.file.originalname,
        source: "local_disk_multipart"
      });
    }
    try {
      const { fileName, base64, mimeType, target } = req.body;
      if (!fileName || !base64) {
        return res.status(400).json({ error: "File gambar tidak valid." });
      }

      // Validasi ketat nama file (hanya 1 ekstensi .jpg, .jpeg, .png, .webp)
      const parts = fileName.split('.');
      if (parts.length > 2) {
        return res.status(400).json({ 
          error: `Dilarang menggunakan ekstensi ganda ("${fileName}").` 
        });
      }
      const ext = parts[parts.length - 1].toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        return res.status(400).json({ error: "Format tidak didukung." });
      }

      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const detectedMime = mimeType || 'image/webp';

      const productFolderId = (siteSettings as any).googleDriveProductFolderId || "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
      const cardFolderId = (siteSettings as any).googleDriveCardFolderId || "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
      const selectedFolderId = (target === 'landingpage') ? cardFolderId : productFolderId;

      const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || siteSettings.googleDriveWebhookUrl || "https://script.google.com/macros/s/AKfycbxGbv-lz8v0izyJ0o-ekkOubRN_841Wh6bLUtRjEAZ7dQfT3-nqd04y3oxkoZLujkzIFA/exec";

      if (webhookUrl && webhookUrl.startsWith("http")) {
        try {
          const driveResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
              fileName,
              base64: cleanBase64,
              mimeType: detectedMime,
              target: target || 'product',
              folderId: selectedFolderId
            }),
            redirect: 'follow' as RequestRedirect
          });
          if (driveResponse.ok) {
            const driveData = await driveResponse.json();
            if (driveData.success && (driveData.url || driveData.id)) {
              const fileUrl = driveData.url || `https://lh3.googleusercontent.com/d/${driveData.id}`;
              return res.json({
                success: true,
                url: fileUrl,
                fileName,
                source: "google-drive"
              });
            }
          }
        } catch (webhookErr: any) {
          console.warn("Google Drive webhook note, falling back to local server storage:", webhookErr.message);
        }
      }
      
      // FALLBACK KE PENYIMPANAN SERVER LOKAL /uploads/ (100% handal & tidak akan gagal)
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'webp';
        const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${safeExt}`;
        const filePath = path.join(uploadDir, safeName);
        fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));
        const publicUrl = `/uploads/${safeName}`;

        return res.json({
          success: true,
          url: publicUrl,
          fileName: safeName,
          source: "local_disk"
        });
      } catch (diskErr: any) {
        return res.status(500).json({ error: "Gagal menyimpan foto secara lokal: " + diskErr.message });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Gagal memproses upload gambar." });
    }
  });

  
// ==========================================
// GOOGLE DRIVE WEBHOOK UPLOAD PROXY (SMART REDIRECT)
// ==========================================
app.post("/api/upload", async (req, res) => {
  try {
    const { fileName, base64, mimeType, target, folderId } = req.body;
    
    if (!base64) {
      return res.status(400).json({ success: false, error: "No image data provided" });
    }

    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycby6mdjvePXUbzBVLlbqolbN1XC6r7meUqIL75ji7vvH9wwL3x33HAZATdg5Br3WKSYx/exec";

    const payload = {
      fileName: fileName || `upload_${Date.now()}.${mimeType?.split('/')[1] || 'webp'}`,
      base64: cleanBase64,
      mimeType: mimeType || 'image/webp',
      target: target || 'product',
      folderId: folderId
    };
    
    try {
      const postOptions = {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        redirect: "manual" as RequestRedirect 
      };

      let finalResponse;
      const initialResponse = await fetch(webhookUrl, postOptions);

      if (initialResponse.status === 302 || initialResponse.status === 307 || initialResponse.status === 303) {
        const redirectUrl = initialResponse.headers.get('location');
        if (redirectUrl) {
          finalResponse = await fetch(redirectUrl, {
            method: "POST", 
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: postOptions.body
          });
        }
      } else {
        finalResponse = initialResponse;
      }

      if (finalResponse && finalResponse.ok) {
        const responseText = await finalResponse.text();
        const responseData = JSON.parse(responseText);
        if (responseData.success && (responseData.url || responseData.fileUrl || responseData.id)) {
          return res.json({ success: true, url: responseData.url || responseData.fileUrl || responseData.id });
        }
      }
    } catch (gErr: any) {
      console.warn("Drive proxy note, falling back to local storage:", gErr.message);
    }

    // Disk fallback
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const ext = (mimeType && mimeType.includes('png')) ? 'png' : (mimeType && mimeType.includes('webp')) ? 'webp' : 'jpg';
    const safeName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));
    return res.json({ success: true, url: `/uploads/${safeName}` });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to upload" });
  }
});

  // Product CRUD (Supports both /api/admin/products and /api/admin/menu)
  const handleCreateProduct = async (req: express.Request, res: express.Response) => {
    try {
      const { name, category, price, costPrice, stock, description, badge, imageUrl, variants, promoType, promoInfo, promoPrice, promoMinQty, promoFreeQty, promoActive, available } = req.body;
      if (!name || price === undefined) {
        return res.status(400).json({ error: "Nama dan harga produk wajib diisi." });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const parsedStock = stock !== undefined && stock !== null && stock !== '' ? Math.max(0, Number(stock)) : undefined;

      const pType = promoType === 'buy_x_get_y' ? 'buy_x_get_y' : 'bundle_price';
      const pPrice = promoPrice !== undefined && promoPrice !== null && (promoPrice as any) !== '' && Number(promoPrice) > 0 ? Number(promoPrice) : undefined;
      const pFreeQty = promoFreeQty !== undefined && promoFreeQty !== null && (promoFreeQty as any) !== '' && Number(promoFreeQty) > 0 ? Number(promoFreeQty) : undefined;
      const pMinQty = promoMinQty !== undefined && promoMinQty !== null && Number(promoMinQty) > 0 ? Number(promoMinQty) : 2;
      const pActive = promoActive !== undefined ? Boolean(promoActive) : true;
      
      let pInfo = promoInfo || "";
      if (!pInfo) {
        if (pType === 'buy_x_get_y' && pFreeQty) {
          pInfo = `Beli ${pMinQty} Gratis ${pFreeQty}!`;
        } else if (pPrice) {
          pInfo = `beli ${pMinQty} hanya Rp${(pPrice || 0).toLocaleString('id-ID')}!!`;
        }
      }

      const newProduct: MenuItem = {
        id: req.body.id || (slug + "-" + Date.now().toString().slice(-4)),
        name,
        category: category || "snack",
        price: Number(price),
        costPrice: costPrice !== undefined ? Number(costPrice) : 0,
        stock: parsedStock,
        description: description || "",
        badge: badge || "Menu Baru",
        imageUrl: imageUrl || "",
        variants: Array.isArray(variants) ? variants : ["Original"],
        keywords: `${name} ${category} ${Array.isArray(variants) ? variants.join(' ') : ''}`,
        available: available !== undefined ? available : (parsedStock !== undefined ? parsedStock > 0 : true),
        promoType: pType,
        promoInfo: pInfo,
        promoPrice: pPrice,
        promoMinQty: pMinQty,
        promoFreeQty: pFreeQty,
        promoActive: pActive
      };

      // Remove existing duplicate ID if any, then push new
      menuItems = menuItems.filter(m => m.id !== newProduct.id);
      menuItems.push(newProduct);

      // Direct synchronous insert/update into MySQL
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query(`
            INSERT INTO menu_produk (id, kategori, nama, deskripsi, harga, harga_modal, stok, badge, gambar_url, varian_json, kata_kunci, tersedia, info_promo, harga_promo, min_qty_promo, promo_tipe, gratis_qty_promo, promo_aktif, dibuat_pada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
              kategori = VALUES(kategori),
              nama = VALUES(nama),
              deskripsi = VALUES(deskripsi),
              harga = VALUES(harga),
              harga_modal = VALUES(harga_modal),
              stok = VALUES(stok),
              badge = VALUES(badge),
              gambar_url = VALUES(gambar_url),
              varian_json = VALUES(varian_json),
              kata_kunci = VALUES(kata_kunci),
              tersedia = VALUES(tersedia),
              info_promo = VALUES(info_promo),
              harga_promo = VALUES(harga_promo),
              min_qty_promo = VALUES(min_qty_promo),
              promo_tipe = VALUES(promo_tipe),
              gratis_qty_promo = VALUES(gratis_qty_promo),
              promo_aktif = VALUES(promo_aktif)
          `, [
            newProduct.id,
            newProduct.category,
            newProduct.name,
            newProduct.description || '',
            newProduct.price,
            newProduct.costPrice || 0,
            newProduct.stock !== undefined ? newProduct.stock : null,
            newProduct.badge || 'Menu Baru',
            newProduct.imageUrl || '',
            JSON.stringify(newProduct.variants || ['Original']),
            newProduct.keywords || '',
            newProduct.available ? 1 : 0,
            newProduct.promoInfo || '',
            newProduct.promoPrice !== undefined ? newProduct.promoPrice : null,
            newProduct.promoMinQty !== undefined ? newProduct.promoMinQty : null,
            newProduct.promoType || 'bundle_price',
            newProduct.promoFreeQty !== undefined ? newProduct.promoFreeQty : null,
            newProduct.promoActive ? 1 : 0
          ]);
        } catch (dbErr: any) {
          console.warn("Notice direct insert product to MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();
      res.status(201).json({ success: true, product: newProduct, menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  const handleUpdateProduct = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const index = menuItems.findIndex(m => m.id === id);
      if (index === -1) {
        // If not found in memory, try to upsert as new with given id
        req.body.id = id;
        return handleCreateProduct(req, res);
      }

      const parsedStock = req.body.stock !== undefined && req.body.stock !== null && req.body.stock !== '' 
        ? Math.max(0, Number(req.body.stock)) 
        : (req.body.stock === null ? undefined : menuItems[index].stock);

      const pType = req.body.promoType !== undefined ? (req.body.promoType === 'buy_x_get_y' ? 'buy_x_get_y' : 'bundle_price') : (menuItems[index].promoType || 'bundle_price');
      const pPrice = req.body.promoPrice !== undefined ? (req.body.promoPrice !== null && (req.body.promoPrice as any) !== '' && Number(req.body.promoPrice) > 0 ? Number(req.body.promoPrice) : undefined) : menuItems[index].promoPrice;
      const pFreeQty = req.body.promoFreeQty !== undefined ? (req.body.promoFreeQty !== null && (req.body.promoFreeQty as any) !== '' && Number(req.body.promoFreeQty) > 0 ? Number(req.body.promoFreeQty) : undefined) : menuItems[index].promoFreeQty;
      const pMinQty = req.body.promoMinQty !== undefined ? (Number(req.body.promoMinQty) || 2) : (menuItems[index].promoMinQty || 2);
      const pActive = req.body.promoActive !== undefined ? Boolean(req.body.promoActive) : (menuItems[index].promoActive !== false);
      const pInfo = req.body.promoInfo !== undefined ? req.body.promoInfo : menuItems[index].promoInfo;

      menuItems[index] = {
        ...menuItems[index],
        ...req.body,
        id,
        price: Number(req.body.price ?? menuItems[index].price),
        costPrice: req.body.costPrice !== undefined ? Number(req.body.costPrice) : (menuItems[index].costPrice || 0),
        stock: parsedStock,
        available: req.body.available !== undefined ? Boolean(req.body.available) : (parsedStock !== undefined ? parsedStock > 0 : menuItems[index].available),
        promoType: pType,
        promoInfo: pInfo,
        promoPrice: pPrice,
        promoMinQty: pMinQty,
        promoFreeQty: pFreeQty,
        promoActive: pActive
      };

      const updatedProd = menuItems[index];

      // Direct synchronous update into MySQL
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query(`
            INSERT INTO menu_produk (id, kategori, nama, deskripsi, harga, harga_modal, stok, badge, gambar_url, varian_json, kata_kunci, tersedia, info_promo, harga_promo, min_qty_promo, promo_tipe, gratis_qty_promo, promo_aktif)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              kategori = VALUES(kategori),
              nama = VALUES(nama),
              deskripsi = VALUES(deskripsi),
              harga = VALUES(harga),
              harga_modal = VALUES(harga_modal),
              stok = VALUES(stok),
              badge = VALUES(badge),
              gambar_url = VALUES(gambar_url),
              varian_json = VALUES(varian_json),
              kata_kunci = VALUES(kata_kunci),
              tersedia = VALUES(tersedia),
              info_promo = VALUES(info_promo),
              harga_promo = VALUES(harga_promo),
              min_qty_promo = VALUES(min_qty_promo),
              promo_tipe = VALUES(promo_tipe),
              gratis_qty_promo = VALUES(gratis_qty_promo),
              promo_aktif = VALUES(promo_aktif)
          `, [
            updatedProd.id,
            updatedProd.category,
            updatedProd.name,
            updatedProd.description || '',
            updatedProd.price,
            updatedProd.costPrice || 0,
            updatedProd.stock !== undefined ? updatedProd.stock : null,
            updatedProd.badge || 'Menu Pilihan',
            updatedProd.imageUrl || '',
            JSON.stringify(updatedProd.variants || ['Original']),
            updatedProd.keywords || '',
            updatedProd.available ? 1 : 0,
            updatedProd.promoInfo || '',
            updatedProd.promoPrice !== undefined ? updatedProd.promoPrice : null,
            updatedProd.promoMinQty !== undefined ? updatedProd.promoMinQty : null,
            updatedProd.promoType || 'bundle_price',
            updatedProd.promoFreeQty !== undefined ? updatedProd.promoFreeQty : null,
            updatedProd.promoActive ? 1 : 0
          ]);
        } catch (dbErr: any) {
          console.warn("Notice direct update product to MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();
      res.json({ success: true, product: updatedProd, menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  // Quick Stock Update Endpoint
  app.patch("/api/admin/menu/:id/stock", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const index = menuItems.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan." });
      }

      const parsedStock = stock !== undefined && stock !== null && stock !== '' ? Math.max(0, Number(stock)) : undefined;
      menuItems[index].stock = parsedStock;
      if (parsedStock !== undefined && parsedStock <= 0) {
        menuItems[index].available = false;
      } else if (parsedStock !== undefined && parsedStock > 0) {
        menuItems[index].available = true;
      }

      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?", [
            parsedStock !== undefined ? parsedStock : null,
            menuItems[index].available ? 1 : 0,
            id
          ]);
        } catch (dbErr: any) {
          console.warn("Notice direct stock update to MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();
      res.json({ success: true, product: menuItems[index], menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Restock Product Endpoint (Menambah stok yang habis tanpa harus input ulang produk)
  app.post("/api/admin/menu/:id/restock", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { addStock, stock } = req.body;
      const amountToAdd = Math.max(1, Number(addStock ?? stock ?? 10));

      const index = menuItems.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan." });
      }

      const currentStock = menuItems[index].stock ?? 0;
      const newStock = currentStock + amountToAdd;
      menuItems[index].stock = newStock;
      menuItems[index].available = true; // Otomatis aktif kembali saat direstok

      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = ?, tersedia = 1 WHERE id = ?", [newStock, id]);
        } catch (dbErr: any) {
          console.warn("Notice direct restock to MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();
      res.json({
        success: true,
        message: `Stok ${menuItems[index].name} berhasil ditambah ${amountToAdd} porsi (total ${newStock} porsi)`,
        product: menuItems[index],
        menuItems
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset Single Product Stock to Zero (Kembalikan stok ke 0 tanpa hapus produk)
  app.post("/api/admin/menu/:id/reset-stock", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const index = menuItems.findIndex(m => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan." });
      }

      menuItems[index].stock = 0;
      menuItems[index].available = false;

      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = 0, tersedia = 0 WHERE id = ?", [id]);
        } catch (dbErr: any) {
          console.warn("Notice direct reset stock to MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();
      res.json({
        success: true,
        message: `Stok produk ${menuItems[index].name} berhasil direset ke 0 (produk tetap ada)`,
        product: menuItems[index],
        menuItems
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Reset All Products Stock to Zero (Reset semua stok produk ke 0 tanpa hapus produk)
  app.post("/api/admin/menu/reset-all-stocks", requireAdmin, async (_req, res) => {
    try {
      menuItems.forEach(item => {
        item.stock = 0;
        item.available = false;
      });

      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = 0, tersedia = 0");
        } catch (dbErr: any) {
          console.warn("Notice direct reset all stocks to MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();
      res.json({
        success: true,
        message: "Semua stok produk berhasil dikosongkan (0 porsi). Seluruh data menu tetap aman tersimpan.",
        menuItems
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/products", requireAdmin, handleCreateProduct);
  app.post("/api/admin/menu", requireAdmin, handleCreateProduct);

  app.put("/api/admin/products/:id", requireAdmin, handleUpdateProduct);
  app.put("/api/admin/menu/:id", requireAdmin, handleUpdateProduct);
  app.post("/api/admin/products/:id", requireAdmin, handleUpdateProduct);
  app.post("/api/admin/menu/:id", requireAdmin, handleUpdateProduct);

  // Helper: Hapus foto di Google Drive via Apps Script Webhook
  const deleteDrivePhotoIfPresent = (imageUrl?: string) => {
    if (!imageUrl || typeof imageUrl !== "string") return;
    let fileId: string | null = null;
    const match1 = imageUrl.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) fileId = match1[1];
    if (!fileId) {
      const match2 = imageUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match2 && match2[1]) fileId = match2[1];
    }
    if (!fileId) {
      const match3 = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match3 && match3[1]) fileId = match3[1];
    }

    if (fileId) {
      const webhookUrl = siteSettings.googleDriveWebhookUrl || "https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec";
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "delete", fileId: fileId, url: imageUrl }),
        redirect: "follow"
      }).then(r => r.text()).then(txt => {
        console.log(`[Drive Auto-Delete] File ${fileId} deletion response:`, txt);
      }).catch(err => {
        console.warn(`[Drive Auto-Delete] Failed to delete file ${fileId} in Google Drive:`, err.message);
      });
    }
  };

  const handleDeleteProduct = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const targetItem = menuItems.find(m => m.id === id);
      menuItems = menuItems.filter(m => m.id !== id);

      // Direct synchronous delete from MySQL
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("DELETE FROM menu_produk WHERE id = ?", [id]);
        } catch (dbErr: any) {
          console.warn("Notice direct delete product from MySQL:", dbErr.message);
        } finally {
          if (conn) try { conn.release(); } catch {}
        }
      }

      persistData();

      // Hapus foto di Google Drive (asynchronous background)
      if (targetItem?.imageUrl) {
        deleteDrivePhotoIfPresent(targetItem.imageUrl);
      }

      res.json({ success: true, deletedId: id, menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.delete("/api/admin/products/:id", requireAdmin, handleDeleteProduct);
  app.delete("/api/admin/menu/:id", requireAdmin, handleDeleteProduct);
  app.post("/api/admin/products/:id/delete", requireAdmin, handleDeleteProduct);
  app.post("/api/admin/menu/:id/delete", requireAdmin, handleDeleteProduct);

  // Orders Management & Real-time Stock Synchronization (Direct MySQL Persistence)
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    setNoCacheHeaders(res);
    if (dbPool) {
      try {
        const queryPromise = dbPool.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 200");
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("MySQL DB query timeout")), 1500)
        );
        const [orderRows]: any = await Promise.race([queryPromise, timeoutPromise]);
        if (Array.isArray(orderRows)) {
          orders = orderRows.map((o: any) => ({
            id: o.id,
            pembeli: o.pembeli,
            waktu: o.waktu,
            items: o.item_pesanan_json ? (typeof o.item_pesanan_json === 'string' ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json) : [],
            total: Number(o.total || 0),
            status: o.status || 'MENUNGGU',
            createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : new Date().toISOString()
          }));
        }
      } catch (dbErr: any) {
        console.warn("Direct MySQL orders query notice:", dbErr.message);
      }
    }
    res.json({ orders, menuItems });
  });

  app.get("/api/admin/data", requireAdmin, async (req, res) => {
    setNoCacheHeaders(res);
    await loadLiveStateFromMySQL();
    res.json({ orders, menuItems, siteSettings, heroCards, teamMembers });
  });

  app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, order: clientOrder } = req.body;
      const normalizedId = String(id || '').trim();

      // 1. Cari di memori lokal (case-insensitive & strip SK-)
      let order = orders.find(o => 
        o.id === normalizedId || 
        (o.id && o.id.toLowerCase() === normalizedId.toLowerCase()) ||
        (o.id && o.id.replace(/^SK-/i, '') === normalizedId.replace(/^SK-/i, ''))
      );

      // 2. Jika belum ada di memori lokal, coba muat langsung dari MySQL
      if (!order && dbPool) {
        try {
          const rawNum = normalizedId.replace(/^SK-/i, '');
          const [dbRows]: any = await dbPool.query(
            "SELECT * FROM pesanan WHERE id = ? OR id = ? OR id = ? LIMIT 1",
            [normalizedId, normalizedId.toUpperCase(), `SK-${rawNum}`]
          );
          if (Array.isArray(dbRows) && dbRows.length > 0) {
            const o = dbRows[0];
            order = {
              id: o.id,
              pembeli: o.pembeli,
              waktu: o.waktu,
              items: o.item_pesanan_json ? (typeof o.item_pesanan_json === 'string' ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json) : [],
              total: Number(o.total || 0),
              status: o.status || 'MENUNGGU',
              createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : new Date().toISOString()
            };
            orders.unshift(order);
          }
        } catch (dbErr: any) {
          console.warn("Notice checking order in MySQL on patch:", dbErr.message);
        }
      }

      // 3. Jika masih belum ada di memori / DB tapi ada clientOrder dari cache kasir
      if (!order) {
        if (clientOrder && typeof clientOrder === 'object') {
          order = {
            id: clientOrder.id || normalizedId,
            pembeli: clientOrder.pembeli || 'Pelanggan',
            waktu: clientOrder.waktu || getJakartaTimeString(),
            items: Array.isArray(clientOrder.items) ? clientOrder.items : [],
            total: Number(clientOrder.total || 0),
            status: status || clientOrder.status || 'MENUNGGU',
            createdAt: clientOrder.createdAt || new Date().toISOString()
          };
          orders.unshift(order);
        } else {
          order = {
            id: normalizedId.startsWith('SK-') ? normalizedId : `SK-${normalizedId}`,
            pembeli: 'Pelanggan',
            waktu: getJakartaTimeString(),
            items: [],
            total: 0,
            status: status || 'MENUNGGU',
            createdAt: new Date().toISOString()
          };
          orders.unshift(order);
        }
      }

      const prevStatus = (order.status || '').toLowerCase();
      const nextStatus = (status || order.status || '').toLowerCase();

      const wasSelesai = prevStatus === 'selesai';
      const isSelesai = nextStatus === 'selesai';

      // 1. Jika status berubah MENJADI 'Selesai' (dari Menunggu/Batal), kurangi stok sekarang!
      if (!wasSelesai && isSelesai) {
        (order.items || []).forEach(it => {
          const prod = menuItems.find(m => 
            (it.productId && m.id === it.productId) || 
            m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim()
          );
          if (prod && prod.stock !== undefined && prod.stock !== null) {
            prod.stock = Math.max(0, Number(prod.stock) - Number(it.qty || 1));
            if (prod.stock === 0) prod.available = false;
          }
        });
      }
      // 2. Jika status berubah DARI 'Selesai' KE Batal atau Menunggu, kembalikan stok!
      else if (wasSelesai && !isSelesai) {
        (order.items || []).forEach(it => {
          const prod = menuItems.find(m => 
            (it.productId && m.id === it.productId) || 
            m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim()
          );
          if (prod && prod.stock !== undefined && prod.stock !== null) {
            prod.stock = Number(prod.stock) + Number(it.qty || 1);
            if (prod.stock > 0) prod.available = true;
          }
        });
      }

      order.status = status || order.status;
      persistData();

      // Langsung update ke MySQL database tabel pesanan
      if (dbPool) {
        try {
          const itemsJson = JSON.stringify(order.items || []);
          await dbPool.query(`
            INSERT INTO pesanan (id, pembeli, waktu, item_pesanan_json, total, status, dibuat_pada)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              status = VALUES(status),
              item_pesanan_json = VALUES(item_pesanan_json),
              total = VALUES(total)
          `, [
            order.id,
            order.pembeli || 'Pelanggan',
            order.waktu || getJakartaTimeString(),
            itemsJson,
            order.total || 0,
            order.status,
            new Date(order.createdAt || Date.now())
          ]);

          // Update stok produk jika ada perubahan
          if (Array.isArray(menuItems)) {
            for (const m of menuItems) {
              if (m.stock !== undefined && m.stock !== null) {
                await dbPool.query("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?", [m.stock, m.available ? 1 : 0, m.id]).catch(() => {});
              }
            }
          }
        } catch (dbErr: any) {
          console.warn("Direct MySQL order status update notice:", dbErr.message);
        }
      }

      res.json({ success: true, order, orders, menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const normalizedId = String(id || '').trim();
      const rawNum = normalizedId.replace(/^SK-/i, '');

      const targetOrder = orders.find(o => 
        o.id === normalizedId || 
        (o.id && o.id.toLowerCase() === normalizedId.toLowerCase()) ||
        (o.id && o.id.replace(/^SK-/i, '') === rawNum)
      );
      if (targetOrder && (targetOrder.status || '').toLowerCase() === 'selesai') {
        // Kembalikan stok item jika pesanan yang sudah selesai dihapus
        (targetOrder.items || []).forEach(it => {
          const prod = menuItems.find(m => 
            (it.productId && m.id === it.productId) || 
            m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim()
          );
          if (prod && prod.stock !== undefined && prod.stock !== null) {
            prod.stock = Number(prod.stock) + Number(it.qty || 1);
            if (prod.stock > 0) prod.available = true;
          }
        });
      }

      orders = orders.filter(o => 
        o.id !== normalizedId && 
        o.id.toLowerCase() !== normalizedId.toLowerCase() &&
        o.id.replace(/^SK-/i, '') !== rawNum
      );
      persistData();

      // Langsung hapus dari database MySQL
      if (dbPool) {
        try {
          await dbPool.query("DELETE FROM pesanan WHERE id = ? OR id = ? OR id = ?", [
            normalizedId,
            normalizedId.toUpperCase(),
            `SK-${rawNum}`
          ]);
        } catch (dbErr: any) {
          console.warn("Direct MySQL order deletion notice:", dbErr.message);
        }
      }

      res.json({ success: true, orders, menuItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Kosongkan semua pesanan / reset transaksi kasir & laporan penjualan
  const clearAllOrdersHandler = async (req: express.Request, res: express.Response) => {
    try {
      orders = [];
      
      // 1. Tulis cepat langsung ke local JSON store
      try {
        const payload = {
          siteSettings,
          heroCards,
          menuItems,
          teamMembers,
          orders: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch (fsErr) {
        console.error("Failed to write data_store.json on clear:", fsErr);
      }

      // 2. Berikan respons sukses instan ke frontend tanpa menunggu latensi remote MySQL
      res.json({
        success: true,
        message: "Semua data pesanan kasir dan laporan penjualan berhasil dikosongkan. Siap diinput dari awal!",
        orders: [],
        menuItems
      });

      // 3. Bersihkan tabel pesanan di MySQL secara asinkronus di latar belakang
      if (dbPool) {
        dbPool.getConnection().then(async (conn) => {
          try {
            await conn.query("DELETE FROM pesanan");
          } catch (dbErr: any) {
            console.warn("Notice MySQL truncate pesanan:", dbErr.message);
          } finally {
            conn.release();
          }
        }).catch((connErr) => {
          console.warn("Notice MySQL pool on clear:", connErr.message);
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Gagal mengosongkan data pesanan" });
    }
  };

  app.post("/api/admin/orders/clear", requireAdmin, clearAllOrdersHandler);
  app.delete("/api/admin/orders", requireAdmin, clearAllOrdersHandler);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const possibleDistPaths = [
      path.join(process.cwd(), 'dist'),
      process.cwd(),
      path.join(__dirname, 'dist'),
      __dirname
    ];
    const staticPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.join(process.cwd(), 'dist');
    app.use(express.static(staticPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Soki Admin & Storefront Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
