import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  CloudUpload, 
  Check, 
  RefreshCw, 
  Sparkles,
  Store,
  Tag,
  BadgePercent,
  Layers,
  FileText,
  DollarSign,
  Eye,
  Plus,
  X,
  Flame,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Calculator,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { MenuItem } from '../types';
import { validateImageFile, uploadToGoogleDriveWebhook } from '../utils/imageUpload';

// Pilihan preset foto siap pakai berkualitas tinggi untuk Snack & Es Soki
const PRESET_PRODUCT_IMAGES = [
  {
    title: 'Es Kiko / Es Stik Buah',
    category: 'es',
    url: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&q=85'
  },
  {
    title: 'Es Buah Segar Berwarna',
    category: 'es',
    url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=800&q=85'
  },
  {
    title: 'Es Sirup Dingin Dahaga',
    category: 'es',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=85'
  },
  {
    title: 'Cemilan Renyah Gurih',
    category: 'snack',
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=85'
  },
  {
    title: 'Keripik Gurih Bumbu',
    category: 'snack',
    url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=85'
  },
  {
    title: 'Stick Renyah Gurih',
    category: 'snack',
    url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85'
  }
];

interface ProductFormPageProps {
  productId?: string;
  menuItems: MenuItem[];
  adminToken: string;
  onSaveProduct: (savedItem: MenuItem, isNew: boolean) => void;
  onBack: () => void;
  showStatus: (text: string, type?: 'success' | 'error') => void;
}

export default function ProductFormPage({
  productId,
  menuItems,
  adminToken,
  onSaveProduct,
  onBack,
  showStatus
}: ProductFormPageProps) {
  const isNew = !productId || productId === 'new';
  
  const [product, setProduct] = useState<MenuItem>(() => {
    if (!isNew) {
      const found = menuItems.find(m => m.id === productId);
      if (found) return { ...found };
    }
    return {
      id: 'item-' + Date.now(),
      name: '',
      category: 'makanan',
      price: 3000,
      costPrice: 1500,
      stock: 50,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
      badge: 'Cemilan Renyah',
      variants: [],
      promoInfo: '',
      promoPrice: 0,
      promoMinQty: 2,
      promoActive: false,
      available: true
    };
  });

  const [newVariantInput, setNewVariantInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFinished, setUploadFinished] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [saving, setSaving] = useState(false);

  // Synchronize URL path to /soki/produk-xx/
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = isNew ? 'produk-baru' : `produk-${product.id}`;
      window.history.pushState(null, '', `/soki/${slug}/`);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', '/admin');
      }
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const check = validateImageFile(file);
    if (!check.valid) {
      showStatus(check.error || "File tidak valid", "error");
      e.target.value = '';
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);

    setUploadProgress(15);
    setUploadFinished(false);
    setUploadStatusText('Mengunggah ke Google Drive...');

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 15;
        if (prev >= 88) return prev;
        return Math.min(88, prev + Math.floor(Math.random() * 8) + 6);
      });
    }, 120);

    try {
      const result = await uploadToGoogleDriveWebhook(file, adminToken, 'product', (statusMsg) => {
        setUploadStatusText(statusMsg);
      });
      clearInterval(progressInterval);

      setUploadProgress(100);
      setUploadFinished(true);
      setUploadStatusText('Berhasil diunggah!');

      setProduct(prev => ({ ...prev, imageUrl: result.url || localPreviewUrl }));
      showStatus(`Foto produk "${file.name}" berhasil diunggah!`, 'success');

      setTimeout(() => {
        setUploadProgress(null);
        setUploadFinished(false);
        setUploadStatusText('');
      }, 1500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(null);
      setUploadFinished(false);
      setUploadStatusText('');
      showStatus(`Gagal mengunggah foto: ${err.message}`, 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleAddVariant = () => {
    const val = newVariantInput.trim();
    if (!val) return;
    if (product.variants && product.variants.includes(val)) {
      showStatus(`Varian "${val}" sudah ada!`, 'error');
      return;
    }
    const updated = [...(product.variants || []), val];
    setProduct(prev => ({ ...prev, variants: updated }));
    setNewVariantInput('');
  };

  const handleRemoveVariant = (idx: number) => {
    const updated = (product.variants || []).filter((_, i) => i !== idx);
    setProduct(prev => ({ ...prev, variants: updated }));
  };

  // Helper untuk menerapkan template promo cepat (misal: "Beli 2 hanya Rp5.000")
  const applyPromoTemplate = (minQty: number, promoPrice: number, label: string) => {
    setProduct(prev => ({
      ...prev,
      promoActive: true,
      promoMinQty: minQty,
      promoPrice: promoPrice,
      promoInfo: label
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!product.name.trim()) {
      showStatus('Nama produk wajib diisi!', 'error');
      return;
    }

    setSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const endpoint = isNew ? '/api/admin/menu' : `/api/admin/menu/${product.id}`;

      const payload = {
        ...product,
        price: Number(product.price) || 0,
        costPrice: product.costPrice !== undefined ? Number(product.costPrice) : 0,
        stock: product.stock !== undefined && product.stock !== null && (product.stock as any) !== '' ? Math.max(0, Number(product.stock)) : undefined,
        promoPrice: product.promoPrice !== undefined ? Number(product.promoPrice) : undefined,
        promoMinQty: product.promoMinQty !== undefined ? Number(product.promoMinQty) : undefined,
        promoActive: Boolean(product.promoActive)
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 200 || res.status === 201) {
        const data = await res.json().catch(() => ({}));
        const savedItem = data.product || payload;
        onSaveProduct(savedItem, isNew);
        showStatus(`Produk "${product.name}" berhasil disimpan ke Database!`, 'success');
        onBack();
      } else {
        const errData = await res.json().catch(() => ({}));
        showStatus(`Gagal menyimpan ke database: ${errData.error || 'Terjadi kesalahan server (' + res.status + ')'}`, 'error');
      }
    } catch (err: any) {
      showStatus(`Gagal terhubung ke database server: ${err.message || 'Koneksi terputus'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Kalkulasi diskon hemat
  const normalBundlePrice = (product.price || 0) * (product.promoMinQty || 2);
  const promoBundlePrice = product.promoPrice || 0;
  const hematAmount = normalBundlePrice - promoBundlePrice;
  const hematPercent = normalBundlePrice > 0 ? Math.round((hematAmount / normalBundlePrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col antialiased selection:bg-orange-500 selection:text-white">
      
      {/* Top Header Sticky Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:h-16 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isNew ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></span>
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wide truncate">
                {isNew ? 'Tambah Menu Baru' : 'Edit Menu Produk'}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
            {/* View Switcher: Edit or Live Preview on Mobile */}
            <div className="w-full sm:w-auto flex items-center justify-center bg-slate-100 p-1 rounded-xl text-xs font-extrabold">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg transition ${activeTab === 'edit' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Formulir
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${activeTab === 'preview' ? 'bg-white text-orange-600 shadow-2xs' : 'text-slate-500'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{saving ? 'Menyimpan...' : 'Simpan Produk'}</span>
              <span className="sm:hidden">{saving ? 'Simpan' : 'Simpan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold mb-3 tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Soki Interactive Menu Studio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {isNew ? 'Buat & Rilis Produk Baru' : `Pengaturan: ${product.name || 'Menu Soki'}`}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                Sesuaikan detail tampilan kartu menu, harga, promo diskon, varian rasa favorit siswa, dan foto resolusi tinggi secara langsung.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[11px] font-bold text-slate-400">Status Ketersediaan:</span>
              <button
                type="button"
                onClick={() => setProduct(prev => ({ ...prev, available: !prev.available }))}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                  product.available !== false 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${product.available !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                <span>{product.available !== false ? 'Tersedia di Toko' : 'Stok Habis / Nonaktif'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Form on Left, Live Card Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Fields */}
          <div className={`lg:col-span-7 space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Section 1: Informasi Dasar */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Informasi Utama Produk</h3>
                  <p className="text-xs text-slate-400">Nama, kategori, harga, dan ketersediaan menu</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Nama Menu Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                    placeholder="Contoh: Aneka Cemilan Gurih atau Es Segar"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Kategori Menu
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProduct({ ...product, category: 'makanan' })}
                        className={`p-3.5 rounded-2xl border-2 text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          product.category === 'makanan'
                            ? 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
                            : 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-orange-200 text-orange-900 hover:border-orange-300'
                        }`}
                      >
                        <span className="text-xl p-1.5 rounded-xl bg-white/80 shadow-xs">🍲</span>
                        <span>Makanan</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProduct({ ...product, category: 'minuman' })}
                        className={`p-3.5 rounded-2xl border-2 text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          product.category === 'minuman'
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]'
                            : 'bg-gradient-to-br from-cyan-50 to-blue-50/50 border-cyan-200 text-cyan-900 hover:border-cyan-300'
                        }`}
                      >
                        <span className="text-xl p-1.5 rounded-xl bg-white/80 shadow-xs">🥤</span>
                        <span>Minuman</span>
                      </button>
                    </div>
                  </div>

                  {/* Harga Jual, Modal Awal (HPP), & Stok Barang */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        Harga Jual Satuan (Rp) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                          Rp
                        </div>
                        <input
                          type="number"
                          required
                          min="0"
                          step="500"
                          value={product.price || ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            setProduct({ ...product, price: isNaN(val) ? 0 : val });
                          }}
                          placeholder="3000"
                          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-900 text-sm outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                          Modal Awal (HPP)
                        </label>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Biaya
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                          Rp
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={product.costPrice ? product.costPrice : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            setProduct({ ...product, costPrice: isNaN(val) ? 0 : val });
                          }}
                          placeholder="1500"
                          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-900 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                          Stok Tersedia
                        </label>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          (product.stock ?? 0) <= 0 
                            ? 'bg-rose-50 text-rose-600 border-rose-200' 
                            : (product.stock ?? 0) <= 10 
                              ? 'bg-amber-50 text-amber-600 border-amber-200' 
                              : 'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {(product.stock ?? 0) <= 0 ? 'Habis' : (product.stock ?? 0) <= 10 ? 'Menipis' : 'Aman'}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                          📦
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={product.stock !== undefined ? product.stock : ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                            const parsed = val !== undefined && !isNaN(val) ? Math.max(0, val) : undefined;
                            setProduct({ 
                              ...product, 
                              stock: parsed,
                              available: parsed !== undefined ? parsed > 0 : product.available 
                            });
                          }}
                          placeholder="50"
                          className="w-full pl-12 pr-14 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-900 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition"
                        />
                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs text-slate-400 font-bold">
                          Porsi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kalkulator Laba Bersih & Margin Real-Time */}
                  {(() => {
                    const price = product.price || 0;
                    const cost = product.costPrice || 0;
                    const profitPerUnit = price - cost;
                    const marginPercent = price > 0 ? Math.round((profitPerUnit / price) * 100) : 0;
                    const isProfitable = profitPerUnit > 0;

                    return (
                      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isProfitable 
                          ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border-emerald-200 text-emerald-950' 
                          : profitPerUnit === 0 
                            ? 'bg-slate-50 border-slate-200 text-slate-700' 
                            : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-white shadow-2xs font-bold text-sm">
                            {isProfitable ? '📈' : profitPerUnit === 0 ? '⚖️' : '⚠️'}
                          </span>
                          <div>
                            <span className="font-extrabold block text-slate-800">
                              Estimasi Laba Bersih per Porsi:
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Otomatis terhubung ke Laporan Penjualan Harian
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span className={`text-sm font-black block font-mono ${isProfitable ? 'text-emerald-700' : 'text-slate-700'}`}>
                              Rp {profitPerUnit.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              Laba / Porsi
                            </span>
                          </div>
                          <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${
                            isProfitable 
                              ? 'bg-emerald-600 text-white shadow-xs' 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            Margin {marginPercent}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="sm:hidden pt-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Status Ketersediaan
                  </label>
                  <button
                    type="button"
                    onClick={() => setProduct(prev => ({ ...prev, available: !prev.available }))}
                    className={`w-full p-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border transition ${
                      product.available !== false 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    <span>{product.available !== false ? '✅ Tersedia di Toko' : '❌ Stok Habis'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Foto Produk & Galeri Visual Menarik */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Foto & Visual Produk</h3>
                    <p className="text-xs text-slate-400">Unggah foto dari galeri HP atau komputer</p>
                  </div>
                </div>

                {product.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setProduct({ ...product, imageUrl: '' })}
                    className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Foto</span>
                  </button>
                )}
              </div>

              {/* Large Image Preview Box with Quick Action */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
                {product.imageUrl ? (
                  <div className="relative h-48 sm:h-56 w-full bg-slate-900">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name || 'Foto Produk'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                      <div className="text-white space-y-0.5">
                        <span className="text-[10px] font-mono bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full inline-block">
                          Foto Aktif Terpasang
                        </span>
                        <p className="text-xs font-bold text-slate-200 truncate max-w-sm">
                          {product.imageUrl}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 sm:h-48 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-orange-50/50 to-slate-50 border-2 border-dashed border-orange-200/80 rounded-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 shadow-xs">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <span className="font-extrabold text-slate-800 text-sm">Belum Ada Foto Produk</span>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Unggah foto lezat untuk menarik minat beli anak sekolah!
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Section */}
              <div className="p-5 rounded-2xl border border-orange-200/80 bg-orange-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                      <CloudUpload className="w-4 h-4 text-orange-500" />
                      Ambil atau Unggah dari Galeri
                    </h4>
                    <p className="text-xs text-slate-500">Mendukung format JPG, PNG, WEBP (Otomatis tersimpan)</p>
                  </div>
                  
                  <label className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer font-black text-xs transition shadow-xs active:scale-95 whitespace-nowrap ${
                    uploadProgress !== null
                      ? 'bg-orange-100 text-orange-600 pointer-events-none'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}>
                    {uploadProgress !== null ? (
                      uploadFinished ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Terpasang!</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{Math.round(uploadProgress)}%</span>
                        </>
                      )
                    ) : (
                      <>
                        <CloudUpload className="w-4 h-4" />
                        <span>Pilih File Gambar</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      disabled={uploadProgress !== null}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgress !== null && !uploadFinished && (
                  <div className="w-full bg-slate-900 p-3 rounded-xl text-white space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-orange-300">{uploadStatusText}</span>
                      <span className="font-mono">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Badge Input */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                  Label Visual / Badge Promo
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={product.badge || ''}
                    onChange={(e) => setProduct({ ...product, badge: e.target.value })}
                    placeholder="Contoh: Cemilan Renyah, Segar Dingin, Best Seller"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                  <div className="flex flex-wrap gap-1 items-center">
                    {['Cemilan Renyah', 'Segar Dingin', 'Terlaris 🔥', 'Paling Hemat'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setProduct({ ...product, badge: preset })}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition whitespace-nowrap cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Section 3: Pengaturan Promo Harga & Diskon Beli Banyak */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                    <BadgePercent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Fitur Promo & Diskon Paket</h3>
                    <p className="text-xs text-slate-400">Atur harga diskon setelah promo, misal: beli 2 hanya Rp5.000</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Aktifkan Promo:</span>
                  <button
                    type="button"
                    onClick={() => setProduct(prev => ({ ...prev, promoActive: !prev.promoActive }))}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      product.promoActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                      product.promoActive ? 'left-6.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Promo Controls Container */}
              <div className="space-y-4">

                {/* Input Fields: Jumlah Minimal & Harga Promo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Syarat Minimal Beli (Jumlah Item)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        value={product.promoMinQty || ''}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          const val = rawVal === '' ? 0 : Math.max(1, parseInt(rawVal, 10));
                          setProduct(prev => ({
                            ...prev,
                            promoMinQty: isNaN(val) ? 0 : val,
                            promoInfo: prev.promoPrice && prev.promoPrice > 0
                              ? `beli ${val || 2} hanya Rp${prev.promoPrice.toLocaleString('id-ID')}!!`
                              : prev.promoInfo
                          }));
                        }}
                        placeholder="2"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-900 text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                      <span className="absolute right-4 top-3 text-xs font-bold text-slate-400 pointer-events-none">
                        pcs / bungkus
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Misal: masukkan <strong>2</strong> untuk "Beli 2"</p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Harga Total Setelah Promo (Rp)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                        Rp
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={product.promoPrice ? product.promoPrice : ''}
                        onChange={(e) => {
                          const rawVal = e.target.value;
                          const pPrice = rawVal === '' ? 0 : parseInt(rawVal, 10);
                          const safePrice = isNaN(pPrice) ? 0 : pPrice;
                          setProduct(prev => ({
                            ...prev,
                            promoPrice: safePrice,
                            promoInfo: safePrice > 0 
                              ? `beli ${prev.promoMinQty || 2} hanya Rp${safePrice.toLocaleString('id-ID')}!!` 
                              : prev.promoInfo
                          }));
                        }}
                        placeholder="5000"
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-900 text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Misal: masukkan <strong>5000</strong></p>
                  </div>
                </div>

                {/* Kalkulasi Ringkasan Promo */}
                {product.promoActive && product.promoPrice && product.promoPrice > 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black">
                          Kalkulasi: Beli {product.promoMinQty || 2} porsi seharga Rp {product.promoPrice.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          Harga normal: Rp {normalBundlePrice.toLocaleString('id-ID')} • Pelanggan lebih hemat Rp {Math.max(0, hematAmount).toLocaleString('id-ID')} ({hematPercent}%)
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black whitespace-nowrap self-start sm:self-auto">
                      Diskon {hematPercent}%
                    </span>
                  </div>
                ) : null}

                {/* Teks Deskripsi Promo pada Pelanggan */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Teks Label Promo (Ditampilkan di Kartu Produk)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-500 font-bold">
                      <Flame className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={product.promoInfo || ''}
                      onChange={(e) => setProduct({ ...product, promoInfo: e.target.value })}
                      placeholder="Contoh: beli 2 hanya Rp5.000!! atau untuk semua rasa"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm outline-none focus:border-orange-500 focus:bg-white transition"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['beli 2 hanya Rp5.000!!', 'untuk semua rasa', 'promo jumat berkah', 'beli 3 gratis 1'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setProduct({ ...product, promoInfo: tag })}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold border border-orange-200 transition cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Varian Rasa Chips */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Pilihan Varian Rasa (Minimal 1)
                  </label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newVariantInput}
                      onChange={(e) => setNewVariantInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddVariant();
                        }
                      }}
                      placeholder="Ketik rasa (cth: Balado, Cokelat, Melon) lalu tekan Tambah"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 text-xs outline-none focus:border-orange-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  </div>

                  {/* Varian chips list */}
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[50px] items-center">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-800 text-xs font-bold"
                        >
                          <span>{v}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="w-4 h-4 rounded-full hover:bg-red-100 hover:text-red-600 flex items-center justify-center text-slate-400 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada varian rasa. Tambahkan di atas.</span>
                    )}
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Deskripsi Singkat Menu
                  </label>
                  <textarea
                    rows={3}
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                    placeholder="Jelaskan cita rasa gurih, sensasi dingin, atau keunikan menu ini untuk menggugah selera pelanggan..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 font-medium text-slate-900 text-xs outline-none focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Form */}
            <div className="flex items-center justify-end gap-3 pt-2 pb-12">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Live Card Preview (Desktop Sticky, Mobile Viewable via Tab) */}
          <div className={`lg:col-span-5 ${activeTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
            <div className="lg:sticky lg:top-24 space-y-4">
              
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-orange-500" />
                  Live Preview Kartu Menu
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Tampilan Pelanggan
                </span>
              </div>

              {/* Product Card Mockup Exact Replica */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                
                {/* Image Section */}
                <div className="relative h-56 bg-slate-900 overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name || 'Preview Menu'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50 text-orange-400 gap-2">
                      <Store className="w-12 h-12" />
                      <span className="text-xs font-black text-slate-500">Foto Menu Belum Dipasang</span>
                    </div>
                  )}

                  {/* Top Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-orange-600 text-[11px] font-black px-3 py-1.5 rounded-full shadow-md">
                      {product.badge}
                    </span>
                  )}

                  {/* Stock Status Badge */}
                  <span className={`absolute top-3 right-3 text-[11px] font-black px-3 py-1.5 rounded-full shadow-md ${
                    product.available !== false 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-rose-500 text-white'
                  }`}>
                    {product.available !== false ? 'Tersedia' : 'Habis'}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                      {product.category === 'es' ? 'Minuman Dingin' : 'Cemilan Krispi'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-xl mt-0.5 leading-snug">
                      {product.name || 'Nama Produk Anda'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                      {product.description || 'Deskripsi singkat kelezatan menu akan muncul di bagian ini untuk pelanggan.'}
                    </p>

                    {/* Promo Info Badge */}
                    {product.promoInfo && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black">
                          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                          <span>{product.promoInfo}</span>
                        </div>
                        {product.promoActive && product.promoPrice && product.promoPrice > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Beli {product.promoMinQty || 2} cuma Rp {(product.promoPrice).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Dropdown Varian Mockup */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-4">
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">
                          Pilih Varian Rasa ({product.variants.length} pilihan):
                        </label>
                        <select 
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                        >
                          {product.variants.map((v, i) => (
                            <option key={i} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Harga</span>
                      <span className="font-black text-slate-900 text-xl">
                        Rp {(product.price || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button 
                      type="button"
                      className="px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 bg-orange-50 text-orange-600 border border-orange-200"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

              </div>

              {/* Info Card Tip */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                <span className="font-black flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Tips Tampilan Menarik:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Gunakan foto berlatar bersih dengan pencahayaan terang dan cantumkan promo menarik seperti <em>"beli 2 hanya Rp5.000!!"</em> untuk mendongkrak pesanan siswa!
                </p>
              </div>

            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Soki Management System • Alamat Halaman: soki/produk-{isNew ? 'baru' : product.id}/</p>
          <p className="text-slate-500">Developed by <strong className="text-orange-600 font-bold">Koko Ferri</strong></p>
        </div>
      </footer>

    </div>
  );
}
