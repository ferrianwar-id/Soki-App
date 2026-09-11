import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Sparkles, 
  Tag, 
  Check, 
  Flame, 
  Store,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MenuItem } from '../types';

interface ProductDetailModalProps {
  item: MenuItem | null;
  allItems?: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItem, selectedVariant: string) => void;
  onSelectOtherItem?: (item: MenuItem) => void;
}

export default function ProductDetailModal({
  item,
  allItems = [],
  isOpen,
  onClose,
  onAddToCart,
  onSelectOtherItem
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('Original');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Update selected variant when item changes
  React.useEffect(() => {
    if (item && item.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0]);
    } else {
      setSelectedVariant('Original');
    }
  }, [item?.id, item?.name]);

  if (!isOpen || !item) return null;

  const isMinuman = (item.category || '').toLowerCase().trim() === 'minuman';

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(item, selectedVariant);
      setAddedAnimation(true);
      setTimeout(() => {
        setAddedAnimation(false);
      }, 1500);
    }
  };

  // Navigasi produk sebelumnya / selanjutnya jika allItems tersedia
  const currentIndex = allItems.findIndex(m => m.id === item.id);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
          title="Tutup Preview (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tombol Navigasi Prev/Next Cepat di Modal */}
        {prevItem && onSelectOtherItem && (
          <button
            onClick={() => onSelectOtherItem(prevItem)}
            className="absolute left-3 top-28 sm:top-32 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer"
            title={`Lihat: ${prevItem.name}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {nextItem && onSelectOtherItem && (
          <button
            onClick={() => onSelectOtherItem(nextItem)}
            className="absolute right-3 top-28 sm:top-32 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer"
            title={`Lihat: ${nextItem.name}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div className="overflow-y-auto no-scrollbar">
          {/* Foto Header & Badge */}
          <div className={`relative h-60 sm:h-72 w-full ${isMinuman ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-amber-400 to-orange-600'} flex items-center justify-center overflow-hidden`}>
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
              <div className="text-6xl select-none filter drop-shadow-lg">
                {isMinuman ? '🥤' : '🍟'}
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 z-10">
              <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md text-white ${isMinuman ? 'bg-cyan-600' : 'bg-orange-600'}`}>
                {item.badge || (isMinuman ? 'Es Segar' : 'Snack Renyah')}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md bg-white/90 text-slate-800 backdrop-blur-xs">
                {isMinuman ? '🥤 Kategori Minuman' : '🍟 Kategori Makanan'}
              </span>
            </div>

            {/* Status Ketersediaan */}
            <span className={`absolute bottom-4 right-4 text-[10px] font-black px-3 py-1 rounded-full shadow-md z-10 ${
              item.available !== false ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {item.available !== false ? '● Stok Tersedia' : '✕ Habis'}
            </span>
          </div>

          {/* Konten & Detail */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {item.description || 'Pilihan jajanan istimewa racikan Kelompok 3 Kelas 8B, pas menemani waktu istirahat sekolah.'}
              </p>
            </div>

            {/* Info Promo & Diskon Bundle */}
            {item.promoInfo && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/90 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Flame className="w-4.5 h-4.5 fill-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">Promo Spesial</span>
                    {item.promoActive && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{item.promoInfo}</p>
                  {item.promoActive && item.promoPrice && item.promoPrice > 0 && (
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Beli minimal <strong>{item.promoMinQty || 2} porsi</strong>, total cukup bayar <strong>Rp {(item.promoPrice).toLocaleString('id-ID')}</strong> (otomatis terpotong di kasir).
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pilihan Varian Rasa Interaktif */}
            {item.variants && item.variants.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Pilih Varian Rasa ({item.variants.length} Pilihan):
                  </label>
                  <span className="text-xs font-bold text-orange-600">
                    {selectedVariant}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {item.variants.map((variant) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white shadow-sm ring-2 ring-orange-200'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{variant}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Menu Terkait / Lainnya */}
            {allItems.length > 1 && onSelectOtherItem && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Lihat Menu Pilihan Lainnya:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {allItems
                    .filter(m => m.id !== item.id)
                    .slice(0, 4)
                    .map((other) => (
                      <button
                        key={other.id}
                        onClick={() => onSelectOtherItem(other)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 text-slate-700 hover:text-orange-600 text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <span>{(other.category || '').toLowerCase() === 'minuman' ? '🥤' : '🍟'}</span>
                        <span className="truncate max-w-[120px]">{other.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Harga Satuan</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              Rp {item.price.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onAddToCart && (
              <button
                onClick={handleAdd}
                disabled={item.available === false}
                className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>+ Masukkan Pesanan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
