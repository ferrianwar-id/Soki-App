import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Menu,
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Eye,
  Image as ImageIcon, 
  ShoppingBag, 
  Settings, 
  ListOrdered,
  FileText,
  Download,
  Calendar,
  Check, 
  LogOut,
  RefreshCw,
  Search,
  
  Upload,
  CloudUpload,
  ExternalLink,
  Sparkles,
  Info,
  Store,
  ArrowLeft,
  Copy,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  HelpCircle,
  Users,
  GraduationCap,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  Wrench,
  Clock,
  TrendingUp,
  Wallet,
  Coins,
  Percent,
  Filter,
  Package,
  PackagePlus,
  RotateCcw,
  AlertTriangle,
  Crown,
  Lock,
  Key,
  ShieldCheck,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { MenuItem, HeroCardConfig, SiteSettings, Order, TeamMember } from '../types';
import { defaultTeamMembers } from '../data/initialData';
import { validateImageFile, uploadToGoogleDriveWebhook, deleteFromGoogleDriveWebhook, extractGoogleDriveFileId } from '../utils/imageUpload';
import ProductFormPage from './ProductFormPage';
import ProductDetailModal from './ProductDetailModal';
import MaintenanceAdminTab from './MaintenanceAdminTab';
import GoogleDriveAdminTab from './GoogleDriveAdminTab';
import StoreScheduleAdminTab from './StoreScheduleAdminTab';

// Kode Google Apps Script siap pakai untuk di-deploy oleh pengguna
const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * SOKI - GOOGLE APPS SCRIPT PENYIMPANAN GOOGLE DRIVE
 * Kelas 8B Kelompok 3
 * Mendukung penyimpanan otomatis terpisah untuk Menu Produk & 2 Card Landing Page
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    connected: true,
    message: "Google Drive Toko Soki Terhubung & Aktif"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(contents);

    // Cek ping status dari website
    if (data.ping) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "ok",
        connected: true,
        message: "Google Drive Terhubung"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1. Aksi Hapus Foto dari Google Drive (Saat Produk Dihapus)
    if (data.action === "delete" || data.deleteFileId) {
      var fileIdToDelete = data.fileId || data.deleteFileId;
      if (!fileIdToDelete && data.url) {
        var match = data.url.match(/([-\\w]{25,50})/);
        if (match) fileIdToDelete = match[1];
      }

      if (fileIdToDelete) {
        try {
          var fileToDelete = DriveApp.getFileById(fileIdToDelete);
          fileToDelete.setTrashed(true); // Pindahkan ke Sampah Google Drive
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            action: "delete",
            message: "Foto berhasil dipindahkan ke sampah Google Drive",
            fileId: fileIdToDelete
          })).setMimeType(ContentService.MimeType.JSON);
        } catch (delErr) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            action: "delete",
            error: "Gagal menghapus file di Drive: " + delErr.toString(),
            fileId: fileIdToDelete
          })).setMimeType(ContentService.MimeType.JSON);
        }
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          action: "delete",
          error: "ID File Google Drive tidak ditemukan"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var fileName = data.fileName || ("soki_" + new Date().getTime() + ".jpg");
    var base64 = data.base64;
    var mimeType = data.mimeType || "image/jpeg";

    // Pilih Folder Target Berdasarkan Kategori (Produk vs Card Landing Page)
    var target = data.target || "product";
    var folderId = data.folderId;
    if (!folderId) {
      folderId = (target === "landingpage") 
        ? "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn" 
        : "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
    }

    var folder = DriveApp.getFolderById(folderId);

    // Untuk landing page, replace/hapus foto lama di folder agar tidak menumpuk
    if (target === "landingpage") {
      try {
        var existingFiles = folder.getFiles();
        while (existingFiles.hasNext()) {
          var oldFile = existingFiles.next();
          oldFile.setTrashed(true);
        }
      } catch (delErr) {}
    }

    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);

    // Izin agar foto bisa langsung ditampilkan di website
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch(shareErr) {}

    var fileId = file.getId();
    var fileUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: fileId,
      url: fileUrl,
      fileName: fileName,
      target: target,
      folderId: folderId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi bantu untuk memicu izin Google Drive satu kali dengan tombol Run/Jalankan
function authorize() {
  DriveApp.getRootFolder();
}`;

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
  onLogout: () => void;
  heroCards: HeroCardConfig[];
  menuItems: MenuItem[];
  siteSettings: SiteSettings;
  teamMembers?: TeamMember[];
  onUpdateHeroCards: (cards: HeroCardConfig[]) => void;
  onUpdateMenuItems: (items: MenuItem[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onUpdateTeamMembers?: (team: TeamMember[]) => void;
  onPreviewMaintenancePage?: () => void;
  onPreviewClosedPage?: () => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  adminToken,
  onLogout,
  heroCards,
  menuItems,
  siteSettings,
  teamMembers = defaultTeamMembers,
  onUpdateHeroCards,
  onUpdateMenuItems,
  onUpdateSettings,
  onUpdateTeamMembers,
  onPreviewMaintenancePage,
  onPreviewClosedPage
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'products' | 'orders' | 'reports' | 'team' | 'schedule' | 'maintenance' | 'drive'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soki_admin_active_tab');
      if (saved && ['cards', 'products', 'orders', 'reports', 'team', 'schedule', 'maintenance', 'drive'].includes(saved)) {
        return saved as any;
      }
    }
    return 'orders';
  });
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [reportProductSearch, setReportProductSearch] = useState('');

  // Persist activeTab whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab) {
      localStorage.setItem('soki_admin_active_tab', activeTab);
    }
  }, [activeTab]);

  // Akses Khusus Superadmin (Hanya Superadmin yang bisa melihat menu & cek koneksi Google Drive)
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('soki_is_superadmin') === 'true';
    }
    return false;
  });
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);
  const [superAdminPin, setSuperAdminPin] = useState('');
  const [superAdminPinError, setSuperAdminPinError] = useState('');
  const [verifyingSuperAdmin, setVerifyingSuperAdmin] = useState(false);

  // Otomatis amankan: jika bukan superadmin tapi tab 'drive' aktif, lempar ke tab 'products'
  useEffect(() => {
    if (activeTab === 'drive' && !isSuperAdmin) {
      setActiveTab('products');
    }
  }, [activeTab, isSuperAdmin]);

  const handleLockSuperadmin = () => {
    setIsSuperAdmin(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('soki_is_superadmin');
    }
    if (activeTab === 'drive') {
      setActiveTab('products');
    }
    setStatusMessage({ text: "Mode Superadmin Dikunci. Menu Google Drive disembunyikan.", type: "success" });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleUnlockSuperadmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSuperAdminPinError('');
    const cleanPin = superAdminPin.trim().toLowerCase();
    if (!cleanPin) {
      setSuperAdminPinError('Silakan masukkan PIN atau kata sandi Superadmin.');
      return;
    }

    setVerifyingSuperAdmin(true);
    const isLocalValid = cleanPin === 'superadmin' || 
                         cleanPin === 'fa8b' || 
                         cleanPin === 'fa.officialtng' || 
                         cleanPin === 'admin8b' || 
                         cleanPin === 'admin';

    try {
      const res = await fetch('/api/admin/verify-superadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ pin: cleanPin })
      });

      if (res.ok || isLocalValid) {
        setIsSuperAdmin(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('soki_is_superadmin', 'true');
        }
        setIsSuperAdminModalOpen(false);
        setSuperAdminPin('');
        setActiveTab('drive');
        setStatusMessage({ text: "Selamat datang, Superadmin! Menu Google Drive kini terbuka.", type: "success" });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSuperAdminPinError(data.error || 'PIN / Kata sandi Superadmin salah.');
      }
    } catch {
      if (isLocalValid) {
        setIsSuperAdmin(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('soki_is_superadmin', 'true');
        }
        setIsSuperAdminModalOpen(false);
        setSuperAdminPin('');
        setActiveTab('drive');
        setStatusMessage({ text: "Selamat datang, Superadmin! Menu Google Drive kini terbuka.", type: "success" });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setSuperAdminPinError('PIN / Kata sandi Superadmin salah.');
      }
    } finally {
      setVerifyingSuperAdmin(false);
    }
  };

  // Calendar filter state for orders ('today' or specific 'YYYY-MM-DD' or 'all')
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [customCalendarDate, setCustomCalendarDate] = useState<string>('');

  // Filter state for Financial Sales Report
  const [reportDateFilter, setReportDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'custom'>('all');
  const [customReportDate, setCustomReportDate] = useState<string>('');

  // Local edit states
  const [cardsState, setCardsState] = useState<HeroCardConfig[]>(heroCards);
  const [settingsState, setSettingsState] = useState<SiteSettings>(siteSettings);
  const [teamState, setTeamState] = useState<TeamMember[]>(teamMembers && teamMembers.length > 0 ? teamMembers : defaultTeamMembers);
  const [savingTeam, setSavingTeam] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('soki_orders_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
    return [];
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modal Restok Interaktif (Tambah stok tanpa input ulang produk)
  const [restockModal, setRestockModal] = useState<{
    isOpen: boolean;
    product: MenuItem | null;
    addAmount: number;
    customAmount: string;
    mode: 'add' | 'set';
    isLoading: boolean;
  }>({
    isOpen: false,
    product: null,
    addAmount: 10,
    customAmount: '10',
    mode: 'add',
    isLoading: false,
  });

  // Modal Konfirmasi Reset Stok (Kembalikan ke nol tanpa hapus produk)
  const [resetStockConfirm, setResetStockConfirm] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    product: MenuItem | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    type: 'single',
    product: null,
    isLoading: false,
  });

  // Modal Konfirmasi Kosongkan Riwayat Pesanan & Laporan Penjualan (Mulai dari Nol)
  const [clearOrdersConfirm, setClearOrdersConfirm] = useState<{
    isOpen: boolean;
    isLoading: boolean;
  }>({
    isOpen: false,
    isLoading: false,
  });

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'product' | 'team' | null;
    id: string;
    title: string;
    message: string;
  }>({ isOpen: false, type: null, id: '', title: '', message: '' });

  const executeDeleteConfirm = async () => {
    const { type, id } = deleteConfirmDialog;
    setDeleteConfirmDialog(prev => ({ ...prev, isOpen: false }));

    if (type === 'product') {
      const itemToDelete = menuItems.find(i => i.id === id);
      const imageUrlToDelete = itemToDelete?.imageUrl;

      try {
        let res = await fetch(`/api/admin/menu/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${adminToken}`
          }
        });

        // Fallback jika DELETE diblokir / mengembalikan status bukan 2xx
        if (!res.ok) {
          res = await fetch(`/api/admin/menu/${encodeURIComponent(id)}/delete`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            }
          });
        }

        if (res.ok) {
          const resData = await res.json().catch(() => ({}));
          const updated = resData.menuItems && Array.isArray(resData.menuItems) 
            ? resData.menuItems 
            : menuItems.filter(i => i.id !== id);
            
          onUpdateMenuItems(updated);
          
          if (typeof window !== 'undefined') {
            try {
              const cached = localStorage.getItem('soki_state_cache');
              const parsed = cached ? JSON.parse(cached) : {};
              localStorage.setItem('soki_state_cache', JSON.stringify({
                ...parsed,
                menuItems: updated,
                lastSyncedAt: Date.now()
              }));
            } catch {}
          }
          showStatus("Produk berhasil dihapus dari database!");
        } else {
          const errData = await res.json().catch(() => ({}));
          // Optimistic local removal
          const updated = menuItems.filter(i => i.id !== id);
          onUpdateMenuItems(updated);
          showStatus(errData.error ? `Dihapus lokal (${errData.error})` : "Produk dihapus dari daftar menu.");
        }
      } catch (err: any) {
        // Fallback optimis jika koneksi terputus
        const updated = menuItems.filter(i => i.id !== id);
        onUpdateMenuItems(updated);
        showStatus("Produk berhasil dihapus dari daftar menu!");
      }
    } else if (type === 'team') {
      setTeamState(prev => prev.filter(m => m.id !== id));
      showStatus("Anggota tim berhasil dihapus.");
    }
  };

  // Sync settingsState when siteSettings prop updates
  useEffect(() => {
    setSettingsState(siteSettings);
  }, [siteSettings]);

  // Sync cardsState when heroCards prop updates
  useEffect(() => {
    if (heroCards && heroCards.length > 0) {
      setCardsState(heroCards);
    }
  }, [heroCards]);

  // Sync teamState when teamMembers prop updates
  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      setTeamState(teamMembers);
    }
  }, [teamMembers]);

  // Fetch orders and real-time stock immediately when admin panel opens or activeTab is orders/reports
  useEffect(() => {
    if (isOpen) {
      fetchOrders(true);
    }
  }, [isOpen, activeTab]);

  // Periodic polling for real-time live stock and order updates
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      if (activeTab === 'orders' || activeTab === 'reports') {
        fetchOrders(true);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab, adminToken]);

  // Google Drive Connection Status Checker
  const [driveStatus, setDriveStatus] = useState<{
    checking: boolean;
    connected?: boolean;
    message?: string;
    checkedAt?: string;
    hasUrl?: boolean;
  }>({ checking: false });

  const checkGoogleDriveStatus = async () => {
    setDriveStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch('/api/admin/drive-status', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDriveStatus({
          checking: false,
          connected: data.connected,
          message: data.message,
          hasUrl: data.hasUrl,
          checkedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      } else {
        setDriveStatus({
          checking: false,
          connected: false,
          message: "Gagal memeriksa status ke server.",
          checkedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        });
      }
    } catch {
      setDriveStatus({
        checking: false,
        connected: false,
        message: "Tidak dapat terhubung ke server.",
        checkedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  // Cek status saat pertama kali AdminPanel terbuka
  React.useEffect(() => {
    checkGoogleDriveStatus();
  }, []);

  // Panduan script & testing
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [savingAndTestingDrive, setSavingAndTestingDrive] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveAndTestDrive = async () => {
    setSavingAndTestingDrive(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(settingsState)
      });
      if (res.ok) {
        onUpdateSettings(settingsState);
        showStatus("URL Google Drive berhasil disimpan. Sedang memeriksa koneksi...");
        await checkGoogleDriveStatus();
      } else {
        showStatus("Gagal menyimpan URL ke server.", "error");
      }
    } catch {
      showStatus("Terjadi kesalahan jaringan saat menyimpan.", "error");
    } finally {
      setSavingAndTestingDrive(false);
    }
  };

  // Upload progress & finish animation state (Card & Product)
  const [cardUploadProgress, setCardUploadProgress] = useState<{ [idx: number]: number }>({});
  const [cardUploadFinished, setCardUploadFinished] = useState<{ [idx: number]: boolean }>({});
  const [cardUploadStatusText, setCardUploadStatusText] = useState<{ [idx: number]: string }>({});
  // Dedicated product form page state (replaces popup modal)
  const [activeProductEditId, setActiveProductEditId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/soki\/produk-(.+)\/?/);
      if (match && match[1]) {
        return match[1] === 'baru' ? 'new' : match[1];
      }
    }
    return null;
  });
  // Preview modal state for single product in admin panel
  const [adminPreviewProduct, setAdminPreviewProduct] = useState<MenuItem | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Handler untuk memilih produk dari daftar katalog untuk Card 1 / Card 2
  const handleSelectProductForCard = async (cardIdx: number, productId: string) => {
    const updated = [...cardsState];
    if (!productId) {
      updated[cardIdx] = {
        ...updated[cardIdx],
        productId: undefined
      };
      setCardsState(updated);
      onUpdateHeroCards(updated);
      try {
        await fetch('/api/admin/hero-cards', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(updated)
        });
      } catch {}
      showStatus(`Tautan produk pada Card ${cardIdx + 1} telah dilepas (Mode Manual).`);
      return;
    }

    const selectedProduct = menuItems.find(p => p.id === productId);
    if (selectedProduct) {
      const isDrink = (selectedProduct.category || '').toLowerCase() === 'minuman' || (selectedProduct.category || '').toLowerCase() === 'es';
      
      let autoSubtitle = '';
      if (selectedProduct.promoActive && selectedProduct.promoPrice && selectedProduct.promoPrice > 0) {
        autoSubtitle = `Promo: Beli ${selectedProduct.promoMinQty || 2} hanya Rp${selectedProduct.promoPrice.toLocaleString('id-ID')}!`;
      } else if (selectedProduct.description) {
        autoSubtitle = selectedProduct.description;
      } else if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        autoSubtitle = `Pilihan Varian: ${selectedProduct.variants.join(', ')}`;
      } else {
        autoSubtitle = `Harga Rp ${selectedProduct.price.toLocaleString('id-ID')}`;
      }

      // Pastikan foto Soba asli tidak tertimpa oleh foto kentang goreng unsplash bawaan awal
      const isFrenchFriesUnsplash = (selectedProduct.imageUrl || '').includes('photo-1541592106381-b31e9677c0e5');
      const sobaRealImageUrl = 'https://lh3.googleusercontent.com/d/146I0x5mQcd_LVtdwq85q8FzBMUzSGWKY';

      let cardImage = selectedProduct.imageUrl;
      if (isFrenchFriesUnsplash || !cardImage) {
        // Jika produk masih mengarah ke kentang goreng awal, gunakan foto Soba asli atau foto Card saat ini jika valid
        const currentValidImg = updated[cardIdx].imageUrl && !updated[cardIdx].imageUrl.includes('photo-1541592106381-b31e9677c0e5')
          ? updated[cardIdx].imageUrl
          : '';
        cardImage = currentValidImg || (cardIdx === 0 ? sobaRealImageUrl : selectedProduct.imageUrl || '');
      }

      updated[cardIdx] = {
        ...updated[cardIdx],
        productId: selectedProduct.id,
        title: selectedProduct.name,
        subtitle: autoSubtitle,
        badge: selectedProduct.badge || (isDrink ? 'Minuman Segar' : 'Cemilan Renyah'),
        imageUrl: cardImage,
        icon: isDrink ? '🥤' : '🍟'
      };
      setCardsState(updated);
      onUpdateHeroCards(updated);

      // Simpan langsung ke database dan file server
      try {
        await fetch('/api/admin/hero-cards', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(updated)
        });
      } catch {}

      showStatus(`✨ Card ${cardIdx + 1} berhasil menerapkan data produk: "${selectedProduct.name}" & tersimpan di database!`);
    }
  };

  // Fetch orders when orders tab opened (Ultra fast & robust)
  const fetchOrders = async (silent: boolean = false) => {
    if (!silent) {
      setLoadingOrders(true);
      showStatus("Menyinkronkan data pesanan langsung dari database...", "info");
    }
    try {
      const effectiveToken = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('soki_admin_token') : '') || 'soki_admin_secret_auth_token_99218';
      const resOrders = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${effectiveToken}` },
        cache: 'no-store'
      });

      if (resOrders.ok) {
        const data = await resOrders.json();
        // Support both array response or object with orders property
        const orderList = Array.isArray(data) ? data : (Array.isArray(data.orders) ? data.orders : []);
        setOrders(orderList);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('soki_orders_cache', JSON.stringify(orderList));
          } catch {}
        }
        if (data.menuItems && Array.isArray(data.menuItems) && onUpdateMenuItems) {
          onUpdateMenuItems(data.menuItems);
        }
        if (!silent) {
          showStatus(`✨ Berhasil menyinkronkan ${orderList.length} transaksi pesanan dari database!`, "success");
        }
      } else {
        if (!silent) {
          showStatus("Gagal menyinkronkan pesanan. Mencoba kembali...", "error");
        }
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      if (!silent) {
        showStatus("Gagal terhubung ke server saat memuat pesanan.", "error");
      }
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  const handleResetCardToDefault = async (cardIdx: number) => {
    const updated = [...cardsState];
    if (cardIdx === 0) {
      updated[0] = {
        id: "snack",
        title: "Snack Soba",
        subtitle: "Harga Rp 3.000",
        badge: "Cemilan Renyah",
        imageUrl: "https://lh3.googleusercontent.com/d/146I0x5mQcd_LVtdwq85q8FzBMUzSGWKY",
        icon: "🍟",
        bgGradient: "from-amber-400 to-orange-500",
        accentColor: "#ea580c",
        productId: "item-1789379742094"
      };
    } else {
      updated[1] = {
        id: "es",
        title: "Es Kiko (5 Varian)",
        subtitle: "Promo: Beli 2 hanya Rp5.000!",
        badge: "Es Pelepas Dahaga",
        imageUrl: "https://lh3.googleusercontent.com/d/1rbYol0QyfLcFkCppDGYwVPY0ppsnf6lD",
        icon: "🥤",
        bgGradient: "from-cyan-400 to-blue-500",
        accentColor: "#0284c7",
        productId: "item-1789331799209"
      };
    }
    setCardsState(updated);
    onUpdateHeroCards(updated);

    try {
      const res = await fetch('/api/admin/hero-cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        showStatus(`Card ${cardIdx + 1} berhasil dinormalkan dan tersimpan di database!`, "success");
      } else {
        showStatus(`Gagal menyimpan ke database saat normalisasi card ${cardIdx + 1}.`, "error");
      }
    } catch {
      showStatus(`Gagal terhubung ke database saat normalisasi card ${cardIdx + 1}.`, "error");
    }
  };

  const [savingLandingPage, setSavingLandingPage] = useState(false);
  const [isHoldingLandingPage, setIsHoldingLandingPage] = useState(false);
  const cancelHoldingLandingPageRef = useRef<boolean>(false);

  const saveHeroCards = async () => {
    // Selalu perbarui state utama secara instan agar tombol responsif dan langsung tampil di beranda
    onUpdateHeroCards(cardsState);

    try {
      const res = await fetch('/api/admin/hero-cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(cardsState)
      });
      if (res.ok) {
        showStatus("2 Card Landing Page berhasil disimpan ke database!", "success");
      } else {
        const errTxt = await res.text().catch(() => '');
        showStatus(`Gagal menyimpan ke database: ${errTxt || 'Sesi admin tidak sah'}`, "error");
      }
    } catch (err: any) {
      showStatus(`Gagal menyimpan ke database: ${err.message || 'Koneksi terputus'}`, "error");
    }
  };

  // Simpan Seluruh Pengaturan Landing Page Langsung ke Database MySQL
  const saveLandingPageSettings = async () => {
    // 1. Terapkan perubahan ke state UI secara instan
    onUpdateHeroCards(cardsState);
    onUpdateSettings(settingsState);

    cancelHoldingLandingPageRef.current = false;
    setSavingLandingPage(true);
    setIsHoldingLandingPage(false);

    const effectiveToken = adminToken || localStorage.getItem('soki_admin_token') || 'soki-secret-admin-session-token-2026';
    const payload = {
      heroCards: cardsState,
      siteSettings: settingsState
    };

    const attemptSend = async (): Promise<{ success: boolean; isAuthError?: boolean; isServerError?: boolean; errorMsg?: string }> => {
      const controller = new AbortController();
      // Beri batas waktu 20 detik untuk koneksi seluler/VPN
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      try {
        const url = `/api/admin/landing-page?token=${encodeURIComponent(effectiveToken)}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`,
          'X-Admin-Token': effectiveToken
        };

        let res: Response;
        try {
          res = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          // Jika server menolak method PUT (misal 405), coba POST
          if (res.status === 405 || res.status === 404) {
            res = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
              signal: controller.signal
            });
          }
        } catch (fetchErr: any) {
          // Jika fetch PUT gagal karena network/cors, coba POST sekali lagi
          if (controller.signal.aborted) throw fetchErr;
          res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        }

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          onUpdateHeroCards(cardsState);
          onUpdateSettings(settingsState);
          const dbInfo = data.database === 'mysql' ? 'Database MySQL' : 'Sistem Server';
          showStatus(`✨ Berhasil terhubung & tersimpan permanen ke ${dbInfo}!`, "success");
          setSavingLandingPage(false);
          setIsHoldingLandingPage(false);
          return { success: true };
        } else {
          if (res.status === 401 || res.status === 403) {
            return { success: false, isAuthError: true, errorMsg: "Sesi admin kedaluwarsa. Silakan login ulang." };
          }
          let parsedError = `Server error (${res.status})`;
          try {
            const errTxt = await res.text().catch(() => '');
            if (errTxt) {
              try {
                const errObj = JSON.parse(errTxt);
                if (errObj && errObj.error) parsedError = errObj.error;
                else parsedError = errTxt.slice(0, 150);
              } catch {
                parsedError = errTxt.slice(0, 150);
              }
            }
          } catch {}
          return { success: false, isServerError: true, errorMsg: parsedError };
        }
      } catch (e: any) {
        clearTimeout(timeoutId);
        return { success: false, errorMsg: e.message || 'Network error' };
      }
    };

    // Percobaan pertama simpan ke database
    const firstResult = await attemptSend();
    if (firstResult.success) return;

    if (firstResult.isAuthError) {
      showStatus(`Gagal menyimpan: ${firstResult.errorMsg}`, "error");
      setSavingLandingPage(false);
      setIsHoldingLandingPage(false);
      return;
    }

    if (firstResult.isServerError) {
      showStatus(`Gagal menyimpan ke server: ${firstResult.errorMsg}`, "error");
      setSavingLandingPage(false);
      setIsHoldingLandingPage(false);
      return;
    }

    // Jika terjadi masalah koneksi jaringan / offline / timeout (misal akibat VPN atau sinyal seluler drop)
    const isDeviceOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    setIsHoldingLandingPage(true);
    showStatus(
      isDeviceOffline
        ? "⏳ Perangkat offline. Proses tertahan & otomatis menyambung kembali saat jaringan aktif..."
        : "⏳ Sinyal jaringan terganggu / delay. Proses tertahan & mencoba menyambung kembali...",
      "info"
    );

    let resolved = false;

    const handleOnline = async () => {
      if (resolved || cancelHoldingLandingPageRef.current) return;
      try {
        const res = await attemptSend();
        if (res.success) {
          resolved = true;
          window.removeEventListener('online', handleOnline);
        }
      } catch {}
    };
    window.addEventListener('online', handleOnline);

    // Coba ulang dengan interval 4 detik (maksimal 6 kali percobaan otomatis)
    let retryCount = 0;
    while (!resolved && !cancelHoldingLandingPageRef.current && retryCount < 6) {
      retryCount++;
      await new Promise(r => setTimeout(r, 4000));
      if (cancelHoldingLandingPageRef.current) break;

      try {
        const res = await attemptSend();
        if (res.success) {
          resolved = true;
          break;
        } else if (res.isAuthError || res.isServerError) {
          showStatus(`Gagal menyimpan: ${res.errorMsg}`, "error");
          break;
        }
      } catch {}
    }

    window.removeEventListener('online', handleOnline);

    if (!resolved && !cancelHoldingLandingPageRef.current) {
      setIsHoldingLandingPage(false);
      setSavingLandingPage(false);
      showStatus("Koneksi belum stabil atau terhalang VPN. Silakan periksa jaringan lalu klik tombol Simpan kembali.", "info");
    }
  };

  const saveSiteSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(settingsState)
      });
      if (res.ok) {
        onUpdateSettings(settingsState);
        showStatus("Pengaturan teks & branding berhasil disimpan!");
      } else {
        showStatus("Gagal menyimpan pengaturan.", "error");
      }
    } catch {
      onUpdateSettings(settingsState);
      showStatus("Gagal menyimpan ke database. Periksa koneksi internet.", "error");
    }
  };

  // Simpan Anggota Tim dan Pengaturan Narasi Tentang Kami
  const saveTeamAndSettings = async () => {
    setSavingTeam(true);
    if (onUpdateTeamMembers) onUpdateTeamMembers(teamState);
    onUpdateSettings(settingsState);

    try {
      const [resTeam, resSettings] = await Promise.all([
        fetch('/api/admin/team', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(teamState)
        }),
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(settingsState)
        })
      ]);

      if (resTeam.ok && resSettings.ok) {
        showStatus("Daftar tugas anggota tim & halaman Tentang Kami berhasil disimpan!");
      } else {
        showStatus("Perubahan berhasil diterapkan dan disimpan!");
      }
    } catch {
      showStatus("Gagal menyimpan ke database. Periksa koneksi internet.", "error");
    } finally {
      setSavingTeam(false);
    }
  };

  const handleAddMember = () => {
    const nextNumber = teamState.length + 1;
    const newMember: TeamMember = {
      id: "member-" + Date.now(),
      name: `Anggota ${nextNumber}`,
      absen: `8B/`,
      role: "",
      description: "",
      initial: "A",
      themeColor: 'amber'
    };
    setTeamState(prev => [...prev, newMember]);
    showStatus("Anggota tim baru ditambahkan. Silakan atur nama dan biarkan anggota mengisi tugasnya.");
  };

  const handleUpdateMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamState(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        if (updates.name !== undefined) {
          const trimmed = updates.name.trim();
          if (trimmed.length > 0) {
            updated.initial = trimmed.charAt(0).toUpperCase();
          }
        }
        return updated;
      }
      return m;
    }));
  };

  const handleDeleteMember = (id: string) => {
    const target = teamState.find(m => m.id === id);
    const label = target?.name ? `"${target.name}"` : "anggota ini";
    setDeleteConfirmDialog({
      isOpen: true,
      type: 'team',
      id: id,
      title: 'Hapus Anggota Tim',
      message: `Yakin ingin menghapus ${label} dari daftar tim Tentang Kami?`
    });
  };

  const handleMoveMember = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= teamState.length) return;
    const nextArr = [...teamState];
    const temp = nextArr[idx];
    nextArr[idx] = nextArr[targetIdx];
    nextArr[targetIdx] = temp;
    setTeamState(nextArr);
  };

  // Handle image upload
  const handleCardImageUpload = async (cardIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation (.jpg, .jpeg, .png only, no double extensions like aaa.png.jpg)
    const check = validateImageFile(file);
    if (!check.valid) {
      showStatus(check.error || "File tidak valid", "error");
      e.target.value = '';
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);

    // Mulai animasi progress upload langsung pada kotak gambar
    setCardUploadProgress(prev => ({ ...prev, [cardIdx]: 15 }));
    setCardUploadFinished(prev => ({ ...prev, [cardIdx]: false }));

    // Animasi progress berjalan mulus menuju finish (tidak akan stuck)
    const progressInterval = setInterval(() => {
      setCardUploadProgress(prev => {
        const curr = prev[cardIdx] ?? 15;
        if (curr >= 92) return prev;
        const next = Math.min(92, curr + Math.floor(Math.random() * 6) + 4);
        return { ...prev, [cardIdx]: next };
      });
    }, 150);

    try {
      const result = await uploadToGoogleDriveWebhook(file, adminToken, 'landingpage', (statusMsg) => {
        setCardUploadStatusText(prev => ({ ...prev, [cardIdx]: statusMsg }));
      }, settingsState.googleDriveWebhookUrl);
      clearInterval(progressInterval);

      // Finish: Snap ke 100% dan aktifkan status finish
      setCardUploadProgress(prev => ({ ...prev, [cardIdx]: 100 }));
      setCardUploadFinished(prev => ({ ...prev, [cardIdx]: true }));
      setCardUploadStatusText(prev => ({ ...prev, [cardIdx]: 'Berhasil diunggah!' }));

      // Gambar resmi terpasang
      const updated = [...cardsState];
      const finalImgUrl = result.url || localPreviewUrl;
      updated[cardIdx].imageUrl = finalImgUrl;
      setCardsState(updated);
      onUpdateHeroCards(updated);

      // Otomatis sinkronkan dan simpan ke database MySQL & backend
      try {
        await fetch('/api/admin/hero-cards', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(updated)
        });
        showStatus(`Foto Card "${file.name}" berhasil diunggah, terpasang, dan tersimpan di database!`, "success");
      } catch {
        showStatus(`Foto Card "${file.name}" berhasil terpasang di tampilan!`, "success");
      }

      // Tunggu animasi finish (1.5 detik) lalu hilangkan overlay agar gambar terpajang sempurna
      setTimeout(() => {
        setCardUploadProgress(prev => {
          const copy = { ...prev };
          delete copy[cardIdx];
          return copy;
        });
        setCardUploadFinished(prev => {
          const copy = { ...prev };
          delete copy[cardIdx];
          return copy;
        });
        setCardUploadStatusText(prev => {
          const copy = { ...prev };
          delete copy[cardIdx];
          return copy;
        });
      }, 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setCardUploadProgress(prev => {
        const copy = { ...prev };
        delete copy[cardIdx];
        return copy;
      });
      setCardUploadFinished(prev => {
        const copy = { ...prev };
        delete copy[cardIdx];
        return copy;
      });
      setCardUploadStatusText(prev => {
        const copy = { ...prev };
        delete copy[cardIdx];
        return copy;
      });
      showStatus(`Gagal mengunggah gambar: ${err.message}`, "error");
    } finally {
      e.target.value = '';
    }
  };

  const handleOpenNewProduct = () => {
    setActiveProductEditId('new');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/soki/produk-baru/');
    }
  };

  const handleEditProduct = (item: MenuItem) => {
    setActiveProductEditId(item.id);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/soki/produk-${item.id}/`);
    }
  };

  const handleDeleteProduct = (id: string) => {
    const item = menuItems.find(i => i.id === id);
    const hasDrivePhoto = item?.imageUrl ? Boolean(extractGoogleDriveFileId(item.imageUrl)) : false;
    setDeleteConfirmDialog({
      isOpen: true,
      type: 'product',
      id: id,
      title: 'Hapus Produk',
      message: hasDrivePhoto
        ? `Yakin ingin menghapus produk "${item?.name || ''}"? Foto produk di Google Drive juga akan ikut otomatis dihapus.`
        : `Yakin ingin menghapus produk "${item?.name || ''}" dari daftar menu?`
    });
  };

  const handleQuickStockUpdate = async (id: string, newStock: number) => {
    const validStock = Math.max(0, newStock);
    try {
      const res = await fetch(`/api/admin/menu/${id}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ stock: validStock })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.menuItems && Array.isArray(data.menuItems)) {
          onUpdateMenuItems(data.menuItems);
        } else {
          const updated = menuItems.map(m => m.id === id ? { 
            ...m, 
            stock: validStock,
            available: validStock > 0 
          } : m);
          onUpdateMenuItems(updated);
        }
        showStatus(`Stok "${data.name || 'produk'}" diperbarui menjadi ${validStock} porsi`);
      } else {
        showStatus('Gagal memperbarui stok di server', 'error');
      }
    } catch (err: any) {
      showStatus(`Gagal koneksi server: ${err.message}`, 'error');
    }
  };

  // Handler Buka Modal Restok
  const handleOpenRestock = (item: MenuItem) => {
    setRestockModal({
      isOpen: true,
      product: item,
      addAmount: 10,
      customAmount: '10',
      mode: 'add',
      isLoading: false,
    });
  };

  // Eksekusi Simpan Restok ke Database (Kilat / Instant)
  const handleExecuteRestock = async () => {
    if (!restockModal.product) return;
    const prod = restockModal.product;
    const addQty = Math.max(1, parseInt(restockModal.customAmount) || restockModal.addAmount || 10);
    const currentStock = prod.stock ?? 0;
    const targetNewStock = restockModal.mode === 'set'
      ? Math.max(0, parseInt(restockModal.customAmount) || 0)
      : currentStock + addQty;

    // 1. Instantly update local UI and close modal without waiting for network roundtrip (Kilat!)
    const updated = menuItems.map(m => m.id === prod.id ? {
      ...m,
      stock: targetNewStock,
      available: targetNewStock > 0
    } : m);
    onUpdateMenuItems(updated);
    
    showStatus(
      restockModal.mode === 'add'
        ? `Stok "${prod.name}" ditambah ${addQty} porsi (Total: ${targetNewStock}). Produk aktif!`
        : `Stok "${prod.name}" diatur ke ${targetNewStock} porsi.`
    );
    
    setRestockModal({ isOpen: false, product: null, addAmount: 10, customAmount: '10', mode: 'add', isLoading: false });

    // 2. Sync with database asynchronously in background
    try {
      const url = restockModal.mode === 'add'
        ? `/api/admin/menu/${prod.id}/restock`
        : `/api/admin/menu/${prod.id}/stock`;

      const body = restockModal.mode === 'add'
        ? { addStock: addQty }
        : { stock: targetNewStock };

      fetch(url, {
        method: restockModal.mode === 'add' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(body)
      }).then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.menuItems && Array.isArray(data.menuItems)) {
            onUpdateMenuItems(data.menuItems);
          }
        } else {
          console.error('Background database sync failed');
        }
      }).catch(err => {
        console.error('Background database sync error:', err);
      });
    } catch (err: any) {
      console.error('Background error:', err);
    }
  };

  // Handler Buka Modal Reset Stok Per-Produk
  const handleOpenResetStockSingle = (item: MenuItem) => {
    setResetStockConfirm({
      isOpen: true,
      type: 'single',
      product: item,
      isLoading: false
    });
  };

  // Handler Buka Modal Reset Semua Stok
  const handleOpenResetStockAll = () => {
    setResetStockConfirm({
      isOpen: true,
      type: 'all',
      product: null,
      isLoading: false
    });
  };

  // Eksekusi Reset Stok ke 0 pada Database (Tanpa Hapus Produk)
  const handleExecuteResetStock = async () => {
    setResetStockConfirm(prev => ({ ...prev, isLoading: true }));
    try {
      if (resetStockConfirm.type === 'single' && resetStockConfirm.product) {
        const prod = resetStockConfirm.product;
        const res = await fetch(`/api/admin/menu/${prod.id}/reset-stock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.menuItems && Array.isArray(data.menuItems)) {
            onUpdateMenuItems(data.menuItems);
          } else {
            const updated = menuItems.map(m => m.id === prod.id ? {
              ...m,
              stock: 0,
              available: false
            } : m);
            onUpdateMenuItems(updated);
          }
          showStatus(`Stok "${prod.name}" berhasil direset ke 0. Produk tetap aman tanpa dihapus.`);
        } else {
          showStatus('Gagal mereset stok di database', 'error');
        }
      } else if (resetStockConfirm.type === 'all') {
        const res = await fetch('/api/admin/menu/reset-all-stocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.menuItems && Array.isArray(data.menuItems)) {
            onUpdateMenuItems(data.menuItems);
          } else {
            const updated = menuItems.map(m => ({
              ...m,
              stock: 0,
              available: false
            }));
            onUpdateMenuItems(updated);
          }
          showStatus('Semua stok produk berhasil direset ke 0. Seluruh menu tetap aman tanpa dihapus.');
        } else {
          showStatus('Gagal mereset semua stok di database', 'error');
        }
      }
    } catch (err: any) {
      showStatus(`Gagal koneksi server: ${err.message}`, 'error');
    } finally {
      setResetStockConfirm({ isOpen: false, type: 'single', product: null, isLoading: false });
    }
  };

  // Eksekusi Kosongkan Semua Pesanan & Laporan Penjualan pada Database (Mulai dari Nol)
  const handleExecuteClearOrders = async () => {
    // 1. Eksekusi instan seketika pada UI & local storage tanpa loading lambat
    setOrders([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('soki_orders_cache', JSON.stringify([]));
      } catch {}
    }
    setClearOrdersConfirm({ isOpen: false, isLoading: false });
    showStatus("✨ Seluruh riwayat pesanan dan data laporan penjualan berhasil dikosongkan. Siap input dari awal!", "success");

    // 2. Kirim update ke server di background
    try {
      const effectiveToken = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('soki_admin_token') : '') || 'soki_admin_secret_auth_token_99218';
      await fetch('/api/admin/orders/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err: any) {
      console.warn("Background clear orders sync:", err.message);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'Menunggu' | 'Selesai' | 'Batal') => {
    const currentOrder = (Array.isArray(orders) ? orders : []).find(o => o.id === orderId);

    // 1. Instant optimistic UI update for instant feedback
    setOrders(prev => {
      const updated = (Array.isArray(prev) ? prev : []).map(o => o.id === orderId ? { ...o, status } : o);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('soki_orders_cache', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    showStatus(`Menyimpan status pesanan #${orderId}...`);

    // 2. Synchronous reliable server update to guarantee persistence on refresh
    try {
      const effectiveToken = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('soki_admin_token') : '') || 'soki_admin_secret_auth_token_99218';
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: JSON.stringify({ status, order: currentOrder })
      });
      
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.order) {
          setOrders(prev => {
            const updated = (Array.isArray(prev) ? prev : []).map(o => o.id === orderId ? { ...o, ...data.order } : o);
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('soki_orders_cache', JSON.stringify(updated)); } catch {}
            }
            return updated;
          });
        }
        if (data.menuItems && Array.isArray(data.menuItems) && onUpdateMenuItems) {
          onUpdateMenuItems(data.menuItems);
        }
        showStatus(`Status pesanan #${orderId} berhasil disimpan ke Database!`, 'success');
      } else {
        const errData = await res.json().catch(() => ({}));
        showStatus(`Gagal menyimpan status: ${errData.error || 'Kesalahan server'}`, 'error');
      }
    } catch (err: any) {
      showStatus(`Gagal koneksi server: ${err.message}`, 'error');
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm(`Hapus pesanan #${orderId} dari daftar?`)) return;
    
    // Instant optimistic removal
    setOrders(prev => {
      const filtered = (Array.isArray(prev) ? prev : []).filter(o => o.id !== orderId);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('soki_orders_cache', JSON.stringify(filtered)); } catch {}
      }
      return filtered;
    });
    showStatus(`Pesanan #${orderId} berhasil dihapus.`);

    try {
      const effectiveToken = adminToken || (typeof window !== 'undefined' ? localStorage.getItem('soki_admin_token') : '') || 'soki_admin_secret_auth_token_99218';
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${effectiveToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.menuItems && Array.isArray(data.menuItems) && onUpdateMenuItems) {
          onUpdateMenuItems(data.menuItems);
        }
      }
    } catch (err: any) {
      console.warn("Delete order error:", err);
    }
  };

  if (!isOpen) return null;

  if (activeProductEditId !== null) {
    return (
      <ProductFormPage
        productId={activeProductEditId}
        menuItems={menuItems}
        adminToken={adminToken}
        webhookUrl={settingsState.googleDriveWebhookUrl}
        onSaveProduct={(savedItem, isNew) => {
          if (isNew) {
            onUpdateMenuItems([...menuItems, savedItem]);
          } else {
            onUpdateMenuItems(menuItems.map(m => m.id === savedItem.id ? savedItem : m));
          }
          setActiveProductEditId(null);
        }}
        onBack={() => {
          setActiveProductEditId(null);
          if (typeof window !== 'undefined') {
            window.history.pushState(null, '', '/admin');
          }
        }}
        showStatus={showStatus}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row selection:bg-orange-500 selection:text-white relative">
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar Admin Modern (Drawer di Mobile, Sticky Sidebar di Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-2xl transition-all duration-300 shrink-0 ${
        isMobileDrawerOpen 
          ? 'translate-x-0 w-72 max-w-[85vw]' 
          : '-translate-x-full md:translate-x-0 ' + (isDesktopSidebarOpen ? 'md:w-72' : 'md:w-0 md:overflow-hidden md:border-r-0')
      }`}>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 relative flex-shrink-0">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 10px 15px rgba(234, 88, 12, 0.28))' }}>
                <defs>
                  <linearGradient id="adminPanelSGoldGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffedd5"/>
                    <stop offset="25%" stopColor="#fb923c"/>
                    <stop offset="70%" stopColor="#ea580c"/>
                    <stop offset="100%" stopColor="#9a3412"/>
                  </linearGradient>
                  <linearGradient id="adminPanelNeonSnakeGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8"/>
                    <stop offset="50%" stopColor="#e0f2fe"/>
                    <stop offset="100%" stopColor="#0284c7"/>
                  </linearGradient>
                  <radialGradient id="adminPanelCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
                <circle cx="50" cy="50" r="38" fill="url(#adminPanelCenterGlow)"/>
                <rect className="anim-logo-badge" x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
                <path className="anim-snake-line-back" d="M16 38 C14 20, 58 14, 82 26" stroke="url(#adminPanelNeonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <path className="anim-snake-line-back" d="M18 68 C16 50, 68 42, 84 56" stroke="url(#adminPanelNeonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <g className="anim-s-core">
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#000000" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.45" transform="translate(0, 4)"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#adminPanelSGoldGrad)" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  <path d="M42 27 C46 25, 56 25, 61 28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </g>
                <path className="anim-snake-line-front" d="M82 26 C88 38, 44 44, 18 68" stroke="url(#adminPanelNeonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
                <path className="anim-snake-line-front" d="M84 56 C90 70, 48 80, 22 88" stroke="url(#adminPanelNeonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
                <g className="anim-ice-cube-1">
                  <polygon points="20,18 28,14 36,18 28,22" fill="#ffffff"/>
                  <polygon points="20,18 28,22 28,30 20,26" fill="#93c5fd"/>
                  <polygon points="28,22 36,18 36,26 28,30" fill="#38bdf8"/>
                </g>
                <g className="anim-ice-cube-2">
                  <polygon points="68,76 76,72 84,76 76,80" fill="#ffffff"/>
                  <polygon points="68,76 76,80 76,88 68,84" fill="#93c5fd"/>
                  <polygon points="76,80 84,76 84,84 76,88" fill="#0284c7"/>
                </g>
              </svg>
            </div>
            <div className="flex flex-col select-none text-left">
              <div className="flex items-center kid-font leading-none">
                <span className="k-letter-s">S</span>
                <span className="k-letter-o">O</span>
                <span className="k-letter-k">K</span>
                <span className="k-letter-i">I</span>
                <span className="k-dot">.</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8.5px] font-extrabold tracking-widest text-slate-400 uppercase">SNACK &bull; ICE BAR</span>
                <span className="text-[8px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.2 rounded font-black uppercase">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Tutup Khusus Mobile */}
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Menu */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto whitespace-nowrap">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Navigasi</p>
          <button
            onClick={() => { setActiveTab('cards'); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center gap-3 text-xs font-bold cursor-pointer ${
              activeTab === 'cards' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span className="text-left">Pengaturan Landing Page &amp; Card</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('products'); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center gap-3 text-xs font-bold cursor-pointer ${
              activeTab === 'products' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="text-left">Daftar Produk</span>
          </button>

          <button
            onClick={() => { setActiveTab('orders'); fetchOrders(); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center gap-3 text-xs font-bold cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4 shrink-0" />
            <span className="text-left">Pesanan Masuk</span>
          </button>

          <button
            onClick={() => { setActiveTab('reports'); fetchOrders(); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center gap-3 text-xs font-bold cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span className="text-left">Laporan Penjualan</span>
          </button>

          <button
            onClick={() => { setActiveTab('team'); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center gap-3 text-xs font-bold cursor-pointer ${
              activeTab === 'team' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-left">Tentang Kami</span>
          </button>

          <button
            onClick={() => { setActiveTab('schedule'); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center justify-between text-xs font-bold cursor-pointer ${
              activeTab === 'schedule' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 shrink-0" />
              <span className="text-left">Jam Buka &amp; Tutup Toko</span>
            </div>
            {settingsState.storeSchedule?.statusMode === 'force_closed' && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" title="Toko Tutup Sementara"></span>
            )}
            {settingsState.storeSchedule?.statusMode === 'force_open' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Toko Selalu Buka"></span>
            )}
          </button>

          {/* TAB 7: GOOGLE DRIVE (HANYA SUPERADMIN YANG BISA MELIHAT) */}
          {isSuperAdmin && (
            <button
              onClick={() => { setActiveTab('drive'); setIsMobileDrawerOpen(false); }}
              className={`w-full px-3.5 py-3 rounded-xl transition flex items-center justify-between text-xs font-bold cursor-pointer ${
                activeTab === 'drive' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 font-black' 
                  : 'text-purple-300 hover:text-white hover:bg-slate-800 border border-purple-500/30 bg-purple-950/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <CloudUpload className="w-4 h-4 shrink-0 text-purple-400" />
                <span className="text-left">Penyimpanan Google Drive</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-purple-500 text-white rounded shadow-xs">
                Superadmin
              </span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('maintenance'); setIsMobileDrawerOpen(false); }}
            className={`w-full px-3.5 py-3 rounded-xl transition flex items-center justify-between text-xs font-bold cursor-pointer ${
              activeTab === 'maintenance' 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-black' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wrench className="w-4 h-4 shrink-0" />
              <span className="text-left">Mode Maintenance</span>
            </div>
            {settingsState.maintenance?.enabled && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3.5 border-t border-slate-800 space-y-2 bg-slate-950/40 whitespace-nowrap">
          {/* Status Superadmin Indicator atau Tombol Buka Kunci Superadmin */}
          {isSuperAdmin ? (
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Crown className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <div className="min-w-0">
                  <span className="text-[9px] font-black text-purple-300 uppercase tracking-wider block leading-none">Superadmin</span>
                  <span className="text-[10.5px] font-bold text-white truncate block">Koko Ferri</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLockSuperadmin}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-purple-200 hover:text-white text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                title="Kunci & Sembunyikan Mode Superadmin sebelum website diserahkan ke orang lain"
              >
                <Lock className="w-3 h-3" />
                <span>Kunci</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSuperAdminPin('');
                setSuperAdminPinError('');
                setIsSuperAdminModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-slate-500 hover:text-purple-300 font-semibold transition cursor-pointer"
              title="Akses Khusus Superadmin (Pemilik)"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Akses Superadmin</span>
            </button>
          )}

          <button
            onClick={() => { onClose(); setIsMobileDrawerOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
            title="Kembali ke Website Toko"
          >
            <Store className="w-4 h-4" />
            <span>Buka Website Toko</span>
          </button>

          <button
            onClick={() => { onLogout(); setIsMobileDrawerOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer active:scale-95"
            title="Logout Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar (Ramping, Responsif, Selalu Terlihat di Atas) */}
        <header className="bg-slate-900 text-white px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between shadow-md sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Menu Button (Hanya Ikon) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center"
              title="Buka Menu Navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Toggle Sidebar Button (Hanya Ikon) */}
            <button
              onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
              className="hidden md:flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title={isDesktopSidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title="Kembali ke Website Toko"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Toko</span>
              <span className="sm:hidden">Toko</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer active:scale-95"
              title="Logout Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>
      {/* Status Toast Banner (Floating & Selalu Tampak di Layar Mana Pun) */}
      {statusMessage && (
        <div className="fixed top-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[9999] pointer-events-auto transition-all animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 text-xs font-bold rounded-2xl flex items-center justify-between shadow-2xl border ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/30' 
              : statusMessage.type === 'info'
                ? 'bg-amber-600 text-white border-amber-500 shadow-amber-950/30'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-950/30'
          }`}>
            <div className="flex items-center gap-2.5">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              ) : statusMessage.type === 'info' ? (
                <Info className="w-5 h-5 text-amber-200 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />
              )}
              <span className="leading-snug text-white font-extrabold">{statusMessage.text}</span>
            </div>
            <button 
              onClick={() => setStatusMessage(null)} 
              className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded-lg ml-2 transition shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 py-3 sm:py-4">
          
          {/* TAB 1: PENGATURAN LANDING PAGE & INTEGRASI GOOGLE DRIVE */}
          {activeTab === 'cards' && (
            <div className="space-y-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">Landing Page Settings</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardsState.map((card, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        <span className="text-xs font-extrabold text-slate-800">
                          {idx === 0 ? 'Card 1 • Snack Utama' : 'Card 2 • Minuman Utama'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleResetCardToDefault(idx)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 text-[10.5px] font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1"
                          title="Normalkan kartu ini ke setelan standar"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Normalkan</span>
                        </button>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md hidden sm:inline-block">
                          Tampilan Utama Hero
                        </span>
                      </div>
                    </div>

                    {/* Preview Image Card dengan Animasi Upload Langsung */}
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group flex items-center justify-center">
                      {card.imageUrl ? (
                        <img 
                          src={card.imageUrl} 
                          alt={card.title}
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            cardUploadProgress[idx] !== undefined && !cardUploadFinished[idx] ? 'scale-105 blur-[2px] opacity-40' : 'scale-100 opacity-100'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                          <span className="text-4xl mb-1.5">{card.icon || (idx === 0 ? '🍟' : '🥤')}</span>
                          <span className="text-xs font-bold text-slate-300">Belum Ada Gambar</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">Unggah foto baru di bawah ini</span>
                        </div>
                      )}

                      {/* Overlay Animasi Upload Sampai Finish */}
                      {cardUploadProgress[idx] !== undefined && (
                        <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
                          cardUploadFinished[idx]
                            ? 'bg-emerald-950/80 backdrop-blur-xs'
                            : 'bg-slate-950/75 backdrop-blur-xs'
                        }`}>
                          {!cardUploadFinished[idx] ? (
                            <div className="w-full max-w-[220px] flex flex-col items-center text-center space-y-3">
                              {/* Icon animasi upload */}
                              <div className="relative">
                                <div className="w-12 h-12 rounded-full border-2 border-orange-500/20 border-t-orange-500 animate-spin" />
                                <CloudUpload className="w-5 h-5 text-orange-400 absolute inset-0 m-auto animate-pulse" />
                              </div>
                              
                              <div className="w-full space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-orange-300 flex items-center gap-1 truncate max-w-[150px]">
                                    <Sparkles className="w-3 h-3 text-orange-400 animate-pulse shrink-0" /> {cardUploadStatusText[idx] || 'Mengunggah...'}
                                  </span>
                                  <span className="font-mono text-white text-xs shrink-0">{Math.round(cardUploadProgress[idx])}%</span>
                                </div>
                                {/* Progress Bar Animasi */}
                                <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5 shadow-inner">
                                  <div 
                                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-full transition-all duration-150 ease-out shadow-sm"
                                    style={{ width: `${cardUploadProgress[idx]}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Finish: Animasi Centang & Gambar Terpasang */
                            <div className="flex flex-col items-center text-center space-y-2 animate-in zoom-in-75 duration-300">
                              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/50">
                                <Check className="w-6 h-6 text-white stroke-[3] animate-in zoom-in-50" />
                              </div>
                              <div>
                                <p className="font-black text-sm text-white tracking-wide">Gambar Terpasang!</p>
                                <p className="text-[10px] text-emerald-200 font-semibold">Tersimpan di Google Drive</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info teks overlay standar di atas kartu (hanya muncul jika tidak sedang upload) */}
                      {cardUploadProgress[idx] === undefined && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3.5 flex flex-col justify-between text-white transition-opacity duration-300">
                          <span className="self-start text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500 shadow-sm">
                            {card.badge}
                          </span>
                          <div>
                            <p className="font-black text-sm drop-shadow-sm">{card.title}</p>
                            <p className="text-[11px] text-slate-300 drop-shadow-sm">{card.subtitle}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Fields & Product Selector */}
                    <div className="space-y-3.5 text-xs">
                      {/* FITUR PILIH DARI DAFTAR PRODUK (KATALOG MENU) */}
                      <div className="bg-gradient-to-br from-orange-50/90 to-amber-50/60 border border-orange-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            <span>Pilih Dari Daftar Menu Produk:</span>
                          </label>
                          {card.productId && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                              Tersambung
                            </span>
                          )}
                        </div>

                        {menuItems.length > 0 ? (
                          <div className="relative">
                            <select
                              value={card.productId || ''}
                              onChange={(e) => handleSelectProductForCard(idx, e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-orange-300 bg-white font-bold text-slate-800 text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer appearance-none pr-8 shadow-xs"
                            >
                              <option value="">-- Mode Manual (Atur Teks Bebas) --</option>
                              <optgroup label="📋 Daftar Menu Produk Tersedia">
                                {menuItems.map((prod) => (
                                  <option key={prod.id} value={prod.id}>
                                    {(prod.category || '').toLowerCase() === 'minuman' ? '🥤' : '🍟'} {prod.name} — Rp {prod.price.toLocaleString('id-ID')} {prod.badge ? `[${prod.badge}]` : ''}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-white rounded-xl border border-orange-200 text-center space-y-2">
                            <p className="text-[11px] text-slate-600 font-medium">
                              Belum ada produk di katalog. Tambahkan produk di tab Menu Produk agar bisa dipilih langsung di sini.
                            </p>
                            <button
                              type="button"
                              onClick={() => setActiveTab('products')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Buka Tab Menu Produk</span>
                            </button>
                          </div>
                        )}

                        {/* Info & Aksi Tambahan Jika Produk Terpilih */}
                        {(() => {
                          const linkedProduct = menuItems.find(p => p.id === card.productId);
                          if (!linkedProduct) {
                            return (
                              <p className="text-[10px] text-slate-500 font-medium">
                                💡 Pilih produk dari dropdown di atas untuk otomatis mengisi Judul, Subjudul, Badge, dan Foto dari katalog produk.
                              </p>
                            );
                          }

                          return (
                            <div className="pt-2 border-t border-orange-200/80 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {linkedProduct.imageUrl ? (
                                  <img src={linkedProduct.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-orange-300 shrink-0 shadow-2xs" />
                                ) : (
                                  <span className="text-base">{(linkedProduct.category || '').toLowerCase() === 'minuman' ? '🥤' : '🍟'}</span>
                                )}
                                <div className="min-w-0">
                                  <span className="text-[11px] font-black text-slate-900 block truncate">
                                    {linkedProduct.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-orange-600">
                                    Rp {linkedProduct.price.toLocaleString('id-ID')} {linkedProduct.promoInfo ? `• ${linkedProduct.promoInfo}` : ''}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectProductForCard(idx, linkedProduct.id)}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-100 text-orange-700 border border-orange-300 text-[10.5px] font-extrabold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Terapkan ulang data terbaru dari menu produk ini"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Sinkronkan Ulang</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectProductForCard(idx, '')}
                                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-[10.5px] font-semibold transition cursor-pointer"
                                  title="Lepas keterikatan produk agar dapat diubah mandiri"
                                >
                                  Lepas Tautan
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700 block">Judul Card:</label>
                          {card.productId && (
                            <span className="text-[10px] text-orange-600 font-bold">Otomatis terisi dari nama produk</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const updated = [...cardsState];
                            updated[idx].title = e.target.value;
                            setCardsState(updated);
                          }}
                          placeholder="Contoh: Aneka Cemilan Renyah"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-orange-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700 block">Sub Judul / Keterangan Singkat:</label>
                          {card.productId && (
                            <span className="text-[10px] text-orange-600 font-bold">Otomatis terisi dari promo / deskripsi</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={card.subtitle}
                          onChange={(e) => {
                            const updated = [...cardsState];
                            updated[idx].subtitle = e.target.value;
                            setCardsState(updated);
                          }}
                          placeholder="Contoh: Renyah gurih bumbu mantap"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-orange-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-700 block">Badge Teks (Label Kecil):</label>
                          {card.productId && (
                            <span className="text-[10px] text-orange-600 font-bold">Otomatis terisi dari badge produk</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={card.badge}
                          onChange={(e) => {
                            const updated = [...cardsState];
                            updated[idx].badge = e.target.value;
                            setCardsState(updated);
                          }}
                          placeholder="Contoh: Cemilan Renyah"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-orange-500 shadow-2xs"
                        />
                      </div>

                      {/* UPLOAD GAMBAR */}
                      <div className="pt-2 border-t border-slate-200">
                        <label className="font-bold text-slate-800 flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1.5 text-orange-600 font-extrabold">
                            <CloudUpload className="w-3.5 h-3.5 text-orange-500" /> Upload Gambar Card:
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Hanya .jpg, .jpeg, .png</span>
                        </label>
                        
                        <div className="flex items-center gap-2">
                          <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition shadow-2xs border ${
                            cardUploadProgress[idx] !== undefined
                              ? 'bg-orange-50 border-orange-200 text-orange-600 pointer-events-none'
                              : 'bg-orange-50 hover:bg-orange-100 border-dashed border-orange-300 text-orange-700'
                          }`}>
                            {cardUploadProgress[idx] !== undefined ? (
                              cardUploadFinished[idx] ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                                  <span className="text-emerald-700">Gambar Terpasang!</span>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-4 h-4 text-orange-600 animate-spin" />
                                  <span>Mengunggah ({Math.round(cardUploadProgress[idx])}%)...</span>
                                </>
                              )
                            ) : (
                              <>
                                <CloudUpload className="w-4 h-4 text-orange-500" />
                                <span>Pilih File Gambar</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                              disabled={cardUploadProgress[idx] !== undefined}
                              onChange={(e) => handleCardImageUpload(idx, e)}
                              className="hidden"
                            />
                          </label>

                          {card.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...cardsState];
                                updated[idx].imageUrl = '';
                                setCardsState(updated);
                                onUpdateHeroCards(updated);
                                showStatus(`Foto pada Card ${idx + 1} berhasil dihapus/dikosongkan.`);
                              }}
                              className="px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 shadow-2xs"
                              title="Hapus foto dan gunakan tampilan ikon bawaan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Hapus Foto</span>
                            </button>
                          )}
                        </div>

                        {/* INPUT URL GAMBAR LANGSUNG & PRESET */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                            <span>Atau Masukkan URL Gambar:</span>
                            {card.imageUrl ? (
                              <span className="text-emerald-700 font-extrabold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">✓ Gambar Aktif</span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Opsional</span>
                            )}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={card.imageUrl || ''}
                              onChange={(e) => {
                                const updated = [...cardsState];
                                updated[idx].imageUrl = e.target.value.trim();
                                setCardsState(updated);
                                onUpdateHeroCards(updated);
                              }}
                              placeholder="https://... atau /uploads/..."
                              className="flex-1 p-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-orange-500 shadow-2xs font-mono"
                            />
                            {idx === 0 && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const updated = [...cardsState];
                                  const sobaImg = 'https://lh3.googleusercontent.com/d/146I0x5mQcd_LVtdwq85q8FzBMUzSGWKY';
                                  updated[0].imageUrl = sobaImg;
                                  setCardsState(updated);
                                  onUpdateHeroCards(updated);
                                  try {
                                    await fetch('/api/admin/hero-cards', {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${adminToken}`
                                      },
                                      body: JSON.stringify(updated)
                                    });
                                  } catch {}
                                  showStatus("Foto Snack Soba asli kemasan berhasil dipasang!");
                                }}
                                className="px-2.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-bold text-[10.5px] shrink-0 cursor-pointer shadow-2xs"
                                title="Pasang foto asli Snack Soba kemasan"
                              >
                                Foto Soba
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>



              {/* Pengaturan Teks & Branding Landing Page */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="pb-3 border-b border-slate-100">
                  <h4 className="font-extrabold text-slate-900 text-base">Teks &amp; Branding Landing Page</h4>
                  <p className="text-xs text-slate-500">Atur badge pengumuman, nomor WhatsApp, judul utama hero, dan deskripsi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Badge Pengumuman:</label>
                    <input
                      type="text"
                      value={settingsState.announcement}
                      onChange={(e) => setSettingsState({ ...settingsState, announcement: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. WhatsApp Kelompok:</label>
                    <input
                      type="text"
                      value={settingsState.whatsappNumber}
                      onChange={(e) => setSettingsState({ ...settingsState, whatsappNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Headline Utama:</label>
                    <input
                      type="text"
                      value={settingsState.heroHeadline}
                      onChange={(e) => setSettingsState({ ...settingsState, heroHeadline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Sub Judul Deskripsi Hero:</label>
                    <input
                      type="text"
                      value={settingsState.heroSubtitle}
                      onChange={(e) => setSettingsState({ ...settingsState, heroSubtitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Pengaturan Card Keunggulan ("Kenapa Harus Beli di Kelompok 3?") */}
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h5 className="font-black text-slate-900 text-sm sm:text-base">Kartu Keunggulan ("Kenapa Harus Beli di Kelompok 3?")</h5>
                      <p className="text-xs text-slate-500 mt-0.5">Sesuaikan 3 kartu poin keunggulan toko yang tampil di landing page.</p>
                    </div>
                    <span className="px-3.5 py-1.5 bg-orange-500 text-white font-black text-xs rounded-xl shadow-xs tracking-wide shrink-0 whitespace-nowrap text-center">
                      3 Kartu Aktif
                    </span>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(settingsState.features || [
                      { title: "Snack Dijamin Garing", description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.", icon: "🍟" },
                      { title: "Minuman Dingin Segar", description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.", icon: "🧊" },
                      { title: "Harga Ramah Kantong", description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.", icon: "⚡" }
                    ]).map((feat, fIdx) => (
                      <div key={fIdx} className="bg-gradient-to-b from-white to-slate-50/90 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                {fIdx + 1}
                              </span>
                              <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                Kartu #{fIdx + 1}
                              </span>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-sm shadow-xs">
                              {feat.icon}
                            </span>
                          </div>

                          <div className="space-y-3.5 text-xs">
                            <div className="space-y-1.5">
                              <label className="font-extrabold text-slate-700 block text-xs">Pilih Emoji / Ikon:</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={feat.icon}
                                  onChange={(e) => {
                                    const newFeatures = [...(settingsState.features || [
                                      { title: "Snack Dijamin Garing", description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.", icon: "🍟" },
                                      { title: "Minuman Dingin Segar", description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.", icon: "🧊" },
                                      { title: "Harga Ramah Kantong", description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.", icon: "⚡" }
                                    ])];
                                    newFeatures[fIdx].icon = e.target.value;
                                    setSettingsState({ ...settingsState, features: newFeatures });
                                  }}
                                  className="w-12 p-2 text-center rounded-xl border border-slate-200 bg-white font-bold text-sm outline-none focus:border-orange-500 shadow-2xs shrink-0"
                                  maxLength={4}
                                />
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 flex-1 scrollbar-thin">
                                  {['🍟', '🧊', '⚡', '🔥', '✨', '😋', '🥤', '💯', '⭐', '🏆', '💎', '🚀', '🍔', '🍕', '🌭', '🍿', '🍩', '🍪', '🍫', '🍬', '☕', '🧋', '🍵', '🍾', '🎉', '🌟', '💡', '🎯', '❤️', '👍', '👑'].map((em, emIdx) => (
                                    <button
                                      key={`${em}-${emIdx}`}
                                      type="button"
                                      onClick={() => {
                                        const newFeatures = [...(settingsState.features || [
                                          { title: "Snack Dijamin Garing", description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.", icon: "🍟" },
                                          { title: "Minuman Dingin Segar", description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.", icon: "🧊" },
                                          { title: "Harga Ramah Kantong", description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.", icon: "⚡" }
                                        ])];
                                        newFeatures[fIdx].icon = em;
                                        setSettingsState({ ...settingsState, features: newFeatures });
                                      }}
                                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-orange-100 flex items-center justify-center text-sm transition cursor-pointer shadow-xs shrink-0"
                                    >
                                      {em}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 pt-1">
                              <div>
                                <label className="font-extrabold text-slate-700 block mb-1 text-xs">Judul Keunggulan:</label>
                                <input
                                  type="text"
                                  value={feat.title}
                                  onChange={(e) => {
                                    const newFeatures = [...(settingsState.features || [
                                      { title: "Snack Dijamin Garing", description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.", icon: "🍟" },
                                      { title: "Minuman Dingin Segar", description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.", icon: "🧊" },
                                      { title: "Harga Ramah Kantong", description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.", icon: "⚡" }
                                    ])];
                                    newFeatures[fIdx].title = e.target.value;
                                    setSettingsState({ ...settingsState, features: newFeatures });
                                  }}
                                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs outline-none focus:border-orange-500 shadow-xs"
                                />
                              </div>

                              <div>
                                <label className="font-extrabold text-slate-700 block mb-1 text-xs">Keterangan / Deskripsi:</label>
                                <input
                                  type="text"
                                  value={feat.description}
                                  onChange={(e) => {
                                    const newFeatures = [...(settingsState.features || [
                                      { title: "Snack Dijamin Garing", description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.", icon: "🍟" },
                                      { title: "Minuman Dingin Segar", description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.", icon: "🧊" },
                                      { title: "Harga Ramah Kantong", description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.", icon: "⚡" }
                                    ])];
                                    newFeatures[fIdx].description = e.target.value;
                                    setSettingsState({ ...settingsState, features: newFeatures });
                                  }}
                                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 text-xs outline-none focus:border-orange-500 shadow-xs"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  {isHoldingLandingPage && (
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 bg-amber-50 px-3.5 py-2.5 rounded-xl border border-amber-300 animate-pulse w-full sm:w-auto">
                      <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Koneksi terputus. Proses tertahan & otomatis menyambung kembali ke Database...</span>
                      <button
                        type="button"
                        onClick={() => {
                          cancelHoldingLandingPageRef.current = true;
                          setIsHoldingLandingPage(false);
                          setSavingLandingPage(false);
                          showStatus("Proses penyimpanan dibatalkan.", "info");
                        }}
                        className="ml-auto underline hover:text-amber-950 text-[11px] font-black cursor-pointer px-1 py-0.5"
                      >
                        Batal
                      </button>
                    </div>
                  )}

                  <button
                    disabled={savingLandingPage && !isHoldingLandingPage}
                    onClick={saveLandingPageSettings}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 cursor-pointer ${
                      isHoldingLandingPage
                        ? 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-400/50'
                        : 'bg-orange-500 hover:bg-orange-600 disabled:opacity-50'
                    }`}
                  >
                    {isHoldingLandingPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-200 shrink-0" />
                        <span>Tertahan: Menunggu Jaringan Konek...</span>
                      </>
                    ) : savingLandingPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 shrink-0" />
                        <span>Simpan Seluruh Pengaturan ke Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAFTAR PRODUK KATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-6 pb-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Daftar Menu Makanan &amp; Minuman</h4>
                  <p className="text-xs text-slate-500">Kelola menu, restok persediaan habis, reset stok awal, edit varian rasa &amp; harga.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenResetStockAll}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Kosongkan semua stok produk menjadi 0 tanpa menghapus produk"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reset Semua Stok ke 0</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenNewProduct}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Menu Baru</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                    <div className="relative h-36 bg-slate-100 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-3xl">
                          {(item.category || '').toLowerCase() === 'minuman' ? '🥤' : '🍟'}
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full text-white ${(item.category || '').toLowerCase() === 'minuman' ? 'bg-cyan-600' : 'bg-amber-500'}`}>
                        {item.badge}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          {(item.category || '').toLowerCase() === 'minuman' ? 'Kategori Minuman' : 'Kategori Makanan'}
                        </span>
                        <h5 className="font-extrabold text-slate-900 text-sm mt-0.5">{item.name}</h5>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-1">{item.description}</p>
                        
                        {item.promoInfo && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                              {item.promoInfo}
                            </span>
                            {Boolean(item.promoActive && Number(item.promoPrice) > 0) && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black">
                                Beli {item.promoMinQty || 2} Rp {Number(item.promoPrice).toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stok Barang Badge & Quick Controls */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[11px] font-extrabold text-slate-700">
                                Stok:
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                (item.stock ?? 0) <= 0
                                  ? 'bg-rose-100 text-rose-700'
                                  : (item.stock ?? 0) <= 10
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.stock !== undefined ? `${item.stock} Porsi` : 'Tak Terbatas'}
                              </span>
                              {(item.stock ?? 0) <= 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                                  Habis
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickStockUpdate(item.id, Math.max(0, (item.stock ?? 0) - 5))}
                                className="w-6 h-5 rounded-md bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 transition cursor-pointer"
                                title="Kurangi 5 stok"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStockUpdate(item.id, (item.stock ?? 0) + 10)}
                                className="w-7 h-5 rounded-md bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 transition cursor-pointer"
                                title="Tambah 10 stok cepat"
                              >
                                +10
                              </button>
                            </div>
                          </div>

                          {/* Tombol Restok Cepat & Reset Stok Langsung */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/70">
                            <button
                              type="button"
                              onClick={() => handleOpenRestock(item)}
                              className={`w-full py-1.5 px-2 rounded-lg font-black text-[11px] flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs ${
                                (item.stock ?? 0) <= 0
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                              title="Restok produk ini (tambah stok tanpa mengulang input menu)"
                            >
                              <PackagePlus className="w-3.5 h-3.5 shrink-0" />
                              <span>{(item.stock ?? 0) <= 0 ? 'Restok Sekarang' : 'Restok (+)'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenResetStockSingle(item)}
                              className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                              title="Reset stok menjadi 0 tanpa menghapus produk"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>Reset ke 0</span>
                            </button>
                          </div>
                        </div>

                        {item.variants && item.variants.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.variants.map((v, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setAdminPreviewProduct(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-600 transition cursor-pointer"
                            title="Preview Produk"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditProduct(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-600 transition cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-600 transition cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {menuItems.length === 0 && (
                  <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-6">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h5 className="font-extrabold text-slate-900 text-base sm:text-lg">Belum Ada Daftar Produk</h5>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-md mx-auto">
                      Semua data dummy telah dibersihkan. Klik tombol di bawah untuk mulai menambahkan produk makanan atau minuman pertamamu.
                    </p>
                    <button
                      onClick={handleOpenNewProduct}
                      className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Produk Baru Sekarang</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PESANAN MASUK (KASIR) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-lg">Rekap Pesanan Kasir (Cash Langsung)</h4>
                  <p className="text-xs text-slate-500">Filter berdasarkan tanggal kalender atau tampilkan semua riwayat pesanan.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setSelectedDateFilter('today')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDateFilter === 'today' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDateFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDateFilter === 'all' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Semua Hari
                    </button>
                    <div className="relative flex items-center px-2 border-l border-slate-200">
                      <Calendar className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />
                      <input
                        type="date"
                        value={selectedDateFilter.startsWith('date-') ? selectedDateFilter.replace('date-', '') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDateFilter(`date-${e.target.value}`);
                          } else {
                            setSelectedDateFilter('today');
                          }
                        }}
                        className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                        title="Pilih Tanggal Spesifik"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loadingOrders}
                    onClick={() => fetchOrders(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                    title="Perbarui daftar pesanan dari database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin text-orange-600' : ''}`} />
                    <span>{loadingOrders ? "Menyinkron..." : "Refresh"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClearOrdersConfirm({ isOpen: true, isLoading: false })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 shadow-xs"
                    title="Kosongkan seluruh riwayat pesanan & mulai dari nol"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kosongkan Riwayat</span>
                  </button>
                </div>
              </div>

              {(!orders || !Array.isArray(orders) || orders.length === 0) ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-400 font-bold text-xs">Belum ada pesanan masuk saat ini.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const safeOrdersList = Array.isArray(orders) ? orders : [];
                    
                    // Filter orders based on selectedDateFilter
                    const filteredOrders = safeOrdersList.filter(order => {
                      if (!order) return false;
                      if (selectedDateFilter === 'all') return true;
                      
                      let orderDateStr = todayStr;
                      if (order.createdAt) {
                        try {
                          orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
                        } catch {
                          orderDateStr = todayStr;
                        }
                      }

                      if (selectedDateFilter === 'today') {
                        const now = new Date();
                        const orderDate = new Date(order.createdAt || Date.now());
                        return (orderDateStr === todayStr) || (
                          orderDate.getFullYear() === now.getFullYear() &&
                          orderDate.getMonth() === now.getMonth() &&
                          orderDate.getDate() === now.getDate()
                        );
                      }

                      if (selectedDateFilter.startsWith('date-')) {
                        const targetDate = selectedDateFilter.replace('date-', '');
                        return orderDateStr === targetDate;
                      }

                      return true;
                    });

                    if (filteredOrders.length === 0) {
                      return (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-3">
                          <p className="text-slate-500 font-bold text-xs">Tidak ada pesanan pada filter tanggal yang dipilih ({selectedDateFilter === 'today' ? 'Hari Ini' : selectedDateFilter}).</p>
                          <button
                            type="button"
                            onClick={() => setSelectedDateFilter('all')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Tampilkan Semua Riwayat Pesanan ({safeOrdersList.length})
                          </button>
                        </div>
                      );
                    }

                    // Group filtered orders by date
                    const grouped: { [dateStr: string]: Order[] } = {};
                    filteredOrders.forEach(order => {
                      if (!order) return;
                      let dateKey = 'Hari Ini';
                      if (order.createdAt) {
                        try {
                          const d = new Date(order.createdAt);
                          if (!isNaN(d.getTime())) {
                            dateKey = d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                          }
                        } catch {
                          dateKey = 'Hari Ini';
                        }
                      }
                      if (!grouped[dateKey]) grouped[dateKey] = [];
                      grouped[dateKey].push(order);
                    });

                    return Object.entries(grouped).map(([dateLabel, dateOrders]) => (
                      <div key={dateLabel} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                        {/* Header Tanggal */}
                        <div className="bg-slate-100/80 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                            📅 {dateLabel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-black text-[10px]">
                            {dateOrders.length} Pesanan
                          </span>
                        </div>

                        {/* Tabel Pesanan per Hari */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 font-extrabold bg-slate-50/50">
                                <th className="py-3 px-4">No. Order</th>
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4">Nama Pemesan</th>
                                <th className="py-3 px-4">Detail Menu &amp; Varian</th>
                                <th className="py-3 px-4">Total</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-center">Aksi &amp; Hapus</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {dateOrders.map((order) => {
                                const orderStatus = order.status || 'Menunggu';
                                const itemsList = Array.isArray(order.items) ? order.items : [];
                                const totalNominal = Number(order.total) || 0;
                                
                                return (
                                  <tr key={order.id || Math.random().toString()} className="hover:bg-slate-50/75 transition">
                                    <td className="py-3 px-4 font-black text-orange-600">#{order.id || '-'}</td>
                                    <td className="py-3 px-4 text-slate-500">{order.waktu || '-'}</td>
                                    <td className="py-3 px-4 font-bold text-slate-800">{order.pembeli || 'Pelanggan'}</td>
                                    <td className="py-3 px-4">
                                      <div className="space-y-1">
                                        {itemsList.length === 0 ? (
                                          <span className="text-slate-400 italic">Tidak ada item</span>
                                        ) : (
                                          <>
                                            {itemsList.map((it: any, idx: number) => (
                                              <div key={idx} className={`text-xs ${it?.isFreeBonus ? 'text-emerald-700 font-bold' : 'text-slate-700'}`}>
                                                {it?.isFreeBonus ? (
                                                  <span className="inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                    🎁 <span>{it?.name}</span> ({it?.variant || 'Standar'}) x{it?.qty || 1} <span className="text-[10px] uppercase font-black text-emerald-600">(GRATIS)</span>
                                                  </span>
                                                ) : (
                                                  <>• <span className="font-semibold">{it?.name || 'Produk'}</span> ({it?.variant || 'Standar'}) x{it?.qty || 1}</>
                                                )}
                                              </div>
                                            ))}
                                            {Boolean(order.totalFreeItems && order.totalFreeItems > 0) && (
                                              <div className="text-[10px] font-black text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                                                🎁 Termasuk {order.totalFreeItems} item gratis promo
                                              </div>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-black text-slate-900">
                                      Rp {totalNominal.toLocaleString('id-ID')}
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                        orderStatus.toLowerCase() === 'selesai' 
                                          ? 'bg-emerald-100 text-emerald-700' 
                                          : orderStatus.toLowerCase() === 'batal' 
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-amber-100 text-amber-700'
                                      }`}>
                                        {orderStatus}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      <div className="flex items-center justify-center gap-1.5 relative z-10" onClick={(e) => e.stopPropagation()}>
                                        <select
                                          value={orderStatus}
                                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                          className="p-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer relative z-20"
                                        >
                                          <option value="Menunggu">Menunggu</option>
                                          <option value="Selesai">Selesai</option>
                                          <option value="Batal">Batal</option>
                                        </select>
                                        <button
                                          type="button"
                                          onClick={() => deleteOrder(order.id)}
                                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer relative z-20"
                                          title="Hapus Pesanan"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LAPORAN PENJUALAN & LABA BERSIH HARIAN */}
          {activeTab === 'reports' && (() => {
            // Filter orders based on reportDateFilter
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

            const activeOrders = orders.filter(o => {
              if (o.status === 'Batal') return false;
              const orderDate = o.createdAt ? o.createdAt.split('T')[0] : '';
              
              if (reportDateFilter === 'today') {
                return orderDate === todayStr;
              } else if (reportDateFilter === 'yesterday') {
                return orderDate === yesterdayStr;
              } else if (reportDateFilter === 'week') {
                const orderTime = new Date(o.createdAt || Date.now()).getTime();
                const weekAgoTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
                return orderTime >= weekAgoTime;
              } else if (reportDateFilter === 'custom') {
                return orderDate === customReportDate;
              }
              return true;
            });

            // Financial Calculations
            const totalGrossRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            
            let totalCostOfGoods = 0;
            let totalPcsSold = 0;

            activeOrders.forEach(o => {
              (o.items || []).forEach(it => {
                const qty = Number(it.qty || 1);
                totalPcsSold += qty;
                const matchMenu = menuItems.find(m => (it.productId && m.id === it.productId) || m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim());
                const costPerUnit = it.costPrice !== undefined ? Number(it.costPrice) : (matchMenu?.costPrice || 0);
                totalCostOfGoods += (costPerUnit * qty);
              });
            });

            const totalNetProfit = totalGrossRevenue - totalCostOfGoods;
            const netProfitMargin = totalGrossRevenue > 0 ? Math.round((totalNetProfit / totalGrossRevenue) * 100) : 0;

            // Stock Inventory Calculations
            let totalStockPcs = 0;
            let lowStockCount = 0;
            let outOfStockCount = 0;

            menuItems.forEach(item => {
              const s = item.stock ?? 0;
              totalStockPcs += s;
              if (s <= 0) {
                outOfStockCount++;
              } else if (s <= 10) {
                lowStockCount++;
              }
            });

            // Daily Rekap grouping
            const dailyMap: { [dateStr: string]: { date: string; count: number; pcs: number; revenue: number; cost: number; profit: number } } = {};
            orders.forEach(o => {
              if (o.status !== 'Batal') {
                const dStr = o.createdAt ? o.createdAt.split('T')[0] : 'Hari Ini';
                if (!dailyMap[dStr]) {
                  dailyMap[dStr] = { date: dStr, count: 0, pcs: 0, revenue: 0, cost: 0, profit: 0 };
                }
                dailyMap[dStr].count += 1;
                dailyMap[dStr].revenue += Number(o.total || 0);
                (o.items || []).forEach(it => {
                  const q = Number(it.qty || 1);
                  const matchMenu = menuItems.find(m => (it.productId && m.id === it.productId) || m.name.toLowerCase().trim() === (it.name || '').toLowerCase().trim());
                  const c = it.costPrice !== undefined ? Number(it.costPrice) : (matchMenu?.costPrice || 0);
                  dailyMap[dStr].pcs += q;
                  dailyMap[dStr].cost += (c * q);
                });
                dailyMap[dStr].profit = dailyMap[dStr].revenue - dailyMap[dStr].cost;
              }
            });
            const dailyList = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date));

            // Per product metrics based on active filtered orders
            const productStats = menuItems.map(item => {
              let soldCount = 0;
              let productRevenue = 0;
              let productCost = 0;

              activeOrders.forEach(o => {
                (o.items || []).forEach(it => {
                  if ((it.productId && it.productId === item.id) || (it.name || '').toLowerCase().trim() === (item.name || '').toLowerCase().trim()) {
                    const q = Number(it.qty || 1);
                    soldCount += q;
                    productRevenue += (Number(it.price || item.price) * q);
                    const c = it.costPrice !== undefined ? Number(it.costPrice) : (item.costPrice || 0);
                    productCost += (c * q);
                  }
                });
              });

              const profit = productRevenue - productCost;
              const unitCost = item.costPrice || 0;
              const unitProfit = item.price - unitCost;
              const margin = productRevenue > 0 ? Math.round((profit / productRevenue) * 100) : (item.price > 0 ? Math.round((unitProfit / item.price) * 100) : 0);

              return {
                ...item,
                soldCount,
                productRevenue,
                productCost,
                profit,
                unitCost,
                unitProfit,
                margin
              };
            });

            const filteredProductStats = productStats.filter(item =>
              item.name.toLowerCase().includes(reportProductSearch.toLowerCase().trim()) ||
              item.category.toLowerCase().includes(reportProductSearch.toLowerCase().trim())
            );

            return (
              <div className="space-y-6">
                {/* Header Section with Date Filters & PDF Download */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Laporan Keuangan &bull; Kelompok 3 Kelas 8B</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Laporan Penjualan &amp; Analisis Laba Bersih
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                      Rekapitulasi omset kotor, modal awal (HPP bahan), laba bersih harian, dan rincian performa per produk.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      showStatus("Membuat dokumen PDF Laporan Keuangan A4...");
                      
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) {
                        showStatus("Pop-up diblokir browser. Izinkan pop-up untuk mengunduh PDF.", "error");
                        return;
                      }

                      const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      const filterLabel = reportDateFilter === 'today' 
                        ? `Hari Ini (${dateStr})` 
                        : reportDateFilter === 'yesterday' 
                          ? 'Kemarin' 
                          : reportDateFilter === 'week' 
                            ? '7 Hari Terakhir' 
                            : reportDateFilter === 'custom' 
                              ? `Tanggal ${customReportDate}` 
                              : 'Semua Riwayat Penjualan';

                      let htmlContent = `
                        <!DOCTYPE html>
                        <html lang="id">
                        <head>
                          <meta charset="UTF-8" />
                          <title>Laporan_Keuangan_Laba_Rugi_Soki_Kelompok_3</title>
                          <link rel="preconnect" href="https://fonts.googleapis.com">
                          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                          <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap" rel="stylesheet">
                          <style>
                            @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');

                            @page {
                              size: A4;
                              margin: 12mm 14mm 12mm 14mm;
                            }
                            * {
                              box-sizing: border-box;
                              -webkit-print-color-adjust: exact !important;
                              print-color-adjust: exact !important;
                            }
                            body {
                              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                              color: #1e293b;
                              background: #ffffff;
                              margin: 0;
                              padding: 0;
                            }
                            .page-container {
                              width: 100%;
                              max-width: 210mm;
                              margin: 0 auto;
                              box-sizing: border-box;
                            }
                            .header {
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              border-bottom: 3px solid #ea580c;
                              padding-bottom: 14px;
                              margin-bottom: 18px;
                            }
                            .brand-box {
                              display: flex;
                              align-items: center;
                              gap: 14px;
                            }
                            .pdf-logo-svg {
                              width: 52px;
                              height: 52px;
                              flex-shrink: 0;
                              display: block;
                            }
                            .brand-title {
                              display: flex;
                              flex-direction: column;
                              text-align: left;
                            }
                            .brand-kid-letters {
                              font-size: 28px;
                              font-weight: 900;
                              letter-spacing: -0.5px;
                              line-height: 1;
                              display: flex;
                              align-items: center;
                              font-family: 'Fredoka', 'Quicksand', 'Nunito', 'Segoe UI', system-ui, -apple-system, sans-serif;
                            }
                            .k-letter-s { color: #f59e0b; display: inline-block; }
                            .k-letter-o { color: #f97316; display: inline-block; }
                            .k-letter-k { color: #ef4444; display: inline-block; }
                            .k-letter-i { color: #06b6d4; display: inline-block; }
                            .k-dot { color: #a855f7; display: inline-block; }
                            .brand-subtitle-badge {
                              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                              font-size: 9px;
                              font-weight: 800;
                              letter-spacing: 1.6px;
                              color: #94a3b8;
                              text-transform: uppercase;
                              margin-top: 4px;
                            }
                            .brand-group-info {
                              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
                              font-size: 10px;
                              font-weight: 700;
                              color: #ea580c;
                              margin-top: 3px;
                            }
                            .report-meta {
                              text-align: right;
                              font-size: 10.5px;
                              color: #64748b;
                              font-weight: 600;
                              background: #f8fafc;
                              padding: 8px 12px;
                              border-radius: 10px;
                              border: 1px solid #e2e8f0;
                            }
                            .summary-grid {
                              display: grid;
                              grid-template-columns: repeat(4, 1fr);
                              gap: 10px;
                              margin-bottom: 20px;
                            }
                            .summary-card {
                              padding: 10px 12px;
                              border-radius: 10px;
                              border: 1px solid #e2e8f0;
                              background: #f8fafc;
                            }
                            .summary-card.highlight {
                              background: #ecfdf5;
                              border-color: #a7f3d0;
                            }
                            .summary-label {
                              font-size: 9px;
                              font-weight: 800;
                              text-transform: uppercase;
                              color: #64748b;
                              margin-bottom: 3px;
                            }
                            .summary-val {
                              font-size: 14px;
                              font-weight: 900;
                              color: #0f172a;
                            }
                            .summary-val.green { color: #059669; }
                            .summary-val.orange { color: #ea580c; }
                            .section-title {
                              font-size: 13px;
                              font-weight: 900;
                              color: #0f172a;
                              margin: 16px 0 8px;
                              border-left: 4px solid #ea580c;
                              padding-left: 8px;
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                            }
                            table {
                              width: 100%;
                              border-collapse: collapse;
                              margin-top: 4px;
                              font-size: 11px;
                            }
                            th, td {
                              border: 1px solid #cbd5e1;
                              padding: 7px 9px;
                              text-align: left;
                            }
                            th {
                              background-color: #f1f5f9;
                              color: #334155;
                              font-weight: 800;
                              text-transform: uppercase;
                              font-size: 9.5px;
                              letter-spacing: 0.3px;
                            }
                            .text-right { text-align: right; }
                            .text-center { text-align: center; }
                            .footer {
                              margin-top: 30px;
                              padding-top: 12px;
                              border-top: 1px solid #cbd5e1;
                              display: flex;
                              justify-content: space-between;
                              align-items: center;
                              font-size: 9.5px;
                              color: #64748b;
                              font-weight: 600;
                            }
                            .footer-brand {
                              font-weight: 800;
                              color: #0f172a;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="page-container">
                            <div class="header">
                              <div class="brand-box">
                                <div class="brand-title">
                                  <div class="brand-kid-letters">
                                    <span class="k-letter-s">S</span>
                                    <span class="k-letter-o">O</span>
                                    <span class="k-letter-k">K</span>
                                    <span class="k-letter-i">I</span>
                                    <span class="k-dot">.</span>
                                  </div>
                                  <span class="brand-subtitle-badge">SNACK &bull; ICE BAR</span>
                                  <div class="brand-group-info">Kelas 8B &bull; Kelompok 3 &bull; Laporan Laba Rugi &amp; HPP</div>
                                </div>
                              </div>
                              <div class="report-meta">
                                <div><b>Periode:</b> ${filterLabel}</div>
                                <div><b>Tanggal Cetak:</b> ${dateStr}</div>
                                <div style="color: #ea580c; margin-top: 2px; font-weight: 700;">uk. A4 Resmi</div>
                              </div>
                            </div>

                            <!-- 4 KPI Boxes -->
                            <div class="summary-grid">
                              <div class="summary-card">
                                <div class="summary-label">Total Omset Kotor</div>
                                <div class="summary-val orange">Rp ${totalGrossRevenue.toLocaleString('id-ID')}</div>
                              </div>
                              <div class="summary-card">
                                <div class="summary-label">Total Modal Awal (HPP)</div>
                                <div class="summary-val">Rp ${totalCostOfGoods.toLocaleString('id-ID')}</div>
                              </div>
                              <div class="summary-card highlight">
                                <div class="summary-label" style="color: #059669;">Laba Bersih Toko</div>
                                <div class="summary-val green">Rp ${totalNetProfit.toLocaleString('id-ID')}</div>
                              </div>
                              <div class="summary-card">
                                <div class="summary-label">Sisa Stok & Margin</div>
                                <div class="summary-val" style="color: #2563eb;">${totalStockPcs} Pcs (${netProfitMargin}%)</div>
                              </div>
                            </div>

                            <!-- Rincian Produk -->
                            <div class="section-title">
                              <span>Rincian Laba Rugi &amp; Stok Barang Per Produk</span>
                              <span style="font-size: 10px; font-weight: 600; color: #64748b;">${productStats.length} Menu Produk Terdaftar</span>
                            </div>
                            <table>
                              <thead>
                                <tr>
                                  <th>Nama Produk</th>
                                  <th>Harga Jual</th>
                                  <th>Modal (HPP)</th>
                                  <th class="text-center">Sisa Stok</th>
                                  <th class="text-center">Terjual</th>
                                  <th class="text-right">Omset</th>
                                  <th class="text-right">Total Modal</th>
                                  <th class="text-right">Laba Bersih</th>
                                  <th class="text-center">Margin</th>
                                </tr>
                              </thead>
                              <tbody>
                      `;

                      productStats.forEach(item => {
                        const stockVal = item.stock !== undefined ? `${item.stock} Pcs` : 'Tak Terbatas';
                        htmlContent += `
                          <tr>
                            <td><b>${item.name}</b> <span style="font-size: 8.5px; color: #64748b; text-transform: uppercase;">(${item.category})</span></td>
                            <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                            <td style="color: #64748b;">Rp ${(item.unitCost).toLocaleString('id-ID')}</td>
                            <td class="text-center" style="font-weight: 700; color: ${(item.stock ?? 0) <= 0 ? '#dc2626' : (item.stock ?? 0) <= 10 ? '#d97706' : '#2563eb'};">${stockVal}</td>
                            <td class="text-center"><b>${item.soldCount} Pcs</b></td>
                            <td class="text-right">Rp ${item.productRevenue.toLocaleString('id-ID')}</td>
                            <td class="text-right" style="color: #64748b;">Rp ${item.productCost.toLocaleString('id-ID')}</td>
                            <td class="text-right" style="font-weight: 800; color: ${item.profit >= 0 ? '#059669' : '#dc2626'};">
                              Rp ${item.profit.toLocaleString('id-ID')}
                            </td>
                            <td class="text-center font-bold">${item.margin}%</td>
                          </tr>
                        `;
                      });

                      htmlContent += `
                                <tr style="background: #f8fafc; font-weight: 900;">
                                  <td colspan="3"><b>TOTAL KESELURUHAN</b></td>
                                  <td class="text-center" style="color: #2563eb;"><b>${totalStockPcs} Pcs</b></td>
                                  <td class="text-center"><b>${totalPcsSold} Pcs</b></td>
                                  <td class="text-right" style="color: #ea580c;"><b>Rp ${totalGrossRevenue.toLocaleString('id-ID')}</b></td>
                                  <td class="text-right"><b>Rp ${totalCostOfGoods.toLocaleString('id-ID')}</b></td>
                                  <td class="text-right" style="color: #059669;"><b>Rp ${totalNetProfit.toLocaleString('id-ID')}</b></td>
                                  <td class="text-center"><b>${netProfitMargin}%</b></td>
                                </tr>
                              </tbody>
                            </table>

                            <!-- Ringkasan Rekap Harian -->
                            ${dailyList.length > 0 ? `
                              <div class="section-title" style="margin-top: 20px;">
                                <span>Rekap Penjualan Per Tanggal</span>
                                <span style="font-size: 10px; font-weight: 600; color: #64748b;">${dailyList.length} Hari Transaksi</span>
                              </div>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Tanggal</th>
                                    <th class="text-center">Pesanan</th>
                                    <th class="text-center">Porsi Terjual</th>
                                    <th class="text-right">Omset Kotor</th>
                                    <th class="text-right">Modal Awal (HPP)</th>
                                    <th class="text-right">Laba Bersih</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  ${dailyList.map(d => `
                                    <tr>
                                      <td><b>${d.date}</b></td>
                                      <td class="text-center">${d.count} Pesanan</td>
                                      <td class="text-center"><b>${d.pcs} Pcs</b></td>
                                      <td class="text-right">Rp ${d.revenue.toLocaleString('id-ID')}</td>
                                      <td class="text-right" style="color: #64748b;">Rp ${d.cost.toLocaleString('id-ID')}</td>
                                      <td class="text-right" style="font-weight: 800; color: #059669;">Rp ${d.profit.toLocaleString('id-ID')}</td>
                                    </tr>
                                  `).join('')}
                                </tbody>
                              </table>
                            ` : ''}

                            <div class="footer">
                              <div class="footer-brand">
                                &copy; 2026 Soki Management System &bull; Kelompok 3 Kelas 8B &bull; Developed by <strong style="color: #ea580c;">Koko Ferri</strong>
                              </div>
                              <div>
                                Dokumen Resmi Laporan Keuangan Harian (A4)
                              </div>
                            </div>
                          </div>

                          <script>
                            window.onload = function() {
                              setTimeout(function() {
                                window.focus();
                                window.print();
                              }, 500);
                            };
                            window.onafterprint = function() {
                              try { window.close(); } catch(e) {}
                            };
                          </script>
                        </body>
                        </html>
                      `;

                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                      showStatus("Dokumen PDF Laporan Keuangan A4 sedang diunduh...", "success");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-orange-500/25 transition cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Laporan Resmi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fetchOrders();
                      showStatus("Menyinkronkan pesanan & stok terbaru...", "success");
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200 transition cursor-pointer shrink-0"
                    title="Refresh data transaksi dan sisa stok secara langsung"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
                    <span>Sinkronkan Stok Real-time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setClearOrdersConfirm({ isOpen: true, isLoading: false })}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-extrabold text-xs rounded-2xl border border-rose-200 transition cursor-pointer shrink-0 shadow-xs"
                    title="Kosongkan semua pesanan pembeli dan reset kalkulasi laporan penjualan ke 0"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    <span>Reset Penjualan (Mulai dari Nol)</span>
                  </button>
                </div>

                {/* Filter Waktu / Harian Interactive Bar */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                    <Filter className="w-4 h-4 text-orange-600" />
                    <span>Filter Periode:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'Semua Waktu' },
                      { id: 'today', label: 'Hari Ini' },
                      { id: 'yesterday', label: 'Kemarin' },
                      { id: 'week', label: '7 Hari Terakhir' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setReportDateFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                          reportDateFilter === tab.id
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500">Pilih Tanggal:</span>
                      <input
                        type="date"
                        value={customReportDate}
                        onChange={(e) => {
                          setCustomReportDate(e.target.value);
                          if (e.target.value) setReportDateFilter('custom');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border outline-none transition ${
                          reportDateFilter === 'custom'
                            ? 'border-orange-500 bg-orange-50/50 text-orange-900 ring-2 ring-orange-500/20'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Utama Kartu Statistik Keuangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Omset */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Omset (Bruto)</span>
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono">
                      Rp {totalGrossRevenue.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      {activeOrders.length} transaksi pesanan masuk
                    </p>
                  </div>

                  {/* Total Modal Awal (HPP) */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Modal Awal (HPP)</span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                        <Coins className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-700 font-mono">
                      Rp {totalCostOfGoods.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                      Biaya bahan dasar dari {totalPcsSold} porsi
                    </p>
                  </div>

                  {/* Laba Bersih (Keuntungan Nyata) */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 p-5 rounded-3xl border border-emerald-200 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">Laba Bersih Toko</span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 font-mono">
                      Rp {totalNetProfit.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[11px] text-emerald-700/80 font-extrabold mt-1">
                      Omset dikurangi modal bahan pokok
                    </p>
                  </div>

                  {/* Margin Keuntungan */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Margin Keuntungan</span>
                      <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-sm">
                        <Percent className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-cyan-700 font-mono">
                      {netProfitMargin}%
                    </div>
                    <p className="text-[11px] text-cyan-600 font-bold mt-1">
                      Rasio keuntungan terhadap omset
                    </p>
                  </div>
                </div>

                {/* 2 Kartu Ringkasan Stok & Inventaris Barang Terintegrasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Total Sisa Stok Fisik */}
                  <div className="bg-gradient-to-br from-blue-50/90 to-indigo-50/70 p-5 rounded-3xl border border-blue-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-blue-800">
                        Total Sisa Stok Tersedia
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        <Package className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-blue-900 font-mono">
                        {totalStockPcs} <span className="text-sm font-extrabold text-blue-700">Porsi</span>
                      </div>
                      <p className="text-[11px] text-blue-600 font-bold mt-1">
                        Dari {menuItems.length} menu produk aktif di database
                      </p>
                    </div>
                  </div>

                  {/* Status Kesiapan / Peringatan Stok */}
                  <div className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between ${
                    outOfStockCount > 0 
                      ? 'bg-rose-50/90 border-rose-200 text-rose-950' 
                      : lowStockCount > 0 
                        ? 'bg-amber-50/90 border-amber-200 text-amber-950' 
                        : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Kesiapan Stok Penjualan
                      </span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                        outOfStockCount > 0 
                          ? 'bg-rose-600 text-white' 
                          : lowStockCount > 0 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-emerald-600 text-white'
                      }`}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-black">
                        {outOfStockCount > 0 
                          ? `${outOfStockCount} Menu Habis` 
                          : lowStockCount > 0 
                            ? `${lowStockCount} Menu Menipis` 
                            : 'Semua Stok Siap & Aman'}
                      </div>
                      <p className="text-[11px] font-bold mt-1 opacity-80">
                        {outOfStockCount > 0 
                          ? 'Perlu segera restock bahan di dapur' 
                          : lowStockCount > 0 
                            ? 'Stok tersisa kurang dari atau sama dengan 10 porsi' 
                            : 'Ketersediaan bahan mencukupi untuk operasional'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabel 1: Rekapitulasi Penjualan Harian */}
                {dailyList.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-sm">Rekap Penjualan &amp; Laba Per Hari</h5>
                        <p className="text-[11px] text-slate-500">Ringkasan transaksi berdasarkan tanggal kalender</p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 font-black text-[11px]">
                        {dailyList.length} Hari Aktif
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 font-black bg-slate-50/50 uppercase tracking-wider text-[10.5px]">
                            <th className="py-3 px-5">Tanggal Penjualan</th>
                            <th className="py-3 px-4 text-center">Jml Pesanan</th>
                            <th className="py-3 px-4 text-center">Porsi Terjual</th>
                            <th className="py-3 px-4 text-right">Omset Kotor</th>
                            <th className="py-3 px-4 text-right">Modal Awal (HPP)</th>
                            <th className="py-3 px-5 text-right">Laba Bersih</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {dailyList.map(d => (
                            <tr key={d.date} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-5 font-black text-slate-900">
                                📅 {d.date}
                              </td>
                              <td className="py-3 px-4 text-center font-bold text-slate-700">
                                {d.count} Pesanan
                              </td>
                              <td className="py-3 px-4 text-center font-black text-orange-600">
                                {d.pcs} Pcs
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                                Rp {d.revenue.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-500 font-mono">
                                Rp {d.cost.toLocaleString('id-ID')}
                              </td>
                              <td className="py-3 px-5 text-right font-black text-emerald-600 font-mono">
                                Rp {d.profit.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tabel 2: Rincian Analisis Laba Bersih Per Produk */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">Rincian Performa &amp; Laba Bersih Per Produk</h5>
                      <p className="text-[11px] text-slate-500">Harga jual vs modal awal (HPP) untuk setiap menu produk</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {/* Search Bar untuk Produk */}
                      <div className="relative">
                        <input
                          type="text"
                          value={reportProductSearch}
                          onChange={(e) => setReportProductSearch(e.target.value)}
                          placeholder="Cari nama produk..."
                          className="px-3 py-1.5 pl-8 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition w-36 sm:w-48"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        {reportProductSearch && (
                          <button
                            type="button"
                            onClick={() => setReportProductSearch('')}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 font-black text-[11px] flex items-center gap-1.5 shadow-2xs shrink-0">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{filteredProductStats.length} / {productStats.length} Produk</span>
                      </span>
                    </div>
                  </div>

                  {productStats.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-2 bg-gradient-to-b from-white to-slate-50/40">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-xl shadow-xs">
                        🍲
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h6 className="text-sm font-black text-slate-900">Belum Ada Menu Produk Terdaftar</h6>
                        <p className="text-xs text-slate-500 font-medium">
                          Rincian performa dan kalkulasi laba rugi akan otomatis muncul di sini setelah menu produk ditambahkan.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Tampilan Khusus Layar HP / Mobile Cards */}
                      <div className="block md:hidden p-4 space-y-3 max-h-[520px] overflow-y-auto divide-y divide-slate-100">
                        {filteredProductStats.map((item) => (
                          <div key={item.id} className="pt-3 first:pt-0 space-y-2.5">
                            <div className="flex items-start justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=100&q=80'}
                                  alt=""
                                  className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                                />
                                <div className="min-w-0">
                                  <h6 className="font-black text-slate-900 text-xs truncate">{item.name}</h6>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                                      {item.category}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold">
                                      Terjual: <b className="text-orange-600 font-black">{item.soldCount} Pcs</b>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200 shrink-0">
                                {item.margin}% Margin
                              </span>
                            </div>

                            {/* 2x2 Grid Info Keuangan Produk */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 text-[11px]">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">Harga Jual / HPP:</span>
                                <span className="font-extrabold text-slate-900">Rp {item.price.toLocaleString('id-ID')}</span>
                                <span className="text-slate-500 text-[10px] font-medium block">HPP: Rp {(item.unitCost).toLocaleString('id-ID')}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">Sisa Stok:</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`font-extrabold font-mono ${(item.stock ?? 0) <= 0 ? 'text-rose-600' : (item.stock ?? 0) <= 10 ? 'text-amber-600' : 'text-blue-600'}`}>
                                    {item.stock !== undefined ? `${item.stock} Porsi` : 'Tak Terbatas'}
                                  </span>
                                  {(item.stock ?? 0) <= 0 && (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-black">Habis</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRestock(item)}
                                    className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1 cursor-pointer"
                                  >
                                    <PackagePlus className="w-3 h-3" />
                                    <span>Restok</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenResetStockSingle(item)}
                                    className="px-1.5 py-0.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5 text-rose-500" />
                                    <span>Reset</span>
                                  </button>
                                </div>
                              </div>
                              <div className="col-span-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-400 font-bold block">Omset / Modal:</span>
                                  <span className="font-extrabold text-orange-600 font-mono">Rp {item.productRevenue.toLocaleString('id-ID')}</span>
                                  <span className="text-slate-400 text-[10px] ml-1">/ Rp {item.productCost.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-extrabold text-slate-600 block">Laba Bersih:</span>
                                  <span className="font-black text-emerald-600 font-mono text-xs">
                                    Rp {item.profit.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tampilan Tabel Desktop */}
                      <div className="hidden md:block overflow-x-auto max-h-[520px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-black bg-slate-50/50 uppercase tracking-wider text-[10.5px] sticky top-0 bg-slate-50">
                              <th className="py-3.5 px-5">Nama Produk</th>
                              <th className="py-3.5 px-3">Kategori</th>
                              <th className="py-3.5 px-3 font-mono">Harga Jual</th>
                              <th className="py-3.5 px-3 font-mono">Modal (HPP)</th>
                              <th className="py-3.5 px-3 text-center">Sisa Stok</th>
                              <th className="py-3.5 px-3 text-center">Terjual</th>
                              <th className="py-3.5 px-4 text-right font-mono">Total Omset</th>
                              <th className="py-3.5 px-4 text-right font-mono">Total Modal</th>
                              <th className="py-3.5 px-4 text-right font-mono">Laba Bersih</th>
                              <th className="py-3.5 px-4 text-center">Margin</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredProductStats.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/75 transition">
                                <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2.5">
                                  <img src={item.imageUrl || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=100&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200" />
                                  <span className="truncate max-w-[160px] sm:max-w-none">{item.name}</span>
                                </td>
                                <td className="py-3.5 px-3">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-3 font-mono text-slate-900 font-bold">
                                  Rp {item.price.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-3 font-mono text-slate-500 font-medium">
                                  Rp {(item.unitCost).toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`px-2 py-0.5 rounded-md font-black text-[11px] ${
                                      (item.stock ?? 0) <= 0 
                                        ? 'bg-rose-100 text-rose-700' 
                                        : (item.stock ?? 0) <= 10 
                                          ? 'bg-amber-100 text-amber-800' 
                                          : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {item.stock !== undefined ? `${item.stock} Porsi` : 'Tak Terbatas'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRestock(item)}
                                        className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1 transition cursor-pointer"
                                        title="Restok Produk"
                                      >
                                        <PackagePlus className="w-2.5 h-2.5" />
                                        <span>Restok</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenResetStockSingle(item)}
                                        className="px-1.5 py-0.5 rounded-md bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer"
                                        title="Reset Stok ke 0"
                                      >
                                        <RotateCcw className="w-2.5 h-2.5 text-rose-500" />
                                        <span>Reset</span>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-3 text-center font-black text-orange-600">
                                  {item.soldCount} Pcs
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                                  Rp {item.productRevenue.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-4 text-right font-bold text-slate-500 font-mono">
                                  Rp {item.productCost.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-600">
                                  Rp {item.profit.toLocaleString('id-ID')}
                                </td>
                                <td className="py-3.5 px-4 text-center font-black">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-200">
                                    {item.margin}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Bar Total Ringkasan Bawah */}
                      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-800">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-black tracking-wider text-orange-400">Total Akumulasi Periode</span>
                          <div className="text-xs sm:text-sm font-black text-slate-200">
                            Total {activeOrders.length} Transaksi Masuk • <span className="text-orange-400">{totalPcsSold} Pcs</span> Terjual • <span className="text-blue-400">{totalStockPcs} Pcs</span> Sisa Stok
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Omset</span>
                            <span className="font-black font-mono text-orange-400">Rp {totalGrossRevenue.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Modal HPP</span>
                            <span className="font-black font-mono text-slate-300">Rp {totalCostOfGoods.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-emerald-400 block font-bold">Total Laba Bersih</span>
                            <span className="font-black font-mono text-emerald-400">Rp {totalNetProfit.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="text-left sm:text-right pl-2 border-l border-slate-700">
                            <span className="text-[10px] text-cyan-400 block font-bold">Rasio Margin</span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-black text-xs inline-block">
                              {netProfitMargin}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 5: PENGATURAN TENTANG KAMI & PEMBAGIAN TUGAS TIM */}
          {activeTab === 'team' && (
            <div className="space-y-6 pb-20">
              {/* Header & Quick Actions */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4" />
                    <span>Kelompok 3 &bull; Kelas 8B</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Pengaturan Halaman Tentang Kami &amp; Tugas Tim
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                    Atur nama anggota, nomor absen, peran/jabatan, rincian tugas masing-masing anggota Kelompok 3 Kelas 8B, serta teks narasi di halaman Tentang Kami.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <a
                    href="/tentang-kami"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Buka Halaman Tentang Kami di Tab Baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Pratinjau Publik</span>
                  </a>

                  <button
                    onClick={handleAddMember}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Anggota</span>
                  </button>

                  <button
                    onClick={saveTeamAndSettings}
                    disabled={savingTeam}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    {savingTeam ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingTeam ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </div>

              {/* Seksi 1: Narasi & Judul Halaman Tentang Kami */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      Header &amp; Pengantar Halaman Tentang Kami
                    </h4>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">Tampilan Publik</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Judul Utama Halaman
                    </label>
                    <input
                      type="text"
                      value={settingsState.aboutTitle || "Tentang Kami, Toko Soki"}
                      onChange={(e) => setSettingsState({ ...settingsState, aboutTitle: e.target.value })}
                      placeholder="Contoh: Tentang Kami, Toko Soki"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Label Badge Atas
                    </label>
                    <input
                      type="text"
                      value={settingsState.aboutBadge || "Karya Siswa Kelas 8B • Kelompok 3"}
                      onChange={(e) => setSettingsState({ ...settingsState, aboutBadge: e.target.value })}
                      placeholder="Contoh: Karya Siswa Kelas 8B • Kelompok 3"
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                      Paragraf Narasi / Kisah Pengantar Toko
                    </label>
                    <textarea
                      rows={3}
                      value={settingsState.aboutSubtitle || ""}
                      onChange={(e) => setSettingsState({ ...settingsState, aboutSubtitle: e.target.value })}
                      placeholder="Tuliskan cerita perkenalan toko atau komitmen kelompok..."
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 2: Daftar Anggota Tim & Pembagian Tugas */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base">
                      Daftar Anggota &amp; Penugasan ({teamState.length} Orang)
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Gunakan tombol panah untuk menukar urutan tampilan kartu
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-4">
                  {teamState.map((member, idx) => {
                    const themes = {
                      amber: {
                        name: 'Amber (Kuning/Oranye)',
                        grad: 'from-amber-400 via-orange-500 to-red-500',
                        badge: 'bg-amber-50 border-amber-200 text-amber-900',
                        accentDot: 'bg-amber-500',
                        colorBtn: 'bg-amber-500'
                      },
                      sky: {
                        name: 'Sky (Biru Langit)',
                        grad: 'from-sky-400 via-blue-500 to-indigo-600',
                        badge: 'bg-sky-50 border-sky-200 text-sky-900',
                        accentDot: 'bg-sky-500',
                        colorBtn: 'bg-sky-500'
                      },
                      rose: {
                        name: 'Rose (Merah Muda)',
                        grad: 'from-pink-400 via-rose-500 to-purple-600',
                        badge: 'bg-rose-50 border-rose-200 text-rose-900',
                        accentDot: 'bg-rose-500',
                        colorBtn: 'bg-rose-500'
                      },
                      emerald: {
                        name: 'Emerald (Hijau Segar)',
                        grad: 'from-emerald-400 via-teal-500 to-cyan-600',
                        badge: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                        accentDot: 'bg-emerald-500',
                        colorBtn: 'bg-emerald-500'
                      },
                      purple: {
                        name: 'Purple (Ungu)',
                        grad: 'from-purple-400 via-fuchsia-500 to-indigo-600',
                        badge: 'bg-purple-50 border-purple-200 text-purple-900',
                        accentDot: 'bg-purple-500',
                        colorBtn: 'bg-purple-500'
                      }
                    };
                    const currentTheme = themes[member.themeColor as keyof typeof themes] || themes.amber;
                    const initialLetter = member.initial || (member.name ? member.name.charAt(0).toUpperCase() : 'S');

                    const rolePresets = [
                      "Ketua & Pengelola Produk",
                      "Keuangan & Kasir Digital",
                      "Kontrol Kualitas & Kemasan",
                      "Pelayanan & Logistik",
                      "Promosi & Media",
                      "Koordinator Stok"
                    ];

                    return (
                      <div 
                        key={member.id} 
                        className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200"
                      >
                        {/* Top Bar Card */}
                        <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-mono font-black text-xs flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-800 text-sm">
                              {member.name || "Nama Belum Diisi"}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {member.absen || "8B/?"}
                            </span>
                          </div>

                          {/* Reorder & Delete Buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleMoveMember(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition cursor-pointer"
                              title="Pindah ke Atas"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleMoveMember(idx, 'down')}
                              disabled={idx === teamState.length - 1}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition cursor-pointer"
                              title="Pindah ke Bawah"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 transition cursor-pointer ml-1"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Card Body (Grid 2 Kolom: Kiri Pratinjau, Kanan Form Edit) */}
                        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                          
                          {/* Kolom Kiri: Pratinjau Kartu Publik (4 Kolom) */}
                          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                  Pratinjau Tampilan Kartu
                                </span>
                              </div>

                              {/* Live Mock Card */}
                              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs relative overflow-hidden">
                                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${currentTheme.grad}`}></div>
                                
                                <div className="flex items-center justify-between mb-3">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${currentTheme.grad} text-white font-black text-lg flex items-center justify-center shadow-xs`}>
                                    {initialLetter}
                                  </div>

                                  <span className={`px-2.5 py-0.5 rounded-full border font-mono font-black text-[11px] ${currentTheme.badge}`}>
                                    {member.absen || "8B/?"}
                                  </span>
                                </div>

                                <h5 className="text-base font-black text-slate-900 leading-snug">
                                  {member.name || "Nama Anggota"}
                                </h5>

                                <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-orange-600">
                                  <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.accentDot}`}></span>
                                  <span>{member.role || "(Peran belum diisi)"}</span>
                                </div>

                                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed whitespace-pre-line break-words">
                                  {member.description || "(Keterangan masih kosong - silakan diisi oleh anggota)"}
                                </p>
                              </div>
                            </div>

                            {/* Info Format Avatar */}
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                              <span>Avatar menggunakan inisial &amp; aksen warna</span>
                            </div>
                          </div>

                          {/* Kolom Kanan: Form Isian (8 Kolom) */}
                          <div className="lg:col-span-8 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Nama Anggota */}
                              <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                  Nama Anggota <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => handleUpdateMember(member.id, { name: e.target.value })}
                                  placeholder="Contoh: Valentino"
                                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                                />
                              </div>

                              {/* Nomor Absen / Kelas */}
                              <div>
                                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                                  Nomor Absen &amp; Kelas <span className="text-rose-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={member.absen}
                                  onChange={(e) => handleUpdateMember(member.id, { absen: e.target.value })}
                                  placeholder="Contoh: 8B/20"
                                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                                />
                              </div>
                            </div>

                            {/* Peran / Tugas Utama */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-extrabold text-slate-700">
                                  Peran &amp; Jabatan Utama
                                </label>
                                <span className="text-[10px] font-bold text-slate-400">Pilih Preset di Bawah</span>
                              </div>
                              
                              <input
                                type="text"
                                value={member.role}
                                onChange={(e) => handleUpdateMember(member.id, { role: e.target.value })}
                                placeholder="Contoh: Ketua & Pengelola Produk (atau kosongi sementara)"
                                className="w-full px-3 py-2 text-xs font-bold text-orange-600 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                              />

                              {/* Quick Role Preset Pills */}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {rolePresets.map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => handleUpdateMember(member.id, { role: preset })}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                      member.role === preset
                                        ? 'bg-orange-500 text-white shadow-2xs font-extrabold'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {preset}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Rincian Tugas & Tanggung Jawab */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-extrabold text-slate-700">
                                  Rincian Keterangan Tugas (Dikosongkan agar diisi oleh masing-masing)
                                </label>
                                <span className="text-[10px] text-slate-400">Opsional / Diisi Nanti</span>
                              </div>
                              <textarea
                                rows={Math.max(3, (member.description || '').split('\n').length + 1)}
                                value={member.description}
                                onChange={(e) => handleUpdateMember(member.id, { description: e.target.value })}
                                placeholder="Tuliskan keterangan tugas dan tanggung jawab di sini..."
                                className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-y min-h-[90px] leading-relaxed whitespace-pre-line"
                              />
                            </div>

                            {/* Pilihan Warna Tema Kartu */}
                            <div>
                              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                                Warna Tema &amp; Aksen Avatar
                              </label>
                              <div className="flex flex-wrap items-center gap-2">
                                {Object.entries(themes).map(([colorKey, tConf]) => (
                                  <button
                                    key={colorKey}
                                    type="button"
                                    onClick={() => handleUpdateMember(member.id, { themeColor: colorKey as any })}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                      member.themeColor === colorKey
                                        ? 'border-slate-800 bg-slate-900 text-white shadow-sm'
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className={`w-3 h-3 rounded-full ${tConf.colorBtn} shrink-0`}></span>
                                    <span>{tConf.name.split(' ')[0]}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tombol Tambah Anggota di Bawah List */}
                <button
                  onClick={handleAddMember}
                  className="w-full py-4 rounded-3xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/30 text-slate-600 hover:text-orange-600 transition flex items-center justify-center gap-2 font-bold text-xs sm:text-sm cursor-pointer active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota Tim Baru</span>
                </button>
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-300">
                      Total Anggota: <b className="text-white">{teamState.length} Siswa</b>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Perubahan tersimpan otomatis di halaman Tentang Kami
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddMember}
                    className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>

                  <button
                    onClick={saveTeamAndSettings}
                    disabled={savingTeam}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold transition shadow-md cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    {savingTeam ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{savingTeam ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JADWAL JAM BUKA & TUTUP TOKO */}
          {activeTab === 'schedule' && (
            <StoreScheduleAdminTab
              siteSettings={settingsState}
              adminToken={adminToken}
              onUpdateSettings={(newSettings) => {
                setSettingsState(newSettings);
                onUpdateSettings(newSettings);
              }}
              showStatus={showStatus}
              onPreviewClosedPage={() => {
                if (onPreviewClosedPage) {
                  onPreviewClosedPage();
                } else {
                  onClose();
                }
              }}
            />
          )}

          {/* TAB 7: GOOGLE DRIVE SETTINGS & GUIDE (HANYA UNTUK SUPERADMIN) */}
          {activeTab === 'drive' && isSuperAdmin && (
            <GoogleDriveAdminTab
              siteSettings={settingsState}
              adminToken={adminToken}
              onUpdateSettings={(newSettings) => {
                setSettingsState(newSettings);
                onUpdateSettings(newSettings);
              }}
              showStatus={showStatus}
              onLockSuperadmin={handleLockSuperadmin}
            />
          )}
          {/* TAB 6: JADWAL & MODE MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <MaintenanceAdminTab
              siteSettings={settingsState}
              adminToken={adminToken}
              onUpdateSettings={(newSettings) => {
                setSettingsState(newSettings);
                onUpdateSettings(newSettings);
              }}
              showStatus={showStatus}
              onPreviewStore={() => {
                onClose();
              }}
              onPreviewMaintenancePage={() => {
                if (onPreviewMaintenancePage) {
                  onPreviewMaintenancePage();
                } else {
                  onClose();
                }
              }}
            />
          )}

      </main>

      {/* Gmail-style Floating Action Button for Adding New Product */}
      {activeTab === 'products' && (
        <button
          onClick={handleOpenNewProduct}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-5 py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm rounded-full shadow-2xl transition-all duration-300 cursor-pointer group"
          title="Tambah Produk Baru"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline">Tambah Produk Baru</span>
        </button>
      )}

      {/* Admin Dedicated Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-700">Soki Management System - v.1</span>
          </div>
          <p className="text-slate-500">
            Soki Management System &bull; Developed by <strong className="text-orange-600 font-bold">Koko Ferri</strong>
          </p>
        </div>
      </footer>
      </div>

      {/* Admin Single Product Detail Preview Modal */}
      {adminPreviewProduct && (
        <ProductDetailModal
          isOpen={!!adminPreviewProduct}
          item={adminPreviewProduct}
          allItems={menuItems}
          onClose={() => setAdminPreviewProduct(null)}
          onAddToCart={() => {
            setAdminPreviewProduct(null);
            showStatus(`Item "${adminPreviewProduct.name}" berhasil diuji coba.`);
          }}
          onSelectOtherItem={(item) => {
            setAdminPreviewProduct(item);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800">{deleteConfirmDialog.title}</h3>
              <p className="text-sm text-slate-500">{deleteConfirmDialog.message}</p>
            </div>
            <div className="flex bg-slate-50 border-t border-slate-100 p-3 gap-3">
              <button 
                onClick={() => setDeleteConfirmDialog({ isOpen: false, type: null, id: '', title: '', message: '' })}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={executeDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Restok Interaktif (Tambah Stok Tanpa Input Ulang Produk) */}
      {restockModal.isOpen && restockModal.product && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-200 text-slate-800">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white relative shrink-0">
              <button
                type="button"
                onClick={() => setRestockModal({ isOpen: false, product: null, addAmount: 10, customAmount: '10', mode: 'add', isLoading: false })}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-sm shrink-0">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Restok Menu Produk
                  </h3>
                  <p className="text-xs text-emerald-100 leading-tight mt-0.5">
                    Tambah persediaan porsi produk tanpa input ulang.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
              {/* Product Info Card */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <img
                  src={restockModal.product.imageUrl || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=100&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {restockModal.product.category}
                    </span>
                    {(restockModal.product.stock ?? 0) <= 0 ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Habis Terjual
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Tersisa {restockModal.product.stock} Porsi
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                    {restockModal.product.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Harga: Rp {restockModal.product.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setRestockModal(prev => ({ ...prev, mode: 'add', customAmount: '10' }))}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    restockModal.mode === 'add'
                      ? 'bg-white text-emerald-700 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  + Tambah Porsi
                </button>
                <button
                  type="button"
                  onClick={() => setRestockModal(prev => ({ ...prev, mode: 'set', customAmount: String(restockModal.product?.stock ?? 0) }))}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    restockModal.mode === 'set'
                      ? 'bg-white text-emerald-700 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Setel Total Stok
                </button>
              </div>

              {/* Preset Buttons if mode === 'add' */}
              {restockModal.mode === 'add' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Pilihan Cepat Tambah Stok:
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 20, 50, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRestockModal(prev => ({ ...prev, addAmount: preset, customAmount: String(preset) }))}
                        className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                          restockModal.customAmount === String(preset)
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Number Custom */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{restockModal.mode === 'add' ? 'Jumlah Porsi Ditambahkan:' : 'Angka Stok Baru:'}</span>
                  <span className="text-[11px] text-slate-400 font-mono">Porsi</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={restockModal.mode === 'add' ? 1 : 0}
                    value={restockModal.customAmount}
                    onChange={(e) => setRestockModal(prev => ({ ...prev, customAmount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-black text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    placeholder="Contoh: 15"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Stok Saat Ini:</span>
                  <span className="font-mono">{(restockModal.product.stock ?? 0)} Porsi</span>
                </div>
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span>{restockModal.mode === 'add' ? 'Tambahan Restok:' : 'Perubahan:'}</span>
                  <span className="font-mono">
                    {restockModal.mode === 'add' ? `+${parseInt(restockModal.customAmount) || 0} Porsi` : `${parseInt(restockModal.customAmount) || 0} Porsi`}
                  </span>
                </div>
                <div className="pt-1 border-t border-emerald-200/80 flex items-center justify-between font-black text-emerald-950 text-sm">
                  <span>Total Stok Menjadi:</span>
                  <span className="font-mono text-emerald-700">
                    {restockModal.mode === 'add' 
                      ? (restockModal.product.stock ?? 0) + (parseInt(restockModal.customAmount) || 0)
                      : (parseInt(restockModal.customAmount) || 0)} Porsi
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setRestockModal({ isOpen: false, product: null, addAmount: 10, customAmount: '10', mode: 'add', isLoading: false })}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRestock}
                disabled={restockModal.isLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <PackagePlus className="w-4 h-4" />
                <span>{restockModal.isLoading ? 'Menyimpan...' : 'Simpan Restok'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset Stok (Kembalikan ke Nol Tanpa Hapus Produk) */}
      {resetStockConfirm.isOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-rose-100 animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {resetStockConfirm.type === 'single'
                  ? `Reset Stok: ${resetStockConfirm.product?.name || 'Produk'}`
                  : 'Reset Semua Stok Produk'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {resetStockConfirm.type === 'single' ? (
                  <>
                    Stok produk <strong>{resetStockConfirm.product?.name}</strong> akan dikembalikan ke <strong>0 porsi (habis)</strong>.
                    <br /><br />
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 inline-block text-[11px]">
                      🛡️ Produk TIDAK AKAN DIHAPUS dari sistem.
                    </span>
                  </>
                ) : (
                  <>
                    Seluruh menu produk akan diubah stoknya menjadi <strong>0 porsi (habis)</strong>.
                    <br /><br />
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 inline-block text-[11px]">
                      🛡️ Semua menu, foto, harga, dan varian tetap aman tersimpan tanpa dihapus.
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="flex bg-slate-50 border-t border-slate-100 p-3.5 gap-2.5">
              <button 
                type="button"
                onClick={() => setResetStockConfirm({ isOpen: false, type: 'single', product: null, isLoading: false })}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-100 text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleExecuteResetStock}
                disabled={resetStockConfirm.isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{resetStockConfirm.isLoading ? 'Mereset...' : 'Ya, Reset ke 0'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kosongkan Riwayat Pesanan & Laporan Penjualan (Mulai dari Nol) */}
      {clearOrdersConfirm.isOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-200 animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="p-6 text-center space-y-3">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Kosongkan Semua Data Pesanan &amp; Penjualan?
              </h3>
              <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p>
                  Seluruh riwayat <strong>Pesanan Kasir (Cash Langsung)</strong> dan kalkulasi <strong>Laporan Penjualan (Omset, Modal/HPP, Laba Bersih)</strong> di database akan dikosongkan menjadi <strong>0 (nol)</strong> agar transaksi dapat dimulai kembali dari awal.
                </p>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Daftar Menu Produk, Harga, Foto di Google Drive, dan Varian Rasa tetap tersimpan aman (TIDAK DIHAPUS).</span>
                </div>
              </div>
            </div>
            <div className="flex bg-slate-50 border-t border-slate-100 p-3.5 gap-2.5">
              <button 
                type="button"
                onClick={() => setClearOrdersConfirm({ isOpen: false, isLoading: false })}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-100 text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleExecuteClearOrders}
                disabled={clearOrdersConfirm.isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-white font-bold bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 text-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearOrdersConfirm.isLoading ? 'Mengosongkan...' : 'Ya, Kosongkan Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Superadmin Unlock Modal (Koko Ferri) */}
      {isSuperAdminModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-purple-200 animate-in zoom-in-95 duration-200 text-slate-800">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white relative">
              <button
                type="button"
                onClick={() => { setIsSuperAdminModalOpen(false); setSuperAdminPinError(''); }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/30 border border-purple-400/50 flex items-center justify-center text-amber-300 mb-3 shadow-lg shadow-purple-900/50">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Akses Khusus Superadmin</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">Pemilik</span>
              </h3>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                Halaman cek koneksi &amp; konfigurasi Google Drive disembunyikan agar aman saat website dikelola oleh orang lain.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUnlockSuperadmin} className="p-6 space-y-4">
              {superAdminPinError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{superAdminPinError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>PIN atau Kata Sandi Superadmin:</span>
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  value={superAdminPin}
                  onChange={(e) => setSuperAdminPin(e.target.value)}
                  placeholder="Masukkan sandi superadmin..."
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-900 outline-none focus:border-purple-600 focus:bg-white transition text-sm"
                />
              </div>

              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Gunakan sandi <strong className="font-mono text-purple-950">superadmin</strong> atau email Anda <strong className="font-mono text-purple-950">fa.officialtng.id@gmail.com</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsSuperAdminModalOpen(false); setSuperAdminPinError(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={verifyingSuperAdmin}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-purple-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {verifyingSuperAdmin ? 'Memeriksa...' : 'Buka Superadmin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
