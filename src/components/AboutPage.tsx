import React from 'react';
import { 
  Users, 
  ArrowLeft, 
  GraduationCap, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Store, 
  Clock, 
  Award,
  ChevronRight,
  Settings,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings, TeamMember } from '../types';
import { defaultTeamMembers } from '../data/initialData';

interface AboutPageProps {
  onReturnToStore: () => void;
  onNavigateToAdmin: () => void;
  siteSettings: SiteSettings;
  teamMembers?: TeamMember[];
}

export default function AboutPage({
  onReturnToStore,
  onNavigateToAdmin,
  siteSettings,
  teamMembers = defaultTeamMembers
}: AboutPageProps) {
  const activeTeam = (teamMembers && teamMembers.length > 0) ? teamMembers : defaultTeamMembers;

  const getThemeStyle = (color?: string, idx: number = 0) => {
    const themes = {
      amber: {
        grad: "from-amber-400 via-orange-500 to-red-500",
        badgeStyle: "bg-amber-50 border-amber-200 text-amber-900",
        accentDot: "bg-amber-500",
        borderAccent: "border-amber-200"
      },
      sky: {
        grad: "from-sky-400 via-blue-500 to-indigo-600",
        badgeStyle: "bg-sky-50 border-sky-200 text-sky-900",
        accentDot: "bg-sky-500",
        borderAccent: "border-sky-200"
      },
      rose: {
        grad: "from-pink-400 via-rose-500 to-purple-600",
        badgeStyle: "bg-rose-50 border-rose-200 text-rose-900",
        accentDot: "bg-rose-500",
        borderAccent: "border-rose-200"
      },
      emerald: {
        grad: "from-emerald-400 via-teal-500 to-cyan-600",
        badgeStyle: "bg-emerald-50 border-emerald-200 text-emerald-900",
        accentDot: "bg-emerald-500",
        borderAccent: "border-emerald-200"
      },
      purple: {
        grad: "from-purple-400 via-fuchsia-500 to-indigo-600",
        badgeStyle: "bg-purple-50 border-purple-200 text-purple-900",
        accentDot: "bg-purple-500",
        borderAccent: "border-purple-200"
      }
    };
    const keys: (keyof typeof themes)[] = ['amber', 'sky', 'rose', 'emerald', 'purple'];
    const chosenKey = (color && themes[color as keyof typeof themes]) ? (color as keyof typeof themes) : keys[idx % keys.length];
    return themes[chosenKey];
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 antialiased selection:bg-orange-500 selection:text-white flex flex-col">
      <style>{`
        @keyframes kidBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(-4px) rotate(-3deg); }
          60% { transform: translateY(2px) rotate(2deg); }
        }
        @keyframes kidPopDot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35) rotate(15deg); }
        }
        .kid-font-about {
          font-size: 1.35rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .k-letter-s { color: #f59e0b; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0s; }
        .k-letter-o { color: #f97316; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.15s; }
        .k-letter-k { color: #ef4444; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.3s; }
        .k-letter-i { color: #06b6d4; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.45s; }
        .k-dot { color: #a855f7; display: inline-block; transform-origin: center; animation: kidPopDot 2s ease-in-out infinite; }
      `}</style>
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* Tombol Kembali + Brand Logo Soki (Menyatu Rapi & Ergonomis) */}
          <button
            onClick={onReturnToStore}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer group select-none text-left"
            title="Kembali ke Beranda Toko Soki"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 relative flex-shrink-0">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 8px rgba(234, 88, 12, 0.25))' }}>
                <defs>
                  <linearGradient id="sGoldGradAbout" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffedd5"/>
                    <stop offset="25%" stopColor="#fb923c"/>
                    <stop offset="70%" stopColor="#ea580c"/>
                    <stop offset="100%" stopColor="#9a3412"/>
                  </linearGradient>
                  <linearGradient id="neonSnakeGradAbout" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8"/>
                    <stop offset="50%" stopColor="#e0f2fe"/>
                    <stop offset="100%" stopColor="#0284c7"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
                <circle cx="50" cy="50" r="38" fill="#ea580c" fillOpacity="0.3"/>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
                <path d="M16 38 C14 20, 58 14, 82 26" stroke="url(#neonSnakeGradAbout)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <path d="M18 68 C16 50, 68 42, 84 56" stroke="url(#neonSnakeGradAbout)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <g>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#000000" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.45" transform="translate(0, 4)"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#sGoldGradAbout)" strokeWidth="13" strokeLinecap="round" fill="none"/>
                </g>
                <path d="M82 26 C88 38, 44 44, 18 68" stroke="url(#neonSnakeGradAbout)" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
                <path d="M84 56 C90 70, 48 80, 22 88" stroke="url(#neonSnakeGradAbout)" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center kid-font-about leading-none">
                <span className="k-letter-s">S</span>
                <span className="k-letter-o">O</span>
                <span className="k-letter-k">K</span>
                <span className="k-letter-i">I</span>
                <span className="k-dot">.</span>
              </div>
              <span className="text-[8px] sm:text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5">SNACK &bull; ICE BAR</span>
            </div>
          </button>

          {/* Sisi Kanan: Menu Toko (1 Baris Rapi) & Admin */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReturnToStore}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-full shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5 shrink-0" />
              <span>Menu Toko</span>
            </button>

            <button
              onClick={onNavigateToAdmin}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition active:scale-95 cursor-pointer shrink-0"
              title="Portal Admin"
              aria-label="Portal Admin"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN ABOUT CONTENT ================= */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 w-full">
        
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider mb-4 shadow-xs">
            <GraduationCap className="w-4 h-4 text-orange-600" />
            <span>{siteSettings.aboutBadge || "Karya Siswa Kelas 8B • Kelompok 3"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {siteSettings.aboutTitle || (
              <>
                Tentang Kami, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-red-600">Toko Soki</span>
              </>
            )}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {siteSettings.aboutSubtitle || "Selamat datang di Soki (Snack & Ice Bar)! Proyek usaha jajanan sekolah yang didirikan dan dikelola secara mandiri oleh tim Kelompok 3 Kelas 8B untuk menghadirkan camilan renyah berkualitas dan es manis segar favorit teman-teman."}
          </p>
        </div>

        {/* ================= TIM ANGGOTA KELOMPOK 3 ================= */}
        <div className="mb-14 sm:mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200/80 gap-3">
            <div>
              <div className="flex items-center gap-2 text-orange-600 text-xs font-extrabold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Struktur Tim & Tugas</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Anggota Kelompok 3 (Kelas 8B)
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {activeTeam.length} Anggota Berdedikasi &bull; Kelas 8B
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {activeTeam.map((member, index) => {
              const theme = getThemeStyle(member.themeColor, index);
              const initialLetter = member.initial || (member.name ? member.name.charAt(0).toUpperCase() : 'S');

              return (
                <div 
                  key={member.id || index}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Top Accent Gradient Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.grad}`}></div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {/* Avatar Inisial Huruf */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${theme.grad} text-white font-black text-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                        {initialLetter}
                      </div>

                      {/* Badge Nomor Absen */}
                      <span className={`px-3 py-1 rounded-full border font-mono font-black text-xs shadow-2xs ${theme.badgeStyle}`}>
                        {member.absen}
                      </span>
                    </div>

                    {/* Nama Anggota */}
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      {member.name}
                    </h3>

                    {/* Peran / Tugas */}
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-orange-600">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.accentDot}`}></span>
                      <span>
                        {member.role || "Anggota Tim"}
                      </span>
                    </div>

                    {/* Deskripsi Tanggung Jawab / Keterangan Kosong */}
                    {member.description ? (
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed whitespace-pre-line break-words">
                        {member.description}
                      </p>
                    ) : (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-400 italic leading-relaxed">
                        Keterangan tugas belum diisi
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      Kelas 8B
                    </span>
                    <span className="font-semibold text-slate-500">Kelompok 3</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= VISI, MISI & NILAI TOKO SOKI ================= */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm mb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-black tracking-wider uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Cerita & Nilai Toko
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
                Kisah & Komitmen Bersama
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Toko Soki lahir dari ide sederhana di jam istirahat sekolah: menghadirkan camilan gurih yang selalu renyah garing dan es stik segar yang manis dingin untuk mengembalikan energi belajar.
              </p>

              <div className="space-y-3 mt-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Jaminan Higienis & Kemasan Rapih</h4>
                    <p className="text-xs text-slate-500">Setiap pesanan makanan dan minuman disimpan dan ditangani dengan bersih dan rapi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Harga Ramah Kantong Pelajar</h4>
                    <p className="text-xs text-slate-500">Menu hemat dan terjangkau untuk seluruh siswa-siswi tanpa mengurangi cita rasa.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pemesanan Praktis Via Kasir Chat</h4>
                    <p className="text-xs text-slate-500">Bisa pesan lebih awal sehingga pesanan langsung siap diambil saat bel istirahat berbunyi.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Showcase Ringkas */}
            <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-red-500 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Slogan Toko Soki</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black leading-snug">
                  "Jajan Renyah, Segar Dingin, Semangat Belajar Setiap Hari!"
                </h4>
                <p className="text-xs text-orange-100 leading-relaxed">
                  Dikelola sepenuh hati oleh Valentino, Kleinegan, Karin, dan Rina dari Kelas 8B Kelompok 3.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/20 flex flex-wrap gap-2 items-center justify-between">
                <span className="text-[11px] font-bold text-orange-100">Siap jajan hari ini?</span>
                <button
                  onClick={onReturnToStore}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Buka Menu Jajanan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM CTA ================= */}
        <div className="text-center py-6">
          <button
            onClick={onReturnToStore}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Katalog Toko Soki</span>
          </button>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white py-8 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-black text-white tracking-wider">SOKI.</span>
              <span>&bull;</span>
              <span>Kelas 8B Kelompok 3</span>
            </div>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-slate-300">Developed by <strong className="text-orange-400 font-bold">Koko Ferri</strong></span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button 
              onClick={onReturnToStore} 
              className="hover:text-white transition cursor-pointer"
            >
              Katalog Menu
            </button>
            <span>&bull;</span>
            <button 
              onClick={onNavigateToAdmin} 
              className="hover:text-orange-400 transition cursor-pointer flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
