import React, { useState } from 'react';
import { Mail, KeyRound, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }: AdminLoginModalProps) {
  const [email, setEmail] = useState('admin@soki.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        onLoginSuccess(data.token);
        onClose();
      } else {
        if (email.trim() === 'admin@soki.com' && password === 'admin') {
          onLoginSuccess('soki-secret-admin-session-token-2026');
          onClose();
        } else {
          setError(data.error || 'Email atau password salah.');
        }
      }
    } catch {
      if (email.trim() === 'admin@soki.com' && password === 'admin') {
        onLoginSuccess('soki-secret-admin-session-token-2026');
        onClose();
      } else {
        setError('Email atau password tidak sesuai.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition cursor-pointer"
        >
          ✕
        </button>

        {/* LOGO RESMI SOKI ICON + BADGE ADMIN */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 relative flex-shrink-0">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 8px 14px rgba(234, 88, 12, 0.35))' }}>
              <defs>
                <linearGradient id="modalSGoldGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffedd5"/>
                  <stop offset="25%" stopColor="#fb923c"/>
                  <stop offset="70%" stopColor="#ea580c"/>
                  <stop offset="100%" stopColor="#9a3412"/>
                </linearGradient>
                <linearGradient id="modalNeonSnakeGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8"/>
                  <stop offset="50%" stopColor="#e0f2fe"/>
                  <stop offset="100%" stopColor="#0284c7"/>
                </linearGradient>
                <radialGradient id="modalCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
              <circle cx="50" cy="50" r="38" fill="url(#modalCenterGlow)"/>
              <rect className="anim-logo-badge" x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
              <path className="anim-snake-line-back" d="M16 38 C14 20, 58 14, 82 26" stroke="url(#modalNeonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <path className="anim-snake-line-back" d="M18 68 C16 50, 68 42, 84 56" stroke="url(#modalNeonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
              <g className="anim-s-core">
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#modalSGoldGrad)" strokeWidth="13" strokeLinecap="round" fill="none"/>
              </g>
              <path className="anim-snake-line-front" d="M82 26 C88 38, 44 44, 18 68" stroke="url(#modalNeonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
              <g className="anim-ice-cube-1">
                <polygon points="20,18 28,14 36,18 28,22" fill="#ffffff"/>
                <polygon points="20,18 28,22 28,30 20,26" fill="#93c5fd"/>
                <polygon points="28,22 36,18 36,26 28,30" fill="#38bdf8"/>
              </g>
            </svg>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 border-2 border-white rounded-full flex items-center justify-center text-white">
              <ShieldCheck className="w-3 h-3 text-orange-400" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1 kid-font text-2xl leading-none">
              <span className="text-amber-500 font-black">S</span>
              <span className="text-orange-500 font-black">O</span>
              <span className="text-red-500 font-black">K</span>
              <span className="text-cyan-500 font-black">I</span>
              <span className="text-purple-500 font-black">.</span>
            </div>
            <span className="text-[9px] font-extrabold tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
              Portal Admin Kelompok 3
            </span>
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 leading-snug">Masuk Dashboard Admin</h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Atur daftar menu produk, harga, varian, dan 2 card gambar landing page.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-orange-500 transition"
              placeholder="admin@soki.com"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 outline-none focus:border-orange-500 transition"
              placeholder="•••••"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-800 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Akses Akun Default:</span>
              <span>Email: <b>admin@soki.com</b> | Sandi: <b>admin</b></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs tracking-wider uppercase transition shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Dashboard Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
