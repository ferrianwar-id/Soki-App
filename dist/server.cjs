var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_promise = __toESM(require("mysql2/promise"), 1);
process.env.TZ = "Asia/Jakarta";
function getJakartaTimeString(d = /* @__PURE__ */ new Date()) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
      hour12: false
    }).format(d).replace(":", ".");
  } catch {
    const h = String((d.getUTCHours() + 7) % 24).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}.${m}`;
  }
}
var DATA_FILE = import_path.default.join(process.cwd(), "data_store.json");
var siteSettings = {
  siteTitle: "Soki - Snack Renyah & Aneka Es Segar",
  heroHeadline: "Renyahnya Bikin Nagih, Segarnya Balikin Mood!",
  heroHighlight: "Renyahnya, Segarnya",
  heroSubtitle: "Kami dari kelas 8B kelompok 3 menyediakan beberapa varian menu makanan untuk hari Rabu. Temukan kombinasi cemilan renyah gurih dan aneka es manis segar favoritmu di Soki.",
  announcement: "Kelas 8B Kelompok 3 \u2022 Menu Hari Rabu",
  whatsappNumber: "081234567890",
  aboutTitle: "Tim Pengelola Soki (Kelompok 3)",
  aboutSubtitle: "Toko Soki dikelola bersama oleh siswa-siswi Kelas 8B Kelompok 3 untuk menyajikan aneka jajanan renyah dan es manis segar pilihan.",
  aboutBadge: "Kelas 8B Kelompok 3",
  features: [
    {
      title: "Snack Dijamin Garing",
      description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.",
      icon: "\u{1F35F}"
    },
    {
      title: "Minuman Dingin Segar",
      description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.",
      icon: "\u{1F9CA}"
    },
    {
      title: "Harga Ramah Kantong",
      description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.",
      icon: "\u26A1"
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
    statusMode: "auto",
    closedTitle: "Toko Sedang Tutup",
    closedMessage: "Halo! Saat ini toko SOKI sedang tutup dan akan buka kembali sesuai jam operasional. Kamu tetap bisa menghubungi admin via WhatsApp untuk pre-order atau menanyakan ketersediaan menu.",
    allowPreorderWhatsApp: true,
    weeklySchedule: [
      { day: "monday", dayName: "Senin", isOpen: true, openTime: "08:00", closeTime: "17:00" },
      { day: "tuesday", dayName: "Selasa", isOpen: true, openTime: "08:00", closeTime: "17:00" },
      { day: "wednesday", dayName: "Rabu", isOpen: true, openTime: "07:30", closeTime: "17:30" },
      { day: "thursday", dayName: "Kamis", isOpen: true, openTime: "08:00", closeTime: "17:00" },
      { day: "friday", dayName: "Jumat", isOpen: true, openTime: "08:00", closeTime: "17:00" },
      { day: "saturday", dayName: "Sabtu", isOpen: true, openTime: "08:00", closeTime: "15:00" },
      { day: "sunday", dayName: "Minggu", isOpen: false, openTime: "08:00", closeTime: "15:00" }
    ],
    specialNote: "Pesanan pre-order tetap diterima melalui WhatsApp!"
  }
};
var teamMembers = [
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
var heroCards = [
  {
    id: "snack",
    title: "Aneka Cemilan Renyah",
    subtitle: "Renyah gurih bumbu mantap",
    badge: "Cemilan Renyah",
    imageUrl: "",
    icon: "\u{1F35F}",
    bgGradient: "from-amber-400 to-orange-500",
    accentColor: "#ea580c"
  },
  {
    id: "es",
    title: "Aneka Minuman Segar",
    subtitle: "Manis beku pelepas dahaga",
    badge: "Es Pelepas Dahaga",
    imageUrl: "",
    icon: "\u{1F964}",
    bgGradient: "from-cyan-400 to-blue-500",
    accentColor: "#0284c7"
  }
];
var menuItems = [];
var orders = [];
var DB_CONFIG = {
  host: process.env.DB_HOST || "157.66.55.62",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "aapjgfju_admin-dmirecord_db",
  password: process.env.DB_PASS || "FerriAnwar22032001",
  database: process.env.DB_NAME || "aapjgfju_dmirecord_db",
  connectTimeout: 5e3,
  waitForConnections: true,
  connectionLimit: 4,
  maxIdle: 2,
  idleTimeout: 3e4,
  enableKeepAlive: true,
  keepAliveInitialDelay: 1e4
};
var dbPool = null;
try {
  dbPool = import_promise.default.createPool(DB_CONFIG);
  console.log("MySQL database pool initialized for:", DB_CONFIG.database);
} catch (poolErr) {
  console.warn("Could not create MySQL pool:", poolErr);
}
async function syncFromDatabase() {
  if (!dbPool) return;
  let conn;
  try {
    conn = await dbPool.getConnection();
    try {
      await conn.query("ALTER TABLE menu_produk ADD COLUMN stok INT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE menu_produk ADD COLUMN promo_tipe VARCHAR(50) DEFAULT 'bundle_price'");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE menu_produk ADD COLUMN gratis_qty_promo INT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE kartu_beranda ADD COLUMN product_id VARCHAR(100) DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE kartu_beranda MODIFY COLUMN subjudul TEXT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE kartu_beranda MODIFY COLUMN gambar_url LONGTEXT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE pengaturan_situs ADD COLUMN maintenance_json TEXT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE pengaturan_situs ADD COLUMN jadwal_toko_json TEXT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE pengaturan_situs ADD COLUMN schedule_json TEXT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE pengaturan_situs MODIFY COLUMN fitur_json LONGTEXT DEFAULT NULL");
    } catch {
    }
    try {
      await conn.query("ALTER TABLE pengaturan_situs MODIFY COLUMN pengumuman TEXT DEFAULT NULL");
    } catch {
    }
    const [settingsRows] = await conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1");
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
    const [cardRows] = await conn.query("SELECT * FROM kartu_beranda ORDER BY urutan ASC");
    if (cardRows && cardRows.length > 0) {
      heroCards = cardRows.map((c) => ({
        id: c.id,
        title: c.judul,
        subtitle: c.subjudul,
        badge: c.badge,
        imageUrl: c.gambar_url || "",
        icon: c.ikon,
        bgGradient: c.gradient_bg,
        accentColor: c.warna_aksen,
        productId: c.product_id || void 0
      }));
    }
    const [menuRows] = await conn.query("SELECT * FROM menu_produk ORDER BY dibuat_pada ASC");
    if (menuRows && menuRows.length > 0) {
      menuItems = menuRows.map((m) => ({
        id: m.id,
        category: m.kategori,
        name: m.nama,
        description: m.deskripsi,
        price: Number(m.harga),
        costPrice: m.harga_modal !== null && m.harga_modal !== void 0 ? Number(m.harga_modal) : 0,
        stock: m.stok !== null && m.stok !== void 0 ? Number(m.stok) : void 0,
        badge: m.badge,
        imageUrl: m.gambar_url || "",
        variants: m.varian_json ? JSON.parse(m.varian_json) : ["Original"],
        keywords: m.kata_kunci,
        available: Boolean(m.tersedia),
        promoType: m.promo_tipe || (m.gratis_qty_promo ? "buy_x_get_y" : "bundle_price"),
        promoInfo: m.info_promo,
        promoPrice: m.harga_promo !== null && m.harga_promo !== void 0 ? Number(m.harga_promo) : void 0,
        promoMinQty: m.min_qty_promo !== null && m.min_qty_promo !== void 0 ? Number(m.min_qty_promo) : void 0,
        promoFreeQty: m.gratis_qty_promo !== null && m.gratis_qty_promo !== void 0 ? Number(m.gratis_qty_promo) : void 0,
        promoActive: Boolean(m.promo_aktif)
      }));
    }
    const [teamRows] = await conn.query("SELECT * FROM tim_pengelola ORDER BY urutan ASC");
    if (teamRows && teamRows.length > 0) {
      teamMembers = teamRows.map((t) => ({
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
    const [orderRows] = await conn.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 200");
    if (orderRows && orderRows.length > 0) {
      orders = orderRows.map((o) => ({
        id: o.id,
        pembeli: o.pembeli,
        waktu: o.waktu,
        items: o.item_pesanan_json ? typeof o.item_pesanan_json === "string" ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json : [],
        total: Number(o.total || 0),
        status: o.status || "MENUNGGU",
        createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    console.log("Synchronized live state from cPanel MySQL Database successfully!");
  } catch (err) {
    console.warn("MySQL sync note, using local data_store.json:", err.message);
  } finally {
    if (conn) {
      try {
        conn.release();
      } catch {
      }
    }
  }
}
function loadPersistedData() {
  try {
    if (import_fs.default.existsSync(DATA_FILE)) {
      const content = import_fs.default.readFileSync(DATA_FILE, "utf-8");
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
var isPersisting = false;
async function saveSettingsToDatabaseAndLocal(updatedPartialSettings) {
  siteSettings = { ...siteSettings, ...updatedPartialSettings };
  try {
    const payload = {
      siteSettings,
      heroCards,
      menuItems,
      teamMembers,
      orders
    };
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist data locally:", err);
  }
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
        siteSettings.aboutTitle || "",
        siteSettings.aboutSubtitle || "",
        siteSettings.aboutBadge || "",
        JSON.stringify(siteSettings.features || []),
        siteSettings.googleDriveWebhookUrl || "",
        siteSettings.googleDriveProductFolderId || "",
        siteSettings.googleDriveCardFolderId || "",
        maintJson,
        schedJson,
        schedJson
      ]);
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
            item.openTime || "08:00",
            item.closeTime || "17:00",
            i + 1
          ]);
        }
      }
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
    } catch (mysqlErr) {
      console.warn("Gagal menyimpan pengaturan ke MySQL database:", mysqlErr.message);
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch {
        }
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
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist data locally:", err);
  }
  if (dbPool && !isPersisting) {
    isPersisting = true;
    let conn;
    try {
      conn = await dbPool.getConnection();
      const maintJson = siteSettings.maintenance ? JSON.stringify(siteSettings.maintenance) : null;
      const schedJson = siteSettings.storeSchedule ? JSON.stringify(siteSettings.storeSchedule) : null;
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
        siteSettings.aboutTitle || "",
        siteSettings.aboutSubtitle || "",
        siteSettings.aboutBadge || "",
        JSON.stringify(siteSettings.features || []),
        siteSettings.googleDriveWebhookUrl || "",
        siteSettings.googleDriveProductFolderId || "",
        siteSettings.googleDriveCardFolderId || "",
        maintJson,
        schedJson,
        schedJson
      ]);
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
            item.openTime || "08:00",
            item.closeTime || "17:00",
            i + 1
          ]);
        }
      }
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
            card.id || (i === 0 ? "snack" : "es"),
            card.title || "",
            card.subtitle || "",
            card.badge || "",
            card.imageUrl || "",
            card.icon || "",
            card.bgGradient || "",
            card.accentColor || "",
            card.productId || null,
            i + 1
          ]);
        }
      }
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
              tm.id || `member-${i + 1}`,
              tm.name || "",
              tm.absen || "",
              tm.role || "",
              tm.description || "",
              tm.initial || tm.name?.charAt(0)?.toUpperCase() || "A",
              tm.avatarUrl || null,
              tm.themeColor || "amber",
              i + 1
            ]);
          } catch (tErr) {
            console.warn("Notice sync tim_pengelola:", tErr.message);
          }
        }
      }
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        for (const item of menuItems) {
          const promoTypeVal = item.promoType === "buy_x_get_y" ? "buy_x_get_y" : "bundle_price";
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
            item.category || "snack",
            item.name,
            item.description || "",
            Number(item.price || 0),
            Number(item.costPrice || 0),
            item.stock !== void 0 && item.stock !== null ? Number(item.stock) : null,
            item.badge || "",
            item.imageUrl || "",
            JSON.stringify(item.variants || ["Original"]),
            item.keywords || "",
            item.available !== false ? 1 : 0,
            item.promoInfo || "",
            item.promoPrice !== void 0 && item.promoPrice !== null ? Number(item.promoPrice) : null,
            item.promoMinQty !== void 0 && item.promoMinQty !== null ? Number(item.promoMinQty) : null,
            promoTypeVal,
            item.promoFreeQty !== void 0 && item.promoFreeQty !== null ? Number(item.promoFreeQty) : null,
            item.promoActive ? 1 : 0
          ]);
        }
        const activeIds = menuItems.map((m) => m.id);
        if (activeIds.length > 0) {
          const placeholders = activeIds.map(() => "?").join(",");
          await conn.query(`DELETE FROM menu_produk WHERE id NOT IN (${placeholders})`, activeIds);
        }
      }
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
              ord.pembeli || "",
              ord.waktu || "",
              JSON.stringify(ord.items || []),
              Number(ord.total || 0),
              ord.status || "MENUNGGU",
              ord.createdAt || (/* @__PURE__ */ new Date()).toISOString()
            ]);
          }
          const activeOrderIds = orders.map((o) => o.id);
          if (activeOrderIds.length > 0) {
            const placeholders = activeOrderIds.map(() => "?").join(",");
            await conn.query(`DELETE FROM pesanan WHERE id NOT IN (${placeholders})`, activeOrderIds);
          } else {
            await conn.query(`DELETE FROM pesanan`);
          }
        } catch (orderErr) {
        }
      }
    } catch (mysqlErr) {
      if (mysqlErr.code !== "ECONNRESET" && mysqlErr.code !== "PROTOCOL_CONNECTION_LOST") {
        console.warn("Background MySQL sync notice:", mysqlErr.message);
      }
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch {
        }
      }
      isPersisting = false;
    }
  }
}
async function startServer() {
  loadPersistedData();
  await syncFromDatabase();
  const app = (0, import_express.default)();
  const upload = (0, import_multer.default)({ dest: "public/uploads/" });
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "15mb" }));
  const uploadsDir = import_path.default.join(process.cwd(), "public", "uploads");
  if (!import_fs.default.existsSync(uploadsDir)) {
    import_fs.default.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", import_express.default.static(uploadsDir));
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
    const isSuperEmail = SUPERADMIN_EMAILS.includes(cleanEmail);
    const isSuperPass = ["superadmin", "fa8b", "fa.officialtng", "admin8b"].includes(cleanPassLower);
    if (isSuperEmail && SUPERADMIN_PASS_LIST.includes(cleanPassLower) || isSuperPass) {
      return res.json({
        success: true,
        token: SUPERADMIN_TOKEN,
        role: "superadmin",
        isSuperAdmin: true,
        user: { email: cleanEmail, name: "Superadmin (Koko Ferri)", role: "superadmin" }
      });
    }
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
  const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token || token !== ADMIN_TOKEN && token !== SUPERADMIN_TOKEN && token !== "soki_admin_secret_auth_token_99218" && !token.startsWith("soki-") && !token.startsWith("soki_")) {
      return res.status(403).json({ error: "Akses ditolak. Sesi admin tidak sah." });
    }
    next();
  };
  const setNoCacheHeaders = (res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  };
  const refreshSettingsFromDb = async () => {
    if (!dbPool) return siteSettings;
    let conn;
    try {
      conn = await dbPool.getConnection();
      const [rows] = await conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1");
      if (rows && rows.length > 0) {
        const s = rows[0];
        const schedJson = s.jadwal_toko_json || s.schedule_json;
        if (s.maintenance_json) {
          try {
            siteSettings.maintenance = JSON.parse(s.maintenance_json);
          } catch {
          }
        }
        if (schedJson) {
          try {
            siteSettings.storeSchedule = JSON.parse(schedJson);
          } catch {
          }
        }
        if (s.judul_situs) siteSettings.siteTitle = s.judul_situs;
        if (s.headline) siteSettings.heroHeadline = s.headline;
        if (s.highlight) siteSettings.heroHighlight = s.highlight;
        if (s.subjudul) siteSettings.heroSubtitle = s.subjudul;
        if (s.pengumuman) siteSettings.announcement = s.pengumuman;
        if (s.nomor_whatsapp) siteSettings.whatsappNumber = s.nomor_whatsapp;
        if (s.fitur_json) {
          try {
            siteSettings.features = JSON.parse(s.fitur_json);
          } catch {
          }
        }
      }
    } catch {
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch {
        }
      }
    }
    return siteSettings;
  };
  let lastLiveStateLoadTime = 0;
  const STATE_CACHE_TTL_MS = 1500;
  const loadLiveStateFromMySQL = async (force = false) => {
    if (!dbPool) return;
    const now = Date.now();
    if (!force && now - lastLiveStateLoadTime < STATE_CACHE_TTL_MS) {
      return;
    }
    let conn;
    try {
      conn = await dbPool.getConnection();
      const [settingsRes, cardsRes, menuRes, ordersRes] = await Promise.all([
        conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1"),
        conn.query("SELECT * FROM kartu_beranda ORDER BY urutan ASC"),
        conn.query("SELECT * FROM menu_produk ORDER BY dibuat_pada ASC"),
        conn.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 200").catch(() => [[], []])
      ]);
      const rows = settingsRes[0];
      if (rows && rows.length > 0) {
        const s = rows[0];
        const schedJson = s.jadwal_toko_json || s.schedule_json;
        if (s.maintenance_json) {
          try {
            siteSettings.maintenance = JSON.parse(s.maintenance_json);
          } catch {
          }
        }
        if (schedJson) {
          try {
            siteSettings.storeSchedule = JSON.parse(schedJson);
          } catch {
          }
        }
        if (s.judul_situs) siteSettings.siteTitle = s.judul_situs;
        if (s.headline) siteSettings.heroHeadline = s.headline;
        if (s.highlight) siteSettings.heroHighlight = s.highlight;
        if (s.subjudul) siteSettings.heroSubtitle = s.subjudul;
        if (s.pengumuman) siteSettings.announcement = s.pengumuman;
        if (s.nomor_whatsapp) siteSettings.whatsappNumber = s.nomor_whatsapp;
        if (s.fitur_json) {
          try {
            siteSettings.features = JSON.parse(s.fitur_json);
          } catch {
          }
        }
      }
      const cardRows = cardsRes[0];
      if (cardRows && cardRows.length > 0) {
        heroCards = cardRows.map((c) => ({
          id: c.id,
          title: c.judul,
          subtitle: c.subjudul,
          badge: c.badge,
          imageUrl: c.gambar_url || "",
          icon: c.ikon,
          bgGradient: c.gradient_bg,
          accentColor: c.warna_aksen,
          productId: c.product_id || void 0
        }));
      }
      const menuRows = menuRes[0];
      if (menuRows && menuRows.length > 0) {
        menuItems = menuRows.map((m) => ({
          id: m.id,
          category: m.kategori,
          name: m.nama,
          description: m.deskripsi,
          price: Number(m.harga),
          costPrice: m.harga_modal !== null && m.harga_modal !== void 0 ? Number(m.harga_modal) : 0,
          stock: m.stok !== null && m.stok !== void 0 ? Number(m.stok) : void 0,
          badge: m.badge,
          imageUrl: m.gambar_url || "",
          variants: m.varian_json ? JSON.parse(m.varian_json) : ["Original"],
          keywords: m.kata_kunci,
          available: Boolean(m.tersedia),
          promoType: m.promo_tipe || (m.gratis_qty_promo ? "buy_x_get_y" : "bundle_price"),
          promoInfo: m.info_promo,
          promoPrice: m.harga_promo !== null ? Number(m.harga_promo) : void 0,
          promoMinQty: m.min_qty_promo !== null && m.min_qty_promo !== void 0 ? Number(m.min_qty_promo) : void 0,
          promoFreeQty: m.gratis_qty_promo !== null && m.gratis_qty_promo !== void 0 ? Number(m.gratis_qty_promo) : void 0,
          promoActive: Boolean(m.promo_aktif),
          rating: Number(m.rating || 5)
        }));
      }
      const orderRows = ordersRes[0];
      if (orderRows && Array.isArray(orderRows)) {
        orders = orderRows.map((o) => ({
          id: o.id,
          pembeli: o.pembeli,
          waktu: o.waktu,
          items: o.item_pesanan_json ? typeof o.item_pesanan_json === "string" ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json : [],
          total: Number(o.total || 0),
          status: o.status || "MENUNGGU",
          createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
      lastLiveStateLoadTime = Date.now();
    } catch (err) {
      console.warn("Notice loadLiveStateFromMySQL fallback:", err.message);
    } finally {
      if (conn) {
        try {
          conn.release();
        } catch {
        }
      }
    }
  };
  app.get("/api/health", (req, res) => {
    setNoCacheHeaders(res);
    res.json({ status: "ok", app: "Soki API Engine" });
  });
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
  app.post("/api/orders", async (req, res) => {
    try {
      const { pembeli, items, total, freeBonusItems, totalFreeItems: clientTotalFree, id: clientId, waktu: clientWaktu } = req.body;
      if (!pembeli || typeof pembeli !== "string" || !pembeli.trim()) {
        return res.status(400).json({ error: "Nama pemesan harus diisi." });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Keranjang belanja kosong." });
      }
      const safeTotal = typeof total === "number" && !isNaN(total) ? Math.max(0, total) : Number(total || 0);
      const nomorAntrean = clientId || "SK-" + Math.floor(100 + Math.random() * 900);
      const waktuOrder = clientWaktu || getJakartaTimeString();
      const enrichedItems = Array.isArray(items) ? items.map((it) => {
        const foundMenu = menuItems.find(
          (m) => it.productId && m.id === it.productId || m.name.toLowerCase().trim() === (it.name || "").toLowerCase().trim()
        );
        const costPrice = it.costPrice !== void 0 ? Number(it.costPrice) : foundMenu?.costPrice || 0;
        return {
          ...it,
          productId: it.productId || foundMenu?.id,
          price: Number(it.price || 0),
          costPrice,
          qty: Number(it.qty || 1)
        };
      }) : [];
      const productSummary = {};
      enrichedItems.forEach((it) => {
        const prod = menuItems.find(
          (m) => it.productId && m.id === it.productId || m.name.toLowerCase().trim() === (it.name || "").toLowerCase().trim()
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
      const generatedBonusItems = [];
      let totalCalculatedFreeItems = 0;
      Object.values(productSummary).forEach((summary) => {
        const prod = summary.prod;
        const orderedQty = summary.orderedQty;
        let isBuyXGetY = prod.promoType === "buy_x_get_y" || Number(prod.promoFreeQty || 0) > 0;
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
              variant: summary.variants[0] || "Original",
              price: 0,
              costPrice: prod.costPrice || 0,
              qty: totalBonus,
              isFreeBonus: true,
              promoNote: `\u{1F381} Bonus Promo Beli ${minQty} Gratis ${freeQtyPerBundle}`
            });
          }
        }
      });
      const finalOrderItems = [...enrichedItems, ...generatedBonusItems];
      const newOrder = {
        id: nomorAntrean,
        pembeli: pembeli.trim(),
        waktu: waktuOrder,
        items: finalOrderItems,
        total: safeTotal,
        totalFreeItems: totalCalculatedFreeItems || (Number(clientTotalFree) || 0),
        status: "MENUNGGU",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      orders.unshift(newOrder);
      try {
        const payload = { siteSettings, heroCards, menuItems, teamMembers, orders };
        import_fs.default.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8", () => {
        });
      } catch (fsErr) {
        console.warn("Notice write local data_store.json:", fsErr);
      }
      if (dbPool) {
        const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace("T", " ");
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
        }).catch((dbErr) => {
          console.warn("MySQL direct order insert notice:", dbErr.message);
        });
      }
      res.status(201).json({ success: true, order: newOrder, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message || "Gagal memproses pesanan" });
    }
  });
  const handleSaveLandingPage = async (req, res) => {
    try {
      const { heroCards: newCards, siteSettings: newSettings } = req.body || {};
      if (Array.isArray(newCards) && newCards.length >= 2) {
        heroCards = newCards;
      }
      if (newSettings && typeof newSettings === "object") {
        siteSettings = { ...siteSettings, ...newSettings };
      }
      let dbSaved = false;
      if (dbPool) {
        let conn;
        try {
          conn = await Promise.race([
            dbPool.getConnection(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), 3e3))
          ]);
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
                card.id || (i === 0 ? "snack" : "es"),
                card.title || "",
                card.subtitle || "",
                card.badge || "",
                card.imageUrl || "",
                card.icon || "",
                card.bgGradient || "",
                card.accentColor || "",
                card.productId || null,
                i + 1
              ]);
            }
          }
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
        } catch (dbErr) {
          console.warn("[Landing Page] Notice MySQL sync error:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
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
        import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch (fErr) {
        console.warn("Failed to write data_store.json:", fErr);
      }
      persistData().catch((e) => console.warn("Background persist notice:", e.message));
      res.json({
        success: true,
        database: dbSaved ? "mysql" : "local-synced",
        heroCards,
        siteSettings
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Gagal menyimpan pengaturan" });
    }
  };
  app.put("/api/admin/landing-page", requireAdmin, handleSaveLandingPage);
  app.post("/api/admin/landing-page", requireAdmin, handleSaveLandingPage);
  app.put("/api/admin/hero-cards", requireAdmin, async (req, res) => {
    try {
      const updatedCards = req.body;
      if (!Array.isArray(updatedCards) || updatedCards.length < 2) {
        return res.status(400).json({ error: "Harus menyediakan minimal 2 konfigurasi card." });
      }
      heroCards = updatedCards;
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
              card.id || (i === 0 ? "snack" : "es"),
              card.title || "",
              card.subtitle || "",
              card.badge || "",
              card.imageUrl || "",
              card.icon || "",
              card.bgGradient || "",
              card.accentColor || "",
              card.productId || null,
              i + 1
            ]);
          }
          console.log("2 Kartu Beranda berhasil disimpan ke MySQL database.");
        } catch (dbErr) {
          console.warn("Direct MySQL sync notice for hero-cards:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
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
        import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch {
      }
      persistData().catch(() => {
      });
      res.json({ success: true, heroCards });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const handleUpdateSettings = async (req, res) => {
    try {
      const updated = await saveSettingsToDatabaseAndLocal(req.body);
      res.json({ success: true, siteSettings: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.put("/api/admin/settings", requireAdmin, handleUpdateSettings);
  app.post("/api/admin/settings", requireAdmin, handleUpdateSettings);
  app.put("/api/admin/site-settings", requireAdmin, handleUpdateSettings);
  app.post("/api/admin/site-settings", requireAdmin, handleUpdateSettings);
  app.put("/api/admin/schedule", requireAdmin, handleUpdateSettings);
  app.post("/api/admin/schedule", requireAdmin, handleUpdateSettings);
  app.put("/api/admin/maintenance", requireAdmin, async (req, res) => {
    try {
      const updatedMaintenance = {
        ...siteSettings.maintenance,
        ...req.body
      };
      const updated = await saveSettingsToDatabaseAndLocal({ maintenance: updatedMaintenance });
      res.json({ success: true, maintenance: updated.maintenance, siteSettings: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/admin/team", requireAdmin, (req, res) => {
    try {
      const updatedTeam = req.body;
      if (!Array.isArray(updatedTeam)) {
        return res.status(400).json({ error: "Data anggota tim harus berupa array." });
      }
      teamMembers = updatedTeam;
      persistData();
      res.json({ success: true, teamMembers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/drive-status", requireAdmin, async (req, res) => {
    const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || siteSettings.googleDriveWebhookUrl;
    const productFolderId = siteSettings.googleDriveProductFolderId || "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
    const cardFolderId = siteSettings.googleDriveCardFolderId || "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
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
    } catch (err) {
      return res.json({
        connected: false,
        status: "connection_error",
        message: `Tidak dapat menjangkau URL Google Drive: ${err.message}`,
        folders,
        hasUrl: true
      });
    }
  });
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
      const parts = fileName.split(".");
      if (parts.length > 2) {
        return res.status(400).json({
          error: `Dilarang menggunakan ekstensi ganda ("${fileName}").`
        });
      }
      const ext = parts[parts.length - 1].toLowerCase();
      if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
        return res.status(400).json({ error: "Format tidak didukung." });
      }
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const detectedMime = mimeType || "image/webp";
      const productFolderId = siteSettings.googleDriveProductFolderId || "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
      const cardFolderId = siteSettings.googleDriveCardFolderId || "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
      const selectedFolderId = target === "landingpage" ? cardFolderId : productFolderId;
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
              target: target || "product",
              folderId: selectedFolderId
            }),
            redirect: "follow"
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
        } catch (webhookErr) {
          console.warn("Google Drive webhook note, falling back to local server storage:", webhookErr.message);
        }
      }
      try {
        const uploadDir = import_path.default.join(process.cwd(), "public", "uploads");
        if (!import_fs.default.existsSync(uploadDir)) {
          import_fs.default.mkdirSync(uploadDir, { recursive: true });
        }
        const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "webp";
        const safeName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${safeExt}`;
        const filePath = import_path.default.join(uploadDir, safeName);
        import_fs.default.writeFileSync(filePath, Buffer.from(cleanBase64, "base64"));
        const publicUrl = `/uploads/${safeName}`;
        return res.json({
          success: true,
          url: publicUrl,
          fileName: safeName,
          source: "local_disk"
        });
      } catch (diskErr) {
        return res.status(500).json({ error: "Gagal menyimpan foto secara lokal: " + diskErr.message });
      }
    } catch (err) {
      res.status(500).json({ error: err.message || "Gagal memproses upload gambar." });
    }
  });
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileName, base64, mimeType, target, folderId } = req.body;
      if (!base64) {
        return res.status(400).json({ success: false, error: "No image data provided" });
      }
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycby6mdjvePXUbzBVLlbqolbN1XC6r7meUqIL75ji7vvH9wwL3x33HAZATdg5Br3WKSYx/exec";
      const payload = {
        fileName: fileName || `upload_${Date.now()}.${mimeType?.split("/")[1] || "webp"}`,
        base64: cleanBase64,
        mimeType: mimeType || "image/webp",
        target: target || "product",
        folderId
      };
      try {
        const postOptions = {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
          redirect: "manual"
        };
        let finalResponse;
        const initialResponse = await fetch(webhookUrl, postOptions);
        if (initialResponse.status === 302 || initialResponse.status === 307 || initialResponse.status === 303) {
          const redirectUrl = initialResponse.headers.get("location");
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
      } catch (gErr) {
        console.warn("Drive proxy note, falling back to local storage:", gErr.message);
      }
      const uploadDir = import_path.default.join(process.cwd(), "public", "uploads");
      if (!import_fs.default.existsSync(uploadDir)) {
        import_fs.default.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = mimeType && mimeType.includes("png") ? "png" : mimeType && mimeType.includes("webp") ? "webp" : "jpg";
      const safeName = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = import_path.default.join(uploadDir, safeName);
      import_fs.default.writeFileSync(filePath, Buffer.from(cleanBase64, "base64"));
      return res.json({ success: true, url: `/uploads/${safeName}` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message || "Failed to upload" });
    }
  });
  const handleCreateProduct = async (req, res) => {
    try {
      const { name, category, price, costPrice, stock, description, badge, imageUrl, variants, promoType, promoInfo, promoPrice, promoMinQty, promoFreeQty, promoActive, available } = req.body;
      if (!name || price === void 0) {
        return res.status(400).json({ error: "Nama dan harga produk wajib diisi." });
      }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const parsedStock = stock !== void 0 && stock !== null && stock !== "" ? Math.max(0, Number(stock)) : void 0;
      const pType = promoType === "buy_x_get_y" ? "buy_x_get_y" : "bundle_price";
      const pPrice = promoPrice !== void 0 && promoPrice !== null && promoPrice !== "" && Number(promoPrice) > 0 ? Number(promoPrice) : void 0;
      const pFreeQty = promoFreeQty !== void 0 && promoFreeQty !== null && promoFreeQty !== "" && Number(promoFreeQty) > 0 ? Number(promoFreeQty) : void 0;
      const pMinQty = promoMinQty !== void 0 && promoMinQty !== null && Number(promoMinQty) > 0 ? Number(promoMinQty) : 2;
      const pActive = promoActive !== void 0 ? Boolean(promoActive) : true;
      let pInfo = promoInfo || "";
      if (!pInfo) {
        if (pType === "buy_x_get_y" && pFreeQty) {
          pInfo = `Beli ${pMinQty} Gratis ${pFreeQty}!`;
        } else if (pPrice) {
          pInfo = `beli ${pMinQty} hanya Rp${(pPrice || 0).toLocaleString("id-ID")}!!`;
        }
      }
      const newProduct = {
        id: req.body.id || slug + "-" + Date.now().toString().slice(-4),
        name,
        category: category || "snack",
        price: Number(price),
        costPrice: costPrice !== void 0 ? Number(costPrice) : 0,
        stock: parsedStock,
        description: description || "",
        badge: badge || "Menu Baru",
        imageUrl: imageUrl || "",
        variants: Array.isArray(variants) ? variants : ["Original"],
        keywords: `${name} ${category} ${Array.isArray(variants) ? variants.join(" ") : ""}`,
        available: available !== void 0 ? available : parsedStock !== void 0 ? parsedStock > 0 : true,
        promoType: pType,
        promoInfo: pInfo,
        promoPrice: pPrice,
        promoMinQty: pMinQty,
        promoFreeQty: pFreeQty,
        promoActive: pActive
      };
      menuItems = menuItems.filter((m) => m.id !== newProduct.id);
      menuItems.push(newProduct);
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
            newProduct.description || "",
            newProduct.price,
            newProduct.costPrice || 0,
            newProduct.stock !== void 0 ? newProduct.stock : null,
            newProduct.badge || "Menu Baru",
            newProduct.imageUrl || "",
            JSON.stringify(newProduct.variants || ["Original"]),
            newProduct.keywords || "",
            newProduct.available ? 1 : 0,
            newProduct.promoInfo || "",
            newProduct.promoPrice !== void 0 ? newProduct.promoPrice : null,
            newProduct.promoMinQty !== void 0 ? newProduct.promoMinQty : null,
            newProduct.promoType || "bundle_price",
            newProduct.promoFreeQty !== void 0 ? newProduct.promoFreeQty : null,
            newProduct.promoActive ? 1 : 0
          ]);
        } catch (dbErr) {
          console.warn("Notice direct insert product to MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      res.status(201).json({ success: true, product: newProduct, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const handleUpdateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const index = menuItems.findIndex((m) => m.id === id);
      if (index === -1) {
        req.body.id = id;
        return handleCreateProduct(req, res);
      }
      const parsedStock = req.body.stock !== void 0 && req.body.stock !== null && req.body.stock !== "" ? Math.max(0, Number(req.body.stock)) : req.body.stock === null ? void 0 : menuItems[index].stock;
      const pType = req.body.promoType !== void 0 ? req.body.promoType === "buy_x_get_y" ? "buy_x_get_y" : "bundle_price" : menuItems[index].promoType || "bundle_price";
      const pPrice = req.body.promoPrice !== void 0 ? req.body.promoPrice !== null && req.body.promoPrice !== "" && Number(req.body.promoPrice) > 0 ? Number(req.body.promoPrice) : void 0 : menuItems[index].promoPrice;
      const pFreeQty = req.body.promoFreeQty !== void 0 ? req.body.promoFreeQty !== null && req.body.promoFreeQty !== "" && Number(req.body.promoFreeQty) > 0 ? Number(req.body.promoFreeQty) : void 0 : menuItems[index].promoFreeQty;
      const pMinQty = req.body.promoMinQty !== void 0 ? Number(req.body.promoMinQty) || 2 : menuItems[index].promoMinQty || 2;
      const pActive = req.body.promoActive !== void 0 ? Boolean(req.body.promoActive) : menuItems[index].promoActive !== false;
      const pInfo = req.body.promoInfo !== void 0 ? req.body.promoInfo : menuItems[index].promoInfo;
      menuItems[index] = {
        ...menuItems[index],
        ...req.body,
        id,
        price: Number(req.body.price ?? menuItems[index].price),
        costPrice: req.body.costPrice !== void 0 ? Number(req.body.costPrice) : menuItems[index].costPrice || 0,
        stock: parsedStock,
        available: req.body.available !== void 0 ? Boolean(req.body.available) : parsedStock !== void 0 ? parsedStock > 0 : menuItems[index].available,
        promoType: pType,
        promoInfo: pInfo,
        promoPrice: pPrice,
        promoMinQty: pMinQty,
        promoFreeQty: pFreeQty,
        promoActive: pActive
      };
      const updatedProd = menuItems[index];
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
            updatedProd.description || "",
            updatedProd.price,
            updatedProd.costPrice || 0,
            updatedProd.stock !== void 0 ? updatedProd.stock : null,
            updatedProd.badge || "Menu Pilihan",
            updatedProd.imageUrl || "",
            JSON.stringify(updatedProd.variants || ["Original"]),
            updatedProd.keywords || "",
            updatedProd.available ? 1 : 0,
            updatedProd.promoInfo || "",
            updatedProd.promoPrice !== void 0 ? updatedProd.promoPrice : null,
            updatedProd.promoMinQty !== void 0 ? updatedProd.promoMinQty : null,
            updatedProd.promoType || "bundle_price",
            updatedProd.promoFreeQty !== void 0 ? updatedProd.promoFreeQty : null,
            updatedProd.promoActive ? 1 : 0
          ]);
        } catch (dbErr) {
          console.warn("Notice direct update product to MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      res.json({ success: true, product: updatedProd, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.patch("/api/admin/menu/:id/stock", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const index = menuItems.findIndex((m) => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan." });
      }
      const parsedStock = stock !== void 0 && stock !== null && stock !== "" ? Math.max(0, Number(stock)) : void 0;
      menuItems[index].stock = parsedStock;
      if (parsedStock !== void 0 && parsedStock <= 0) {
        menuItems[index].available = false;
      } else if (parsedStock !== void 0 && parsedStock > 0) {
        menuItems[index].available = true;
      }
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?", [
            parsedStock !== void 0 ? parsedStock : null,
            menuItems[index].available ? 1 : 0,
            id
          ]);
        } catch (dbErr) {
          console.warn("Notice direct stock update to MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      res.json({ success: true, product: menuItems[index], menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/menu/:id/restock", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { addStock, stock } = req.body;
      const amountToAdd = Math.max(1, Number(addStock ?? stock ?? 10));
      const index = menuItems.findIndex((m) => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan." });
      }
      const currentStock = menuItems[index].stock ?? 0;
      const newStock = currentStock + amountToAdd;
      menuItems[index].stock = newStock;
      menuItems[index].available = true;
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = ?, tersedia = 1 WHERE id = ?", [newStock, id]);
        } catch (dbErr) {
          console.warn("Notice direct restock to MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      res.json({
        success: true,
        message: `Stok ${menuItems[index].name} berhasil ditambah ${amountToAdd} porsi (total ${newStock} porsi)`,
        product: menuItems[index],
        menuItems
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/menu/:id/reset-stock", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const index = menuItems.findIndex((m) => m.id === id);
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
        } catch (dbErr) {
          console.warn("Notice direct reset stock to MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      res.json({
        success: true,
        message: `Stok produk ${menuItems[index].name} berhasil direset ke 0 (produk tetap ada)`,
        product: menuItems[index],
        menuItems
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/menu/reset-all-stocks", requireAdmin, async (_req, res) => {
    try {
      menuItems.forEach((item) => {
        item.stock = 0;
        item.available = false;
      });
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("UPDATE menu_produk SET stok = 0, tersedia = 0");
        } catch (dbErr) {
          console.warn("Notice direct reset all stocks to MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      res.json({
        success: true,
        message: "Semua stok produk berhasil dikosongkan (0 porsi). Seluruh data menu tetap aman tersimpan.",
        menuItems
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/products", requireAdmin, handleCreateProduct);
  app.post("/api/admin/menu", requireAdmin, handleCreateProduct);
  app.put("/api/admin/products/:id", requireAdmin, handleUpdateProduct);
  app.put("/api/admin/menu/:id", requireAdmin, handleUpdateProduct);
  app.post("/api/admin/products/:id", requireAdmin, handleUpdateProduct);
  app.post("/api/admin/menu/:id", requireAdmin, handleUpdateProduct);
  const deleteDrivePhotoIfPresent = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== "string") return;
    let fileId = null;
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
        body: JSON.stringify({ action: "delete", fileId, url: imageUrl }),
        redirect: "follow"
      }).then((r) => r.text()).then((txt) => {
        console.log(`[Drive Auto-Delete] File ${fileId} deletion response:`, txt);
      }).catch((err) => {
        console.warn(`[Drive Auto-Delete] Failed to delete file ${fileId} in Google Drive:`, err.message);
      });
    }
  };
  const handleDeleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const targetItem = menuItems.find((m) => m.id === id);
      menuItems = menuItems.filter((m) => m.id !== id);
      if (dbPool) {
        let conn;
        try {
          conn = await dbPool.getConnection();
          await conn.query("DELETE FROM menu_produk WHERE id = ?", [id]);
        } catch (dbErr) {
          console.warn("Notice direct delete product from MySQL:", dbErr.message);
        } finally {
          if (conn) try {
            conn.release();
          } catch {
          }
        }
      }
      persistData();
      if (targetItem?.imageUrl) {
        deleteDrivePhotoIfPresent(targetItem.imageUrl);
      }
      res.json({ success: true, deletedId: id, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.delete("/api/admin/products/:id", requireAdmin, handleDeleteProduct);
  app.delete("/api/admin/menu/:id", requireAdmin, handleDeleteProduct);
  app.post("/api/admin/products/:id/delete", requireAdmin, handleDeleteProduct);
  app.post("/api/admin/menu/:id/delete", requireAdmin, handleDeleteProduct);
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    setNoCacheHeaders(res);
    if (dbPool) {
      try {
        const queryPromise = dbPool.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 200");
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("MySQL DB query timeout")), 1500)
        );
        const [orderRows] = await Promise.race([queryPromise, timeoutPromise]);
        if (Array.isArray(orderRows)) {
          orders = orderRows.map((o) => ({
            id: o.id,
            pembeli: o.pembeli,
            waktu: o.waktu,
            items: o.item_pesanan_json ? typeof o.item_pesanan_json === "string" ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json : [],
            total: Number(o.total || 0),
            status: o.status || "MENUNGGU",
            createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
          }));
        }
      } catch (dbErr) {
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
      const normalizedId = String(id || "").trim();
      let order = orders.find(
        (o) => o.id === normalizedId || o.id && o.id.toLowerCase() === normalizedId.toLowerCase() || o.id && o.id.replace(/^SK-/i, "") === normalizedId.replace(/^SK-/i, "")
      );
      if (!order && dbPool) {
        try {
          const rawNum = normalizedId.replace(/^SK-/i, "");
          const [dbRows] = await dbPool.query(
            "SELECT * FROM pesanan WHERE id = ? OR id = ? OR id = ? LIMIT 1",
            [normalizedId, normalizedId.toUpperCase(), `SK-${rawNum}`]
          );
          if (Array.isArray(dbRows) && dbRows.length > 0) {
            const o = dbRows[0];
            order = {
              id: o.id,
              pembeli: o.pembeli,
              waktu: o.waktu,
              items: o.item_pesanan_json ? typeof o.item_pesanan_json === "string" ? JSON.parse(o.item_pesanan_json) : o.item_pesanan_json : [],
              total: Number(o.total || 0),
              status: o.status || "MENUNGGU",
              createdAt: o.dibuat_pada ? new Date(o.dibuat_pada).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
            };
            orders.unshift(order);
          }
        } catch (dbErr) {
          console.warn("Notice checking order in MySQL on patch:", dbErr.message);
        }
      }
      if (!order) {
        if (clientOrder && typeof clientOrder === "object") {
          order = {
            id: clientOrder.id || normalizedId,
            pembeli: clientOrder.pembeli || "Pelanggan",
            waktu: clientOrder.waktu || getJakartaTimeString(),
            items: Array.isArray(clientOrder.items) ? clientOrder.items : [],
            total: Number(clientOrder.total || 0),
            status: status || clientOrder.status || "MENUNGGU",
            createdAt: clientOrder.createdAt || (/* @__PURE__ */ new Date()).toISOString()
          };
          orders.unshift(order);
        } else {
          order = {
            id: normalizedId.startsWith("SK-") ? normalizedId : `SK-${normalizedId}`,
            pembeli: "Pelanggan",
            waktu: getJakartaTimeString(),
            items: [],
            total: 0,
            status: status || "MENUNGGU",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          orders.unshift(order);
        }
      }
      const prevStatus = (order.status || "").toLowerCase();
      const nextStatus = (status || order.status || "").toLowerCase();
      const wasSelesai = prevStatus === "selesai";
      const isSelesai = nextStatus === "selesai";
      if (!wasSelesai && isSelesai) {
        (order.items || []).forEach((it) => {
          const prod = menuItems.find(
            (m) => it.productId && m.id === it.productId || m.name.toLowerCase().trim() === (it.name || "").toLowerCase().trim()
          );
          if (prod && prod.stock !== void 0 && prod.stock !== null) {
            prod.stock = Math.max(0, Number(prod.stock) - Number(it.qty || 1));
            if (prod.stock === 0) prod.available = false;
          }
        });
      } else if (wasSelesai && !isSelesai) {
        (order.items || []).forEach((it) => {
          const prod = menuItems.find(
            (m) => it.productId && m.id === it.productId || m.name.toLowerCase().trim() === (it.name || "").toLowerCase().trim()
          );
          if (prod && prod.stock !== void 0 && prod.stock !== null) {
            prod.stock = Number(prod.stock) + Number(it.qty || 1);
            if (prod.stock > 0) prod.available = true;
          }
        });
      }
      order.status = status || order.status;
      persistData();
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
            order.pembeli || "Pelanggan",
            order.waktu || getJakartaTimeString(),
            itemsJson,
            order.total || 0,
            order.status,
            new Date(order.createdAt || Date.now())
          ]);
          if (Array.isArray(menuItems)) {
            for (const m of menuItems) {
              if (m.stock !== void 0 && m.stock !== null) {
                await dbPool.query("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?", [m.stock, m.available ? 1 : 0, m.id]).catch(() => {
                });
              }
            }
          }
        } catch (dbErr) {
          console.warn("Direct MySQL order status update notice:", dbErr.message);
        }
      }
      res.json({ success: true, order, orders, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const normalizedId = String(id || "").trim();
      const rawNum = normalizedId.replace(/^SK-/i, "");
      const targetOrder = orders.find(
        (o) => o.id === normalizedId || o.id && o.id.toLowerCase() === normalizedId.toLowerCase() || o.id && o.id.replace(/^SK-/i, "") === rawNum
      );
      if (targetOrder && (targetOrder.status || "").toLowerCase() === "selesai") {
        (targetOrder.items || []).forEach((it) => {
          const prod = menuItems.find(
            (m) => it.productId && m.id === it.productId || m.name.toLowerCase().trim() === (it.name || "").toLowerCase().trim()
          );
          if (prod && prod.stock !== void 0 && prod.stock !== null) {
            prod.stock = Number(prod.stock) + Number(it.qty || 1);
            if (prod.stock > 0) prod.available = true;
          }
        });
      }
      orders = orders.filter(
        (o) => o.id !== normalizedId && o.id.toLowerCase() !== normalizedId.toLowerCase() && o.id.replace(/^SK-/i, "") !== rawNum
      );
      persistData();
      if (dbPool) {
        try {
          await dbPool.query("DELETE FROM pesanan WHERE id = ? OR id = ? OR id = ?", [
            normalizedId,
            normalizedId.toUpperCase(),
            `SK-${rawNum}`
          ]);
        } catch (dbErr) {
          console.warn("Direct MySQL order deletion notice:", dbErr.message);
        }
      }
      res.json({ success: true, orders, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const clearAllOrdersHandler = async (req, res) => {
    try {
      orders = [];
      try {
        const payload = {
          siteSettings,
          heroCards,
          menuItems,
          teamMembers,
          orders: []
        };
        import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
      } catch (fsErr) {
        console.error("Failed to write data_store.json on clear:", fsErr);
      }
      res.json({
        success: true,
        message: "Semua data pesanan kasir dan laporan penjualan berhasil dikosongkan. Siap diinput dari awal!",
        orders: [],
        menuItems
      });
      if (dbPool) {
        dbPool.getConnection().then(async (conn) => {
          try {
            await conn.query("DELETE FROM pesanan");
          } catch (dbErr) {
            console.warn("Notice MySQL truncate pesanan:", dbErr.message);
          } finally {
            conn.release();
          }
        }).catch((connErr) => {
          console.warn("Notice MySQL pool on clear:", connErr.message);
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message || "Gagal mengosongkan data pesanan" });
    }
  };
  app.post("/api/admin/orders/clear", requireAdmin, clearAllOrdersHandler);
  app.delete("/api/admin/orders", requireAdmin, clearAllOrdersHandler);
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const possibleDistPaths = [
      import_path.default.join(process.cwd(), "dist"),
      process.cwd(),
      import_path.default.join(__dirname, "dist"),
      __dirname
    ];
    const staticPath = possibleDistPaths.find((p) => import_fs.default.existsSync(import_path.default.join(p, "index.html"))) || import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(staticPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(staticPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Soki Admin & Storefront Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
