<?php
/**
 * API Backend Soki-App (cPanel PHP + MySQL Full Integration)
 * Bahasa Indonesia Database Schema
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfigurasi Database cPanel MySQL Anda
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_USER = getenv('DB_USER') ?: 'aapjgfju_admin-dmirecord_db';
$DB_PASS = getenv('DB_PASS') ?: 'FerriAnwar22032001';
$DB_NAME = getenv('DB_NAME') ?: 'aapjgfju_dmirecord_db';
$DB_PORT = getenv('DB_PORT') ?: 3306;

$pdo = null;
try {
    $pdo = new PDO("mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // Jika koneksi via localhost gagal pada server tertentu, coba via IP
    try {
        $pdo = new PDO("mysql:host=157.66.55.62;port=3306;dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $ex) {}
}

if (isset($_GET['install']) && $_GET['install'] === 'true' && $pdo) {
    try {
        $pdo->exec("
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
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

            CREATE TABLE IF NOT EXISTS `menu_produk` (
              `id` varchar(100) NOT NULL,
              `kategori` varchar(50) NOT NULL DEFAULT 'makanan',
              `nama` varchar(255) NOT NULL,
              `deskripsi` text DEFAULT NULL,
              `harga` int(11) NOT NULL DEFAULT 3000,
              `harga_modal` int(11) DEFAULT 0,
              `stok` int(11) DEFAULT NULL,
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
        ");
        echo json_encode(["success" => true, "message" => "Tabel database cPanel Bahasa Indonesia berhasil dibuat!"]);
        exit;
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
        exit;
    }
}

$requestUri = $_SERVER['REQUEST_URI'];
$uriPath = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?: [];

$ADMIN_TOKEN = 'soki-secret-admin-session-token-2026';
$ADMIN_EMAIL = 'admin@soki.com';
$ADMIN_PASS = 'admin';

if (strpos($uriPath, '/api/admin/login') !== false && $method === 'POST') {
    if (($body['email'] ?? '') === $ADMIN_EMAIL && ($body['password'] ?? '') === $ADMIN_PASS) {
        echo json_encode([
            'success' => true,
            'token' => $ADMIN_TOKEN,
            'user' => ['email' => $ADMIN_EMAIL, 'name' => 'Admin Soki']
        ]);
        exit;
    }
    http_response_code(401);
    echo json_encode(['error' => 'Email atau password salah.']);
    exit;
}

if ($pdo) {
    if (strpos($uriPath, '/api/state') !== false && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM pengaturan_situs WHERE id = 1");
        $rowSettings = $stmt->fetch();
        $siteSettings = [
            'siteTitle' => $rowSettings['judul_situs'] ?? 'Soki - Snack Renyah & Aneka Es Segar',
            'heroHeadline' => $rowSettings['headline'] ?? 'Renyahnya Bikin Nagih, Segarnya Balikin Mood!',
            'heroHighlight' => $rowSettings['highlight'] ?? 'Renyahnya, Segarnya',
            'heroSubtitle' => $rowSettings['subjudul'] ?? '',
            'announcement' => $rowSettings['pengumuman'] ?? 'Kelas 8B Kelompok 3 • Menu Hari Rabu',
            'whatsappNumber' => $rowSettings['nomor_whatsapp'] ?? '+6281384998659',
            'aboutTitle' => $rowSettings['tentang_judul'] ?? 'Tim Pengelola Soki (Kelompok 3)',
            'aboutSubtitle' => $rowSettings['tentang_subjudul'] ?? '',
            'aboutBadge' => $rowSettings['tentang_badge'] ?? 'Kelas 8B Kelompok 3',
            'features' => json_decode($rowSettings['fitur_json'] ?? '[]', true),
            'googleDriveWebhookUrl' => $rowSettings['webhook_drive'] ?? '',
            'googleDriveProductFolderId' => $rowSettings['folder_produk_id'] ?? '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n',
            'googleDriveCardFolderId' => $rowSettings['folder_landing_id'] ?? '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn'
        ];

        $stmtCards = $pdo->query("SELECT * FROM kartu_beranda ORDER BY urutan ASC");
        $cards = [];
        while ($c = $stmtCards->fetch()) {
            $cards[] = [
                'id' => $c['id'],
                'title' => $c['judul'],
                'subtitle' => $c['subjudul'],
                'badge' => $c['badge'],
                'imageUrl' => $c['gambar_url'],
                'icon' => $c['ikon'],
                'bgGradient' => $c['gradient_bg'],
                'accentColor' => $c['warna_aksen']
            ];
        }

        $stmtMenu = $pdo->query("SELECT * FROM menu_produk ORDER BY dibuat_pada ASC");
        $menu = [];
        while ($m = $stmtMenu->fetch()) {
            $menu[] = [
                'id' => $m['id'],
                'category' => $m['kategori'],
                'name' => $m['nama'],
                'description' => $m['deskripsi'],
                'price' => (int)$m['harga'],
                'costPrice' => isset($m['harga_modal']) ? (int)$m['harga_modal'] : 0,
                'stock' => isset($m['stok']) && $m['stok'] !== null ? (int)$m['stok'] : null,
                'badge' => $m['badge'],
                'imageUrl' => $m['gambar_url'],
                'variants' => json_decode($m['varian_json'] ?? '["Original"]', true),
                'keywords' => $m['kata_kunci'] ?? '',
                'available' => (bool)$m['tersedia'],
                'promoInfo' => $m['info_promo'] ?? '',
                'promoPrice' => isset($m['harga_promo']) ? (int)$m['harga_promo'] : null,
                'promoMinQty' => isset($m['min_qty_promo']) ? (int)$m['min_qty_promo'] : null,
                'promoActive' => (bool)$m['promo_aktif']
            ];
        }

        $stmtTeam = $pdo->query("SELECT * FROM tim_pengelola ORDER BY urutan ASC");
        $team = [];
        while ($t = $stmtTeam->fetch()) {
            $team[] = [
                'id' => $t['id'],
                'name' => $t['nama'],
                'absen' => $t['absen'],
                'role' => $t['peran'] ?? '',
                'description' => $t['deskripsi'] ?? '',
                'initial' => $t['inisial'],
                'avatarUrl' => $t['avatar_url'],
                'themeColor' => $t['warna_tema']
            ];
        }

        echo json_encode([
            'siteSettings' => $siteSettings,
            'heroCards' => $cards,
            'menuItems' => $menu,
            'teamMembers' => $team
        ]);
        exit;
    }

    if (strpos($uriPath, '/api/orders') !== false && $method === 'POST') {
        $pembeli = trim($body['pembeli'] ?? 'Pembeli');
        $items = $body['items'] ?? [];
        $total = (int)($body['total'] ?? 0);
        $orderId = 'SK-' . rand(100, 999);
        $waktu = date('H:i');

        $stmt = $pdo->prepare("INSERT INTO pesanan (id, pembeli, waktu, item_pesanan_json, total, status, dibuat_pada) VALUES (?, ?, ?, ?, ?, 'MENUNGGU', NOW())");
        $stmt->execute([$orderId, $pembeli, $waktu, json_encode($items), $total]);

        echo json_encode([
            'success' => true,
            'order' => [
                'id' => $orderId,
                'pembeli' => $pembeli,
                'waktu' => $waktu,
                'items' => $items,
                'total' => $total,
                'status' => 'MENUNGGU'
            ]
        ]);
        exit;
    }
}

echo json_encode(['status' => 'ok', 'message' => 'Soki Database API Endpoint Active']);
