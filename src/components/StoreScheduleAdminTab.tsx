import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Store, 
  Save, 
  RefreshCw, 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Copy, 
  HelpCircle,
  Sun,
  Moon,
  ToggleLeft,
  ToggleRight,
  Info
} from 'lucide-react';
import { SiteSettings, StoreScheduleConfig, DaySchedule } from '../types';
import { defaultStoreSchedule, defaultWeeklySchedule, getStoreStatus, StoreStatusResult } from '../utils/scheduleHelper';

interface StoreScheduleAdminTabProps {
  siteSettings: SiteSettings;
  adminToken: string;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  showStatus: (msg: string, type?: 'success' | 'error') => void;
  onPreviewClosedPage?: () => void;
}

export default function StoreScheduleAdminTab({
  siteSettings,
  adminToken,
  onUpdateSettings,
  showStatus,
  onPreviewClosedPage
}: StoreScheduleAdminTabProps) {
  const currentConfig: StoreScheduleConfig = siteSettings?.storeSchedule || defaultStoreSchedule;

  const [formState, setFormState] = useState<StoreScheduleConfig>(() => ({
    ...defaultStoreSchedule,
    ...currentConfig,
    weeklySchedule: currentConfig.weeklySchedule && currentConfig.weeklySchedule.length > 0 
      ? currentConfig.weeklySchedule 
      : defaultWeeklySchedule
  }));

  const [isSaving, setIsSaving] = useState(false);
  const liveStatus = getStoreStatus(formState);
  const [currentRealTime, setCurrentRealTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  });

  // Update real time clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentRealTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Preset Handlers
  const applyPresetSchool = () => {
    const updated = formState.weeklySchedule.map(day => {
      if (day.day === 'saturday' || day.day === 'sunday') {
        return { ...day, isOpen: false };
      }
      return { ...day, isOpen: true, openTime: '07:30', closeTime: '15:30' };
    });
    setFormState(prev => ({ ...prev, statusMode: 'auto', weeklySchedule: updated }));
    showStatus('Preset Jam Sekolah berhasil diterapkan!');
  };

  const applyPresetWednesdayOnly = () => {
    const updated = formState.weeklySchedule.map(day => {
      if (day.day === 'wednesday') {
        return { ...day, isOpen: true, openTime: '07:30', closeTime: '17:30' };
      }
      return { ...day, isOpen: false };
    });
    setFormState(prev => ({
      ...prev,
      statusMode: 'auto',
      weeklySchedule: updated,
      specialNote: 'Menu Spesial Kelas 8B Kelompok 3 buka setiap hari Rabu!'
    }));
    showStatus('Preset Khusus Hari Rabu berhasil diterapkan!');
  };

  const applyPresetRegular = () => {
    const updated = formState.weeklySchedule.map(day => {
      if (day.day === 'sunday') {
        return { ...day, isOpen: false };
      }
      return { ...day, isOpen: true, openTime: '08:00', closeTime: '21:00' };
    });
    setFormState(prev => ({ ...prev, statusMode: 'auto', weeklySchedule: updated }));
    showStatus('Preset Reguler (Senin - Sabtu) berhasil diterapkan!');
  };

  const applyPresetAllDays = () => {
    const updated = formState.weeklySchedule.map(day => ({
      ...day,
      isOpen: true,
      openTime: '08:00',
      closeTime: '20:00'
    }));
    setFormState(prev => ({ ...prev, statusMode: 'auto', weeklySchedule: updated }));
    showStatus('Preset Buka Setiap Hari berhasil diterapkan!');
  };

  const handleToggleDay = (dayIndex: number) => {
    const updated = [...formState.weeklySchedule];
    updated[dayIndex] = {
      ...updated[dayIndex],
      isOpen: !updated[dayIndex].isOpen
    };
    setFormState(prev => ({ ...prev, weeklySchedule: updated }));
  };

  const handleTimeChange = (dayIndex: number, field: 'openTime' | 'closeTime', val: string) => {
    const updated = [...formState.weeklySchedule];
    updated[dayIndex] = {
      ...updated[dayIndex],
      [field]: val
    };
    setFormState(prev => ({ ...prev, weeklySchedule: updated }));
  };

  const copyTimeToAllDays = (sourceDay: DaySchedule) => {
    const updated = formState.weeklySchedule.map(d => ({
      ...d,
      openTime: sourceDay.openTime,
      closeTime: sourceDay.closeTime
    }));
    setFormState(prev => ({ ...prev, weeklySchedule: updated }));
    showStatus(`Jam ${sourceDay.openTime} - ${sourceDay.closeTime} disalin ke semua hari.`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const newSettings: SiteSettings = {
      ...siteSettings,
      storeSchedule: formState
    };

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(newSettings)
      });

      if (res.ok) {
        onUpdateSettings(newSettings);
        showStatus('Jadwal & Jam Operasional Toko berhasil disimpan ke database!');
      } else {
        onUpdateSettings(newSettings);
        showStatus('Jadwal disimpan.');
      }
    } catch {
      onUpdateSettings(newSettings);
      showStatus('Jadwal disimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Pengaturan Operasional Toko</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Jadwal Jam Buka &amp; Jam Tutup
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Atur jam operasional toko harian. Saat toko tutup atau diluar jam operasional, pengunjung akan dialihkan ke halaman khusus toko tutup secara otomatis.
          </p>
        </div>

        {onPreviewClosedPage && (
          <button
            onClick={onPreviewClosedPage}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
            title="Lihat Pratinjau Layar Toko Tutup"
          >
            <Eye className="w-4 h-4 text-orange-500" />
            <span>Lihat Layar Toko Tutup</span>
          </button>
        )}
      </div>

      {/* Live Status Overview Card */}
      <div className={`p-5 rounded-3xl border shadow-sm transition ${
        liveStatus.isOpen 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950' 
          : 'bg-rose-500/10 border-rose-500/30 text-rose-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              liveStatus.isOpen ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Status Toko Saat Ini:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                  liveStatus.isOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {liveStatus.isOpen ? 'BUKA SEKARANG' : 'SEDANG TUTUP'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {liveStatus.reason} &bull; <b className="text-slate-900">{liveStatus.nextOpeningText}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-2xl border border-slate-200/80 font-mono text-xs font-bold text-slate-800 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{currentRealTime || 'Waktu WIB'}</span>
          </div>
        </div>
      </div>

      {/* Mode Status Toko Master Selector (3 Pilihan) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Mode Kontrol Operasional</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Mode 1: Otomatis Sesuai Jadwal */}
          <div
            onClick={() => setFormState(prev => ({ ...prev, statusMode: 'auto' }))}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              formState.statusMode === 'auto'
                ? 'border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                formState.statusMode === 'auto' ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
              }`}>
                {formState.statusMode === 'auto' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
              </div>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Otomatis (Jadwal)</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Buka &amp; tutup secara otomatis mengikuti jam operasional harian yang ditentukan di bawah.
            </p>
          </div>

          {/* Mode 2: Selalu Buka (Force Open) */}
          <div
            onClick={() => setFormState(prev => ({ ...prev, statusMode: 'force_open' }))}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              formState.statusMode === 'force_open'
                ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Sun className="w-4 h-4" />
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                formState.statusMode === 'force_open' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
              }`}>
                {formState.statusMode === 'force_open' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
              </div>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Selalu Buka (24 Jam)</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Toko selalu berstatus buka tanpa batasan jam. Pembeli selalu bisa mengakses katalog toko.
            </p>
          </div>

          {/* Mode 3: Tutup Sementara (Force Closed) */}
          <div
            onClick={() => setFormState(prev => ({ ...prev, statusMode: 'force_closed' }))}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              formState.statusMode === 'force_closed'
                ? 'border-rose-500 bg-rose-50/50 shadow-md ring-2 ring-rose-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Moon className="w-4 h-4" />
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                formState.statusMode === 'force_closed' ? 'border-rose-500 bg-rose-500' : 'border-slate-300'
              }`}>
                {formState.statusMode === 'force_closed' && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
              </div>
            </div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">Tutup Sementara / Libur</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">
              Tutup toko saat ini juga (misal: stok habis atau libur dadakan) tanpa mengubah jadwal mingguan.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Cepat */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80">
        <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-2.5">
          Template &amp; Preset Jadwal Cepat:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={applyPresetWednesdayOnly}
            className="px-3 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            ⭐ Khusus Hari Rabu (Menu 8B)
          </button>
          <button
            onClick={applyPresetSchool}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            🏫 Jam Sekolah (Senin-Jumat 07:30 - 15:30)
          </button>
          <button
            onClick={applyPresetRegular}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            📅 Reguler (Senin-Sabtu 08:00 - 21:00)
          </button>
          <button
            onClick={applyPresetAllDays}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer active:scale-95"
          >
            ⚡ Setiap Hari (08:00 - 20:00)
          </button>
        </div>
      </div>

      {/* Tabel Pengaturan Hari (Senin - Minggu) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>Jadwal Jam Buka &amp; Tutup Mingguan</span>
          </h3>
          <span className="text-xs text-slate-400">Waktu Indonesia Barat (WIB)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                <th className="py-3 px-3">Hari</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Jam Buka</th>
                <th className="py-3 px-3">Jam Tutup</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formState.weeklySchedule.map((dayItem, idx) => (
                <tr key={dayItem.day} className={`hover:bg-slate-50/80 transition ${!dayItem.isOpen ? 'opacity-60 bg-slate-50/40' : ''}`}>
                  
                  {/* Nama Hari */}
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-slate-900 text-sm">{dayItem.dayName}</span>
                    {dayItem.day === 'wednesday' && (
                      <span className="block text-[9px] text-orange-600 font-bold">Hari Menu Spesial</span>
                    )}
                  </td>

                  {/* Toggle Buka / Libur */}
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleDay(idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        dayItem.isOpen
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dayItem.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span>{dayItem.isOpen ? 'Buka' : 'Libur / Tutup'}</span>
                    </button>
                  </td>

                  {/* Jam Buka */}
                  <td className="py-3 px-3">
                    <input
                      type="time"
                      disabled={!dayItem.isOpen}
                      value={dayItem.openTime || '08:00'}
                      onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                  </td>

                  {/* Jam Tutup */}
                  <td className="py-3 px-3">
                    <input
                      type="time"
                      disabled={!dayItem.isOpen}
                      value={dayItem.closeTime || '17:00'}
                      onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                  </td>

                  {/* Salin ke Semua Hari */}
                  <td className="py-3 px-3 text-right">
                    {dayItem.isOpen && (
                      <button
                        onClick={() => copyTimeToAllDays(dayItem)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 transition cursor-pointer"
                        title="Salin jam buka-tutup hari ini ke semua hari"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kustomisasi Tampilan Halaman Tutup */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-orange-500" />
          <span>Kustomisasi Teks Halaman Toko Tutup</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Halaman Tutup</label>
            <input
              type="text"
              value={formState.closedTitle}
              onChange={(e) => setFormState(prev => ({ ...prev, closedTitle: e.target.value }))}
              placeholder="Contoh: Toko Sedang Tutup"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pesan Pengumuman untuk Pengunjung</label>
            <textarea
              rows={3}
              value={formState.closedMessage}
              onChange={(e) => setFormState(prev => ({ ...prev, closedMessage: e.target.value }))}
              placeholder="Tuliskan pesan penutupan toko..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan / Spesial (Opsional)</label>
            <input
              type="text"
              value={formState.specialNote || ''}
              onChange={(e) => setFormState(prev => ({ ...prev, specialNote: e.target.value }))}
              placeholder="Contoh: Buka kembali besok pukul 08:00 WIB"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-orange-500 outline-hidden"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formState.allowPreorderWhatsApp}
                onChange={(e) => setFormState(prev => ({ ...prev, allowPreorderWhatsApp: e.target.checked }))}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
              />
              <span className="text-xs font-bold text-slate-800">
                Tampilkan Tombol Kontak WhatsApp saat toko sedang tutup
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Save Popup Bar (Satu-satunya Tombol Simpan) */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-full ${liveStatus.isOpen ? 'bg-emerald-500 animate-ping opacity-75' : 'bg-rose-500 animate-ping opacity-75'}`}></span>
            <span className={`absolute w-2.5 h-2.5 rounded-full ${liveStatus.isOpen ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">
              Mode: <b className="text-orange-400">{formState.statusMode === 'auto' ? 'Otomatis Sesuai Jadwal' : (formState.statusMode === 'force_open' ? 'Selalu Buka' : 'Tutup Sementara')}</b>
            </span>
            <span className="text-[10px] text-slate-400">
              Klik Simpan untuk menerapkan jadwal operasional baru ke website
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs sm:text-sm font-black transition shadow-lg shadow-orange-500/25 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Menyimpan Jadwal..." : "Simpan Jadwal Operasional"}</span>
        </button>
      </div>

    </div>
  );
}
