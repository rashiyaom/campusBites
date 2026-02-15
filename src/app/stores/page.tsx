"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useMenu } from '@/contexts/MenuContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { useCart } from '@/contexts/CartContext';
import { useProducts } from '@/contexts/ProductContext';
import { useBusinesses } from '@/contexts/BusinessContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { CartView } from '@/components/student/CartView';
import { BUSINESS_UI_CONFIG, CATEGORY_MAP, BusinessType, getBusinessTypeLabel } from '@/types/business';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Star, 
  X, 
  Zap, 
  Flame, 
  Leaf, 
  Coffee, 
  Info,
  Truck,
  Bike,
  Utensils,
  Plus,
  Minus,
  Grid,
  Layout,
  Share2,
  Moon,
  Sun,
  Home,
  CheckCircle
} from 'lucide-react';

/* --              <div className="bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 flex">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-black dark:bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                 >
                   <Grid size={18} />
                 </button>
                 <button 
                   onClick={() => setViewMode('stream')}
                   className={`p-2 rounded-full transition-all ${viewMode === 'stream' ? 'bg-black dark:bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                 >
                   <Layout size={18} />
                 </button>
              </div>
              <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 shadow-lg hover:scale-110 transition-transform border border-gray-200 dark:border-gray-700"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link href="/order" className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform relative">IONS & STYLES --- */
const FeedStyles = () => (
  <style>{`
    .perspective-1000 {
      perspective: 1000px;
    }
    
    .preserve-3d {
      transform-style: preserve-3d;
    }
    
    .backface-hidden {
      backface-visibility: hidden;
    }

    /* 3D Floating Animation */
    @keyframes float-3d {
      0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
      25% { transform: translateY(-20px) rotateX(5deg) rotateY(5deg); }
      50% { transform: translateY(0) rotateX(0) rotateY(0); }
      75% { transform: translateY(20px) rotateX(-5deg) rotateY(-5deg); }
    }

    .animate-float-3d {
      animation: float-3d 8s ease-in-out infinite;
    }

    /* Scrollbar Hiding */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* Glassmorphism */
    .glass-panel {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    .dark-glass {
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    /* Mobile Scroll Snap Logic */
    .snap-container {
      scroll-snap-type: y mandatory;
      overflow-y: scroll;
      height: 100vh;
      scroll-behavior: smooth;
    }
    
    .snap-item {
      scroll-snap-align: start;
      scroll-snap-stop: always;
      height: 100vh;
      padding-top: 100px;
      padding-bottom: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Heart Pop Animation */
    @keyframes heart-pop {
      0% { transform: scale(0) rotate(-45deg); opacity: 0; }
      50% { transform: scale(1.5) rotate(0deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 0; }
    }
    
    .animate-heart-pop {
      animation: heart-pop 0.8s ease-out forwards;
    }
  `}</style>
);

// --- COMPONENT: 3D TILT CARD (DESKTOP) ---
const TiltCard = ({ item, cafeName, onClick }: { item: any; cafeName: string; onClick: (item: any) => void }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div 
      className="perspective-1000 h-[400px] w-full cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick({ ...item, cafe: cafeName, cafeteriaId: item.cafeteriaId })}
    >
      <div 
        className="w-full h-full relative preserve-3d transition-all duration-200 ease-out rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-orange-500/10 hover:shadow-2xl dark:hover:shadow-orange-500/20"
        style={{ 
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Image Layer (Background) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden border-2 border-white/50 dark:border-orange-500/20">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ transform: `scale(1.1) translateX(${rotate.y * -0.5}px) translateY(${rotate.x * -0.5}px)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent dark:from-black/95 dark:via-black/30 opacity-90" />
        </div>

        {/* Content Layer (Floating) */}
        <div 
          className="absolute bottom-0 left-0 w-full p-6 text-white preserve-3d"
          style={{ transform: "translateZ(30px)" }}
        >
           <div className="flex justify-between items-start mb-2">
             <span className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg backdrop-blur-md">
               {cafeName}
             </span>
             <div className="flex items-center gap-1 bg-white/20 dark:bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg">
               <Star size={12} className="text-yellow-400 fill-yellow-400" />
               <span className="text-xs font-bold">4.5</span>
             </div>
           </div>
           
           <h3 className="text-2xl font-black leading-tight mb-2 drop-shadow-lg">{item.name}</h3>
           
           <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-orange-400 dark:text-orange-300 drop-shadow-lg">₹{(item.price).toFixed(2)}</span>
              <button className="bg-white dark:bg-gradient-to-r dark:from-orange-500 dark:to-red-500 text-black dark:text-white p-2 rounded-full hover:bg-orange-500 hover:text-white dark:hover:from-orange-600 dark:hover:to-red-600 transition-all shadow-lg hover:scale-110 active:scale-95">
                <Plus size={20} />
              </button>
           </div>
        </div>

        {/* Floating Tag (Top Right) */}
        <div 
          className="absolute top-4 right-4 preserve-3d"
          style={{ transform: "translateZ(50px)" }}
        >
           {item.available ? (
             <div className="bg-green-500 dark:bg-green-600 text-white p-2 rounded-full shadow-lg dark:shadow-green-500/50"><ShoppingBag size={20} /></div>
           ) : (
             <div className="bg-gray-500 dark:bg-gray-600 text-white p-2 rounded-full shadow-lg"><Clock size={20} /></div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MOBILE SNAP STREAM CARD ---
const MobileStreamCard = ({ item, cafeName, onClick }: { item: any; cafeName: string; onClick: (item: any) => void }) => {
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } else {
      onClick({ ...item, cafe: cafeName, cafeteriaId: item.cafeteriaId });
    }
    lastTap.current = now;
  };

  return (
    <div className="snap-item w-full p-4">
       <div 
         className="w-full h-full bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl dark:shadow-orange-500/20 relative border border-gray-100 dark:border-orange-500/20 flex flex-col"
         onClick={handleTap}
       >
          {/* Full Height Image */}
          <div className="flex-1 relative overflow-hidden">
             <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent dark:from-black/98 dark:via-black/40" />
             
             {/* Double Tap Heart Overlay */}
             {showHeart && (
               <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                 <Heart size={100} className="text-white fill-white animate-heart-pop drop-shadow-lg" />
               </div>
             )}

             {/* Mobile Top Badge */}
             <div className="absolute top-4 right-4 bg-white/20 dark:bg-orange-500/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/20 dark:border-orange-400/20">
                15 min
             </div>
          </div>

          {/* Bottom Info Section */}
          <div className="absolute bottom-0 w-full p-6 text-white pb-8">
             <div className="flex items-center gap-2 mb-2">
               <span className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{cafeName}</span>
               <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={12} fill="currentColor"/>
                  <span className="text-xs font-bold">4.5</span>
               </div>
             </div>
             
             <h2 className="text-3xl font-black leading-none mb-2">{item.name}</h2>
             <p className="text-gray-300 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
             
             <div className="flex items-center gap-3">
                <button className="flex-1 bg-white dark:bg-gradient-to-r dark:from-orange-500 dark:to-red-500 text-black dark:text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-lg">
                   Details
                </button>
                <button className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-500 dark:to-red-500 text-white p-3 rounded-xl active:scale-95 transition-transform shadow-lg shadow-orange-600/30 dark:shadow-orange-500/30">
                   <Plus size={24} />
                </button>
                <button className="bg-white/20 dark:bg-orange-500/20 backdrop-blur text-white p-3 rounded-xl active:scale-95 transition-transform border border-white/20 dark:border-orange-400/20">
                   <Share2 size={24} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENT: DETAIL MODAL ---
const DetailView = ({ item, onClose, onAddToCart }: { item: any; onClose: () => void; onAddToCart: (item: any, qty: number) => void }) => {
  const [qty, setQty] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 50);
  }, []);

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(item, qty);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  if (!item) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Blurred Backdrop with Gradient */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60 dark:bg-black/80" onClick={onClose} />
      
      {/* Content Container */}
      <div className={`relative w-full md:max-w-5xl md:h-[90vh] h-[92vh] bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-orange-500/20 flex flex-col md:flex-row transition-transform duration-500 ease-out transform border border-gray-200 dark:border-orange-500/30 ${isLoaded ? 'translate-y-0' : 'translate-y-full md:translate-y-20'}`}>
        
        {/* Mobile Pull Indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden z-50"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-black/30 dark:bg-white/20 hover:bg-black/50 dark:hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md transition-colors">
          <X size={24} />
        </button>

        {/* Left Side: Visuals */}
        <div className="w-full md:w-1/2 h-[40%] md:h-full relative overflow-hidden bg-gray-900 dark:bg-black group">
           <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
           
           <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                 <span className="px-2 py-1 md:px-3 bg-white/20 dark:bg-white/10 backdrop-blur border border-white/20 dark:border-white/10 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                   {item.category}
                 </span>
                 {item.available && (
                   <span className="px-2 py-1 md:px-3 bg-green-500/80 dark:bg-green-600/80 backdrop-blur border border-green-400/20 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                     Available
                   </span>
                 )}
              </div>
              <h2 className="text-3xl md:text-5xl font-black leading-none mb-1 md:mb-2 drop-shadow-lg">{item.name}</h2>
              <div className="flex items-center gap-2 text-gray-200 text-sm md:text-base">
                <MapPin size={16} /> {item.cafe}
              </div>
           </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 h-[60%] md:h-full p-6 md:p-12 flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
           <div className="flex justify-between items-start mb-6 md:mb-8">
             <div>
               <p className="text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Price</p>
               <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">₹{(item.price * qty).toFixed(2)}</div>
             </div>
             <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-xl">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="text-xl font-bold text-yellow-700 dark:text-yellow-400">4.5</span>
             </div>
           </div>

           <div className="space-y-4 md:space-y-6 flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                 <div className="p-3 md:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1 font-bold text-xs md:text-sm">
                       <Clock size={16} /> Prep Time
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">15 min</div>
                 </div>
                 <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1 font-bold text-xs md:text-sm">
                       <Utensils size={16} /> Category
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{item.category}</div>
                 </div>
              </div>
              
              <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                 <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-sm md:text-base">
                    <ShoppingBag size={18} />
                    Pickup Available
                 </div>
                 <span className={`font-bold text-xs md:text-sm px-2 py-1 rounded ${item.available ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'}`}>
                   {item.available ? 'Available Now' : 'Unavailable'}
                 </span>
              </div>
           </div>

           {/* Action Bar */}
           <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 md:gap-6 pb-safe">
              <div className="flex items-center gap-3 md:gap-4 bg-gray-100 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-2 py-2 border border-gray-200/50 dark:border-gray-700/50">
                 <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all border border-gray-200 dark:border-gray-600"><Minus size={18} className="text-gray-700 dark:text-gray-300" /></button>
                 <span className="text-xl font-bold w-6 text-center text-gray-900 dark:text-white">{qty}</span>
                 <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-orange-500 dark:to-red-500 text-white rounded-full shadow-lg shadow-gray-900/20 dark:shadow-orange-500/40 flex items-center justify-center hover:from-gray-800 hover:to-gray-700 dark:hover:from-orange-600 dark:hover:to-red-600 active:scale-90 transition-all"><Plus size={18} /></button>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white py-4 rounded-2xl font-black text-lg hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 transition-all shadow-xl shadow-orange-500/40 dark:shadow-orange-500/30 flex items-center justify-center gap-2 border border-orange-600/20 dark:border-orange-500/30 ${isAdding ? 'scale-95 opacity-80' : 'active:scale-95'}`}
              >
                {isAdding ? (
                  <>
                    <CheckCircle size={20} className="animate-pulse" /> Added!
                  </>
                ) : (
                  <>
                    Add to Cart <ArrowRight size={20} />
                  </>
                )}
              </button>
           </div>
        </div>
      </div>    </div>
  );
};

// --- MAIN COMPONENT ---
const BitePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { menuItems } = useMenu();
  const { products } = useProducts();
  const { businesses } = useBusinesses();
  const { cafeterias } = useCafeterias();
  const { addToCafeCart, cafeCarts, getTotalCartsCount } = useCart();
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  const [filter, setFilter] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);
  
  // Business type from URL param
  const businessTypeParam = searchParams.get('type') as BusinessType | null;
  const [activeBusinessType, setActiveBusinessType] = useState<BusinessType | 'all'>('all');

  // Set business type from URL on mount
  useEffect(() => {
    if (businessTypeParam && ['food', 'grocery', 'stationery', 'daily_essentials'].includes(businessTypeParam)) {
      setActiveBusinessType(businessTypeParam);
    }
  }, [businessTypeParam]);

  // Get UI config based on active business type
  const currentConfig = activeBusinessType !== 'all' ? BUSINESS_UI_CONFIG[activeBusinessType] : null;

  const handleAddToCart = (item: any, qty: number) => {
    const cafeteriaId = item.cafeteriaId || item.cafe?.id;
    const cafeName = getCafeName(cafeteriaId);
    addToCafeCart(cafeteriaId, cafeName, item, qty);
  };

  const getTotalCartCount = () => {
    return Object.values(cafeCarts).reduce((total, cart) => 
      total + cart.items.reduce((sum, { quantity }) => sum + quantity, 0), 0
    );
  };

  // Dark mode setup
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Handle Scroll Effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Responsive View Toggle on Mount
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('stream');
    }
  }, []);

  // Get cafe name by ID
  const getCafeName = (cafeteriaId: string) => {
    const cafe = cafeterias.find((c: any) => c.id === cafeteriaId);
    const business = businesses.find((b: any) => b.id === cafeteriaId);
    return cafe?.name || business?.name || 'Unknown Store';
  };

  // Get categories based on active business type
  const getCategories = () => {
    if (activeBusinessType !== 'all' && CATEGORY_MAP[activeBusinessType]) {
      return ['All', ...CATEGORY_MAP[activeBusinessType]];
    }
    // Default food categories
    return ['All', ...Array.from(new Set(menuItems.map((item: any) => item.category)))];
  };

  const categories: string[] = getCategories();

  // Combine menu items and products
  const allItems = React.useMemo(() => {
    // Get products with businessType matching the filter
    const filteredProducts = products.filter((p: any) => {
      if (activeBusinessType === 'all') return true;
      return p.businessType === activeBusinessType;
    });
    
    // Include menu items only for food type or when showing all
    const relevantMenuItems = activeBusinessType === 'food' || activeBusinessType === 'all' 
      ? menuItems 
      : [];
    
    // Merge and dedupe by id
    const combined = [...relevantMenuItems, ...filteredProducts];
    const seen = new Set();
    return combined.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [menuItems, products, activeBusinessType]);

  const filteredItems = filter === 'All' ? allItems : allItems.filter((item: any) => item.category === filter);

  return (
    <div className={`${isDark ? 'dark' : ''} transition-colors duration-500`}>
      <div className="min-h-screen bg-orange-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-white relative overflow-hidden">
        <FeedStyles />

        {/* Dynamic Background Gradients - Like Hero Section */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {viewMode === 'grid' && (
            <>
              {/* Top Right Gradient Blob */}
              <div 
                className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-red-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20 animate-pulse"
              ></div>
              
              {/* Bottom Left Gradient Blob */}
              <div 
                className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-red-300 to-pink-400 dark:from-blue-900 dark:to-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-30 dark:opacity-20"
                style={{ animationDelay: '1s' }}
              ></div>
              
              {/* Center Purple Accent */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-300 to-orange-300 dark:from-purple-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10"
              ></div>
            </>
          )}
          
          {/* Floating Food Emojis */}
          {viewMode === 'grid' && (
            <>
              <div className="absolute top-[10%] left-[5%] text-8xl opacity-5 dark:opacity-[0.03] animate-float-3d">🍕</div>
              <div className="absolute top-[30%] right-[10%] text-9xl opacity-5 dark:opacity-[0.03] animate-float-3d" style={{ animationDelay: '2s' }}>🍔</div>
              <div className="absolute bottom-[20%] left-[15%] text-7xl opacity-5 dark:opacity-[0.03] animate-float-3d" style={{ animationDelay: '4s' }}>🍩</div>
              <div className="absolute bottom-[10%] right-[5%] text-8xl opacity-5 dark:opacity-[0.03] animate-float-3d" style={{ animationDelay: '1s' }}>🌮</div>
            </>
          )}
        </div>

        {/* Sticky Header */}
        <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled || viewMode === 'stream' ? 'backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 py-2 md:py-3 shadow-lg border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-transparent py-6'}`}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
             {/* Left: Logo + Home Link */}
             <div className="flex items-center gap-3">
               <Link href="/" className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl text-white shadow-lg ${currentConfig ? '' : 'bg-orange-500'}`} style={currentConfig ? { background: `linear-gradient(to right, ${currentConfig.gradientFrom}, ${currentConfig.gradientTo})` } : {}}>
                    <Utensils size={20} />
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight dark:text-white">
                    Campus<span style={{ color: currentConfig?.color || '#f97316' }}>Store</span>
                  </h1>
               </Link>
               <Link 
                 href="/" 
                 className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 transition-all"
               >
                 <Home size={18} className="text-gray-700 dark:text-gray-300" />
                 <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Home</span>
               </Link>
             </div>

             {/* Desktop Search Bar */}
             <div className="flex-1 max-w-md mx-4 hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 ring-orange-100 dark:ring-orange-900 transition-all">
                <Search className="text-gray-400 dark:text-gray-500 ml-2" size={20} />
                <input type="text" placeholder={`Search ${activeBusinessType === 'all' ? 'products' : getBusinessTypeLabel(activeBusinessType).toLowerCase()}...`} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white" />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"><Filter size={18} /></button>
             </div>

             {/* Right: View Toggles, Dark Mode, Cart */}
             <div className="flex items-center gap-2 md:gap-3">
              {/* View Mode Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 flex shadow-sm">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}
                 >
                   <Grid size={18} />
                 </button>
                 <button 
                   onClick={() => setViewMode('stream')}
                   className={`p-2 rounded-full transition-all ${viewMode === 'stream' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'}`}
                 >
                   <Layout size={18} />
                 </button>
              </div>
              
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 md:p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 shadow-lg hover:scale-110 transition-transform border border-gray-200 dark:border-gray-700"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setShowCart(true)}
                className="relative p-2 md:p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:border-orange-200 dark:hover:border-orange-500 transition-colors shadow-lg"
              >
                 <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300" />
                 {getTotalCartCount() > 0 ? (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 dark:bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                     {getTotalCartCount()}
                   </span>
                 ) : (
                   <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                 )}
              </button>
           </div>
        </div>

        {/* Business Type Tabs - PREMIUM MINIMAL DESIGN */}
        {viewMode !== 'stream' && (
          <div className="max-w-7xl mx-auto px-4 mt-6 mb-6 relative z-10">
            {/* Minimal Pill-Style Filter - Mobile Optimized */}
            <div className="overflow-x-auto hide-scrollbar pb-2">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-full p-1.5 md:p-2 border border-gray-200/30 dark:border-gray-700/30 shadow-sm inline-flex items-center gap-1.5 md:gap-2 min-w-max">
                {/* All Stores */}
                <button
                  onClick={() => {
                    setActiveBusinessType('all');
                    setFilter('All');
                    router.push('/stores');
                  }}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    activeBusinessType === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>

                {/* Food & Beverages */}
                <button
                  onClick={() => {
                    setActiveBusinessType('food');
                    setFilter('All');
                    router.push(`/stores?type=food`);
                  }}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                    activeBusinessType === 'food'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Utensils size={14} className="md:w-4 md:h-4" />
                  <span>Food</span>
                </button>

                {/* Grocery */}
                <button
                  onClick={() => {
                    setActiveBusinessType('grocery');
                    setFilter('All');
                    router.push(`/stores?type=grocery`);
                  }}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                    activeBusinessType === 'grocery'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag size={14} className="md:w-4 md:h-4" />
                  <span>Grocery</span>
                </button>

                {/* Stationery */}
                <button
                  onClick={() => {
                    setActiveBusinessType('stationery');
                    setFilter('All');
                    router.push(`/stores?type=stationery`);
                  }}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                    activeBusinessType === 'stationery'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Coffee size={14} className="md:w-4 md:h-4" />
                  <span>Stationery</span>
                </button>

                {/* Daily Essentials */}
                <button
                  onClick={() => {
                    setActiveBusinessType('daily_essentials');
                    setFilter('All');
                    router.push(`/stores?type=daily_essentials`);
                  }}
                  className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                    activeBusinessType === 'daily_essentials'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Coffee size={14} className="md:w-4 md:h-4" />
                  <span>Essentials</span>
                </button>
              </div>
            </div>

            {/* Category Pills - Minimal Design */}
            {categories.length > 1 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                {categories.map((cat: string) => (
                  <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      filter === cat 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm' 
                        : 'bg-white/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white border border-gray-200/30 dark:border-gray-700/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto">
         
         {/* GRID VIEW */}
         {viewMode === 'grid' && (
           <div className="pt-48 md:pt-52 pb-20 px-4 max-w-7xl mx-auto">
              {/* CAFETERIAS SECTION */}
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                      Cafeterias
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Delicious meals from campus eateries
                    </p>
                  </div>
                  <div className="text-orange-500 font-bold text-sm">View All →</div>
                </div>
                {filteredItems.filter((item: any) => {
                  const cafe = cafeterias.find(c => c.id === item.cafeteriaId);
                  const business = businesses.find(b => b.id === item.businessId);
                  return (cafe && !business) || (business?.businessType === 'food');
                }).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                    <Utensils size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500">No cafeteria items available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.filter((item: any) => {
                      const cafe = cafeterias.find(c => c.id === item.cafeteriaId);
                      const business = businesses.find(b => b.id === item.businessId);
                      return (cafe && !business) || (business?.businessType === 'food');
                    }).map((item: any) => (
                      <TiltCard key={item.id} item={item} cafeName={getCafeName(item.cafeteriaId)} onClick={setSelectedItem} />
                    ))}
                  </div>
                )}
              </section>

              {/* GROCERIES SECTION */}
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                      Groceries
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Fresh produce, snacks & daily groceries
                    </p>
                  </div>
                  <div className="text-green-500 font-bold text-sm">View All →</div>
                </div>
                {filteredItems.filter((item: any) => {
                  const business = businesses.find(b => b.id === item.businessId);
                  return business?.businessType === 'grocery';
                }).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500">No grocery items available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.filter((item: any) => {
                      const business = businesses.find(b => b.id === item.businessId);
                      return business?.businessType === 'grocery';
                    }).map((item: any) => (
                      <TiltCard key={item.id} item={item} cafeName={getCafeName(item.cafeteriaId)} onClick={setSelectedItem} />
                    ))}
                  </div>
                )}
              </section>

              {/* ESSENTIALS SECTION */}
              <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                      Essentials
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Stationery & daily essentials for campus life
                    </p>
                  </div>
                  <div className="text-blue-500 font-bold text-sm">View All →</div>
                </div>
                {filteredItems.filter((item: any) => {
                  const business = businesses.find(b => b.id === item.businessId);
                  return business?.businessType === 'stationery' || business?.businessType === 'daily_essentials';
                }).length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                    <Coffee size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500">No essential items available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.filter((item: any) => {
                      const business = businesses.find(b => b.id === item.businessId);
                      return business?.businessType === 'stationery' || business?.businessType === 'daily_essentials';
                    }).map((item: any) => (
                      <TiltCard key={item.id} item={item} cafeName={getCafeName(item.cafeteriaId)} onClick={setSelectedItem} />
                    ))}
                  </div>
                )}
              </section>

              {/* Show message if no items in any section */}
              {filteredItems.length === 0 && (
                <div className="text-center py-20">
                  <Utensils size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">No items found</h3>
                  <p className="text-gray-500 dark:text-gray-600">Check back later for delicious options!</p>
                </div>
              )}
           </div>
         )}

         {/* SNAP STREAM VIEW */}
         {viewMode === 'stream' && (
           <div className="snap-container bg-gray-100 dark:bg-gray-950">
              {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <Utensils size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-2">No items found</h3>
                    <p className="text-gray-500 dark:text-gray-600">Check back later for delicious options!</p>
                  </div>
                </div>
              ) : (
                filteredItems.map((item: any) => (
                  <MobileStreamCard key={item.id} item={item} cafeName={getCafeName(item.cafeteriaId)} onClick={setSelectedItem} />
                ))
              )}
           </div>
         )}
      </main>

      {/* Item Detail Overlay */}
      {selectedItem && (
         <DetailView 
           item={selectedItem} 
           onClose={() => setSelectedItem(null)} 
           onAddToCart={handleAddToCart}
         />
      )}

      {/* Cart Modal */}
      {showCart && (
         <CartView onClose={() => setShowCart(false)} />
      )}

      {/* Sticky FAB */}
      {viewMode !== 'stream' && (
        <div className="fixed bottom-6 right-6 z-30">
          <button className="bg-black dark:bg-orange-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold px-6">
             <Heart className="fill-red-500 text-red-500 animate-pulse" /> <span className="hidden md:inline">Favorites</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

// Simple Arrow Right Component
const ArrowRight = ({ size }: { size: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default BitePage;
