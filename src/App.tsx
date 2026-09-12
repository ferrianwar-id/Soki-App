import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Sparkles, 
  Settings,
  Key,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Layers,
  ArrowLeftRight,
  LayoutDashboard,
  Users,
  GraduationCap,
  Eye
} from 'lucide-react';
import { CartItem, MenuItem, HeroCardConfig, SiteSettings, TeamMember } from './types';
import { defaultMenuItems, defaultHeroCards, defaultSiteSettings, defaultTeamMembers } from './data/initialData';
import AdminLoginPage from './components/AdminLoginPage';
import AdminPanel from './components/AdminPanel';
import AboutPage from './components/AboutPage';
import ProductDetailModal from './components/ProductDetailModal';
import MaintenanceScreen from './components/MaintenanceScreen';
import StoreClosedScreen from './components/StoreClosedScreen';
import { getStoreStatus } from './utils/scheduleHelper';

export default function App() {
  // Page Routing State ('store' | 'admin' | 'about')
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'about'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin' || path.startsWith('/soki/produk-')) {
        return 'admin';
      }
      if (path.startsWith('/tentang-kami') || hash === '#tentang-kami') {
        return 'about';
      }
    }
    return 'store';
  });

  // Main Data States (Synced with Backend API)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [heroCards, setHeroCards] = useState<HeroCardConfig[]>(defaultHeroCards);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers);

  // Maintenance Bypass / Mode Perancangan State (stored in sessionStorage)
  const [isMaintenanceBypassed, setIsMaintenanceBypassed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('soki_bypass_maintenance') === 'true';
    }
    return false;
  });

  // Store Closed Bypass / Mode Pratinjau Toko Tutup State (stored in sessionStorage)
  const [isStoreClosedBypassed, setIsStoreClosedBypassed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('soki_bypass_store_closed') === 'true';
    }
    return false;
  });

  // Calculate Real-Time Store Open / Closed Status
  const storeStatus = getStoreStatus(siteSettings.storeSchedule);

  // Variant selection per item
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});

  // Cart & UI states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successOrder, setSuccessOrder] = useState<{ id: string; pembeli: string; total: number } | null>(null);
  const [cardClicks, setCardClicks] = useState<{ [idx: number]: number }>({ 0: 0, 1: 0 });

  // Catalog View Mode: 'grid' (default compact horizontal grid) | 'carousel'
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'carousel'>('grid');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Single Product Preview Detail Modal State
  const [previewModalItem, setPreviewModalItem] = useState<MenuItem | null>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselContainerRef.current) {
      const container = carouselContainerRef.current;
      const scrollDistance = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'left' ? -scrollDistance : scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  const scrollToSlide = (idx: number) => {
    if (carouselContainerRef.current) {
      const container = carouselContainerRef.current;
      const cards = container.querySelectorAll<HTMLElement>('.carousel-card-item');
      if (cards[idx]) {
        const cardLeft = cards[idx].offsetLeft;
        container.scrollTo({
          left: cardLeft - 16,
          behavior: 'smooth'
        });
        setActiveSlideIndex(idx);
      }
    }
  };

  const handleCarouselScroll = () => {
    if (carouselContainerRef.current) {
      const container = carouselContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cards = container.querySelectorAll<HTMLElement>('.carousel-card-item');
      if (cards.length > 0) {
        let closestIdx = 0;
        let minDiff = Infinity;
        cards.forEach((card, i) => {
          const diff = Math.abs(card.offsetLeft - 16 - scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        });
        setActiveSlideIndex(closestIdx);
      }
    }
  };

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('soki_admin_token') || null;
  });

  // URL & View Synchronizer
  const navigateTo = (view: 'store' | 'admin' | 'about') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        window.history.pushState(null, '', '/admin');
      } else if (view === 'about') {
        window.history.pushState(null, '', '/tentang-kami');
      } else {
        if (window.location.hash) {
          window.location.hash = '';
        }
        window.history.pushState(null, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin' || path.startsWith('/soki/produk-')) {
        setCurrentView('admin');
      } else if (path.startsWith('/tentang-kami') || hash === '#tentang-kami') {
        setCurrentView('about');
      } else {
        setCurrentView('store');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Fetch full state from backend on mount
  useEffect(() => {
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        if (data.siteSettings) setSiteSettings(data.siteSettings);
        if (Array.isArray(data.heroCards) && data.heroCards.length > 0) setHeroCards(data.heroCards);
        if (Array.isArray(data.teamMembers) && data.teamMembers.length > 0) setTeamMembers(data.teamMembers);
        if (Array.isArray(data.menuItems) && data.menuItems.length > 0) {
          setMenuItems(data.menuItems);
          
          // Setup defaults
          const defaults: { [key: string]: string } = {};
          data.menuItems.forEach((item: MenuItem) => {
            if (item.variants && item.variants.length > 0) {
              defaults[item.name] = item.variants[0];
            }
          });
          setSelectedVariants(defaults);
        }
      })
      .catch(() => {
        // Use default initial data
        const defaults: { [key: string]: string } = {};
        defaultMenuItems.forEach((item) => {
          if (item.variants && item.variants.length > 0) {
            defaults[item.name] = item.variants[0];
          }
        });
        setSelectedVariants(defaults);
      });
  }, []);

  const handleVariantChange = (menuName: string, variant: string) => {
    setSelectedVariants(prev => ({ ...prev, [menuName]: variant }));
  };

  const addToCart = (item: MenuItem, customVariant?: string) => {
    const variant = customVariant || selectedVariants[item.name] || (item.variants && item.variants[0]) || 'Original';
    setCart(prevCart => {
      const existing = prevCart.find(ci => ci.name === item.name && ci.variant === variant);
      if (existing) {
        return prevCart.map(ci => 
          ci.name === item.name && ci.variant === variant 
            ? { ...ci, qty: ci.qty + 1 } 
            : ci
        );
      }
      return [...prevCart, { name: item.name, variant, price: item.price, costPrice: item.costPrice || 0, qty: 1 }];
    });
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  // Perhitungan total harga dengan diskon bundle promo (contoh: beli 2 seharga Rp5.000)
  const calculateCartTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;

    // Kelompokkan kuantitas per produk name
    const groupedByName: { [name: string]: { qty: number; items: CartItem[] } } = {};
    cart.forEach(ci => {
      if (!groupedByName[ci.name]) {
        groupedByName[ci.name] = { qty: 0, items: [] };
      }
      groupedByName[ci.name].qty += ci.qty;
      groupedByName[ci.name].items.push(ci);
    });

    Object.entries(groupedByName).forEach(([name, group]) => {
      const menuObj = menuItems.find(m => m.name === name);
      const standardPrice = menuObj ? menuObj.price : (group.items[0]?.price || 0);
      const regularItemTotal = standardPrice * group.qty;

      // Cek apakah produk memiliki promo aktif
      if (
        menuObj && 
        menuObj.promoActive && 
        menuObj.promoMinQty && 
        menuObj.promoPrice && 
        menuObj.promoMinQty > 0 &&
        menuObj.promoPrice > 0 &&
        group.qty >= menuObj.promoMinQty
      ) {
        const bundleSize = menuObj.promoMinQty;
        const bundlePrice = menuObj.promoPrice;
        const bundleCount = Math.floor(group.qty / bundleSize);
        const remainderQty = group.qty % bundleSize;

        const effectiveTotal = (bundleCount * bundlePrice) + (remainderQty * standardPrice);
        const discount = regularItemTotal - effectiveTotal;

        subtotal += regularItemTotal;
        totalDiscount += Math.max(0, discount);
      } else {
        subtotal += regularItemTotal;
      }
    });

    const finalPrice = Math.max(0, subtotal - totalDiscount);
    return { subtotal, totalDiscount, finalPrice };
  };

  const { subtotal: rawSubtotal, totalDiscount: cartDiscount, finalPrice: totalPrice } = calculateCartTotals();

  const processCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }
    if (!buyerName.trim()) {
      alert('Mohon masukkan nama pemesan terlebih dahulu!');
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pembeli: buyerName,
          items: cart,
          total: totalPrice
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessOrder({
          id: data.order.id,
          pembeli: data.order.pembeli,
          total: data.order.total
        });
        setCart([]);
        setBuyerName('');
        setIsChatOpen(false);
      } else {
        alert(data.error || 'Gagal memproses pesanan.');
      }
    } catch {
      const fallbackId = 'SK-' + Math.floor(100 + Math.random() * 900);
      setSuccessOrder({
        id: fallbackId,
        pembeli: buyerName,
        total: totalPrice
      });
      setCart([]);
      setBuyerName('');
      setIsChatOpen(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const rawCat = (item.category || '').toLowerCase().trim();
    
    let matchesCat = true;
    if (activeCategory === 'makanan') {
      matchesCat = rawCat === 'makanan' || rawCat === 'snack' || rawCat.includes('makan');
    } else if (activeCategory === 'minuman') {
      matchesCat = rawCat === 'minuman' || rawCat.includes('minum');
    } else if (activeCategory !== 'all') {
      matchesCat = rawCat === activeCategory;
    }
                       
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) ||
                          item.description.toLowerCase().includes(q) ||
                          (item.keywords && item.keywords.toLowerCase().includes(q)) ||
                          item.variants.some(v => v.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('soki_admin_token', token);
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('soki_admin_token');
    navigateTo('store');
  };

  // Dedicated Admin Backend Page
  if (currentView === 'admin') {
    if (!adminToken) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleLoginSuccess}
          onReturnToStore={() => navigateTo('store')}
        />
      );
    }
    return (
      <AdminPanel
        isOpen={true}
        onClose={() => navigateTo('store')}
        adminToken={adminToken}
        onLogout={handleAdminLogout}
        heroCards={heroCards}
        menuItems={menuItems}
        siteSettings={siteSettings}
        teamMembers={teamMembers}
        onUpdateHeroCards={setHeroCards}
        onUpdateMenuItems={setMenuItems}
        onUpdateSettings={setSiteSettings}
        onUpdateTeamMembers={setTeamMembers}
        onPreviewMaintenancePage={() => {
          setIsMaintenanceBypassed(false);
          sessionStorage.removeItem('soki_bypass_maintenance');
          navigateTo('store');
        }}
        onPreviewClosedPage={() => {
          setIsStoreClosedBypassed(false);
          sessionStorage.removeItem('soki_bypass_store_closed');
          navigateTo('store');
        }}
      />
    );
  }

  // PUBLIC MAINTENANCE SCREEN (Active when maintenance is enabled and not bypassed by admin/designer)
  if (siteSettings.maintenance?.enabled && !isMaintenanceBypassed) {
    return (
      <MaintenanceScreen
        maintenance={siteSettings.maintenance}
        siteSettings={siteSettings}
        onBypass={() => {
          setIsMaintenanceBypassed(true);
          sessionStorage.setItem('soki_bypass_maintenance', 'true');
        }}
        onOpenAdmin={() => navigateTo('admin')}
      />
    );
  }

  // PUBLIC STORE CLOSED SCREEN (Active when store is closed by schedule or force closed, and not bypassed)
  if (!storeStatus.isOpen && !isStoreClosedBypassed) {
    return (
      <StoreClosedScreen
        siteSettings={siteSettings}
        onBypass={() => {
          setIsStoreClosedBypassed(true);
          sessionStorage.setItem('soki_bypass_store_closed', 'true');
        }}
        onOpenAdmin={() => navigateTo('admin')}
      />
    );
  }

  // Dedicated Tentang Kami (About Us) Page
  if (currentView === 'about') {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Bypass Mode Banner (jika maintenance sedang aktif dan di-bypass) */}
        {siteSettings.maintenance?.enabled && isMaintenanceBypassed && (
          <div className="sticky top-0 z-[70] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                🛠️ Mode Perancangan Aktif
              </span>
              <span className="text-white text-[11px] sm:text-xs">
                Status publik saat ini sedang Maintenance. Anda sedang dalam mode pratinjau website.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsMaintenanceBypassed(false);
                  sessionStorage.removeItem('soki_bypass_maintenance');
                }}
                className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
              >
                Lihat Tampilan Maintenance Publik
              </button>
              <button
                onClick={() => navigateTo('admin')}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] transition cursor-pointer shadow-xs"
              >
                Atur di Panel Admin
              </button>
            </div>
          </div>
        )}

        {/* Bypass Mode Banner (jika Toko Tutup sedang aktif dan di-bypass) */}
        {!storeStatus.isOpen && isStoreClosedBypassed && !siteSettings.maintenance?.enabled && (
          <div className="sticky top-0 z-[70] bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 text-white font-bold px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                🌙 Toko Tutup (Mode Pratinjau)
              </span>
              <span className="text-white text-[11px] sm:text-xs">
                Status publik saat ini sedang Tutup ({storeStatus.reason}). Pengunjung melihat halaman Toko Tutup.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsStoreClosedBypassed(false);
                  sessionStorage.removeItem('soki_bypass_store_closed');
                }}
                className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
              >
                Lihat Tampilan Toko Tutup
              </button>
              <button
                onClick={() => navigateTo('admin')}
                className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] transition cursor-pointer shadow-xs"
              >
                Atur Jam Operasional
              </button>
            </div>
          </div>
        )}

        <AboutPage
          onReturnToStore={() => navigateTo('store')}
          onNavigateToAdmin={() => navigateTo('admin')}
          siteSettings={siteSettings}
          teamMembers={teamMembers}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-800 antialiased selection:bg-orange-500 selection:text-white flex flex-col">
      
      {/* Bypass Mode Banner (jika maintenance sedang aktif dan di-bypass) */}
      {siteSettings.maintenance?.enabled && isMaintenanceBypassed && (
        <div className="sticky top-0 z-[70] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              🛠️ Mode Perancangan Aktif
            </span>
            <span className="text-white text-[11px] sm:text-xs">
              Status publik saat ini sedang Maintenance. Anda sedang dalam mode pratinjau website.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMaintenanceBypassed(false);
                sessionStorage.removeItem('soki_bypass_maintenance');
              }}
              className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
            >
              Lihat Tampilan Maintenance Publik
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] transition cursor-pointer shadow-xs"
            >
              Atur di Panel Admin
            </button>
          </div>
        </div>
      )}

      {/* Bypass Mode Banner (jika Toko Tutup sedang aktif dan di-bypass) */}
      {!storeStatus.isOpen && isStoreClosedBypassed && !siteSettings.maintenance?.enabled && (
        <div className="sticky top-0 z-[70] bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 text-white font-bold px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-rose-300 text-[10px] font-black uppercase tracking-wider">
              🌙 Toko Tutup (Mode Pratinjau)
            </span>
            <span className="text-white text-[11px] sm:text-xs">
              Status publik saat ini sedang Tutup ({storeStatus.reason}). Pengunjung melihat halaman Toko Tutup.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsStoreClosedBypassed(false);
                sessionStorage.removeItem('soki_bypass_store_closed');
              }}
              className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
            >
              Lihat Tampilan Toko Tutup
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-[11px] transition cursor-pointer shadow-xs"
            >
              Atur Jam Operasional
            </button>
          </div>
        </div>
      )}
      
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
        @keyframes cardRockRight {
          0%, 100% { transform: rotate(6deg) translateY(0); }
          50% { transform: rotate(10deg) translateY(-6px); }
        }
        @keyframes cardRockLeft {
          0%, 100% { transform: rotate(-6deg) translateY(0); }
          50% { transform: rotate(-10deg) translateY(-6px); }
        }
        .anim-card-rock-right { animation: cardRockRight 5s ease-in-out infinite; transform-origin: center; }
        .anim-card-rock-left { animation: cardRockLeft 5.5s ease-in-out infinite; transform-origin: center; }
        .anim-logo-badge { animation: borderGlowPulse 4s ease-in-out infinite; }
        .anim-s-core { transform-origin: 50px 50px; animation: sCoreFloat 3s ease-in-out infinite; }
        .anim-snake-line-back { stroke-dasharray: 28 16; animation: snakeCrawlBack 2.4s linear infinite; }
        .anim-snake-line-front { stroke-dasharray: 32 18; animation: snakeCrawlFront 2.4s linear infinite; }
        .anim-ice-cube-1 { transform-origin: 24px 24px; animation: iceCubeHover1 2.6s ease-in-out infinite; }
        .anim-ice-cube-2 { transform-origin: 74px 74px; animation: iceCubeHover2 2.8s ease-in-out infinite; }
        .kid-font {
          font-size: 2.15rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          filter: drop-shadow(0 2px 0px rgba(15, 23, 42, 0.15));
        }
        .k-letter-s { color: #f59e0b; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0s; }
        .k-letter-o { color: #f97316; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.15s; }
        .k-letter-k { color: #ef4444; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.3s; }
        .k-letter-i { color: #06b6d4; display: inline-block; animation: kidBounce 2.4s ease-in-out infinite 0.45s; }
        .k-dot { color: #a855f7; display: inline-block; transform-origin: center; animation: kidPopDot 2s ease-in-out infinite; }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo Vektor Animasi Besar + Tulisan Warna-Warni Ceria */}
          <a href="#beranda" className="flex items-center gap-3.5 group">
            <div className="w-14 h-14 relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 10px 15px rgba(234, 88, 12, 0.28))' }}>
                <defs>
                  <linearGradient id="sGoldGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffedd5"/>
                    <stop offset="25%" stopColor="#fb923c"/>
                    <stop offset="70%" stopColor="#ea580c"/>
                    <stop offset="100%" stopColor="#9a3412"/>
                  </linearGradient>
                  <linearGradient id="neonSnakeGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#38bdf8"/>
                    <stop offset="50%" stopColor="#e0f2fe"/>
                    <stop offset="100%" stopColor="#0284c7"/>
                  </linearGradient>
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ea580c" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0"/>
                  </radialGradient>
                </defs>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
                <circle cx="50" cy="50" r="38" fill="url(#centerGlow)"/>
                <rect className="anim-logo-badge" x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
                <path className="anim-snake-line-back" d="M16 38 C14 20, 58 14, 82 26" stroke="url(#neonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <path className="anim-snake-line-back" d="M18 68 C16 50, 68 42, 84 56" stroke="url(#neonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <g className="anim-s-core">
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#000000" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.45" transform="translate(0, 4)"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#sGoldGrad)" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  <path d="M42 27 C46 25, 56 25, 61 28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </g>
                <path className="anim-snake-line-front" d="M82 26 C88 38, 44 44, 18 68" stroke="url(#neonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
                <path className="anim-snake-line-front" d="M84 56 C90 70, 48 80, 22 88" stroke="url(#neonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
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
            <div className="flex flex-col select-none text-left">
              <div className="flex items-center kid-font leading-none">
                <span className="k-letter-s">S</span>
                <span className="k-letter-o">O</span>
                <span className="k-letter-k">K</span>
                <span className="k-letter-i">I</span>
                <span className="k-dot">.</span>
              </div>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-1">SNACK &bull; ICE BAR</span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#beranda" className="hover:text-orange-500 transition-colors">Beranda</a>
            <a href="#menu" className="hover:text-orange-500 transition-colors">Katalog Menu</a>
            <button onClick={() => navigateTo('about')} className="hover:text-orange-500 transition-colors cursor-pointer">Tentang Kami</button>
          </nav>

          {/* Actions (Login Admin Icon & Kasir Chat) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {adminToken ? (
              <button
                onClick={() => navigateTo('admin')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-orange-600 text-xs font-bold transition active:scale-95 cursor-pointer"
                title="Halaman Admin"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>Admin</span>
              </button>
            ) : (
              /* TOMBOL LOGIN DENGAN GAMBAR KUNCI */
              <button
                onClick={() => navigateTo('admin')}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-orange-600 transition active:scale-95 cursor-pointer"
                title="Login Admin"
                aria-label="Login Admin"
              >
                <Key className="w-4 h-4" />
              </button>
            )}

            <button 
              onClick={() => setIsChatOpen(!isChatOpen)} 
              className="relative p-2.5 sm:px-4 sm:py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-md shadow-orange-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center"
              title="Keranjang Belanja / Kasir"
            >
              <ShoppingCart className="w-5 h-5 shrink-0" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION (2 CARD SHOWCASE UTAMA) ================= */}
      <section id="beranda" className="relative overflow-hidden pt-8 pb-12 md:py-16 bg-white border-b border-amber-100 flex-grow text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          
          {/* Text Hero */}
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> {siteSettings.announcement}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15]">
              {siteSettings.heroHeadline.split(',')[0]}
              {siteSettings.heroHeadline.includes(',') && (
                <span className="text-orange-500">, {siteSettings.heroHeadline.split(',')[1]}</span>
              )}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {siteSettings.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <a href="#menu" className="inline-flex justify-center items-center px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-lg shadow-slate-900/20 active:scale-95">
                Pilih Varian & Pesan
              </a>
              <a href="#keunggulan" className="inline-flex justify-center items-center px-7 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition shadow-sm">
                Kenapa Soki?
              </a>
            </div>
          </div>

          {/* Visual Hero Showcase (2 CARD UTAMA DINAMIS YANG DIATUR DARI ADMIN) */}
          <div className="relative flex justify-center mt-6">
            <div className="w-72 sm:w-80 h-[390px] relative flex justify-center items-center">
                
                {/* Card 1: Posisi Atas (Default: Snack Soba) */}
                {heroCards[0] && (
                  <div 
                    onClick={() => setCardClicks(prev => ({ ...prev, 0: (prev[0] || 0) + 1 }))}
                    style={{
                      transform: `rotate(${6 + ((cardClicks[0] || 0) % 2 === 1 ? 5 : 0)}deg) translateY(${(cardClicks[0] || 0) % 2 === 1 ? '-10px' : '0px'})`,
                      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      zIndex: (cardClicks[0] || 0) % 2 === 1 ? 40 : 10
                    }}
                    className="absolute -top-1 right-2 sm:right-5 w-56 sm:w-60 p-3 bg-white rounded-3xl shadow-2xl border border-amber-200 text-left cursor-pointer select-none"
                  >
                    <div className="w-full h-36 rounded-2xl mb-2.5 overflow-hidden bg-amber-50 relative group flex items-center justify-center">
                      {heroCards[0].imageUrl ? (
                        <img 
                          src={heroCards[0].imageUrl} 
                          alt={heroCards[0].title}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-amber-600/70 p-4 text-center">
                          <span className="text-4xl mb-1">{heroCards[0].icon || '🍟'}</span>
                          <span className="text-[10px] font-bold text-slate-400">Foto belum diatur</span>
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-black tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-md z-10">
                        {heroCards[0].badge}
                      </span>
                    </div>
                    <p className="font-extrabold text-sm text-slate-800 leading-snug">{heroCards[0].title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{heroCards[0].subtitle}</p>
                  </div>
                )}

                {/* Card 2: Posisi Bawah (Default: Es Kiko) */}
                {heroCards[1] && (
                  <div 
                    onClick={() => setCardClicks(prev => ({ ...prev, 1: (prev[1] || 0) + 1 }))}
                    style={{
                      transform: `rotate(${-6 - ((cardClicks[1] || 0) % 2 === 1 ? 5 : 0)}deg) translateY(${(cardClicks[1] || 0) % 2 === 1 ? '-10px' : '0px'})`,
                      transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      zIndex: (cardClicks[1] || 0) % 2 === 1 ? 40 : 20
                    }}
                    className="absolute -bottom-2 left-2 sm:left-5 w-56 sm:w-60 p-3 bg-white rounded-3xl shadow-2xl border border-cyan-200 text-left cursor-pointer select-none"
                  >
                    <div className="w-full h-36 rounded-2xl mb-2.5 overflow-hidden bg-cyan-50 relative group flex items-center justify-center">
                      {heroCards[1].imageUrl ? (
                        <img 
                          src={heroCards[1].imageUrl} 
                          alt={heroCards[1].title}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-cyan-600/70 p-4 text-center">
                          <span className="text-4xl mb-1">{heroCards[1].icon || '🥤'}</span>
                          <span className="text-[10px] font-bold text-slate-400">Foto belum diatur</span>
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-black tracking-wider bg-cyan-600 text-white px-2 py-0.5 rounded-full shadow-md z-10">
                        {heroCards[1].badge}
                      </span>
                    </div>
                    <p className="font-extrabold text-sm text-slate-800 leading-snug">{heroCards[1].title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{heroCards[1].subtitle}</p>
                  </div>
                )}

            </div>
          </div>

        </div>
      </section>

      {/* ================= MENU & KATALOG SECTION ================= */}
      <section id="menu" className="py-10 sm:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-black tracking-wide uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Menu Pilihan Spesial
              </div>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Daftar Menu Spesial Kelompok 3</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {catalogViewMode === 'carousel' 
                  ? 'Geser lembar menu ke kanan/kiri untuk memilih snack dan minuman favoritmu'
                  : 'Tampilan grid kompak berjajar menyamping (tidak menumpuk ke bawah)'}
              </p>
            </div>

            {/* Filter Tabs, Search & View Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-end gap-2.5">
              
              {/* Kotak Pencarian */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari menu / rasa..." 
                  className="pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 w-full sm:w-44 outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Filter Kategori */}
              <div className="flex flex-wrap justify-center gap-1.5">
                <button 
                  onClick={() => setActiveCategory('all')} 
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition border-0 cursor-pointer ${activeCategory === 'all' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  Semua ({menuItems.length})
                </button>
                <button 
                  onClick={() => setActiveCategory('makanan')} 
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition border-0 cursor-pointer ${activeCategory === 'makanan' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  🍽️ Makanan
                </button>
                <button 
                  onClick={() => setActiveCategory('minuman')} 
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition border-0 cursor-pointer ${activeCategory === 'minuman' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  🥤 Minuman
                </button>
              </div>

              {/* View Switcher: Carousel vs Grid */}
              <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setCatalogViewMode('carousel')}
                  title="Tampilan Geser Lembar (Carousel)"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    catalogViewMode === 'carousel'
                      ? 'bg-white text-orange-600 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Geser</span>
                </button>
                <button
                  onClick={() => setCatalogViewMode('grid')}
                  title="Tampilan Grid Seluruh Menu"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    catalogViewMode === 'grid'
                      ? 'bg-white text-orange-600 shadow-xs border border-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>

              {/* Prev / Next Nav Buttons for Carousel */}
              {catalogViewMode === 'carousel' && (
                <div className="hidden sm:flex items-center gap-1.5 pl-1">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Menu Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
                    title="Menu Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* ================= TAMPILAN 1: CAROUSEL (LEMBAR KERTAS GESER) ================= */}
          {catalogViewMode === 'carousel' && (
            <div className="relative">
              {/* Floating Nav Button Kiri (Desktop) */}
              <button
                onClick={() => scrollCarousel('left')}
                className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-slate-200 shadow-lg items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-300 hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Geser ke kiri"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Floating Nav Button Kanan (Desktop) */}
              <button
                onClick={() => scrollCarousel('right')}
                className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border border-slate-200 shadow-lg items-center justify-center text-slate-700 hover:text-orange-600 hover:border-orange-300 hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Geser ke kanan"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Swipeable Carousel Track */}
              <div 
                ref={carouselContainerRef}
                onScroll={handleCarouselScroll}
                className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2.5 px-2 sm:px-3 snap-x snap-mandatory -mx-3 sm:mx-0"
              >
                {filteredMenuItems.map((item, idx) => {
                  const isMinuman = (item.category || '').toLowerCase().trim() === 'minuman';
                  return (
                    <div 
                      key={item.id} 
                      className="carousel-card-item w-[64vw] max-w-[250px] sm:w-[230px] md:w-[250px] shrink-0 snap-center sm:snap-start bg-white rounded-2xl border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative group text-left"
                    >
                      {/* Top Header Lembar Kartu */}
                      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-black tracking-wider uppercase text-slate-400">
                          Lembar #{idx + 1}
                        </span>
                        <span className="text-[9px] font-extrabold text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-full">
                          {isMinuman ? '🥤 Minuman' : '🍟 Snack'}
                        </span>
                      </div>

                      {/* Gambar Produk - Clickable for single item preview */}
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className={`relative h-28 sm:h-32 md:h-36 w-full ${isMinuman ? 'bg-cyan-50' : 'bg-amber-50'} flex items-center justify-center overflow-hidden cursor-pointer group/img`}
                        title="Klik untuk melihat preview detail produk"
                      >
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-3xl">
                            {isMinuman ? '🥤' : '🍲'}
                          </div>
                        )}

                        <span className={`absolute top-2 left-2 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs text-white ${isMinuman ? 'bg-cyan-600' : 'bg-amber-500'}`}>
                          {item.badge}
                        </span>

                        {/* Hover Preview Overlay Badge */}
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-bold shadow-md flex items-center gap-1">
                            <Eye className="w-3 h-3 text-orange-500" />
                            Preview
                          </span>
                        </div>
                      </div>

                      {/* Detail & Aksi */}
                      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between">
                        <div>
                          <div 
                            onClick={() => setPreviewModalItem(item)}
                            className="cursor-pointer group/title"
                          >
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base mt-0.5 leading-snug line-clamp-1 group-hover/title:text-orange-600 transition" title={item.name}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {item.promoInfo && (
                            <div className="mt-2 flex flex-col gap-1">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
                                <span className="truncate">{item.promoInfo}</span>
                              </div>
                              {item.promoActive && item.promoPrice && item.promoPrice > 0 && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 self-start">
                                  Beli {item.promoMinQty || 2} Rp {(item.promoPrice).toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Dropdown Varian */}
                          {item.variants && item.variants.length > 0 && (
                            <div className="mt-2">
                              <label className="text-[10px] font-bold text-slate-600 block mb-1">Pilih Rasa:</label>
                              <select 
                                value={selectedVariants[item.name] || item.variants[0]}
                                onChange={(e) => handleVariantChange(item.name, e.target.value)}
                                className="w-full text-[11px] font-medium p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-orange-500 transition cursor-pointer"
                              >
                                {item.variants.map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* Harga & Tombol Preview / Tambah */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 gap-1.5">
                          <div 
                            onClick={() => setPreviewModalItem(item)}
                            className="cursor-pointer"
                          >
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Harga Satuan</span>
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base hover:text-orange-600 transition">Rp {item.price.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewModalItem(item)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition cursor-pointer"
                              title="Lihat Detail Produk"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => addToCart(item)}
                              className="px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95 cursor-pointer"
                            >
                              + Tambah
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Carousel Pagination & Guidance Bar */}
              {filteredMenuItems.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100/90 px-3 py-1 rounded-full">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span>Geser lembar menu ({filteredMenuItems.length} menu)</span>
                  </div>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-1.5">
                    {filteredMenuItems.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          activeSlideIndex === idx
                            ? 'w-6 bg-orange-500 shadow-xs shadow-orange-500/30'
                            : 'w-2 bg-slate-200 hover:bg-slate-300'
                        }`}
                        aria-label={`Lihat lembar menu ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] font-black text-slate-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                    Lembar {Math.min(activeSlideIndex + 1, filteredMenuItems.length)} / {filteredMenuItems.length}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ================= TAMPILAN GRID: MENYAMPING / TIDAK MENUMPUK KE BAWAH ================= */}
          {catalogViewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 max-w-7xl mx-auto">
              {filteredMenuItems.map((item) => {
                const isMinuman = (item.category || '').toLowerCase().trim() === 'minuman';
                return (
                  <div key={item.id} className="menu-card bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-orange-300 transition duration-200 overflow-hidden flex flex-col justify-between text-left group">
                    
                    {/* Product Image - Clickable for single item preview */}
                    <div 
                      onClick={() => setPreviewModalItem(item)}
                      className={`relative h-28 sm:h-36 w-full ${isMinuman ? 'bg-cyan-50' : 'bg-amber-50'} flex items-center justify-center overflow-hidden cursor-pointer group/img`}
                      title="Klik untuk melihat preview detail produk"
                    >
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-3xl">
                          {isMinuman ? '🥤' : '🍲'}
                        </div>
                      )}

                      <span className={`absolute top-2 left-2 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs text-white ${isMinuman ? 'bg-cyan-600' : 'bg-amber-500'}`}>
                        {item.badge}
                      </span>

                      {/* Hover Preview Overlay Badge */}
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-bold shadow-md flex items-center gap-1">
                          <Eye className="w-3 h-3 text-orange-500" />
                          Preview
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <div 
                          onClick={() => setPreviewModalItem(item)}
                          className="cursor-pointer group/title"
                        >
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {isMinuman ? '🥤 Minuman' : '🍟 Snack'}
                          </span>
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 leading-snug line-clamp-1 group-hover/title:text-orange-600 transition" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {item.promoInfo && (
                          <div className="mt-2 flex flex-col gap-1">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0"></span>
                              <span className="truncate">{item.promoInfo}</span>
                            </div>
                          </div>
                        )}

                        {/* Dropdown Varian */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="mt-2.5">
                            <label className="text-[10px] font-bold text-slate-600 block mb-1">Rasa:</label>
                            <select 
                              value={selectedVariants[item.name] || item.variants[0]}
                              onChange={(e) => handleVariantChange(item.name, e.target.value)}
                              className="w-full text-[11px] font-medium p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-orange-500 transition cursor-pointer truncate"
                            >
                              {item.variants.map((v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 gap-1.5">
                        <div 
                          onClick={() => setPreviewModalItem(item)}
                          className="cursor-pointer"
                        >
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Harga</span>
                          <span className="font-black text-slate-900 text-xs sm:text-sm hover:text-orange-600 transition">Rp {item.price.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewModalItem(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition cursor-pointer"
                            title="Lihat Detail Produk"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => addToCart(item)}
                            className="px-2.5 sm:px-3 py-1.5 rounded-lg font-bold text-[11px] sm:text-xs flex items-center gap-1 transition bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95 cursor-pointer shrink-0"
                          >
                            + Beli
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {filteredMenuItems.length === 0 && (
            <div className="text-center py-12 sm:py-16 px-4 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 my-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-extrabold text-base sm:text-lg">
                {menuItems.length === 0 ? "Daftar Menu Sedang Dipersiapkan" : "Menu Tidak Ditemukan"}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed">
                {menuItems.length === 0 
                  ? "Admin & tim pengelola sedang mempersiapkan daftar produk makanan dan minuman terbaru. Silakan nantikan katalog resmi kami!"
                  : "Menu atau varian rasa yang kamu cari belum tersedia. Coba kata kunci lain atau pilih kategori Semua."}
              </p>
              {menuItems.length === 0 && (
                <button
                  onClick={() => navigateTo('admin')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer active:scale-95"
                >
                  <Key className="w-3.5 h-3.5 text-orange-400" />
                  <span>Kelola Menu di Panel Admin</span>
                </button>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ================= KEUNGGULAN SECTION ================= */}
      <section id="keunggulan" className="py-10 sm:py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Kenapa Harus Beli di Kelompok 3?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-8">
            Kualitas rasa, kerenyahan snack, dan kesegaran es stik terbaik yang disajikan sepenuh hati.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {(siteSettings.features || [
              { title: "Snack Dijamin Garing", description: "Dikemas rapi dan higienis agar kerenyahannya selalu terjaga saat jam istirahat.", icon: "🍟" },
              { title: "Minuman Dingin Segar", description: "Disajikan dingin beku sempurna, sangat pas melepas dahaga di siang hari.", icon: "🧊" },
              { title: "Harga Ramah Kantong", description: "Pilihan jajanan hemat dan pas untuk teman ngobrol bareng teman sekelas.", icon: "⚡" }
            ]).map((feat, idx) => {
              const bgColors = ['bg-amber-50/60 border-amber-100', 'bg-cyan-50/60 border-cyan-100', 'bg-emerald-50/60 border-emerald-100'];
              const iconBgColors = ['bg-orange-100 text-orange-600', 'bg-cyan-100 text-cyan-600', 'bg-emerald-100 text-emerald-600'];
              return (
                <div key={idx} className={`p-6 ${bgColors[idx % bgColors.length]} rounded-3xl shadow-sm border flex flex-col items-center text-center`}>
                  <div className={`w-14 h-14 ${iconBgColors[idx % iconBgColors.length]} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900">{feat.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>

          {/* Navigasi ke Halaman Khusus Tentang Kami */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500">
            <span>Dikelola mandiri oleh siswa-siswi Kelas 8B Kelompok 3.</span>
            <button 
              onClick={() => navigateTo('about')} 
              className="font-extrabold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Buka Halaman Profil & Tentang Kami &rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= CTA WHATSAPP SECTION ================= */}
      <section className="py-8 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-orange-400 text-[11px] font-bold tracking-wider uppercase mb-2 shadow-xs">
            <span>💬 Ada Pertanyaan?</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black mb-1.5 text-white">
            Butuh Bantuan atau Pesanan Khusus?
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
            Hubungi kontak WhatsApp kami untuk pertanyaan seputar menu dan ketersediaan stok.
          </p>
          <a
            href="https://wa.me/6281384998659?text=Halo%20Soki%20Kelompok%203,%20saya%20ingin%20bertanya%20mengenai%20menu%20dan%20pemesanan."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center text-[10px] shadow-xs">✓</span>
            <span>+62 813-8499-8659 (Hubungi WhatsApp)</span>
          </a>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm border-t border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Footer Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 relative flex-shrink-0">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 8px 12px rgba(234, 88, 12, 0.25))' }}>
                <rect x="4" y="4" width="92" height="92" rx="28" fill="#0f172a"/>
                <circle cx="50" cy="50" r="38" fill="url(#centerGlow)"/>
                <rect className="anim-logo-badge" x="4" y="4" width="92" height="92" rx="28" fill="none" stroke="#ea580c" strokeWidth="2.5"/>
                <path className="anim-snake-line-back" d="M16 38 C14 20, 58 14, 82 26" stroke="url(#neonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <path className="anim-snake-line-back" d="M18 68 C16 50, 68 42, 84 56" stroke="url(#neonSnakeGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.65"/>
                <g className="anim-s-core">
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#000000" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.45" transform="translate(0, 4)"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="#fff7ed" strokeWidth="17" strokeLinecap="round" fill="none"/>
                  <path d="M66 32 C66 22, 42 21, 36 29 C29 38, 46 43, 58 48 C72 53, 71 70, 60 76 C46 82, 32 74, 32 63" stroke="url(#sGoldGrad)" strokeWidth="13" strokeLinecap="round" fill="none"/>
                  <path d="M42 27 C46 25, 56 25, 61 28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </g>
                <path className="anim-snake-line-front" d="M82 26 C88 38, 44 44, 18 68" stroke="url(#neonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
                <path className="anim-snake-line-front" d="M84 56 C90 70, 48 80, 22 88" stroke="url(#neonSnakeGrad)" strokeWidth="6.5" strokeLinecap="round" fill="none" style={{ filter: 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.9))' }}/>
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
            <div className="flex flex-col select-none text-left">
              <div className="flex items-center kid-font text-xl leading-none">
                <span className="k-letter-s">S</span>
                <span className="k-letter-o">O</span>
                <span className="k-letter-k">K</span>
                <span className="k-letter-i">I</span>
                <span className="k-dot">.</span>
              </div>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-1">SNACK &bull; ICE BAR</span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-6 text-slate-400 font-medium">
              <a href="#menu" className="hover:text-white transition">Katalog Menu</a>
              <button onClick={() => navigateTo('about')} className="hover:text-white transition cursor-pointer">Tentang Kami</button>
              <button 
                onClick={() => navigateTo('admin')}
                className="text-slate-400 hover:text-orange-400 transition cursor-pointer text-xs flex items-center gap-1.5"
                title="Halaman Admin"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center justify-center md:justify-end gap-1.5 mt-1">
              <span>&copy; {new Date().getFullYear()} SOKI Kelompok 3 Kelas 8B</span>
              <span>&bull;</span>
              <span className="text-slate-400">Developed by <strong className="text-orange-400 font-bold">Koko</strong></span>
            </p>
          </div>
        </div>
      </footer>

      {/* ================= WIDGET KASIR GAYA FACEBOOK CHAT ================= */}
      <div className={`fixed bottom-0 right-4 z-50 w-80 sm:w-88 bg-white rounded-t-2xl shadow-2xl border border-slate-300 overflow-hidden transition-all duration-300 flex flex-col transform ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Chat Header */}
        <div onClick={() => setIsChatOpen(!isChatOpen)} className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between cursor-pointer select-none shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white text-orange-600 font-extrabold flex items-center justify-center text-sm shadow-inner">S</div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-orange-500 rounded-full"></span>
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wide leading-tight">Kasir Soki (Kelompok 3)</h4>
              <p className="text-[10px] text-orange-100">Aktif &bull; Bayar Cash Langsung</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="font-extrabold text-sm bg-orange-600 px-2 py-0.5 rounded-md">{isChatOpen ? '_' : '+'}</span>
            <button onClick={(e) => { e.stopPropagation(); setIsChatOpen(false); }} className="hover:text-orange-200 font-bold text-sm cursor-pointer">✕</button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex flex-col bg-slate-50 max-h-[380px] overflow-y-auto p-3.5 space-y-3 text-xs text-left">
          
          {/* Pesan Sambutan */}
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">S</div>
            <div className="bg-white text-slate-800 p-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-200 max-w-[85%] text-xs leading-relaxed">
              Halo kak! Pilih menu dan masukkan nama kamu, lalu klik bayar untuk mendapatkan nomor pesanan langsung! 😊
            </div>
          </div>

          {/* Bubble Keranjang Aktif */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
            <p className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider border-b border-slate-100 pb-1.5">Keranjang Belanja Kamu:</p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-slate-400 text-center py-2 text-[11px]">Belum ada item dipilih.</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800">{item.name} ({item.variant})</span>
                      <span className="text-slate-500"> x{item.qty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-orange-600">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                      <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600 font-bold cursor-pointer">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bubble Pembayaran */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 space-y-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Pemesan / Pembeli:</label>
              <input 
                type="text" 
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Contoh: Andi (Kelas 8B)" 
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none focus:border-orange-500 transition"
              />
            </div>

            {cartDiscount > 0 && (
              <div className="flex justify-between items-center text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                <span className="font-bold flex items-center gap-1">🎉 Diskon Promo Paket:</span>
                <span className="font-extrabold">-Rp {cartDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="flex justify-between items-center font-black text-slate-800 text-xs pt-1 border-t border-slate-100">
              <div>
                <span>Total Bayar (Cash):</span>
                {cartDiscount > 0 && (
                  <span className="block text-[10px] text-slate-400 font-normal line-through">
                    Rp {rawSubtotal.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
              <span className="text-orange-600 text-sm font-black">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>

            <button 
              onClick={processCheckout}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition active:scale-95 mt-1 cursor-pointer"
            >
              Bayar & Ambil Nomor Pesanan
            </button>
          </div>

        </div>
      </div>

      {/* Success Order Modal / Alert */}
      {successOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <h3 className="text-xl font-black text-slate-900">Pembayaran Cash Berhasil!</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Nomor Pesanan:</span>
                <span className="text-orange-600 font-black text-sm">#{successOrder.id}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Nama Pemesan:</span>
                <span className="text-slate-800">{successOrder.pembeli}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-600 border-t border-amber-200/60 pt-2">
                <span>Total Bayar:</span>
                <span className="text-slate-900 font-extrabold">Rp {successOrder.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Silakan tunjukkan nomor pesanan ini ke Kelompok 3 untuk mengambil barang secara langsung!
            </p>

            <button 
              onClick={() => setSuccessOrder(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg cursor-pointer"
            >
              Tutup & Selesai
            </button>
          </div>
        </div>
      )}

      {/* Product Detail & Preview Modal */}
      {previewModalItem && (
        <ProductDetailModal
          isOpen={!!previewModalItem}
          item={previewModalItem}
          allItems={filteredMenuItems.length > 0 ? filteredMenuItems : menuItems}
          onClose={() => setPreviewModalItem(null)}
          onAddToCart={(item, variant) => {
            addToCart(item, variant);
          }}
          onSelectOtherItem={(item) => {
            setPreviewModalItem(item);
          }}
        />
      )}
    </div>
  );
}
