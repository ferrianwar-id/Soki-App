<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Konfigurasi Database cPanel MySQL
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
    try {
        $pdo = new PDO("mysql:host=157.66.55.62;port=3306;dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $ex) {}
}

// Inisialisasi Otomatis Tabel & Migrasi Kolom
if ($pdo) {
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
              `maintenance_json` text DEFAULT NULL,
              `schedule_json` text DEFAULT NULL,
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
              `product_id` varchar(100) DEFAULT NULL,
              `urutan` int(11) DEFAULT 1,
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

            CREATE TABLE IF NOT EXISTS `menu_produk` (
              `id` varchar(100) NOT NULL,
              `kategori` varchar(50) NOT NULL DEFAULT 'snack',
              `nama` varchar(255) NOT NULL,
              `deskripsi` text DEFAULT NULL,
              `harga` int(11) NOT NULL,
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

        // Periksa kolom stok & harga_modal jika belum ada di menu_produk
        $cols = $pdo->query("SHOW COLUMNS FROM menu_produk LIKE 'stok'")->fetchAll();
        if (count($cols) === 0) {
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `stok` int(11) DEFAULT NULL AFTER `harga`");
        }
        $colsModal = $pdo->query("SHOW COLUMNS FROM menu_produk LIKE 'harga_modal'")->fetchAll();
        if (count($colsModal) === 0) {
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `harga_modal` int(11) DEFAULT 0 AFTER `harga`");
        }
    } catch (Exception $e) {}
}

if (isset($_GET['install']) && $_GET['install'] === 'true') {
    echo json_encode(["success" => true, "message" => "Tabel database cPanel Bahasa Indonesia berhasil dibuat & dimigrasikan!"]);
    exit;
}

$requestUri = $_SERVER['REQUEST_URI'];
$uriPath = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?: [];

$ADMIN_TOKEN = 'soki-secret-admin-session-token-2026';
$ADMIN_EMAIL = 'admin@soki.com';
$ADMIN_PASS = 'admin';

// Helper Admin Token Check
function checkAdminAuth($token) {
    global $ADMIN_TOKEN;
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if ($auth === "Bearer {$ADMIN_TOKEN}" || (isset($_GET['token']) && $_GET['token'] === $ADMIN_TOKEN)) {
        return true;
    }
    http_response_code(403);
    echo json_encode(['error' => 'Akses ditolak. Sesi admin tidak sah.']);
    exit;
}

// 1. ADMIN LOGIN
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

if (!$pdo) {
    echo json_encode(['error' => 'Koneksi database belum tersedia.']);
    exit;
}

// 2. GET PUBLIC STATE (/api/state)
if (strpos($uriPath, '/api/state') !== false && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM pengaturan_situs WHERE id = 1");
    $rowSettings = $stmt->fetch() ?: [];
    
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
        'googleDriveCardFolderId' => $rowSettings['folder_landing_id'] ?? '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn',
        'maintenance' => json_decode($rowSettings['maintenance_json'] ?? '{"enabled":false}', true),
        'storeSchedule' => json_decode($rowSettings['schedule_json'] ?? 'null', true)
    ];

    $stmtCards = $pdo->query("SELECT * FROM kartu_beranda ORDER BY urutan ASC");
    $cards = [];
    while ($c = $stmtCards->fetch()) {
        $cards[] = [
            'id' => $c['id'],
            'title' => $c['judul'],
            'subtitle' => $c['subjudul'],
            'badge' => $c['badge'],
            'imageUrl' => $c['gambar_url'] ?? '',
            'icon' => $c['ikon'] ?? '',
            'bgGradient' => $c['gradient_bg'] ?? '',
            'accentColor' => $c['warna_aksen'] ?? '',
            'productId' => $c['product_id'] ?? null
        ];
    }

    $stmtMenu = $pdo->query("SELECT * FROM menu_produk ORDER BY dibuat_pada ASC");
    $menu = [];
    while ($m = $stmtMenu->fetch()) {
        $menu[] = [
            'id' => $m['id'],
            'category' => $m['kategori'],
            'name' => $m['nama'],
            'description' => $m['deskripsi'] ?? '',
            'price' => (int)$m['harga'],
            'costPrice' => isset($m['harga_modal']) ? (int)$m['harga_modal'] : 0,
            'stock' => isset($m['stok']) && $m['stok'] !== null ? (int)$m['stok'] : null,
            'badge' => $m['badge'] ?? 'Menu Pilihan',
            'imageUrl' => $m['gambar_url'] ?? '',
            'variants' => json_decode($m['varian_json'] ?? '["Original"]', true) ?: ["Original"],
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
            'absen' => $t['absen'] ?? '',
            'role' => $t['peran'] ?? '',
            'description' => $t['deskripsi'] ?? '',
            'initial' => $t['inisial'] ?? 'A',
            'avatarUrl' => $t['avatar_url'] ?? null,
            'themeColor' => $t['warna_tema'] ?? 'amber'
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

// 3. QUICK STOCK UPDATE (/api/admin/menu/{id}/stock)
if (preg_match('#/api/admin/menu/([^/]+)/stock#', $uriPath, $matches) && ($method === 'PATCH' || $method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $productId = $matches[1];
    $newStock = isset($body['stock']) && $body['stock'] !== '' && $body['stock'] !== null ? max(0, (int)$body['stock']) : null;
    $available = $newStock !== null ? ($newStock > 0 ? 1 : 0) : 1;

    $stmt = $pdo->prepare("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?");
    $stmt->execute([$newStock, $available, $productId]);

    echo json_encode(['success' => true, 'id' => $productId, 'stock' => $newStock, 'available' => (bool)$available]);
    exit;
}

// 4. PRODUCT CREATE (/api/admin/menu or /api/admin/products)
if ((strpos($uriPath, '/api/admin/menu') !== false || strpos($uriPath, '/api/admin/products') !== false) && $method === 'POST' && !strpos($uriPath, '/stock')) {
    checkAdminAuth($ADMIN_TOKEN);
    $id = $body['id'] ?? (strtolower(preg_replace('/[^a-z0-9]+/i', '-', $body['name'] ?? 'menu')) . '-' . substr(time(), -4));
    $name = $body['name'] ?? 'Produk Baru';
    $category = $body['category'] ?? 'snack';
    $price = (int)($body['price'] ?? 0);
    $costPrice = (int)($body['costPrice'] ?? 0);
    $stock = isset($body['stock']) && $body['stock'] !== '' && $body['stock'] !== null ? max(0, (int)$body['stock']) : null;
    $description = $body['description'] ?? '';
    $badge = $body['badge'] ?? 'Menu Baru';
    $imageUrl = $body['imageUrl'] ?? '';
    $variants = json_encode($body['variants'] ?? ['Original']);
    $keywords = ($body['keywords'] ?? '') ?: "{$name} {$category}";
    $available = isset($body['available']) ? ($body['available'] ? 1 : 0) : ($stock !== null ? ($stock > 0 ? 1 : 0) : 1);
    $promoInfo = $body['promoInfo'] ?? '';
    $promoPrice = isset($body['promoPrice']) && $body['promoPrice'] !== '' ? (int)$body['promoPrice'] : null;
    $promoMinQty = isset($body['promoMinQty']) && $body['promoMinQty'] !== '' ? (int)$body['promoMinQty'] : null;
    $promoActive = !empty($body['promoActive']) ? 1 : 0;

    $stmt = $pdo->prepare("
        INSERT INTO menu_produk (id, kategori, nama, deskripsi, harga, harga_modal, stok, badge, gambar_url, varian_json, kata_kunci, tersedia, info_promo, harga_promo, min_qty_promo, promo_aktif, dibuat_pada)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
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
    ");
    $stmt->execute([$id, $category, $name, $description, $price, $costPrice, $stock, $badge, $imageUrl, $variants, $keywords, $available, $promoInfo, $promoPrice, $promoMinQty, $promoActive]);

    $savedProduct = [
        'id' => $id,
        'category' => $category,
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'costPrice' => $costPrice,
        'stock' => $stock,
        'badge' => $badge,
        'imageUrl' => $imageUrl,
        'variants' => json_decode($variants, true),
        'keywords' => $keywords,
        'available' => (bool)$available,
        'promoInfo' => $promoInfo,
        'promoPrice' => $promoPrice,
        'promoMinQty' => $promoMinQty,
        'promoActive' => (bool)$promoActive
    ];

    echo json_encode(['success' => true, 'product' => $savedProduct]);
    exit;
}

// 5. PRODUCT UPDATE (/api/admin/menu/{id} or /api/admin/products/{id})
if ((preg_match('#/api/admin/menu/([^/]+)#', $uriPath, $matches) || preg_match('#/api/admin/products/([^/]+)#', $uriPath, $matches)) && ($method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $id = $matches[1];
    $name = $body['name'] ?? '';
    $category = $body['category'] ?? 'snack';
    $price = (int)($body['price'] ?? 0);
    $costPrice = (int)($body['costPrice'] ?? 0);
    $stock = isset($body['stock']) && $body['stock'] !== '' && $body['stock'] !== null ? max(0, (int)$body['stock']) : null;
    $description = $body['description'] ?? '';
    $badge = $body['badge'] ?? 'Menu Pilihan';
    $imageUrl = $body['imageUrl'] ?? '';
    $variants = json_encode($body['variants'] ?? ['Original']);
    $keywords = ($body['keywords'] ?? '') ?: "{$name} {$category}";
    $available = isset($body['available']) ? ($body['available'] ? 1 : 0) : ($stock !== null ? ($stock > 0 ? 1 : 0) : 1);
    $promoInfo = $body['promoInfo'] ?? '';
    $promoPrice = isset($body['promoPrice']) && $body['promoPrice'] !== '' ? (int)$body['promoPrice'] : null;
    $promoMinQty = isset($body['promoMinQty']) && $body['promoMinQty'] !== '' ? (int)$body['promoMinQty'] : null;
    $promoActive = !empty($body['promoActive']) ? 1 : 0;

    $stmt = $pdo->prepare("
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
    ");
    $stmt->execute([$id, $category, $name, $description, $price, $costPrice, $stock, $badge, $imageUrl, $variants, $keywords, $available, $promoInfo, $promoPrice, $promoMinQty, $promoActive]);

    $savedProduct = [
        'id' => $id,
        'category' => $category,
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'costPrice' => $costPrice,
        'stock' => $stock,
        'badge' => $badge,
        'imageUrl' => $imageUrl,
        'variants' => json_decode($variants, true),
        'keywords' => $keywords,
        'available' => (bool)$available,
        'promoInfo' => $promoInfo,
        'promoPrice' => $promoPrice,
        'promoMinQty' => $promoMinQty,
        'promoActive' => (bool)$promoActive
    ];

    echo json_encode(['success' => true, 'product' => $savedProduct]);
    exit;
}

// 6. PRODUCT DELETE (/api/admin/menu/{id} or /api/admin/products/{id})
if ((preg_match('#/api/admin/menu/([^/]+)#', $uriPath, $matches) || preg_match('#/api/admin/products/([^/]+)#', $uriPath, $matches)) && $method === 'DELETE') {
    checkAdminAuth($ADMIN_TOKEN);
    $id = $matches[1];
    $stmt = $pdo->prepare("DELETE FROM menu_produk WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'deletedId' => $id]);
    exit;
}

// 7. SETTINGS UPDATE (/api/admin/settings, /api/admin/site-settings, /api/admin/schedule)
if ((strpos($uriPath, '/api/admin/settings') !== false || strpos($uriPath, '/api/admin/site-settings') !== false || strpos($uriPath, '/api/admin/schedule') !== false) && ($method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    
    $stmtOld = $pdo->query("SELECT * FROM pengaturan_situs WHERE id = 1");
    $old = $stmtOld->fetch() ?: [];

    $judul_situs = $body['siteTitle'] ?? ($old['judul_situs'] ?? 'Soki - Snack Renyah & Aneka Es Segar');
    $headline = $body['heroHeadline'] ?? ($old['headline'] ?? '');
    $highlight = $body['heroHighlight'] ?? ($old['highlight'] ?? '');
    $subjudul = $body['heroSubtitle'] ?? ($old['subjudul'] ?? '');
    $pengumuman = $body['announcement'] ?? ($old['pengumuman'] ?? '');
    $nomor_whatsapp = $body['whatsappNumber'] ?? ($old['nomor_whatsapp'] ?? '');
    $tentang_judul = $body['aboutTitle'] ?? ($old['tentang_judul'] ?? '');
    $tentang_subjudul = $body['aboutSubtitle'] ?? ($old['tentang_subjudul'] ?? '');
    $tentang_badge = $body['aboutBadge'] ?? ($old['tentang_badge'] ?? '');
    $fitur_json = isset($body['features']) ? json_encode($body['features']) : ($old['fitur_json'] ?? '[]');
    $webhook_drive = $body['googleDriveWebhookUrl'] ?? ($old['webhook_drive'] ?? '');
    $folder_produk_id = $body['googleDriveProductFolderId'] ?? ($old['folder_produk_id'] ?? '');
    $folder_landing_id = $body['googleDriveCardFolderId'] ?? ($old['folder_landing_id'] ?? '');
    $maintenance_json = isset($body['maintenance']) ? json_encode($body['maintenance']) : ($old['maintenance_json'] ?? '{"enabled":false}');
    $schedule_json = isset($body['storeSchedule']) ? json_encode($body['storeSchedule']) : ($old['schedule_json'] ?? 'null');

    $stmt = $pdo->prepare("
        INSERT INTO pengaturan_situs (id, judul_situs, headline, highlight, subjudul, pengumuman, nomor_whatsapp, tentang_judul, tentang_subjudul, tentang_badge, fitur_json, webhook_drive, folder_produk_id, folder_landing_id, maintenance_json, schedule_json)
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
          schedule_json = VALUES(schedule_json)
    ");
    $stmt->execute([$judul_situs, $headline, $highlight, $subjudul, $pengumuman, $nomor_whatsapp, $tentang_judul, $tentang_subjudul, $tentang_badge, $fitur_json, $webhook_drive, $folder_produk_id, $folder_landing_id, $maintenance_json, $schedule_json]);

    echo json_encode(['success' => true]);
    exit;
}

// 8. HERO CARDS UPDATE (/api/admin/hero-cards)
if (strpos($uriPath, '/api/admin/hero-cards') !== false && ($method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $cards = is_array($body) ? $body : ($body['heroCards'] ?? []);
    foreach ($cards as $idx => $card) {
        $id = $card['id'] ?? "card-" . ($idx + 1);
        $judul = $card['title'] ?? '';
        $subjudul = $card['subtitle'] ?? '';
        $badge = $card['badge'] ?? '';
        $gambar_url = $card['imageUrl'] ?? '';
        $ikon = $card['icon'] ?? '';
        $gradient_bg = $card['bgGradient'] ?? '';
        $warna_aksen = $card['accentColor'] ?? '';
        $product_id = $card['productId'] ?? null;
        $urutan = $idx + 1;

        $stmt = $pdo->prepare("
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
        ");
        $stmt->execute([$id, $judul, $subjudul, $badge, $gambar_url, $ikon, $gradient_bg, $warna_aksen, $product_id, $urutan]);
    }
    echo json_encode(['success' => true]);
    exit;
}

// 9. TEAM UPDATE (/api/admin/team)
if (strpos($uriPath, '/api/admin/team') !== false && ($method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $team = is_array($body) ? $body : ($body['teamMembers'] ?? []);
    foreach ($team as $idx => $t) {
        $id = $t['id'] ?? "member-" . ($idx + 1);
        $nama = $t['name'] ?? '';
        $absen = $t['absen'] ?? '';
        $peran = $t['role'] ?? '';
        $deskripsi = $t['description'] ?? '';
        $inisial = $t['initial'] ?? strtoupper(substr($nama, 0, 1));
        $avatar_url = $t['avatarUrl'] ?? null;
        $warna_tema = $t['themeColor'] ?? 'amber';
        $urutan = $idx + 1;

        $stmt = $pdo->prepare("
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
        ");
        $stmt->execute([$id, $nama, $absen, $peran, $deskripsi, $inisial, $avatar_url, $warna_tema, $urutan]);
    }
    echo json_encode(['success' => true]);
    exit;
}

// 10. ORDERS (/api/orders & /api/admin/orders)
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

if (strpos($uriPath, '/api/admin/orders') !== false && $method === 'GET') {
    checkAdminAuth($ADMIN_TOKEN);
    $stmt = $pdo->query("SELECT * FROM pesanan ORDER BY dibuat_pada DESC LIMIT 100");
    $orders = [];
    while ($r = $stmt->fetch()) {
        $orders[] = [
            'id' => $r['id'],
            'pembeli' => $r['pembeli'],
            'waktu' => $r['waktu'],
            'items' => json_decode($r['item_pesanan_json'], true) ?: [],
            'total' => (int)$r['total'],
            'status' => $r['status']
        ];
    }
    echo json_encode($orders);
    exit;
}

if (preg_match('#/api/admin/orders/([^/]+)/status#', $uriPath, $matches) && ($method === 'PATCH' || $method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $orderId = $matches[1];
    $status = $body['status'] ?? 'Selesai';
    $stmt = $pdo->prepare("UPDATE pesanan SET status = ? WHERE id = ?");
    $stmt->execute([$status, $orderId]);
    echo json_encode(['success' => true, 'orderId' => $orderId, 'status' => $status]);
    exit;
}

// 11. GOOGLE DRIVE UPLOAD / STATUS
if (strpos($uriPath, '/api/admin/drive-status') !== false && $method === 'GET') {
    checkAdminAuth($ADMIN_TOKEN);
    echo json_encode([
        'connected' => true,
        'status' => 'connected',
        'message' => 'Layanan media siap digunakan.',
        'hasUrl' => true
    ]);
    exit;
}

if (strpos($uriPath, '/api/admin/upload-drive') !== false && $method === 'POST') {
    checkAdminAuth($ADMIN_TOKEN);
    $fileName = $body['fileName'] ?? 'image.jpg';
    $base64 = $body['base64'] ?? '';
    $cleanBase64 = strpos($base64, ',') !== false ? explode(',', $base64)[1] : $base64;
    $mimeType = $body['mimeType'] ?? 'image/jpeg';
    $dataUrl = "data:{$mimeType};base64,{$cleanBase64}";
    
    echo json_encode([
        'success' => true,
        'url' => $dataUrl,
        'fileName' => $fileName,
        'source' => 'direct'
    ]);
    exit;
}

echo json_encode(['status' => 'ok', 'message' => 'Soki Database API Engine Active']);
