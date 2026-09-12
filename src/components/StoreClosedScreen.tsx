import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Store, 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Lock,
  X,
  ShieldCheck,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { SiteSettings, StoreScheduleConfig, DaySchedule } from '../types';
import { getStoreStatus, StoreStatusResult, defaultWeeklySchedule, defaultStoreSchedule } from '../utils/scheduleHelper';

interface StoreClosedScreenProps {
  siteSettings: SiteSettings;
  onBypass: () => void;
  onOpenAdmin?: () => void;
}

export default function StoreClosedScreen({
  siteSettings,
  onBypass,
  onOpenAdmin
}: StoreClosedScreenProps) {
  const scheduleConfig: StoreScheduleConfig = siteSettings?.storeSchedule || defaultStoreSchedule;
  const status: StoreStatusResult = getStoreStatus(scheduleConfig);
  const [showFullSchedule, setShowFullSchedule] = useState(true);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);
  const [currentRealTime, setCurrentRealTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  });

  // Keyboard shortcut Ctrl+Shift+A for instant admin access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowSecretModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSecretTrigger = () => {
    setSecretClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setShowSecretModal(true);
        return 0;
      }
      return next;
    });
  };

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentRealTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const cleanPhone = (siteSettings.whatsappNumber || "081384998659").replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Halo Admin SOKI, saya ingin bertanya tentang jadwal buka toko atau ingin pre-order menu untuk jadwal berikutnya.`
  )}`;

  const weekly = scheduleConfig.weeklySchedule && scheduleConfig.weeklySchedule.length > 0 
    ? scheduleConfig.weeklySchedule 
    : defaultWeeklySchedule;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Custom Styles Injection for Brand & Animations */}
      <style>{`
        @keyframes snakeCrawlFront {
          0% { stroke-dashoffset: 120; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes snakeCrawlBack {
          0% { stroke-dashoffset: 90; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes kidBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-4px) rotate(-3deg); }
          60% { transform: translateY(2px) rotate(2deg); }
        }
        @keyframes kidPopDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35) rotate(15deg); }
        }
        .kid-font-store {
          font-size: 1.85rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }
        .k-letter-s { color: #f59e0b; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0s; }
        .k-letter-o { color: #f97316; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.15s; }
        .k-letter-k { color: #ef4444; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.3s; }
        .k-letter-i { color: #06b6d4; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.45s; }
        .k-dot { color: #a855f7; display: inline-block; transform-origin: center; animation: kidPopDot 2s ease-in-out infinite; }
      `}</style>

      {/* Background Decorative Neon Lights & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 flex items-center justify-between">
        {/* Brand Logo - Sama Persis dengan Landing Page & Rahasia Klik 3x */}
        <div 
          onClick={handleSecretTrigger}
          className="flex items-center gap-3 select-none cursor-pointer"
          title="Soki Snack & Ice Bar"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 relative flex-shrink-0">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 8px 16px rgba(234, 88, 12, 0.35))' }}>
              <defs>
                <linearGradient id="sGoldGradStore" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffedd5"/>
                  <stop offset="25%" stopColor="#fb923c"/>
                  <stop offset="70%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#9a3412"/>
                </linearGradient>
                <linearGradient id="neonSnakeGradStore" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8"/>
                  <stop offset="50%" stopColor="#e0f2fe"/>
                  <stop offset="100%" stopColor="#0284c7"/>
                </linearGradient>
                <radialGradient id="centerGlowStore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.45"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
              <circle cx="50" cy="50" r="38" fill="url(#centerGlowStore)"/>
              <rect x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
              <path d="M16 38 C14 20, 58 14, 82 26" stroke="url(#neonSnakeGradStore)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <path d="M18 68 C16 50, 68 42, 84 56" stroke="url(#neonSnakeGradStore)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <g>
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#000000" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.45" transform="translate(0, 4)"/>
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#sGoldGradStore)" strokeWidth="13" strokeLinecap="round" fill="none"/>
              </g>
              <path d="M82 26 C88 38, 44 44, 18 68" stroke="url(#neonSnakeGradStore)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
              <path d="M84 56 C90 70, 48 80, 22 88" stroke="url(#neonSnakeGradStore)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center kid-font-store leading-none">
              <span className="k-letter-s">S</span>
              <span className="k-letter-o">O</span>
              <span className="k-letter-k">K</span>
              <span className="k-letter-i">I</span>
              <span className="k-dot">.</span>
            </div>
            <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">SNACK &bull; ICE BAR</span>
          </div>
        </div>

        {/* Real-time Clock Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono font-bold text-amber-400 shadow-md">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>{currentRealTime || 'WIB'}</span>
        </div>
      </header>

      {/* Main Center Container */}
      <main className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center text-center">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-black tracking-wide uppercase shadow-lg shadow-rose-500/10 mb-6 animate-pulse">
          <Store className="w-4 h-4 text-rose-400" />
          <span>{status.statusLabel}</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-2xl leading-tight sm:leading-tight">
          {scheduleConfig.closedTitle || "Toko Sedang Tutup"}
        </h1>

        {/* Custom Message */}
        <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
          {scheduleConfig.closedMessage || "Halo! Toko kami saat ini sedang tutup dan akan buka kembali sesuai jadwal operasional. Silakan hubungi kami untuk pre-order."}
        </p>

        {/* Next Opening Highlight Card */}
        <div className="mt-6 w-full max-w-md bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 text-left shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300/90 uppercase tracking-widest font-black block">Jadwal Buka Berikutnya</span>
              <span className="text-sm sm:text-base font-black text-white">{status.nextOpeningText}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-bold text-slate-300 shrink-0 border border-slate-700">
            {status.currentDayName}
          </span>
        </div>

        {/* Weekly Schedule Accordion / Table */}
        <div className="mt-6 w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-left backdrop-blur-sm">
          <div 
            onClick={() => setShowFullSchedule(!showFullSchedule)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Jadwal Jam Operasional</h3>
            </div>
            <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold">
              <span>{showFullSchedule ? 'Sembunyikan' : 'Lihat Semua'}</span>
              {showFullSchedule ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showFullSchedule && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              {weekly.map((dayItem) => {
                const isToday = dayItem.dayName.toLowerCase() === status.currentDayName.toLowerCase();
                return (
                  <div 
                    key={dayItem.day}
                    className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs sm:text-sm transition ${
                      isToday 
                        ? 'bg-orange-500/15 border border-orange-500/40 text-white font-bold' 
                        : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-orange-400 animate-ping' : (dayItem.isOpen ? 'bg-emerald-500/60' : 'bg-slate-600')}`}></span>
                      <span className={isToday ? 'text-orange-300 font-black' : 'text-slate-300'}>
                        {dayItem.dayName} {isToday && <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded ml-1 font-extrabold">HARI INI</span>}
                      </span>
                    </div>

                    <div className="font-mono">
                      {dayItem.isOpen ? (
                        <span className="text-slate-200">{dayItem.openTime} - {dayItem.closeTime} WIB</span>
                      ) : (
                        <span className="text-rose-400/90 font-bold bg-rose-500/10 px-2 py-0.5 rounded text-xs">Libur / Tutup</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {scheduleConfig.specialNote && (
                <div className="mt-3 pt-2 text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{scheduleConfig.specialNote}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Only WhatsApp for public */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {/* WhatsApp Contact / Help */}
          {scheduleConfig.allowPreorderWhatsApp && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition duration-200 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Hubungi Admin via WhatsApp</span>
            </a>
          )}
        </div>

      </main>

      {/* Footer with Discreet Hidden Admin Trigger */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        <p>&copy; {new Date().getFullYear()} Soki Kelompok 3 Kelas 8B &bull; Jadwal Buka &amp; Operasional</p>
        
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span 
            onClick={handleSecretTrigger}
            className="cursor-pointer select-none"
            title="Soki"
          >
            Developed by <strong className="text-orange-400 font-bold">Koko Ferri</strong>
          </span>
          {/* Subtle discreet lock icon only admin knows to click */}
          <button 
            type="button"
            onClick={() => setShowSecretModal(true)}
            className="opacity-15 hover:opacity-90 transition p-1 text-slate-400 hover:text-orange-400 cursor-pointer rounded"
            title="Akses Pengelola"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </footer>

      {/* MODAL RAHASIA KHUSUS ADMIN & PENGELOLA */}
      {showSecretModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-left relative overflow-hidden">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowSecretModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Akses Khusus Admin / Pengembang</h3>
                <p className="text-xs text-slate-400">Pilih tindakan yang ingin Anda lakukan</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Opsi 1: Masuk Panel Admin Langsung */}
              <button
                type="button"
                onClick={() => {
                  setShowSecretModal(false);
                  if (onOpenAdmin) onOpenAdmin();
                  else window.location.assign('/admin');
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/30 transition duration-200 active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Buka Panel Admin &amp; Kasir</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Opsi 2: Buka Mode Perancangan (Bypass) */}
              <button
                type="button"
                onClick={() => {
                  setShowSecretModal(false);
                  onBypass();
                }}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition duration-200 active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Buka Pratinjau Website (Mode Perancangan)</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <p className="mt-5 text-center text-[11px] text-slate-500">
              Tips: Anda juga dapat menekan kombinasi tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">Ctrl + Shift + A</kbd>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
