import React, { useState } from 'react';
import { 
  Wrench, 
  Power, 
  Clock, 
  Calendar, 
  Sparkles, 
  Save, 
  Eye, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { MaintenanceConfig, SiteSettings } from '../types';

interface MaintenanceAdminTabProps {
  siteSettings: SiteSettings;
  adminToken: string | null;
  onUpdateSettings: (settings: SiteSettings) => void;
  showStatus: (text: string, type?: 'success' | 'error') => void;
  onPreviewStore: () => void;
  onPreviewMaintenancePage: () => void;
}

export default function MaintenanceAdminTab({
  siteSettings,
  adminToken,
  onUpdateSettings,
  showStatus,
  onPreviewStore,
  onPreviewMaintenancePage
}: MaintenanceAdminTabProps) {
  const currentMaintenance: MaintenanceConfig = siteSettings.maintenance || {
    enabled: false,
    title: "Website Sedang Dalam Pemeliharaan",
    reason: "Pembaruan Menu Produk & Promo Diskon",
    message: "Halo! Kami sedang memperbarui daftar menu produk baru dan penyesuaian promo menarik untuk kamu. Website akan segera dibuka kembali!",
    autoSchedule: false,
    allowBypass: true,
    scheduledStart: "",
    scheduledEnd: "",
    estimatedTime: "Segera Hadir"
  };

  const [formState, setFormState] = useState<MaintenanceConfig>(currentMaintenance);
  const [isSaving, setIsSaving] = useState(false);

  const reasonPresets = [
    { label: "📦 Tambah Menu Baru", text: "Penambahan Menu Produk Baru" },
    { label: "🏷️ Update Diskon & Promo", text: "Update Harga & Promo Diskon Spesial" },
    { label: "🎨 Perbaikan Tampilan Website", text: "Pembaruan Tampilan & Desain Landing Page" },
    { label: "🛠️ Pemeliharaan Rutin", text: "Pemeliharaan Sistem Rutin" },
    { label: "📅 Persiapan Buka Hari Rabu", text: "Persiapan Menu Penjualan Hari Rabu" }
  ];

  const handleSave = async (updatedConfig?: MaintenanceConfig) => {
    const configToSave = updatedConfig || formState;
    setIsSaving(true);
    const updatedSettings: SiteSettings = {
      ...siteSettings,
      maintenance: configToSave
    };

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
        onUpdateSettings(updatedSettings);
        showStatus(
          configToSave.enabled 
            ? "Mode Maintenance BERHASIL DIAKTIFKAN. Pengunjung akan melihat halaman pemeliharaan." 
            : "Mode Maintenance DINONAKTIFKAN. Website toko kembali dapat diakses publik secara normal."
        );
      } else {
        onUpdateSettings(updatedSettings);
        showStatus("Pengaturan disimpan secara lokal.");
      }
    } catch {
      onUpdateSettings(updatedSettings);
      showStatus("Pengaturan disimpan secara lokal.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMaintenanceNow = () => {
    const nextState = !formState.enabled;
    const updated = { ...formState, enabled: nextState };
    setFormState(updated);
    handleSave(updated);
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl">Jadwal &amp; Mode Maintenance Website</h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
              formState.enabled 
                ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
            }`}>
              {formState.enabled ? '🔴 Maintenance Aktif' : '🟢 Website Toko Online'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan fitur ini saat kamu ingin memperbaiki website, menambahkan menu produk baru, atau mengubah promo diskon tanpa mengganggu pengunjung.
          </p>
        </div>

        {/* Quick Preview Button (Tombol Simpan hanya satu di popup bawah) */}
        <button
          onClick={onPreviewMaintenancePage}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
          title="Lihat Pratinjau Halaman Maintenance Publik"
        >
          <Eye className="w-4 h-4 text-orange-500" />
          <span>Lihat Layar Maintenance</span>
        </button>
      </div>

      {/* Hero Control Card: Status Switch & Instant Action */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 ${
        formState.enabled 
          ? 'bg-gradient-to-br from-rose-50 to-orange-50/60 border-rose-200 shadow-sm' 
          : 'bg-gradient-to-br from-slate-50 to-emerald-50/50 border-slate-200/90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl shrink-0 ${
              formState.enabled ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-200 text-slate-700'
            }`}>
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {formState.enabled ? 'Mode Maintenance Sedang AKTIF' : 'Mode Maintenance Sedang NONAKTIF'}
                </h5>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
                {formState.enabled 
                  ? 'Pengunjung umum akan dialihkan ke halaman pemeliharaan. Tim perancang & admin tetap dapat melewati halaman ini untuk melakukan penataan toko.' 
                  : 'Website toko berjalan normal dan siap menerima kunjungan serta pesanan dari pembeli.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleMaintenanceNow}
            className={`px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 ${
              formState.enabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{formState.enabled ? 'Matikan Maintenance (Buka Toko)' : 'Aktifkan Maintenance Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Mode Perancangan & Bypass Section (User explicitly requested) */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">Tombol Lewati (Bypass) Mode Perancangan</h5>
            <p className="text-[11px] text-slate-500">Memungkinkan kamu atau tim melewati halaman maintenance untuk merancang website.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-800 block">
              Aktifkan Tombol "Mode Perancangan (Lewati)" di Halaman Maintenance
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jika aktif, pada halaman maintenance yang dilihat pengunjung akan tersedia tombol khusus untuk melompati mode pemeliharaan sehingga tim dapat langsung mendesain dan menguji landing page.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              checked={formState.allowBypass !== false} 
              onChange={(e) => setFormState({ ...formState, allowBypass: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>

        {/* Action Preview Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onPreviewStore}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 text-slate-700 hover:text-orange-600 transition flex items-center justify-between font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-orange-500" />
              <span>Buka Pratinjau Website (Mode Perancangan)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onPreviewMaintenancePage}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-slate-700 hover:text-sky-600 transition flex items-center justify-between font-bold text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-sky-500" />
              <span>Lihat Tampilan Halaman Maintenance</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Informasi & Pesan Pemeliharaan */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">Informasi Halaman Pemeliharaan</h5>
            <p className="text-[11px] text-slate-500">Teks yang ditampilkan kepada pengunjung saat mode maintenance aktif.</p>
          </div>
        </div>

        {/* Preset Pilihan Alasan Pemeliharaan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Pilih Cepat Alasan Pemeliharaan:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {reasonPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormState(prev => ({ ...prev, reason: preset.text }))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  formState.reason === preset.text
                    ? 'bg-orange-500 text-white shadow-2xs font-extrabold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Alasan Spesifik */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Badge / Alasan Pemeliharaan
          </label>
          <input
            type="text"
            value={formState.reason || ''}
            onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
            placeholder="Contoh: Penambahan Menu Produk Baru & Promo Diskon"
            className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        {/* Input Judul Pemeliharaan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Judul Utama Halaman Maintenance
          </label>
          <input
            type="text"
            value={formState.title || ''}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            placeholder="Contoh: Website Sedang Dalam Perbaikan / Update"
            className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        {/* Input Pesan Detail */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Pesan Penjelasan untuk Pengunjung
          </label>
          <textarea
            rows={3}
            value={formState.message || ''}
            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
            placeholder="Tuliskan pesan penjelasan untuk pengunjung di sini..."
            className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-y"
          />
        </div>

        {/* Perkiraan Selesai */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Perkiraan Waktu Selesai (Teks Singkat)
          </label>
          <input
            type="text"
            value={formState.estimatedTime || ''}
            onChange={(e) => setFormState({ ...formState, estimatedTime: e.target.value })}
            placeholder="Contoh: Hari ini pukul 17:00 WIB atau Segera Hadir"
            className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Pengaturan Jadwal Otomatis (Scheduler) */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">Jadwal Hitung Mundur Pemeliharaan</h5>
              <p className="text-[11px] text-slate-500">Opsional: Tentukan waktu selesai untuk menampilkan timer hitung mundur otomatis.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Waktu Mulai Pemeliharaan
            </label>
            <input
              type="datetime-local"
              value={formState.scheduledStart || ''}
              onChange={(e) => setFormState({ ...formState, scheduledStart: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Waktu Target Selesai (Timer Hitung Mundur)
            </label>
            <input
              type="datetime-local"
              value={formState.scheduledEnd || ''}
              onChange={(e) => setFormState({ ...formState, scheduledEnd: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            />
          </div>
        </div>

        {formState.scheduledEnd && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-2 text-xs text-sky-800 font-semibold">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Timer hitung mundur akan otomatis berjalan di halaman pemeliharaan sampai target waktu selesai.
            </span>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Popup Bar (Satu-satunya Tombol Simpan) */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-full ${formState.enabled ? 'bg-rose-500 animate-ping opacity-75' : 'bg-emerald-500'}`}></span>
            <span className={`absolute w-2.5 h-2.5 rounded-full ${formState.enabled ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">
              Status Target: <b className={`${formState.enabled ? 'text-rose-400' : 'text-emerald-400'}`}>{formState.enabled ? 'Mode Maintenance Aktif' : 'Toko Buka Normal'}</b>
            </span>
            <span className="text-[10px] text-slate-400">
              Klik Simpan Pengaturan untuk menerapkan ke seluruh sistem
            </span>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs sm:text-sm font-black transition shadow-lg shadow-orange-500/25 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
        </button>
      </div>

    </div>
  );
}
