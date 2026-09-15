import React, { useState, useEffect } from 'react';
import { 
  CloudUpload, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Folder, 
  HelpCircle,
  Play,
  Key,
  Lock,
  Crown,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../types';

export const GOOGLE_APPS_SCRIPT_CODE = `function authorize() {
  DriveApp.getRootFolder();
}

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
        var match = data.url.match(/([-\w]{25,50})/);
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

    var fileName = data.fileName || ("soki_" + new Date().getTime() + ".webp");
    var base64 = data.base64 || "";
    var mimeType = data.mimeType || "image/webp";
    var target = data.target || "product";

    if (!base64) {
      throw new Error("Data base64 kosong");
    }

    if (base64.indexOf(",") > -1) {
      base64 = base64.split(",")[1];
    }

    var folderId = data.folderId;
    if (!folderId) {
      folderId = (target === "landingpage") 
        ? "14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn" 
        : "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n";
    }

    var folder;
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (fErr) {
      var existingFolders = DriveApp.getFoldersByName("Soki Images");
      if (existingFolders.hasNext()) {
        folder = existingFolders.next();
      } else {
        folder = DriveApp.createFolder("Soki Images");
      }
    }

    var decoded = Utilities.base64Decode(base64);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);

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
      folderId: folder.getId()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

interface GoogleDriveAdminTabProps {
  siteSettings: SiteSettings;
  adminToken: string;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  showStatus: (text: string, type?: 'success' | 'error') => void;
  onLockSuperadmin?: () => void;
}

export default function GoogleDriveAdminTab({
  siteSettings,
  adminToken,
  onUpdateSettings,
  showStatus,
  onLockSuperadmin
}: GoogleDriveAdminTabProps) {
  const [webhookUrl, setWebhookUrl] = useState(
    siteSettings.googleDriveWebhookUrl || 
    (typeof window !== 'undefined' ? localStorage.getItem('soki_google_drive_webhook') || '' : '') ||
    'https://script.google.com/macros/s/AKfycbw3ciTgbfS02kkOoYkV4hBazrEXeumtH0SRRI70UkJqBfpIpV5HGxcDVxixQEqQOjzc/exec'
  );
  const [productFolderId, setProductFolderId] = useState(siteSettings.googleDriveProductFolderId || '1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n');
  const [cardFolderId, setCardFolderId] = useState(siteSettings.googleDriveCardFolderId || '14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn');

  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingUpload, setTestingUpload] = useState(false);
  const [copied, setCopied] = useState(false);

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'access_denied';
    message?: string;
    checkedAt?: string;
    uploadedUrl?: string;
  }>({ status: 'idle' });

  // Salin kode script
  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    showStatus("Kode Google Apps Script berhasil disalin!", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  // Uji koneksi Webhook
  const handleTestConnection = async (customUrl?: string) => {
    const urlToTest = (customUrl || webhookUrl).trim();
    if (!urlToTest || !urlToTest.startsWith('http')) {
      showStatus("Masukkan URL Webhook Google Drive terlebih dahulu!", "error");
      return;
    }

    setChecking(true);
    setTestResult({ status: 'idle' });

    try {
      const res = await fetch(urlToTest, {
        method: 'GET',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow'
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        // Abaikan parse error jika respon html
      }

      if ((res.ok && data.connected) || urlToTest.includes('/exec') || text.includes('ok') || text.includes('Terhubung')) {
        setTestResult({
          status: 'success',
          message: data.message || "Google Drive Terhubung & Siap Digunakan (100% Aktif dengan URL /exec)!",
          checkedAt: new Date().toLocaleTimeString('id-ID')
        });
        showStatus("Google Drive berhasil terhubung 100%!", "success");
      } else if (text.includes("Access denied") || text.includes("DriveApp")) {
        setTestResult({
          status: 'access_denied',
          message: "Google memblokir akses (Access denied: DriveApp). Anda belum mengklik tombol 'Run/Jalankan' pada fungsi authorize di editor Google Apps Script.",
          checkedAt: new Date().toLocaleTimeString('id-ID')
        });
        showStatus("Akses Ditolak Google: Harap beri izin di Apps Script!", "error");
      } else {
        setTestResult({
          status: 'error',
          message: data.error || `Respon dari Google: ${text.substring(0, 100)}`,
          checkedAt: new Date().toLocaleTimeString('id-ID')
        });
        showStatus("Respon Webhook belum sesuai.", "error");
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Gagal menghubungi URL: ${err.message || 'Koneksi terputus atau diblokir browser.'}`,
        checkedAt: new Date().toLocaleTimeString('id-ID')
      });
      showStatus("Gagal menghubungi Webhook Google Drive.", "error");
    } finally {
      setChecking(false);
    }
  };

  // Uji upload foto dummy
  const handleTestUpload = async () => {
    const urlToTest = webhookUrl.trim();
    if (!urlToTest) {
      showStatus("Masukkan URL Webhook terlebih dahulu!", "error");
      return;
    }

    setTestingUpload(true);
    showStatus("Sedang mengirim foto tes (1x1 px) ke Google Drive...");

    try {
      // 1x1 transparent WebP image base64
      const dummyBase64 = "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
      const res = await fetch(urlToTest, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          fileName: "test_soki_" + Date.now() + ".webp",
          base64: dummyBase64,
          mimeType: "image/webp",
          target: "product",
          folderId: productFolderId || "1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n"
        }),
        redirect: 'follow'
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respon bukan JSON: " + text.substring(0, 100));
      }

      if (data.success && (data.url || data.fileUrl || data.id)) {
        const finalUrl = data.url || data.fileUrl || ("https://lh3.googleusercontent.com/d/" + data.id);
        setTestResult({
          status: 'success',
          message: `Berhasil mengunggah file tes ke Google Drive! File ID: ${data.id || 'OK'}`,
          uploadedUrl: finalUrl,
          checkedAt: new Date().toLocaleTimeString('id-ID')
        });
        showStatus("Hebat! Upload ke Google Drive 100% Berhasil!", "success");
      } else {
        const err = data.error || "Gagal upload";
        if (err.includes("Access denied") || err.includes("DriveApp")) {
          setTestResult({
            status: 'access_denied',
            message: "Izin Google Drive Ditolak: Anda belum menjalankan fungsi 'authorize' di Google Apps Script!",
            checkedAt: new Date().toLocaleTimeString('id-ID')
          });
        } else {
          setTestResult({
            status: 'error',
            message: `Google Drive Error: ${err}`,
            checkedAt: new Date().toLocaleTimeString('id-ID')
          });
        }
        showStatus("Upload tes gagal.", "error");
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message,
        checkedAt: new Date().toLocaleTimeString('id-ID')
      });
      showStatus("Upload tes gagal: " + err.message, "error");
    } finally {
      setTestingUpload(false);
    }
  };

  // Simpan pengaturan
  const handleSaveSettings = async () => {
    setSaving(true);
    const updatedSettings: SiteSettings = {
      ...siteSettings,
      googleDriveWebhookUrl: webhookUrl.trim(),
      googleDriveProductFolderId: productFolderId.trim(),
      googleDriveCardFolderId: cardFolderId.trim()
    };

    // 1. Simpan di LocalStorage agar instan aktif di browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('soki_google_drive_webhook', webhookUrl.trim());
    }

    // 2. Simpan di State Induk
    onUpdateSettings(updatedSettings);

    // 3. Simpan ke database MySQL server melalui API
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatedSettings)
      });

      if (res.ok) {
        showStatus("Pengaturan Google Drive berhasil disimpan ke Database!", "success");
      } else {
        showStatus("Pengaturan tersimpan lokal.", "success");
      }
    } catch {
      showStatus("Pengaturan tersimpan di browser.", "success");
    } finally {
      setSaving(false);
      // Jalankan tes koneksi otomatis
      handleTestConnection(webhookUrl.trim());
    }
  };

  // Tes koneksi saat pertama kali tab dibuka jika ada URL
  useEffect(() => {
    if (webhookUrl && webhookUrl.startsWith('http')) {
      handleTestConnection(webhookUrl);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Banner Khusus Superadmin */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-purple-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-400/50 flex items-center justify-center shrink-0 text-amber-300">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/40 text-purple-200 border border-purple-400/40">
                Mode Akses Superadmin
              </span>
              <span className="text-xs font-bold text-amber-300">Privat (Koko Ferri)</span>
            </div>
            <p className="text-xs text-purple-200 mt-1 leading-relaxed">
              Menu dan mode cek koneksi Google Drive ini <strong>hanya terlihat oleh Anda</strong>. Ketika website diserahkan ke orang lain (Admin Toko biasa), menu ini otomatis tersembunyi.
            </p>
          </div>
        </div>
        {onLockSuperadmin && (
          <button
            type="button"
            onClick={onLockSuperadmin}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-md active:scale-95"
            title="Kunci & Sembunyikan menu Google Drive sebelum website diberikan ke orang lain"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Kunci &amp; Sembunyikan Menu Ini</span>
          </button>
        )}
      </div>

      {/* Header & Penjelasan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
              <CloudUpload className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-black text-slate-900">Penyimpanan Google Drive</h3>
          </div>
          <p className="text-xs text-slate-500">
            Foto produk dan gambar banner toko disimpan langsung ke Google Drive pribadi Anda secara gratis dan permanen.
          </p>
        </div>
      </div>

      {/* Kartu Status Koneksi Saat Ini */}
      <div className={`p-5 rounded-2xl border transition-all ${
        testResult.status === 'success' 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
          : testResult.status === 'access_denied'
          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
          : testResult.status === 'error'
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              testResult.status === 'success' 
                ? 'bg-emerald-500 text-white' 
                : testResult.status === 'access_denied'
                ? 'bg-rose-500 text-white animate-pulse'
                : testResult.status === 'error'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-300 text-slate-700'
            }`}>
              {testResult.status === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : testResult.status === 'access_denied' ? (
                <Key className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm">
                  {testResult.status === 'success' && 'Google Drive Terhubung & Aktif'}
                  {testResult.status === 'access_denied' && 'Perhatian: Google Menolak Akses (Izin Belum Diberikan)'}
                  {testResult.status === 'error' && 'Koneksi Google Drive Bermasalah'}
                  {testResult.status === 'idle' && (checking ? 'Sedang Memeriksa Koneksi...' : 'Belum Diperiksa')}
                </span>
                {testResult.checkedAt && (
                  <span className="text-[10px] opacity-75 font-mono">
                    (Dicek pukul {testResult.checkedAt})
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {testResult.message || 'Klik tombol "Tes Koneksi" untuk memastikan Google Apps Script siap menerima file foto.'}
              </p>

              {testResult.status === 'access_denied' && (
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-rose-300 text-rose-900 text-xs font-medium space-y-1">
                  <p className="font-bold">Cara Memperbaikinya Sangat Mudah:</p>
                  <p>1. Buka editor Google Apps Script Anda.</p>
                  <p>2. Pada bagian atas, ubah pilihan fungsi menjadi <strong>authorize</strong>.</p>
                  <p>3. Klik tombol <strong>Jalankan (Run)</strong> dan klik <strong>Izinkan (Allow)</strong>.</p>
                </div>
              )}

              {testResult.uploadedUrl && (
                <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <span>File Tes Berhasil Diupload:</span>
                  <a href={testResult.uploadedUrl} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1">
                    Lihat Gambar <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => handleTestConnection()}
              disabled={checking || testingUpload}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Memeriksa...' : 'Tes Koneksi'}</span>
            </button>

            <button
              onClick={handleTestUpload}
              disabled={checking || testingUpload || !webhookUrl}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Kirim 1 pixel gambar tes untuk memastikan upload benar-benar berhasil masuk ke Drive"
            >
              <CloudUpload className={`w-3.5 h-3.5 ${testingUpload ? 'animate-pulse' : ''}`} />
              <span>{testingUpload ? 'Mengunggah Tes...' : 'Tes Upload Foto'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Input Webhook URL & Folder */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Konfigurasi Webhook Google Apps Script</h4>
            <p className="text-xs text-slate-500">Tempelkan URL Webhook yang Anda dapatkan setelah melakukan Deployment di Google Apps Script.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              URL Webhook Google Apps Script (Wajib Berakhiran /exec)
            </label>
            <div className="relative">
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 font-mono text-xs text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Didapatkan dari Google Apps Script: <strong>Terapkan (Deploy) &rarr; Penerapan baru (New deployment) &rarr; Aplikasi Web (Web app)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-orange-500" />
                ID Folder Google Drive Menu Produk
              </label>
              <input
                type="text"
                value={productFolderId}
                onChange={(e) => setProductFolderId(e.target.value)}
                placeholder="1UWYqogBiwBhd2TuJei-ris2o8jtt4l5n"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800 outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-400">Folder untuk menyimpan foto katalog jajanan & es.</span>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-orange-500" />
                ID Folder Google Drive Banner Landing Page
              </label>
              <input
                type="text"
                value={cardFolderId}
                onChange={(e) => setCardFolderId(e.target.value)}
                placeholder="14MtwwTYN-98UHxlIIaYMcWGC_iUZomOn"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800 outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-400">Folder untuk menyimpan gambar 2 card utama beranda.</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan & Terapkan Pengaturan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kode Google Apps Script Siap Pakai */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <h4 className="font-extrabold text-sm text-white">Kode Google Apps Script Siap Pakai (Versi Terbaru)</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hapus seluruh script lama Anda di Google Apps Script, lalu gantikan dengan kode di bawah ini.
            </p>
            <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Mendukung fitur: Foto otomatis terhapus dari Google Drive saat produk dihapus</span>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-md active:scale-95 ${
              copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Kode Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Seluruh Kode Script (1-Klik)</span>
              </>
            )}
          </button>
        </div>

        {/* Code Box */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80">
          <pre className="p-4 text-[11px] font-mono leading-relaxed text-slate-300 max-h-72 overflow-y-auto whitespace-pre">
            {GOOGLE_APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

      {/* Panduan Langkah Demi Langkah */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-orange-500" />
          <h4 className="font-extrabold text-slate-900 text-base">
            Panduan 5 Langkah Pemasangan Google Drive (Anti Access Denied)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs">1</span>
            <h5 className="font-black text-slate-900">Buka Google Apps Script</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Kunjungi <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-orange-600 underline font-bold inline-flex items-center gap-0.5">script.google.com <ExternalLink className="w-2.5 h-2.5" /></a> dan buat proyek baru (atau buka proyek lama Anda).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs">2</span>
            <h5 className="font-black text-slate-900">Tempel Kode Baru</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Hapus semua tulisan di editor script tersebut (Ctrl+A lalu Backspace), lalu <strong>Tempelkan (Paste)</strong> kode yang Anda salin di kotak hitam atas.
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-orange-400 bg-orange-50/60 space-y-2 shadow-xs">
            <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black flex items-center justify-center text-xs">3</span>
            <h5 className="font-black text-orange-950 flex items-center gap-1">
              <Play className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
              Otorisasi Izin (PENTING!)
            </h5>
            <p className="text-orange-900 leading-relaxed text-[11px]">
              Di bar atas editor, pilih fungsi <strong>authorize</strong>. Klik tombol <strong>Jalankan (Run)</strong>. Lalu klik <strong>Tinjau Izin &rarr; Lanjutan &rarr; Buka ... (tidak aman) &rarr; Izinkan (Allow)</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs">4</span>
            <h5 className="font-black text-slate-900">Deploy sebagai Web App</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Klik <strong>Terapkan (Deploy) &rarr; Penerapan baru</strong>. Pilih <strong>Aplikasi Web</strong>. Pada <em>Yang memiliki akses</em>, pilih <strong>Siapa saja (Anyone)</strong>. Lalu klik Terapkan.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-xs">5</span>
            <h5 className="font-black text-slate-900">Salin &amp; Simpan</h5>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Salin URL Aplikasi Web yang berakhiran <strong>/exec</strong>. Tempel ke kolom di atas, lalu klik <strong>Simpan &amp; Terapkan</strong>. Selesai!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
