-- ==========================================================
-- SKRIP DATABASE SQL BAHASA INDONESIA - SOKI APP (KELOMPOK 3 KELAS 8B)
-- Kompatibel dengan MySQL / MariaDB di cPanel & phpMyAdmin
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL PENGATURAN SITUS
CREATE TABLE IF NOT EXISTS `pengaturan_situs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `judul_situs` varchar(255) DEFAULT 'Soki - Snack Renyah & Aneka Es Segar',
  `headline` varchar(255) DEFAULT 'Renyahnya Bikin Nagih, Segarnya Balikin Mood!',
  `highlight` varchar(255) DEFAULT 'Renyahnya, Segarnya',
  `subjudul` text DEFAULT NULL,
  `pengumuman` varchar(255) DEFAULT 'Kelas 8B Kelompok 3 • Menu Hari Rabu',
  `nomor_whatsapp` varchar(50) DEFAULT '+6281384998659',
  `tentang_judul` varchar(255) DEFAULT 'Tim Pengelola Soki (Kelompok 3)',
  `tentang_subjudul` text DEFAULT NULL,
  `tentang_badge` varchar(100) DEFAULT 'Kelas 8B Kelompok 3',
  `fitur_json` text DEFAULT NULL,
  `webhook_drive` text DEFAULT NULL,
  `folder_produk_id` varchar(255) DEFAULT '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n',
  `folder_landing_id` varchar(255) DEFAULT '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn',
  `diperbarui_pada` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL KARTU BERANDA (2 CARD SHOWCASE)
CREATE TABLE IF NOT EXISTS `kartu_beranda` (
  `id` varchar(100) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `subjudul` varchar(255) DEFAULT NULL,
  `badge` varchar(100) DEFAULT NULL,
  `gambar_url` text DEFAULT NULL,
  `ikon` varchar(50) DEFAULT NULL,
  `gradient_bg` varchar(100) DEFAULT NULL,
  `warna_aksen` varchar(50) DEFAULT NULL,
  `urutan` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL MENU PRODUK
CREATE TABLE IF NOT EXISTS `menu_produk` (
  `id` varchar(100) NOT NULL,
  `kategori` varchar(50) NOT NULL DEFAULT 'makanan',
  `nama` varchar(255) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` int(11) NOT NULL DEFAULT 3000,
  `badge` varchar(100) DEFAULT 'Menu Pilihan',
  `gambar_url` text DEFAULT NULL,
  `varian_json` text DEFAULT NULL,
  `kata_kunci` text DEFAULT NULL,
  `tersedia` tinyint(1) DEFAULT 1,
  `info_promo` varchar(255) DEFAULT 'beli 2 hanya Rp5.000!!',
  `harga_promo` int(11) DEFAULT 5000,
  `min_qty_promo` int(11) DEFAULT 2,
  `promo_aktif` tinyint(1) DEFAULT 1,
  `dibuat_pada` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL TIM PENGELOLA
CREATE TABLE IF NOT EXISTS `tim_pengelola` (
  `id` varchar(100) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `absen` varchar(50) DEFAULT NULL,
  `peran` varchar(100) DEFAULT '',
  `deskripsi` text DEFAULT NULL,
  `inisial` varchar(10) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `warna_tema` varchar(50) DEFAULT 'amber',
  `urutan` int(11) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL PESANAN & TRANSAKSI KASIR
CREATE TABLE IF NOT EXISTS `pesanan` (
  `id` varchar(50) NOT NULL,
  `pembeli` varchar(255) NOT NULL,
  `waktu` varchar(50) DEFAULT NULL,
  `item_pesanan_json` longtext NOT NULL,
  `total` int(11) NOT NULL,
  `status` varchar(50) DEFAULT 'MENUNGGU',
  `dibuat_pada` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- DATA AWAL (SEED DATA BERSIH)
-- ==========================================================

-- Data Pengaturan Situs
INSERT INTO `pengaturan_situs` (`id`, `judul_situs`, `headline`, `highlight`, `subjudul`, `pengumuman`, `nomor_whatsapp`, `tentang_judul`, `tentang_subjudul`, `tentang_badge`, `fitur_json`, `webhook_drive`, `folder_produk_id`, `folder_landing_id`)
VALUES (1, 
  'Soki - Snack Renyah & Aneka Es Segar',
  'Renyahnya Bikin Nagih, Segarnya Balikin Mood!',
  'Renyahnya, Segarnya',
  'Kami dari kelas 8B kelompok 3 menyediakan beberapa varian menu makanan untuk hari Rabu. Temukan kombinasi cemilan renyah gurih dan aneka es manis segar favoritmu di Soki.',
  'Kelas 8B Kelompok 3 • Menu Hari Rabu',
  '+6281384998659',
  'Tim Pengelola Soki (Kelompok 3)',
  'Toko Soki dikelola bersama oleh siswa-siswi Kelas 8B Kelompok 3 untuk menyajikan aneka jajanan renyah dan es manis segar pilihan.',
  'Kelas 8B Kelompok 3',
  '[{"title":"Snack Dijamin Garing","description":"Snack Soba dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.","icon":"🍟"},{"title":"Es Kiko Beku & Segar","description":"Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.","icon":"🧊"},{"title":"Harga Ramah Kantong","description":"Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.","icon":"⚡"}]',
  'https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec',
  '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n',
  '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn'
) ON DUPLICATE KEY UPDATE `judul_situs` = VALUES(`judul_situs`);

-- Data Kartu Beranda (2 Card Utama tanpa Dummy Image)
INSERT INTO `kartu_beranda` (`id`, `judul`, `subjudul`, `badge`, `gambar_url`, `ikon`, `gradient_bg`, `warna_aksen`, `urutan`)
VALUES 
('snack', 'Snack Soba (3 Varian)', 'Renyah gurih bumbu mantap', 'Cemilan Renyah', '', '🍟', 'from-amber-400 to-orange-500', '#ea580c', 1),
('es', 'Es Kiko (5 Varian)', 'Manis beku pelepas dahaga', 'Es Pelepas Dahaga', '', '🥤', 'from-cyan-400 to-blue-500', '#0284c7', 2)
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`);

-- Data Tim Pengelola
INSERT INTO `tim_pengelola` (`id`, `nama`, `absen`, `peran`, `deskripsi`, `inisial`, `avatar_url`, `warna_tema`, `urutan`)
VALUES 
('member-valentino', 'Valentino', '8B/20', '', '', 'V', NULL, 'amber', 1),
('member-kleinegan', 'Kleinegan', '8B/12', '', '', 'K', NULL, 'sky', 2),
('member-karin', 'Karin', '8B/11', '', '', 'K', NULL, 'rose', 3),
('member-rina', 'Rina', '8B/17', '', '', 'R', NULL, 'emerald', 4)
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

SET FOREIGN_KEY_CHECKS = 1;
