import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Clock, 
  MessageCircle, 
  ShieldAlert, 
  Eye, 
  CheckCircle2, 
  Calendar,
  ShoppingBag,
  Lock,
  X,
  ShieldCheck,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { MaintenanceConfig, SiteSettings } from '../types';

interface MaintenanceScreenProps {
  maintenance: MaintenanceConfig;
  siteSettings: SiteSettings;
  onBypass: () => void;
  onOpenAdmin?: () => void;
}

export default function MaintenanceScreen({
  maintenance,
  siteSettings,
  onBypass,
  onOpenAdmin
}: MaintenanceScreenProps) {
  // Countdown calculation if scheduledEnd is present
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretClickCount, setSecretClickCount] = useState(0);

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

  useEffect(() => {
    if (!maintenance.scheduledEnd) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(maintenance.scheduledEnd!).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60))),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [maintenance.scheduledEnd]);

  const whatsappUrl = `https://wa.me/${(siteSettings.whatsappNumber || '6281384998659').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Soki Kelompok 3, saya ingin bertanya tentang menu produk & pesanan.')}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Custom Styles Injection for Brand & Animations matching Landing Page */}
      <style>{`
        @keyframes snakeCrawlFront {
          0% { stroke-dashoffset: 120; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes snakeCrawlBack {
          0% { stroke-dashoffset: 90; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes sCoreFloat {
          0%, 100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.45)); }
          50% { transform: translateY(-2.5px) scale(1.03); filter: drop-shadow(0 0 12px rgba(251, 146, 60, 0.8)); }
        }
        @keyframes iceCubeHover1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-3px, -4px) rotate(22deg); }
        }
        @keyframes iceCubeHover2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(3px, 4px) rotate(-20deg); }
        }
        @keyframes borderGlowPulse {
          0%, 100% { stroke: #ea580c; stroke-width: 2.5; }
          50% { stroke: #38bdf8; stroke-width: 3.5; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6)); }
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
        .kid-font-maint {
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
      <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Header */}
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
                <linearGradient id="sGoldGradMaint" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffedd5"/>
                  <stop offset="25%" stopColor="#fb923c"/>
                  <stop offset="70%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#9a3412"/>
                </linearGradient>
                <linearGradient id="neonSnakeGradMaint" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8"/>
                  <stop offset="50%" stopColor="#e0f2fe"/>
                  <stop offset="100%" stopColor="#0284c7"/>
                </linearGradient>
                <radialGradient id="centerGlowMaint" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.45"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
              <circle cx="50" cy="50" r="38" fill="url(#centerGlowMaint)"/>
              <rect className="anim-logo-badge" x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
              <path className="anim-snake-line-back" d="M16 38 C14 20, 58 14, 82 26" stroke="url(#neonSnakeGradMaint)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <path className="anim-snake-line-back" d="M18 68 C16 50, 68 42, 84 56" stroke="url(#neonSnakeGradMaint)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <g className="anim-s-core">
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#000000" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.45" transform="translate(0, 4)"/>
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#sGoldGradMaint)" strokeWidth="13" strokeLinecap="round" fill="none"/>
                <path d="M42 27 C46 25, 56 25, 61 28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none"/>
              </g>
              <path className="anim-snake-line-front" d="M82 26 C88 38, 44 44, 18 68" stroke="url(#neonSnakeGradMaint)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
              <path className="anim-snake-line-front" d="M84 56 C90 70, 48 80, 22 88" stroke="url(#neonSnakeGradMaint)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
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
          <div className="flex flex-col text-left">
            <div className="flex items-center kid-font-maint leading-none">
              <span className="k-letter-s">S</span>
              <span className="k-letter-o">O</span>
              <span className="k-letter-k">K</span>
              <span className="k-letter-i">I</span>
              <span className="k-dot">.</span>
            </div>
            <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">SNACK &bull; ICE BAR</span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Pemeliharaan Sistem</span>
        </div>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center my-auto">
        
        {/* Floating Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-6 shadow-lg shadow-orange-500/10 animate-pulse">
          <Wrench className="w-4 h-4 text-orange-400 animate-spin-slow" />
          <span>{maintenance.reason || "Pembaruan Website & Menu Baru"}</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4">
          {maintenance.title || "Website Sedang Dalam Perbaikan"}
        </h1>

        {/* Descriptive Message */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 font-medium">
          {maintenance.message || "Kami dari Kelas 8B Kelompok 3 sedang mempersiapkan menu makanan baru, penyesuaian harga promo terbaik, dan pemeliharaan website. Website akan segera dibuka kembali!"}
        </p>

        {/* Countdown Timer Block (If Scheduled Time Set) */}
        {timeLeft && (
          <div className="max-w-md mx-auto mb-8 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Perkiraan Selesai Dalam
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-2xl sm:text-3xl font-black text-orange-400 block">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Jam</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-2xl sm:text-3xl font-black text-sky-400 block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Menit</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Detik</span>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Info Card (If date set but no live countdown or alongside) */}
        {!timeLeft && maintenance.estimatedTime && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-bold mb-8">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span>Target Rilis: <b className="text-white">{maintenance.estimatedTime}</b></span>
          </div>
        )}

        {/* Feature / Update Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto mb-10 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Menu Baru</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Persiapan menu makanan & minuman pilihan.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Promo Diskon</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Paket hemat istimewa untuk hari Rabu.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Sistem Pesan</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Pengalaman belanja lebih cepat & mudah.</p>
            </div>
          </div>
        </div>

        {/* Main Action Buttons: Only WhatsApp for public */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          {/* WhatsApp Direct Inquiries */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition duration-200 active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Tanya Admin via WhatsApp</span>
          </a>
        </div>

      </main>

      {/* Footer with Discreet Hidden Admin Trigger */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 text-center text-xs text-slate-500 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
        <p>&copy; {new Date().getFullYear()} Soki Kelompok 3 Kelas 8B &bull; Sistem Pemeliharaan Website</p>
        
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          <span 
            onClick={handleSecretTrigger}
            className="cursor-pointer select-none"
            title="Soki"
          >
            Developed by <strong className="text-orange-400 font-bold">Koko</strong>
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
