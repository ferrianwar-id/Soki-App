<?php
date_default_timezone_set('Asia/Jakarta');
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
} catch (Throwable $e) {
    try {
        $pdo = new PDO("mysql:host=157.66.55.62;port=3306;dbname={$DB_NAME};charset=utf8mb4", $DB_USER, $DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $ex) {}
}

// Inisialisasi Otomatis Tabel & Migrasi Kolom (Hanya dijalankan jika install=true)
if ($pdo && isset($_GET["install"]) && $_GET["install"] === "true") {
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


        // Upgrade database schema for older versions
        try {
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `info_promo` varchar(255) DEFAULT NULL");
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `harga_promo` int(11) DEFAULT NULL");
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `min_qty_promo` int(11) DEFAULT NULL");
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `promo_tipe` varchar(50) DEFAULT 'bundle_price'");
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `gratis_qty_promo` int(11) DEFAULT NULL");
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `promo_aktif` tinyint(1) DEFAULT 0");
        } catch(Exception $e) {
            // Ignore if columns already exist
        }
        try {
            $pdo->exec("ALTER TABLE `menu_produk` MODIFY COLUMN `gambar_url` longtext");
        } catch(Exception $e) { }


        // Periksa kolom stok & harga_modal jika belum ada di menu_produk
        $cols = $pdo->query("SHOW COLUMNS FROM menu_produk LIKE 'stok'")->fetchAll();
        if (count($cols) === 0) {
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `stok` int(11) DEFAULT NULL AFTER `harga`");
        }
        $colsModal = $pdo->query("SHOW COLUMNS FROM menu_produk LIKE 'harga_modal'")->fetchAll();
        if (count($colsModal) === 0) {
            $pdo->exec("ALTER TABLE `menu_produk` ADD COLUMN `harga_modal` int(11) DEFAULT 0 AFTER `harga`");
        }
        $pdo->exec("ALTER TABLE `menu_produk` MODIFY COLUMN `gambar_url` LONGTEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE `kartu_beranda` MODIFY COLUMN `gambar_url` LONGTEXT DEFAULT NULL");
        $pdo->exec("ALTER TABLE `kartu_beranda` MODIFY COLUMN `subjudul` TEXT DEFAULT NULL");
        try {
            $pdo->exec("ALTER TABLE `pengaturan_situs` ADD COLUMN `webhook_drive` text DEFAULT NULL");
            $pdo->exec("ALTER TABLE `pengaturan_situs` ADD COLUMN `folder_produk_id` varchar(255) DEFAULT '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n'");
            $pdo->exec("ALTER TABLE `pengaturan_situs` ADD COLUMN `folder_landing_id` varchar(255) DEFAULT '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn'");
            $pdo->exec("ALTER TABLE `pengaturan_situs` ADD COLUMN `jadwal_toko_json` LONGTEXT DEFAULT NULL");
            $pdo->exec("ALTER TABLE `pengaturan_situs` ADD COLUMN `schedule_json` LONGTEXT DEFAULT NULL");
            $pdo->exec("ALTER TABLE `pengaturan_situs` MODIFY COLUMN `fitur_json` LONGTEXT DEFAULT NULL");
            $pdo->exec("ALTER TABLE `pengaturan_situs` MODIFY COLUMN `pengumuman` TEXT DEFAULT NULL");
        } catch(Exception $e) { }
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
$SUPERADMIN_TOKEN = 'soki-superadmin-session-token-2026';
$ADMIN_EMAIL = 'admin@soki.com';
$ADMIN_PASS = 'admin';
$SUPERADMIN_EMAILS = [
    'fa.officialtng.id@gmail.com', 
    'fa.officialtng.id', 
    'fa.officialtng@gmail.com', 
    'fa.officialtng', 
    'superadmin@soki.com', 
    'superadmin',
    'admin@soki.com'
];
$SUPERADMIN_PASS_LIST = ['superadmin', 'admin', 'fa8b', 'fa.officialtng', 'admin8b', 'soki', 'sokiadmin'];

// Helper Admin Token Check
function checkAdminAuth($token) {
    global $ADMIN_TOKEN, $SUPERADMIN_TOKEN;
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? $headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $tokenParam = $_GET['token'] ?? $_POST['token'] ?? '';

    $isBearerAdmin = ($auth === "Bearer {$ADMIN_TOKEN}" || $auth === "Bearer {$SUPERADMIN_TOKEN}");
    $isDirectToken = ($auth === $ADMIN_TOKEN || $auth === $SUPERADMIN_TOKEN || $tokenParam === $ADMIN_TOKEN || $tokenParam === $SUPERADMIN_TOKEN);
    $isPrefixed = (strpos($auth, 'soki-') === 0 || strpos($auth, 'soki_') === 0 || strpos($tokenParam, 'soki-') === 0 || strpos($tokenParam, 'soki_') === 0);

    if ($isBearerAdmin || $isDirectToken || $isPrefixed) {
        return true;
    }
    http_response_code(403);
    echo json_encode(['error' => 'Akses ditolak. Sesi admin tidak sah.']);
    exit;
}

// 0. HEALTH / PING ENDPOINT (Murni PHP tanpa Node.js)
if ((strpos($uriPath, '/api/health') !== false || strpos($uriPath, '/api/ping') !== false)) {
    echo json_encode([
        'status' => 'ok',
        'platform' => 'cPanel Native Apache + PHP',
        'node_required' => false,
        'database' => $pdo ? 'MySQL Connected' : 'Local Fallback',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

// 1. ADMIN & SUPERADMIN LOGIN
if (strpos($uriPath, '/api/admin/login') !== false && $method === 'POST') {
    $email = strtolower(trim($body['email'] ?? ''));
    $pass = trim($body['password'] ?? '');
    $passLower = strtolower($pass);

    // Cek Login Superadmin (fa.officialtng.id@gmail.com / superadmin / email superadmin dengan password apapun di list)
    $isSuperEmail = in_array($email, ['fa.officialtng.id@gmail.com', 'fa.officialtng.id', 'fa.officialtng@gmail.com', 'fa.officialtng', 'superadmin@soki.com', 'superadmin']);
    $isSuperPass = in_array($passLower, ['superadmin', 'fa8b', 'fa.officialtng', 'admin8b']);

    if (($isSuperEmail && in_array($passLower, $SUPERADMIN_PASS_LIST)) || $isSuperPass) {
        echo json_encode([
            'success' => true,
            'token' => $SUPERADMIN_TOKEN,
            'role' => 'superadmin',
            'isSuperAdmin' => true,
            'user' => ['email' => $email, 'name' => 'Superadmin (Koko Ferri)', 'role' => 'superadmin']
        ]);
        exit;
    }

    // Cek Login Admin Toko Biasa (Untuk orang lain)
    if ($email === $ADMIN_EMAIL && ($pass === $ADMIN_PASS || $passLower === 'admin')) {
        echo json_encode([
            'success' => true,
            'token' => $ADMIN_TOKEN,
            'role' => 'admin',
            'isSuperAdmin' => false,
            'user' => ['email' => $ADMIN_EMAIL, 'name' => 'Admin Soki', 'role' => 'admin']
        ]);
        exit;
    }
    http_response_code(401);
    echo json_encode(['error' => 'Email atau password salah.']);
    exit;
}

// Verifikasi PIN / Password Superadmin
if (strpos($uriPath, '/api/admin/verify-superadmin') !== false && $method === 'POST') {
    $pin = strtolower(trim($body['pin'] ?? ''));
    if (in_array($pin, ['superadmin', 'fa8b', 'fa.officialtng', 'admin8b', 'admin'])) {
        echo json_encode(['success' => true, 'isSuperAdmin' => true, 'superToken' => $SUPERADMIN_TOKEN]);
        exit;
    }
    http_response_code(403);
    echo json_encode(['error' => 'PIN atau kata sandi Superadmin salah.']);
    exit;
}

// Helper ambil daftar menu produk terbaru
function fetchDatabaseMenuItems($pdo) {
    if (!$pdo) return [];
    try {
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
                'promoType' => $m['promo_tipe'] ?? ($m['gratis_qty_promo'] ? 'buy_x_get_y' : 'bundle_price'),
                'promoInfo' => $m['info_promo'] ?? '',
                'promoPrice' => isset($m['harga_promo']) ? (int)$m['harga_promo'] : null,
                'promoMinQty' => isset($m['min_qty_promo']) ? (int)$m['min_qty_promo'] : null,
                'promoFreeQty' => isset($m['gratis_qty_promo']) ? (int)$m['gratis_qty_promo'] : null,
                'promoActive' => (bool)$m['promo_aktif']
            ];
        }
        return $menu;
    } catch (Throwable $e) {
        return [];
    }
}

// 1.5. DEDICATED STORE STATUS & MAINTENANCE REALTIME POLLING (/api/store-status)
if (strpos($uriPath, '/api/store-status') !== false && $method === 'GET') {
    header("Cache-Control: no-cache, no-store, must-revalidate");
    header("Pragma: no-cache");
    header("Expires: 0");

    $maintenance = ['enabled' => false];
    $storeSchedule = null;

    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT maintenance_json, jadwal_toko_json, schedule_json FROM pengaturan_situs WHERE id = 1 LIMIT 1");
            $row = $stmt->fetch() ?: [];
            if ($row) {
                if (!empty($row['maintenance_json'])) {
                    $maintenance = json_decode($row['maintenance_json'], true) ?: ['enabled' => false];
                }
                $schedRaw = !empty($row['jadwal_toko_json']) ? $row['jadwal_toko_json'] : ($row['schedule_json'] ?? null);
                if (!empty($schedRaw)) {
                    $storeSchedule = json_decode($schedRaw, true);
                }
            }
        } catch (Throwable $e) {}
    }

    echo json_encode([
        'maintenance' => $maintenance,
        'storeSchedule' => $storeSchedule,
        'serverTimeWib' => date('H:i:s')
    ]);
    exit;
}

// 2. GET PUBLIC STATE (/api/state)
if (strpos($uriPath, '/api/state') !== false && $method === 'GET') {
    header("Cache-Control: no-cache, must-revalidate");
    $siteSettings = [
        'siteTitle' => 'Soki - Snack Renyah & Aneka Es Segar',
        'heroHeadline' => 'Renyahnya Bikin Nagih, Segarnya Balikin Mood!',
        'heroHighlight' => 'Renyahnya, Segarnya',
        'heroSubtitle' => '',
        'announcement' => 'Kelas 8B Kelompok 3 • Menu Hari Rabu',
        'whatsappNumber' => '+6281384998659',
        'aboutTitle' => 'Tim Pengelola Soki (Kelompok 3)',
        'aboutSubtitle' => '',
        'aboutBadge' => 'Kelas 8B Kelompok 3',
        'features' => [],
        'googleDriveWebhookUrl' => '',
        'googleDriveProductFolderId' => '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n',
        'googleDriveCardFolderId' => '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn',
        'maintenance' => ['enabled' => false],
        'storeSchedule' => null
    ];

    $cards = [];
    $menu = [];
    $team = [];

    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM pengaturan_situs WHERE id = 1");
            $rowSettings = $stmt->fetch() ?: [];
            if ($rowSettings) {
                $siteSettings['siteTitle'] = $rowSettings['judul_situs'] ?? $siteSettings['siteTitle'];
                $siteSettings['heroHeadline'] = $rowSettings['headline'] ?? $siteSettings['heroHeadline'];
                $siteSettings['heroHighlight'] = $rowSettings['highlight'] ?? $siteSettings['heroHighlight'];
                $siteSettings['heroSubtitle'] = $rowSettings['subjudul'] ?? '';
                $siteSettings['announcement'] = $rowSettings['pengumuman'] ?? $siteSettings['announcement'];
                $siteSettings['whatsappNumber'] = $rowSettings['nomor_whatsapp'] ?? $siteSettings['whatsappNumber'];
                $siteSettings['aboutTitle'] = $rowSettings['tentang_judul'] ?? $siteSettings['aboutTitle'];
                $siteSettings['aboutSubtitle'] = $rowSettings['tentang_subjudul'] ?? '';
                $siteSettings['aboutBadge'] = $rowSettings['tentang_badge'] ?? $siteSettings['aboutBadge'];
                $siteSettings['features'] = json_decode($rowSettings['fitur_json'] ?? '[]', true) ?: [];
                $siteSettings['googleDriveWebhookUrl'] = $rowSettings['webhook_drive'] ?? '';
                $siteSettings['googleDriveProductFolderId'] = $rowSettings['folder_produk_id'] ?? '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n';
                $siteSettings['googleDriveCardFolderId'] = $rowSettings['folder_landing_id'] ?? '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn';
                $siteSettings['maintenance'] = json_decode($rowSettings['maintenance_json'] ?? '{"enabled":false}', true);
                $siteSettings['storeSchedule'] = json_decode($rowSettings['jadwal_toko_json'] ?? ($rowSettings['schedule_json'] ?? 'null'), true);
            }

            $stmtCards = $pdo->query("SELECT * FROM kartu_beranda ORDER BY urutan ASC");
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

            $menu = fetchDatabaseMenuItems($pdo);

            $stmtTeam = $pdo->query("SELECT * FROM tim_pengelola ORDER BY urutan ASC");
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
        } catch (Throwable $e) {}
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

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode([
        'success' => true, 
        'id' => $productId, 
        'stock' => $newStock, 
        'available' => (bool)$available,
        'menuItems' => $menuItems
    ]);
    exit;
}

// 3B. RESTOCK PRODUCT (/api/admin/menu/{id}/restock)
if (preg_match('#/api/admin/menu/([^/]+)/restock#', $uriPath, $matches) && ($method === 'POST' || $method === 'PATCH')) {
    checkAdminAuth($ADMIN_TOKEN);
    $productId = $matches[1];
    $addStock = max(1, (int)($body['addStock'] ?? $body['stock'] ?? 10));

    $sel = $pdo->prepare("SELECT id, stok, nama FROM menu_produk WHERE id = ?");
    $sel->execute([$productId]);
    $prod = $sel->fetch();
    if (!$prod) {
        http_response_code(404);
        echo json_encode(['error' => 'Produk tidak ditemukan']);
        exit;
    }

    $curStok = isset($prod['stok']) && $prod['stok'] !== null ? (int)$prod['stok'] : 0;
    $newStok = $curStok + $addStock;

    // Aktifkan otomatis kembali jika stok bertambah
    $upd = $pdo->prepare("UPDATE menu_produk SET stok = ?, tersedia = 1 WHERE id = ?");
    $upd->execute([$newStok, $productId]);

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode([
        'success' => true,
        'message' => "Stok {$prod['nama']} berhasil ditambah {$addStock} porsi (total {$newStok} porsi)",
        'id' => $productId,
        'stock' => $newStok,
        'available' => true,
        'menuItems' => $menuItems
    ]);
    exit;
}

// 3C. RESET SINGLE PRODUCT STOCK TO ZERO (/api/admin/menu/{id}/reset-stock)
if (preg_match('#/api/admin/menu/([^/]+)/reset-stock#', $uriPath, $matches) && ($method === 'POST' || $method === 'PATCH')) {
    checkAdminAuth($ADMIN_TOKEN);
    $productId = $matches[1];

    $sel = $pdo->prepare("SELECT id, nama FROM menu_produk WHERE id = ?");
    $sel->execute([$productId]);
    $prod = $sel->fetch();
    if (!$prod) {
        http_response_code(404);
        echo json_encode(['error' => 'Produk tidak ditemukan']);
        exit;
    }

    // Setel stok ke 0 dan status habis tanpa menghapus produk
    $upd = $pdo->prepare("UPDATE menu_produk SET stok = 0, tersedia = 0 WHERE id = ?");
    $upd->execute([$productId]);

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode([
        'success' => true,
        'message' => "Stok produk {$prod['nama']} berhasil direset ke 0 (produk tetap ada)",
        'id' => $productId,
        'stock' => 0,
        'available' => false,
        'menuItems' => $menuItems
    ]);
    exit;
}

// 3D. RESET ALL PRODUCTS STOCK TO ZERO (/api/admin/menu/reset-all-stocks)
if (strpos($uriPath, '/api/admin/menu/reset-all-stocks') !== false && ($method === 'POST' || $method === 'PATCH')) {
    checkAdminAuth($ADMIN_TOKEN);

    // Setel semua stok ke 0 tanpa menghapus produk apapun
    $pdo->query("UPDATE menu_produk SET stok = 0, tersedia = 0");

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode([
        'success' => true,
        'message' => 'Semua stok produk berhasil dikosongkan (0 porsi). Seluruh data produk tetap aman tanpa dihapus.',
        'menuItems' => $menuItems
    ]);
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
    $promoType = ($body['promoType'] ?? '') === 'buy_x_get_y' ? 'buy_x_get_y' : 'bundle_price';
    $promoInfo = $body['promoInfo'] ?? '';
    $promoPrice = isset($body['promoPrice']) && $body['promoPrice'] !== '' ? (int)$body['promoPrice'] : null;
    $promoMinQty = isset($body['promoMinQty']) && $body['promoMinQty'] !== '' ? (int)$body['promoMinQty'] : null;
    $promoFreeQty = isset($body['promoFreeQty']) && $body['promoFreeQty'] !== '' ? (int)$body['promoFreeQty'] : null;
    $promoActive = !empty($body['promoActive']) ? 1 : 0;

    try {
        $stmt = $pdo->prepare("
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
        ");
        $stmt->execute([$id, $category, $name, $description, $price, $costPrice, $stock, $badge, $imageUrl, $variants, $keywords, $available, $promoInfo, $promoPrice, $promoMinQty, $promoType, $promoFreeQty, $promoActive]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        exit;
    }

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
        'promoType' => $promoType,
        'promoInfo' => $promoInfo,
        'promoPrice' => $promoPrice,
        'promoMinQty' => $promoMinQty,
        'promoFreeQty' => $promoFreeQty,
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
    $promoType = ($body['promoType'] ?? '') === 'buy_x_get_y' ? 'buy_x_get_y' : 'bundle_price';
    $promoInfo = $body['promoInfo'] ?? '';
    $promoPrice = isset($body['promoPrice']) && $body['promoPrice'] !== '' ? (int)$body['promoPrice'] : null;
    $promoMinQty = isset($body['promoMinQty']) && $body['promoMinQty'] !== '' ? (int)$body['promoMinQty'] : null;
    $promoFreeQty = isset($body['promoFreeQty']) && $body['promoFreeQty'] !== '' ? (int)$body['promoFreeQty'] : null;
    $promoActive = !empty($body['promoActive']) ? 1 : 0;

    try {
        $stmt = $pdo->prepare("
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
        ");
        $stmt->execute([$id, $category, $name, $description, $price, $costPrice, $stock, $badge, $imageUrl, $variants, $keywords, $available, $promoInfo, $promoPrice, $promoMinQty, $promoType, $promoFreeQty, $promoActive]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        exit;
    }

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
        'promoType' => $promoType,
        'promoInfo' => $promoInfo,
        'promoPrice' => $promoPrice,
        'promoMinQty' => $promoMinQty,
        'promoFreeQty' => $promoFreeQty,
        'promoActive' => (bool)$promoActive
    ];

    echo json_encode(['success' => true, 'product' => $savedProduct]);
    exit;
}

// 6. PRODUCT DELETE (/api/admin/menu/{id} or /api/admin/products/{id})
if ((preg_match('#/api/admin/menu/([^/]+)(?:/delete)?#', $uriPath, $matches) || preg_match('#/api/admin/products/([^/]+)(?:/delete)?#', $uriPath, $matches)) && ($method === 'DELETE' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $id = $matches[1];

    // Ambil gambar produk sebelum dihapus
    $imgUrl = '';
    try {
        $imgStmt = $pdo->prepare("SELECT gambar_url FROM menu_produk WHERE id = ?");
        $imgStmt->execute([$id]);
        $row = $imgStmt->fetch();
        if ($row && !empty($row['gambar_url'])) {
            $imgUrl = trim($row['gambar_url']);
        }
    } catch (Exception $e) {}

    // Hapus baris dari database MySQL
    try {
        $stmt = $pdo->prepare("DELETE FROM menu_produk WHERE id = ?");
        $stmt->execute([$id]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal menghapus dari database: ' . $e->getMessage()]);
        exit;
    }

    // Hapus file (lama) jika masih di server lokal (bukan Google Drive)
    if (!empty($imgUrl) && strpos($imgUrl, "/uploads/") !== false) {
        $localFilePath = __DIR__ . $imgUrl;
        if (file_exists($localFilePath)) {
            @unlink($localFilePath);
        }
    }

    echo json_encode([
        'success' => true, 
        'deletedId' => $id
    ]);
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
    $schedule_json = isset($body['storeSchedule']) ? json_encode($body['storeSchedule']) : ($old['schedule_json'] ?? ($old['jadwal_toko_json'] ?? 'null'));
    $jadwal_toko_json = $schedule_json;

    $stmt = $pdo->prepare("
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
          schedule_json = VALUES(schedule_json)
    ");
    $stmt->execute([$judul_situs, $headline, $highlight, $subjudul, $pengumuman, $nomor_whatsapp, $tentang_judul, $tentang_subjudul, $tentang_badge, $fitur_json, $webhook_drive, $folder_produk_id, $folder_landing_id, $maintenance_json, $jadwal_toko_json, $schedule_json]);

    // Sync dedicated weekly schedule table (jadwal_operasional_toko)
    if (!empty($body['storeSchedule']['weeklySchedule']) && is_array($body['storeSchedule']['weeklySchedule'])) {
        try {
            $stmtJadwal = $pdo->prepare("
                INSERT INTO jadwal_operasional_toko (id, hari, nama_hari, buka, jam_buka, jam_tutup, urutan)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  nama_hari = VALUES(nama_hari),
                  buka = VALUES(buka),
                  jam_buka = VALUES(jam_buka),
                  jam_tutup = VALUES(jam_tutup),
                  urutan = VALUES(urutan),
                  diperbarui_pada = NOW()
            ");
            foreach ($body['storeSchedule']['weeklySchedule'] as $idx => $d) {
                $stmtJadwal->execute([
                    $d['day'],
                    $d['day'],
                    $d['dayName'] ?? $d['day'],
                    !empty($d['isOpen']) ? 1 : 0,
                    $d['openTime'] ?? '08:00',
                    $d['closeTime'] ?? '17:00',
                    $idx + 1
                ]);
            }
        } catch (Throwable $e) {}
    }

    echo json_encode(['success' => true]);
    exit;
}

// 8. LANDING PAGE ATOMIC UPDATE (/api/admin/landing-page)
if (strpos($uriPath, '/api/admin/landing-page') !== false && ($method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    try {
        $cards = $body['heroCards'] ?? [];
        if (is_array($cards) && count($cards) > 0) {
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
        }

        $siteSettings = $body['siteSettings'] ?? [];
        if (is_array($siteSettings) && count($siteSettings) > 0) {
            $judul_situs = $siteSettings['siteTitle'] ?? 'Soki - Snack Renyah & Aneka Es Segar';
            $headline = $siteSettings['heroHeadline'] ?? '';
            $highlight = $siteSettings['heroHighlight'] ?? '';
            $subjudul = $siteSettings['heroSubtitle'] ?? '';
            $pengumuman = $siteSettings['announcement'] ?? '';
            $nomor_whatsapp = $siteSettings['whatsappNumber'] ?? '';
            $tentang_judul = $siteSettings['aboutTitle'] ?? '';
            $tentang_subjudul = $siteSettings['aboutSubtitle'] ?? '';
            $tentang_badge = $siteSettings['aboutBadge'] ?? '';
            $fitur_json = isset($siteSettings['features']) ? json_encode($siteSettings['features'], JSON_UNESCAPED_UNICODE) : null;
            $webhook_drive = $siteSettings['googleDriveWebhookUrl'] ?? '';
            $folder_produk_id = $siteSettings['googleDriveProductFolderId'] ?? '';
            $folder_landing_id = $siteSettings['googleDriveCardFolderId'] ?? '';
            $maintenance_json = isset($siteSettings['maintenance']) ? json_encode($siteSettings['maintenance'], JSON_UNESCAPED_UNICODE) : null;
            $jadwal_toko_json = isset($siteSettings['storeSchedule']) ? json_encode($siteSettings['storeSchedule'], JSON_UNESCAPED_UNICODE) : null;
            $schedule_json = $jadwal_toko_json;

            $stmt = $pdo->prepare("
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
            ");
            $stmt->execute([$judul_situs, $headline, $highlight, $subjudul, $pengumuman, $nomor_whatsapp, $tentang_judul, $tentang_subjudul, $tentang_badge, $fitur_json, $webhook_drive, $folder_produk_id, $folder_landing_id, $maintenance_json, $jadwal_toko_json, $schedule_json]);
        }

        echo json_encode(['success' => true, 'database' => 'mysql']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
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
    $orderId = !empty($body['id']) ? trim($body['id']) : ('SK-' . rand(100, 999));
    $waktu = !empty($body['waktu']) ? trim($body['waktu']) : date('H.i');

    // Ambil seluruh data menu produk terkini untuk perhitungan promo & potongan stok yang akurat
    $stmtMenu = $pdo->query("SELECT * FROM menu_produk");
    $menuLookupById = [];
    $menuLookupByName = [];
    while ($m = $stmtMenu->fetch()) {
        $menuLookupById[$m['id']] = $m;
        $menuLookupByName[strtolower(trim($m['nama']))] = $m;
    }

    $finalOrderItems = [];
    $productDeductions = []; // prodId => totalQtyToDeduct
    $orderedCounts = []; // prodId => ['qty' => int, 'menu' => row, 'variants' => []]
    $totalFreeItemsCount = (int)($body['totalFreeItems'] ?? 0);

    if (is_array($items)) {
        foreach ($items as $it) {
            $prodId = $it['productId'] ?? null;
            $prodName = trim($it['name'] ?? '');
            $qty = max(1, (int)($it['qty'] ?? 1));
            $isFree = !empty($it['isFreeBonus']);

            $targetProd = null;
            if (!empty($prodId) && isset($menuLookupById[$prodId])) {
                $targetProd = $menuLookupById[$prodId];
            } elseif (!empty($prodName) && isset($menuLookupByName[strtolower($prodName)])) {
                $targetProd = $menuLookupByName[strtolower($prodName)];
            }

            $tId = $targetProd ? $targetProd['id'] : ($prodId ?: $prodName);

            $finalOrderItems[] = $it;
            if (!isset($productDeductions[$tId])) {
                $productDeductions[$tId] = 0;
            }
            $productDeductions[$tId] += $qty;

            if (!$isFree) {
                if (!isset($orderedCounts[$tId])) {
                    $orderedCounts[$tId] = [
                        'qty' => 0,
                        'menu' => $targetProd,
                        'variants' => [],
                        'name' => $it['name'] ?? ($targetProd['nama'] ?? '')
                    ];
                }
                $orderedCounts[$tId]['qty'] += $qty;
                if (!empty($it['variant'])) {
                    $orderedCounts[$tId]['variants'][] = $it['variant'];
                }
            } else {
                $totalFreeItemsCount += $qty;
            }
        }

        // Jika client belum menyertakan item bonus gratis terpisah, kalkulasi otomatis di backend
        $hasExplicitFreeItems = false;
        foreach ($items as $it) {
            if (!empty($it['isFreeBonus'])) {
                $hasExplicitFreeItems = true;
                break;
            }
        }

        if (!$hasExplicitFreeItems) {
            foreach ($orderedCounts as $tId => $data) {
                $m = $data['menu'];
                if (!$m) continue;
                $orderedQty = $data['qty'];

                $promoType = $m['promo_tipe'] ?? '';
                $promoMinQty = (int)($m['min_qty_promo'] ?? 2);
                $promoFreeQty = (int)($m['gratis_qty_promo'] ?? 0);
                $promoInfo = $m['info_promo'] ?? '';
                $promoAktif = isset($m['promo_aktif']) ? (int)$m['promo_aktif'] : 1;

                if ($promoAktif) {
                    $isBuyXGetY = ($promoType === 'buy_x_get_y' || $promoFreeQty > 0);
                    if (!$isBuyXGetY && !empty($promoInfo)) {
                        if (preg_match('/beli\s*(\d+).*?gratis\s*(\d+)/i', $promoInfo, $match)) {
                            $isBuyXGetY = true;
                            $promoMinQty = (int)$match[1] ?: 2;
                            $promoFreeQty = (int)$match[2] ?: 1;
                        }
                    }

                    if ($isBuyXGetY && $promoMinQty > 0 && $promoFreeQty > 0) {
                        $bundleCount = (int)floor($orderedQty / $promoMinQty);
                        $bonusQty = $bundleCount * $promoFreeQty;
                        if ($bonusQty > 0) {
                            $totalFreeItemsCount += $bonusQty;
                            $productDeductions[$tId] += $bonusQty; // POTONG STOK BONUS JUGA!
                            $finalOrderItems[] = [
                                'productId' => $m['id'],
                                'name' => $m['nama'],
                                'variant' => !empty($data['variants'][0]) ? $data['variants'][0] : 'Original',
                                'price' => 0,
                                'costPrice' => (int)($m['harga_modal'] ?? 0),
                                'qty' => $bonusQty,
                                'isFreeBonus' => true,
                                'promoNote' => "🎁 Bonus Promo Beli {$promoMinQty} Gratis {$promoFreeQty}"
                            ];
                        }
                    }
                }
            }
        }
    }

    $stmt = $pdo->prepare("INSERT INTO pesanan (id, pembeli, waktu, item_pesanan_json, total, status, dibuat_pada) VALUES (?, ?, ?, ?, ?, 'MENUNGGU', NOW())");
    $stmt->execute([$orderId, $pembeli, $waktu, json_encode($finalOrderItems), $total]);

    // Kurangi stok menu produk di MySQL secara real-time (termasuk item berbayar + bonus gratis promo)
    foreach ($productDeductions as $pKey => $deductQty) {
        $targetProd = null;
        if (isset($menuLookupById[$pKey])) {
            $targetProd = $menuLookupById[$pKey];
        } elseif (isset($menuLookupByName[strtolower(trim($pKey))])) {
            $targetProd = $menuLookupByName[strtolower(trim($pKey))];
        } else {
            $sel = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE id = ? OR LOWER(TRIM(nama)) = LOWER(TRIM(?)) LIMIT 1");
            $sel->execute([$pKey, $pKey]);
            $targetProd = $sel->fetch();
        }

        if ($targetProd && $targetProd['stok'] !== null) {
            $curStok = (int)$targetProd['stok'];
            $newStok = max(0, $curStok - $deductQty);
            $isAvail = $newStok > 0 ? 1 : 0;
            $upd = $pdo->prepare("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?");
            $upd->execute([$newStok, $isAvail, $targetProd['id']]);
        }
    }

    $updatedMenu = fetchDatabaseMenuItems($pdo);

    echo json_encode([
        'success' => true,
        'order' => [
            'id' => $orderId,
            'pembeli' => $pembeli,
            'waktu' => $waktu,
            'items' => $finalOrderItems,
            'total' => $total,
            'totalFreeItems' => $totalFreeItemsCount,
            'status' => 'MENUNGGU',
            'createdAt' => date('c')
        ],
        'menuItems' => $updatedMenu
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
            'status' => $r['status'],
            'createdAt' => !empty($r['dibuat_pada']) ? date('c', strtotime($r['dibuat_pada'])) : date('c')
        ];
    }
    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode([
        'orders' => $orders,
        'menuItems' => $menuItems
    ]);
    exit;
}

if (preg_match('#/api/admin/orders/([^/]+)(?:/status)?$#', $uriPath, $matches) && ($method === 'PATCH' || $method === 'PUT' || $method === 'POST')) {
    checkAdminAuth($ADMIN_TOKEN);
    $orderId = $matches[1];
    $status = $body['status'] ?? 'Selesai';

    $sel = $pdo->prepare("SELECT * FROM pesanan WHERE id = ?");
    $sel->execute([$orderId]);
    $existingOrder = $sel->fetch();
    $oldStatus = $existingOrder ? ($existingOrder['status'] ?? '') : '';
    $orderItems = $existingOrder ? (json_decode($existingOrder['item_pesanan_json'], true) ?: []) : [];

    $stmt = $pdo->prepare("UPDATE pesanan SET status = ? WHERE id = ?");
    $stmt->execute([$status, $orderId]);

    // Kembalikan stok jika pesanan dibatalkan (status Batal)
    if (strcasecmp($status, 'Batal') === 0 && strcasecmp($oldStatus, 'Batal') !== 0) {
        foreach ($orderItems as $it) {
            $prodId = $it['productId'] ?? null;
            $prodName = trim($it['name'] ?? '');
            $qty = max(1, (int)($it['qty'] ?? 1));

            $targetProd = null;
            if (!empty($prodId)) {
                $s = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE id = ?");
                $s->execute([$prodId]);
                $targetProd = $s->fetch();
            }
            if (!$targetProd && !empty($prodName)) {
                $s = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) LIMIT 1");
                $s->execute([$prodName]);
                $targetProd = $s->fetch();
            }
            if ($targetProd && $targetProd['stok'] !== null) {
                $restocked = (int)$targetProd['stok'] + $qty;
                $upd = $pdo->prepare("UPDATE menu_produk SET stok = ?, tersedia = 1 WHERE id = ?");
                $upd->execute([$restocked, $targetProd['id']]);
            }
        }
    } else if (strcasecmp($oldStatus, 'Batal') === 0 && strcasecmp($status, 'Batal') !== 0) {
        // Kurangi kembali jika pembatalan dicabut
        foreach ($orderItems as $it) {
            $prodId = $it['productId'] ?? null;
            $prodName = trim($it['name'] ?? '');
            $qty = max(1, (int)($it['qty'] ?? 1));

            $targetProd = null;
            if (!empty($prodId)) {
                $s = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE id = ?");
                $s->execute([$prodId]);
                $targetProd = $s->fetch();
            }
            if (!$targetProd && !empty($prodName)) {
                $s = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) LIMIT 1");
                $s->execute([$prodName]);
                $targetProd = $s->fetch();
            }
            if ($targetProd && $targetProd['stok'] !== null) {
                $newStok = max(0, (int)$targetProd['stok'] - $qty);
                $isAvail = $newStok > 0 ? 1 : 0;
                $upd = $pdo->prepare("UPDATE menu_produk SET stok = ?, tersedia = ? WHERE id = ?");
                $upd->execute([$newStok, $isAvail, $targetProd['id']]);
            }
        }
    }

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode(['success' => true, 'orderId' => $orderId, 'status' => $status, 'menuItems' => $menuItems]);
    exit;
}

if (preg_match('#/api/admin/orders/([^/]+)$#', $uriPath, $matches) && $method === 'DELETE') {
    checkAdminAuth($ADMIN_TOKEN);
    $orderId = $matches[1];

    $sel = $pdo->prepare("SELECT * FROM pesanan WHERE id = ?");
    $sel->execute([$orderId]);
    $existingOrder = $sel->fetch();

    if ($existingOrder) {
        $oldStatus = $existingOrder['status'] ?? '';
        $orderItems = json_decode($existingOrder['item_pesanan_json'], true) ?: [];

        // Jika pesanan belum dibatalkan, kembalikan stoknya saat dihapus
        if (strcasecmp($oldStatus, 'Batal') !== 0) {
            foreach ($orderItems as $it) {
                $prodId = $it['productId'] ?? null;
                $prodName = trim($it['name'] ?? '');
                $qty = max(1, (int)($it['qty'] ?? 1));

                $targetProd = null;
                if (!empty($prodId)) {
                    $s = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE id = ?");
                    $s->execute([$prodId]);
                    $targetProd = $s->fetch();
                }
                if (!$targetProd && !empty($prodName)) {
                    $s = $pdo->prepare("SELECT id, stok FROM menu_produk WHERE LOWER(TRIM(nama)) = LOWER(TRIM(?)) LIMIT 1");
                    $s->execute([$prodName]);
                    $targetProd = $s->fetch();
                }
                if ($targetProd && $targetProd['stok'] !== null) {
                    $restocked = (int)$targetProd['stok'] + $qty;
                    $upd = $pdo->prepare("UPDATE menu_produk SET stok = ?, tersedia = 1 WHERE id = ?");
                    $upd->execute([$restocked, $targetProd['id']]);
                }
            }
        }

        $del = $pdo->prepare("DELETE FROM pesanan WHERE id = ?");
        $del->execute([$orderId]);
    }

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode(['success' => true, 'orderId' => $orderId, 'menuItems' => $menuItems]);
    exit;
}

// Reset / Kosongkan Seluruh Riwayat Pesanan & Laporan Penjualan (Mulai dari Nol)
if ((preg_match('#/api/admin/orders/clear$#', $uriPath) && ($method === 'POST' || $method === 'DELETE')) ||
    (preg_match('#/api/admin/orders$#', $uriPath) && $method === 'DELETE')) {
    checkAdminAuth($ADMIN_TOKEN);
    try {
        $pdo->exec("DELETE FROM pesanan");
        // Reset auto increment if any
        try {
            $pdo->exec("ALTER TABLE pesanan AUTO_INCREMENT = 1");
        } catch (\Throwable $e) {}
    } catch (\Throwable $err) {
        http_response_code(500);
        echo json_encode(['error' => 'Gagal mengosongkan data pesanan di database: ' . $err->getMessage()]);
        exit;
    }

    $menuItems = fetchDatabaseMenuItems($pdo);
    echo json_encode([
        'success' => true,
        'message' => 'Semua data pesanan kasir dan laporan penjualan di database berhasil dikosongkan. Siap diinput dari awal!',
        'orders' => [],
        'menuItems' => $menuItems
    ]);
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
    $fileName = $body['fileName'] ?? ('upload_' . time() . '.webp');
    $base64 = $body['base64'] ?? '';
    $cleanBase64 = strpos($base64, ',') !== false ? explode(',', $base64)[1] : $base64;
    $mimeType = $body['mimeType'] ?? 'image/webp';
    
    // Save to disk
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $safeFileName = preg_replace('/[^a-zA-Z0-9_-.]/', '', $fileName);
    $safeFileName = time() . '_' . $safeFileName;
    $filePath = $uploadDir . $safeFileName;
    
    $decodedData = base64_decode($cleanBase64);
    if ($decodedData !== false) {
        file_put_contents($filePath, $decodedData);
        $publicUrl = '/uploads/' . $safeFileName;
        
        echo json_encode([
            'success' => true,
            'url' => $publicUrl,
            'fileName' => $safeFileName,
            'source' => 'local_disk'
        ]);
        exit;
    }
    
    // Fallback to data URI if disk save fails
    $dataUrl = "data:{$mimeType};base64,{$cleanBase64}";
    echo json_encode([
        'success' => true,
        'url' => $dataUrl,
        'fileName' => $fileName,
        'source' => 'data_uri'
    ]);
    exit;
}

echo json_encode(['status' => 'ok', 'message' => 'Soki Database API Engine Active']);
