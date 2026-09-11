<?php
/**
 * Konfigurasi Database cPanel & Skrip Migrasi/Koneksi Tabel Bahasa Indonesia
 * Aplikasi Soki-App (Kelompok 3 Kelas 8B)
 */

$host = "localhost";
$username = "namadatabase_user"; // Ganti dengan user cPanel Anda
$password = "password_anda";     // Ganti dengan password database cPanel Anda
$dbname   = "namadatabase_soki"; // Ganti dengan nama database cPanel Anda

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die(json_encode(["error" => "Koneksi database cPanel gagal: " . $e->getMessage()]));
}

// Skrip Pembuatan Tabel dengan Nama Bahasa Indonesia
$sql = "
CREATE TABLE IF NOT EXISTS pengaturan_situs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul_situs VARCHAR(255),
    headline VARCHAR(255),
    highlight VARCHAR(255),
    subjudul TEXT,
    pengumuman TEXT,
    nomor_whatsapp VARCHAR(50),
    tentang_judul VARCHAR(255),
    tentang_subjudul TEXT,
    tentang_badge VARCHAR(100),
    webhook_drive TEXT,
    folder_produk_id VARCHAR(255),
    folder_landing_id VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS menu_produk (
    id VARCHAR(100) PRIMARY KEY,
    kategori VARCHAR(50),
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    harga INT NOT NULL,
    badge VARCHAR(100),
    gambar_url TEXT,
    varian TEXT,
    kata_kunci TEXT,
    tersedia BOOLEAN DEFAULT TRUE,
    info_promo TEXT,
    harga_promo INT,
    min_qty_promo INT,
    promo_aktif BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kartu_beranda (
    id VARCHAR(100) PRIMARY KEY,
    judul VARCHAR(255),
    subjudul TEXT,
    badge VARCHAR(100),
    gambar_url TEXT,
    ikon VARCHAR(50),
    gradient_bg VARCHAR(100),
    warna_aksen VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tim_pengelola (
    id VARCHAR(100) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    absen VARCHAR(50),
    peran VARCHAR(100),
    deskripsi TEXT,
    inisial VARCHAR(10),
    avatar_url TEXT,
    warna_tema VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pesanan (
    id VARCHAR(50) PRIMARY KEY,
    pembeli VARCHAR(255) NOT NULL,
    waktu VARCHAR(50),
    item_pesanan TEXT NOT NULL,
    total INT NOT NULL,
    status VARCHAR(50) DEFAULT 'MENUNGGU',
    dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
";

if (isset($_GET['install']) && $_GET['install'] === 'true') {
    try {
        $pdo->exec($sql);
        echo json_encode(["success" => true, "pesan" => "Struktur tabel bahasa Indonesia berhasil dibuat di database cPanel!"]);
        exit;
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
        exit;
    }
}
?>
