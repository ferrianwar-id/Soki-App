import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Sparkles, 
  Check, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Package
} from 'lucide-react';
import { MenuItem } from '../types';

interface ProductDetailModalProps {
  item: MenuItem | null;
  allItems?: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: MenuItem, selectedVariant: string, quantity?: number) => void;
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
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Update selected variant & reset quantity when item changes
  React.useEffect(() => {
    if (item && item.variants && item.variants.length > 0) {
      setSelectedVariant(item.variants[0]);
    } else {
      setSelectedVariant('Original');
    }
    setQuantity(1);
  }, [item?.id, item?.name]);

  if (!isOpen || !item) return null;

  const isMinuman = (item.category || '').toLowerCase().trim() === 'minuman';
  const isOutOfStock = item.available === false || (item.stock !== undefined && item.stock !== null && item.stock <= 0);
  const maxStock = item.stock !== undefined && item.stock !== null ? Math.max(0, item.stock) : 999;

  // Promo Calculation & Auto-Detection
  let promoType: 'buy_x_get_y' | 'bundle_price' = item.promoType || 'bundle_price';
  let promoPrice = Number(item.promoPrice || 0);
  let promoMinQty = Number(item.promoMinQty || 2);
  if (promoMinQty <= 0) promoMinQty = 2;
  let promoFreeQty = Number(item.promoFreeQty || 0);

  if (promoFreeQty > 0 || promoType === 'buy_x_get_y') {
    promoType = 'buy_x_get_y';
    if (promoFreeQty <= 0) promoFreeQty = 1;
  } else if (item.promoInfo && /beli\s*(\d+).*?gratis\s*(\d+)/i.test(item.promoInfo)) {
    const match = item.promoInfo.match(/beli\s*(\d+).*?gratis\s*(\d+)/i);
    if (match) {
      promoType = 'buy_x_get_y';
      promoMinQty = parseInt(match[1], 10) || 2;
      promoFreeQty = parseInt(match[2], 10) || 1;
    }
  } else if (promoPrice <= 0 && item.promoInfo) {
    const match = item.promoInfo.match(/beli\s*(\d+).*?(?:rp|hanya|cuma)?\s*([\d.]+)/i);
    if (match) {
      promoMinQty = parseInt(match[1], 10) || 2;
      const parsedPrice = parseInt(match[2].replace(/\./g, ''), 10);
      if (parsedPrice > 0) {
        promoPrice = parsedPrice;
        promoType = 'bundle_price';
      }
    }
  }

  const hasPromo = promoType === 'buy_x_get_y'
    ? Boolean(promoFreeQty > 0 && promoMinQty > 0 && item.promoActive !== false)
    : Boolean(promoPrice > 0 && item.promoActive !== false);

  const isPromoApplied = hasPromo && quantity >= promoMinQty;

  const normalTotal = (item.price || 0) * quantity;
  const bundleCount = promoMinQty > 0 ? Math.floor(quantity / promoMinQty) : 0;
  const remainderQty = promoMinQty > 0 ? quantity % promoMinQty : quantity;

  // Buy X Get Y calculations
  const totalFreeBonusEarned = (promoType === 'buy_x_get_y' && isPromoApplied) ? (bundleCount * promoFreeQty) : 0;
  const totalPhysicalQuantity = quantity + totalFreeBonusEarned;

  // Bundle Price calculations
  const effectiveTotal = (promoType === 'bundle_price' && isPromoApplied)
    ? (bundleCount * promoPrice) + (remainderQty * (item.price || 0))
    : normalTotal;
  const totalHemat = Math.max(0, normalTotal - effectiveTotal);

  const handleAdd = () => {
    if (onAddToCart && !isOutOfStock) {
      onAddToCart(item, selectedVariant, quantity);
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
          <div className={`relative h-56 sm:h-64 w-full ${isMinuman ? 'bg-gradient-to-br from-cyan-400 to-blue-600' : 'bg-gradient-to-br from-amber-400 to-orange-600'} flex items-center justify-center overflow-hidden`}>
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
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
                {isMinuman ? '🥤 Minuman' : '🍟 Makanan'}
              </span>
            </div>

            {/* Status Ketersediaan & Sisa Stok */}
            <div className="absolute bottom-4 right-4 z-10">
              {item.stock !== undefined && item.stock !== null ? (
                item.stock <= 0 ? (
                  <span className="text-[11px] font-black px-3 py-1 rounded-full shadow-md bg-rose-600 text-white flex items-center gap-1">
                    ✕ Stok Habis
                  </span>
                ) : item.stock <= 5 ? (
                  <span className="text-[11px] font-black px-3 py-1 rounded-full shadow-md bg-amber-500 text-white flex items-center gap-1 animate-pulse">
                    <Flame className="w-3.5 h-3.5" /> Sisa {item.stock} Porsi!
                  </span>
                ) : (
                  <span className="text-[11px] font-black px-3 py-1 rounded-full shadow-md bg-emerald-600 text-white flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" /> Stok: {item.stock} Porsi
                  </span>
                )
              ) : (
                <span className={`text-[11px] font-black px-3 py-1 rounded-full shadow-md ${
                  item.available !== false ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {item.available !== false ? '● Stok Tersedia' : '✕ Stok Habis'}
                </span>
              )}
            </div>
          </div>

          {/* Konten & Detail */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {item.description || 'Pilihan jajanan istimewa racikan Kelompok 3 Kelas 8B, pas menemani waktu istirahat sekolah.'}
              </p>
            </div>

            {/* Info Promo & Diskon Bundle Terintegrasi */}
            {hasPromo && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200 shadow-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded">
                        {promoType === 'buy_x_get_y' ? 'Promo Beli X Gratis Y' : 'Promo Paket Hemat'}
                      </span>
                      {promoType === 'buy_x_get_y' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          🎁 Beli {promoMinQty} Gratis {promoFreeQty}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Beli {promoMinQty} Cuma Rp {promoPrice.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                    {item.promoInfo && (
                      <p className="text-xs font-black text-slate-800 mt-1">{item.promoInfo}</p>
                    )}
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {promoType === 'buy_x_get_y' ? (
                        <>Beli minimal <b>{promoMinQty} porsi</b> langsung dapat <b>+{promoFreeQty} porsi GRATIS</b> (Total dapat <b>{promoMinQty + promoFreeQty} porsi</b> hanya seharga {promoMinQty} porsi!)</>
                      ) : (
                        <>Harga normal {promoMinQty} porsi adalah <b>Rp {(item.price * promoMinQty).toLocaleString('id-ID')}</b>. Kamu lebih hemat <b>Rp {((item.price * promoMinQty) - promoPrice).toLocaleString('id-ID')}</b>!</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Tombol Ambil Paket Promo Cepat */}
                <button
                  type="button"
                  onClick={() => setQuantity(promoMinQty)}
                  disabled={isOutOfStock || (item.stock !== undefined && item.stock < (promoType === 'buy_x_get_y' ? (promoMinQty + promoFreeQty) : promoMinQty))}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {promoType === 'buy_x_get_y' 
                      ? `Ambil Promo Beli ${promoMinQty} (+${promoFreeQty} Porsi Gratis)` 
                      : `Ambil Paket Promo (${promoMinQty} Porsi = Rp ${promoPrice.toLocaleString('id-ID')})`}
                  </span>
                </button>
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

            {/* Pilihan Jumlah Porsi & Indikator Promo Terintegrasi */}
            {!isOutOfStock && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Jumlah Porsi yang Dipesan:</span>
                    <span className="text-[10px] text-slate-500">
                      {item.stock !== undefined ? `Tersedia: ${item.stock} porsi` : 'Stok siap dipesan'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-black text-slate-700 disabled:opacity-30 cursor-pointer transition active:scale-95"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-slate-900 text-sm">{quantity}</span>
                    <button
                      type="button"
                      disabled={item.stock !== undefined && quantity >= maxStock}
                      onClick={() => setQuantity(q => item.stock !== undefined ? Math.min(maxStock, q + 1) : q + 1)}
                      className="w-8 h-8 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-black text-slate-700 disabled:opacity-30 cursor-pointer transition active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Status Promo Berdasarkan Qty */}
                {hasPromo && (
                  <div>
                    {isPromoApplied ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {promoType === 'buy_x_get_y' 
                              ? `Promo Aktif! Dapat Bonus +${totalFreeBonusEarned} Porsi GRATIS` 
                              : 'Promo Paket Hemat Aktif!'}
                          </span>
                        </span>
                        <span className="font-extrabold text-emerald-700 shrink-0">
                          {promoType === 'buy_x_get_y' 
                            ? `Total ${totalPhysicalQuantity} porsi` 
                            : `Lebih hemat Rp ${totalHemat.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center justify-between gap-2">
                        <span>
                          {promoType === 'buy_x_get_y' ? (
                            <>💡 Beli <b>{promoMinQty - quantity} porsi lagi</b> untuk dapat <b>+{promoFreeQty} porsi GRATIS</b>!</>
                          ) : (
                            <>💡 Tambah <b>{promoMinQty - quantity} porsi lagi</b> untuk aktifkan promo Rp {promoPrice.toLocaleString('id-ID')}!</>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(promoMinQty)}
                          disabled={item.stock !== undefined && item.stock < (promoType === 'buy_x_get_y' ? (promoMinQty + promoFreeQty) : promoMinQty)}
                          className="px-2 py-0.5 rounded-lg bg-orange-500 text-white font-bold text-[10px] hover:bg-orange-600 transition cursor-pointer shrink-0"
                        >
                          + Pas-kan {promoMinQty}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Menu Terkait / Lainnya */}
            {allItems.length > 1 && onSelectOtherItem && (
              <div className="pt-2 border-t border-slate-100">
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
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {quantity > 1 ? `Total Bayar (${quantity} Porsi)` : 'Total Bayar'}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                Rp {effectiveTotal.toLocaleString('id-ID')}
              </span>
              {totalHemat > 0 && (
                <span className="text-xs text-slate-400 line-through font-bold">
                  Rp {normalTotal.toLocaleString('id-ID')}
                </span>
              )}
            </div>
            {totalFreeBonusEarned > 0 ? (
              <span className="text-[10px] font-black text-emerald-600 block">
                🎁 Bonus +{totalFreeBonusEarned} Porsi Gratis (Dapat {totalPhysicalQuantity} Porsi)
              </span>
            ) : totalHemat > 0 ? (
              <span className="text-[10px] font-black text-emerald-600 block">
                🎉 Hemat Rp {totalHemat.toLocaleString('id-ID')}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {onAddToCart && (
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
                  isOutOfStock
                    ? 'bg-slate-300 text-slate-500 shadow-none'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
                }`}
              >
                {isOutOfStock ? (
                  <span>Stok Habis</span>
                ) : addedAnimation ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>
                      + Masukkan {totalFreeBonusEarned > 0 ? `(${quantity}+${totalFreeBonusEarned} Gratis)` : (quantity > 1 ? `(${quantity} Porsi)` : 'Pesanan')}
                    </span>
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
