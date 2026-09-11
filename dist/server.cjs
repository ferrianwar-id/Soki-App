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
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_promise = __toESM(require("mysql2/promise"), 1);
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
    const [settingsRows] = await conn.query("SELECT * FROM pengaturan_situs WHERE id = 1 LIMIT 1");
    if (settingsRows && settingsRows.length > 0) {
      const s = settingsRows[0];
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
        storeSchedule: s.jadwal_toko_json ? JSON.parse(s.jadwal_toko_json) : siteSettings.storeSchedule
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
        accentColor: c.warna_aksen
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
        promoInfo: m.info_promo,
        promoPrice: m.harga_promo !== null ? Number(m.harga_promo) : void 0,
        promoMinQty: m.min_qty_promo !== null ? Number(m.min_qty_promo) : void 0,
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
    const [orderRows] = await conn.query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 100");
    if (orderRows && orderRows.length > 0) {
      orders = orderRows.map((o) => ({
        id: o.id,
        pembeli: o.pembeli,
        waktu: o.waktu,
        items: o.item_pesanan_json ? JSON.parse(o.item_pesanan_json) : [],
        total: Number(o.total),
        status: o.status,
        createdAt: o.dibuat_pada
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
      await conn.query(`
        INSERT INTO pengaturan_situs (id, judul_situs, headline, highlight, subjudul, pengumuman, nomor_whatsapp, tentang_judul, tentang_subjudul, tentang_badge, fitur_json, webhook_drive, folder_produk_id, folder_landing_id, maintenance_json, jadwal_toko_json)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          jadwal_toko_json = VALUES(jadwal_toko_json)
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
        siteSettings.maintenance ? JSON.stringify(siteSettings.maintenance) : null,
        siteSettings.storeSchedule ? JSON.stringify(siteSettings.storeSchedule) : null
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
            INSERT INTO kartu_beranda (id, judul, subjudul, badge, gambar_url, icon, bg_gradient, accent_color, product_id, urutan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              judul = VALUES(judul),
              subjudul = VALUES(subjudul),
              badge = VALUES(badge),
              gambar_url = VALUES(gambar_url),
              icon = VALUES(icon),
              bg_gradient = VALUES(bg_gradient),
              accent_color = VALUES(accent_color),
              product_id = VALUES(product_id),
              urutan = VALUES(urutan)
          `, [
            card.id || `card-${i + 1}`,
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
          await conn.query(`
            INSERT INTO anggota_tim (id, nama, absen, peran, deskripsi, inisial, warna_tema, urutan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              nama = VALUES(nama),
              absen = VALUES(absen),
              peran = VALUES(peran),
              deskripsi = VALUES(deskripsi),
              inisial = VALUES(inisial),
              warna_tema = VALUES(warna_tema),
              urutan = VALUES(urutan)
          `, [
            tm.id || `member-${i + 1}`,
            tm.name || "",
            tm.absen || "",
            tm.role || "",
            tm.description || "",
            tm.initial || tm.name?.charAt(0)?.toUpperCase() || "A",
            tm.themeColor || "amber",
            i + 1
          ]);
        }
      }
      if (Array.isArray(menuItems) && menuItems.length > 0) {
        for (const item of menuItems) {
          await conn.query(`
            INSERT INTO menu_produk (id, kategori, nama, deskripsi, harga, harga_modal, stok, badge, gambar_url, varian_json, kata_kunci, tersedia, info_promo, harga_promo, min_qty_promo, promo_aktif)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            item.promoPrice !== void 0 ? Number(item.promoPrice) : null,
            item.promoMinQty !== void 0 ? Number(item.promoMinQty) : null,
            item.promoActive ? 1 : 0
          ]);
        }
        const activeIds = menuItems.map((m) => m.id);
        if (activeIds.length > 0) {
          const placeholders = activeIds.map(() => "?").join(",");
          await conn.query(`DELETE FROM menu_produk WHERE id NOT IN (${placeholders})`, activeIds);
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
loadPersistedData();
syncFromDatabase();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "15mb" }));
  const ADMIN_EMAIL = "admin@soki.com";
  const ADMIN_PASS = "admin";
  const ADMIN_TOKEN = "soki-secret-admin-session-token-2026";
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      return res.json({
        success: true,
        token: ADMIN_TOKEN,
        user: { email: ADMIN_EMAIL, name: "Admin Soki" }
      });
    }
    return res.status(401).json({ error: "Email atau password admin salah." });
  });
  const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return res.status(403).json({ error: "Akses ditolak. Sesi admin tidak sah." });
    }
    next();
  };
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Soki API Engine" });
  });
  app.get("/api/state", (req, res) => {
    res.json({
      siteSettings,
      heroCards,
      menuItems,
      teamMembers
    });
  });
  app.get("/api/menu", (req, res) => {
    res.json(menuItems);
  });
  app.get("/api/hero-cards", (req, res) => {
    res.json(heroCards);
  });
  app.get("/api/settings", (req, res) => {
    res.json(siteSettings);
  });
  app.get("/api/team", (req, res) => {
    res.json(teamMembers);
  });
  app.post("/api/orders", (req, res) => {
    try {
      const { pembeli, items, total } = req.body;
      if (!pembeli || !items || !items.length || !total) {
        return res.status(400).json({ error: "Data pesanan tidak lengkap." });
      }
      const nomorAntrean = Math.floor(100 + Math.random() * 900);
      const enrichedItems = Array.isArray(items) ? items.map((it) => {
        const foundMenu = menuItems.find((m) => m.name.toLowerCase() === (it.name || "").toLowerCase());
        const costPrice = it.costPrice !== void 0 ? Number(it.costPrice) : foundMenu?.costPrice || 0;
        return {
          ...it,
          price: Number(it.price || 0),
          costPrice,
          qty: Number(it.qty || 1)
        };
      }) : [];
      if (Array.isArray(enrichedItems)) {
        enrichedItems.forEach((it) => {
          const prod = menuItems.find((m) => m.name.toLowerCase() === (it.name || "").toLowerCase());
          if (prod && prod.stock !== void 0 && prod.stock !== null) {
            const newStock = Math.max(0, Number(prod.stock) - Number(it.qty || 1));
            prod.stock = newStock;
            if (newStock === 0) {
              prod.available = false;
            }
          }
        });
      }
      const newOrder = {
        id: "SK-" + nomorAntrean,
        pembeli: pembeli.trim(),
        waktu: (/* @__PURE__ */ new Date()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        items: enrichedItems,
        total,
        status: "MENUNGGU",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      orders.unshift(newOrder);
      persistData();
      res.status(201).json({ success: true, order: newOrder });
    } catch (err) {
      res.status(500).json({ error: err.message || "Gagal memproses pesanan" });
    }
  });
  app.put("/api/admin/hero-cards", requireAdmin, (req, res) => {
    try {
      const updatedCards = req.body;
      if (!Array.isArray(updatedCards) || updatedCards.length < 2) {
        return res.status(400).json({ error: "Harus menyediakan minimal 2 konfigurasi card." });
      }
      heroCards = updatedCards;
      persistData();
      res.json({ success: true, heroCards });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const handleUpdateSettings = (req, res) => {
    try {
      siteSettings = { ...siteSettings, ...req.body };
      persistData();
      res.json({ success: true, siteSettings });
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
  app.put("/api/admin/maintenance", requireAdmin, (req, res) => {
    try {
      siteSettings.maintenance = {
        ...siteSettings.maintenance,
        ...req.body
      };
      persistData();
      res.json({ success: true, maintenance: siteSettings.maintenance, siteSettings });
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
  app.post("/api/admin/upload-drive", requireAdmin, async (req, res) => {
    try {
      const { fileName, base64, mimeType, target } = req.body;
      if (!fileName || !base64) {
        return res.status(400).json({ error: "File gambar tidak valid." });
      }
      const parts = fileName.split(".");
      if (parts.length > 2) {
        return res.status(400).json({
          error: `Dilarang menggunakan ekstensi ganda ("${fileName}"). Format file harus satu ekstensi asli (contoh: foto.jpg atau gambar.png).`
        });
      }
      const ext = parts[parts.length - 1].toLowerCase();
      if (!["jpg", "jpeg", "png"].includes(ext)) {
        return res.status(400).json({ error: "Hanya format .jpg, .jpeg, dan .png yang diizinkan." });
      }
      const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
      const detectedMime = mimeType || (ext === "png" ? "image/png" : "image/jpeg");
      const productFolderId = siteSettings.googleDriveProductFolderId || "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
      const cardFolderId = siteSettings.googleDriveCardFolderId || "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn";
      const selectedFolderId = target === "landingpage" ? cardFolderId : productFolderId;
      const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || siteSettings.googleDriveWebhookUrl;
      if (webhookUrl && webhookUrl.startsWith("http")) {
        try {
          const driveResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            if (driveData.url || driveData.id) {
              const fileUrl = driveData.url || `https://lh3.googleusercontent.com/d/${driveData.id}`;
              console.log(`[Google Drive Webhook] Sukses upload "${fileName}" ke Google Drive (${target || "product"}): ${fileUrl}`);
              return res.json({
                success: true,
                url: fileUrl,
                fileName,
                source: "google-drive",
                target: target || "product"
              });
            }
          } else {
            console.warn(`[Google Drive Webhook] Webhook respons status ${driveResponse.status}`);
          }
        } catch (webhookErr) {
          console.warn("[Google Drive Webhook] Gagal koneksi ke webhook:", webhookErr?.message || webhookErr);
        }
      }
      const dataUrl = `data:${detectedMime};base64,${cleanBase64}`;
      return res.json({
        success: true,
        url: dataUrl,
        fileName,
        source: "direct",
        target: target || "product"
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Gagal memproses upload gambar." });
    }
  });
  const handleCreateProduct = (req, res) => {
    try {
      const { name, category, price, costPrice, stock, description, badge, imageUrl, variants, promoInfo, promoPrice, promoMinQty, promoActive, available } = req.body;
      if (!name || price === void 0) {
        return res.status(400).json({ error: "Nama dan harga produk wajib diisi." });
      }
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const parsedStock = stock !== void 0 && stock !== null && stock !== "" ? Math.max(0, Number(stock)) : void 0;
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
        promoInfo: promoInfo || "",
        promoPrice: promoPrice !== void 0 ? Number(promoPrice) : void 0,
        promoMinQty: promoMinQty !== void 0 ? Number(promoMinQty) : void 0,
        promoActive: promoActive !== void 0 ? Boolean(promoActive) : false
      };
      menuItems.push(newProduct);
      persistData();
      res.status(201).json({ success: true, product: newProduct, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const handleUpdateProduct = (req, res) => {
    try {
      const { id } = req.params;
      const index = menuItems.findIndex((m) => m.id === id);
      if (index === -1) {
        return res.status(404).json({ error: "Produk tidak ditemukan." });
      }
      const parsedStock = req.body.stock !== void 0 && req.body.stock !== null && req.body.stock !== "" ? Math.max(0, Number(req.body.stock)) : req.body.stock === null ? void 0 : menuItems[index].stock;
      menuItems[index] = {
        ...menuItems[index],
        ...req.body,
        price: Number(req.body.price ?? menuItems[index].price),
        costPrice: req.body.costPrice !== void 0 ? Number(req.body.costPrice) : menuItems[index].costPrice || 0,
        stock: parsedStock,
        available: req.body.available !== void 0 ? Boolean(req.body.available) : parsedStock !== void 0 ? parsedStock > 0 : menuItems[index].available,
        promoPrice: req.body.promoPrice !== void 0 ? Number(req.body.promoPrice) : menuItems[index].promoPrice,
        promoMinQty: req.body.promoMinQty !== void 0 ? Number(req.body.promoMinQty) : menuItems[index].promoMinQty,
        promoActive: req.body.promoActive !== void 0 ? Boolean(req.body.promoActive) : menuItems[index].promoActive
      };
      persistData();
      res.json({ success: true, product: menuItems[index], menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  app.patch("/api/admin/menu/:id/stock", requireAdmin, (req, res) => {
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
      persistData();
      res.json({ success: true, product: menuItems[index], menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/admin/products", requireAdmin, handleCreateProduct);
  app.post("/api/admin/menu", requireAdmin, handleCreateProduct);
  app.put("/api/admin/products/:id", requireAdmin, handleUpdateProduct);
  app.put("/api/admin/menu/:id", requireAdmin, handleUpdateProduct);
  app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      menuItems = menuItems.filter((m) => m.id !== id);
      persistData();
      res.json({ success: true, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/menu/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      menuItems = menuItems.filter((m) => m.id !== id);
      persistData();
      res.json({ success: true, menuItems });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/admin/orders", requireAdmin, (req, res) => {
    res.json(orders);
  });
  app.patch("/api/admin/orders/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = orders.find((o) => o.id === id);
      if (!order) {
        return res.status(404).json({ error: "Pesanan tidak ditemukan." });
      }
      order.status = status || order.status;
      persistData();
      res.json({ success: true, order, orders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.delete("/api/admin/orders/:id", requireAdmin, (req, res) => {
    try {
      const { id } = req.params;
      orders = orders.filter((o) => o.id !== id);
      persistData();
      res.json({ success: true, orders });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
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
