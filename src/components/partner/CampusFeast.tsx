import React, { useState, useEffect, useRef } from 'react';
import { useMenu } from '@/contexts/MenuContext';
import { 
  Search, 
  Filter, 
  Heart, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Star, 
  X, 
  ChevronDown, 
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
  Share2
} from 'lucide-react';

/* --- CUSTOM ANIMATIONS & STYLES --- */
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
const TiltCard = ({ item, onClick }: { item: any; onClick: (item: any) => void }) => {
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
      onClick={() => onClick(item)}
    >
      <div 
        className="w-full h-full relative preserve-3d transition-all duration-200 ease-out rounded-3xl shadow-xl hover:shadow-2xl"
        style={{ 
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        }}
      >
        {/* Image Layer (Background) */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden border-2 border-white/50">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ transform: `scale(1.1) translateX(${rotate.y * -0.5}px) translateY(${rotate.x * -0.5}px)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
        </div>

        {/* Content Layer (Floating) */}
        <div 
          className="absolute bottom-0 left-0 w-full p-6 text-white preserve-3d"
          style={{ transform: "translateZ(30px)" }}
        >
           <div className="flex justify-between items-start mb-2">
             <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg backdrop-blur-md">
               {item.category}
             </span>
             <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg">
               <Star size={12} className="text-yellow-400 fill-yellow-400" />
               <span className="text-xs font-bold">4.5</span>
             </div>
           </div>
           
           <h3 className="text-2xl font-black leading-tight mb-2 shadow-sm">{item.name}</h3>
           
           <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-orange-400">₹{(item.price).toFixed(2)}</span>
              <button className="bg-white text-black p-2 rounded-full hover:bg-orange-500 hover:text-white transition-colors shadow-lg">
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
             <div className="bg-green-500 text-white p-2 rounded-full shadow-lg"><ShoppingBag size={20} /></div>
           ) : (
             <div className="bg-gray-500 text-white p-2 rounded-full shadow-lg"><Clock size={20} /></div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MOBILE SNAP STREAM CARD ---
const MobileStreamCard = ({ item, onClick }: { item: any; onClick: (item: any) => void }) => {
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } else {
      onClick(item);
    }
    lastTap.current = now;
  };

  return (
    <div className="snap-item w-full p-4">
       <div 
         className="w-full h-full bg-white rounded-[2rem] overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col"
         onClick={handleTap}
       >
          {/* Full Height Image */}
          <div className="flex-1 relative overflow-hidden">
             <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
             
             {/* Double Tap Heart Overlay */}
             {showHeart && (
               <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                 <Heart size={100} className="text-white fill-white animate-heart-pop drop-shadow-lg" />
               </div>
             )}

             {/* Mobile Top Badge */}
             <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/20">
                15 min
             </div>
          </div>

          {/* Bottom Info Section */}
          <div className="absolute bottom-0 w-full p-6 text-white pb-8">
             <div className="flex items-center gap-2 mb-2">
               <span className="bg-orange-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
               <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={12} fill="currentColor"/>
                  <span className="text-xs font-bold">4.5</span>
               </div>
             </div>
             
             <h2 className="text-3xl font-black leading-none mb-2">{item.name}</h2>
             <p className="text-gray-300 text-sm line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
             
             <div className="flex items-center gap-3">
                <button className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform">
                   Details
                </button>
                <button className="bg-orange-600 text-white p-3 rounded-xl active:scale-95 transition-transform shadow-lg shadow-orange-600/30">
                   <Plus size={24} />
                </button>
                <button className="bg-white/20 backdrop-blur text-white p-3 rounded-xl active:scale-95 transition-transform">
                   <Share2 size={24} />
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- COMPONENT: DETAIL MODAL ---
const DetailView = ({ item, onClose }: { item: any; onClose: () => void }) => {
  const [qty, setQty] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 50);
  }, []);

  if (!item) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 dark-glass" onClick={onClose} />
      
      {/* Content Container */}
      <div className={`relative w-full md:max-w-5xl md:h-[90vh] h-[92vh] bg-white rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row transition-transform duration-500 ease-out transform ${isLoaded ? 'translate-y-0' : 'translate-y-full md:translate-y-20'}`}>
        
        {/* Mobile Pull Indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full md:hidden z-50"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors">
          <X size={24} />
        </button>

        {/* Left Side: Visuals */}
        <div className="w-full md:w-1/2 h-[40%] md:h-full relative overflow-hidden bg-gray-900 group">
           <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
           
           <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
              <div className="flex items-center gap-2 mb-2 md:mb-4">
                 <span className="px-2 py-1 md:px-3 bg-white/20 backdrop-blur border border-white/20 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                   {item.category}
                 </span>
                 {item.available && (
                   <span className="px-2 py-1 md:px-3 bg-green-500/80 backdrop-blur border border-green-400/20 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                     Available
                   </span>
                 )}
              </div>
              <h2 className="text-3xl md:text-5xl font-black leading-none mb-1 md:mb-2">{item.name}</h2>
              <div className="flex items-center gap-2 text-gray-300 text-sm md:text-base">
                <Utensils size={16} /> {item.category}
              </div>
           </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 h-[60%] md:h-full p-6 md:p-12 flex flex-col overflow-y-auto bg-white">
           <div className="flex justify-between items-start mb-6 md:mb-8">
             <div>
               <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Price</p>
               <div className="text-3xl md:text-4xl font-black text-gray-900">₹{(item.price * qty).toFixed(2)}</div>
             </div>
             <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-xl">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="text-xl font-bold text-yellow-700">4.5</span>
             </div>
           </div>

           <div className="space-y-4 md:space-y-6 flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-lg">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                 <div className="p-3 md:p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-1 font-bold text-xs md:text-sm">
                       <Clock size={16} /> Prep Time
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900">15 min</div>
                 </div>
                 <div className="p-3 md:p-4 bg-green-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-1 font-bold text-xs md:text-sm">
                       <Utensils size={16} /> Category
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900">{item.category}</div>
                 </div>
              </div>
              
              <div className="p-3 md:p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2 font-bold text-gray-700 text-sm md:text-base">
                    <ShoppingBag size={18} />
                    Pickup Available
                 </div>
                 <span className={`font-bold text-xs md:text-sm px-2 py-1 rounded ${item.available ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                   {item.available ? 'Available Now' : 'Unavailable'}
                 </span>
              </div>
           </div>

           {/* Action Bar */}
           <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100 flex items-center gap-4 md:gap-6 pb-safe">
              <div className="flex items-center gap-3 md:gap-4 bg-gray-100 rounded-full px-2 py-2">
                 <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all"><Minus size={18} /></button>
                 <span className="text-xl font-bold w-6 text-center">{qty}</span>
                 <button onClick={() => setQty(qty+1)} className="w-10 h-10 bg-gray-900 text-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-800 active:scale-90 transition-all"><Plus size={18} /></button>
              </div>
              <button className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2">
                 View Item <ArrowRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const CampusBiteFoodScroll = ({ cafeteriaId }: { cafeteriaId: string }) => {
  const { menuItems } = useMenu();
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filter, setFilter] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);

  // Filter items for this cafeteria
  const cafeteriaItems = menuItems.filter((item: any) => item.cafeteriaId === cafeteriaId);

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

  // Get unique categories
  const categories: string[] = ['All', ...Array.from(new Set(cafeteriaItems.map((item: any) => item.category)))];

  const filteredItems = filter === 'All' ? cafeteriaItems : cafeteriaItems.filter((item: any) => item.category === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      <FeedStyles />

      {/* Floating 3D Background Elements */}
      {viewMode === 'grid' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
           <div className="absolute top-[10%] left-[5%] text-8xl opacity-5 dark:opacity-10 animate-float-3d">🍕</div>
           <div className="absolute top-[30%] right-[10%] text-9xl opacity-5 dark:opacity-10 animate-float-3d" style={{ animationDelay: '2s' }}>🍔</div>
           <div className="absolute bottom-[20%] left-[15%] text-7xl opacity-5 dark:opacity-10 animate-float-3d" style={{ animationDelay: '4s' }}>🍩</div>
           <div className="absolute bottom-[10%] right-[5%] text-8xl opacity-5 dark:opacity-10 animate-float-3d" style={{ animationDelay: '1s' }}>🌮</div>
        </div>
      )}

      {/* Sticky Header */}
      <div className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled || viewMode === 'stream' ? 'glass-panel dark:dark-glass py-2 md:py-3 shadow-md' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-xl text-white shadow-lg">
                <Utensils size={20} />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Campus<span className="text-orange-500">Feast</span></h1>
           </div>

           {/* Desktop Search Bar */}
           <div className="flex-1 max-w-md mx-4 hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus-within:ring-2 ring-orange-100 transition-all">
              <Search className="text-gray-400 ml-2" size={20} />
              <input type="text" placeholder="Craving something specific?" className="flex-1 bg-transparent outline-none text-sm font-medium dark:text-white" />
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400"><Filter size={18} /></button>
           </div>

           {/* View Toggles */}
           <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 flex">
                 <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                 >
                   <Grid size={18} />
                 </button>
                 <button 
                   onClick={() => setViewMode('stream')}
                   className={`p-2 rounded-full transition-all ${viewMode === 'stream' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                 >
                   <Layout size={18} />
                 </button>
              </div>
           </div>
        </div>

        {/* Categories Bar */}
        {viewMode !== 'stream' && (
          <div className="max-w-7xl mx-auto px-4 mt-2 md:mt-4 overflow-x-auto hide-scrollbar pb-2">
             <div className="flex gap-3">
                {categories.map((cat: string) => (
                   <button 
                     key={cat}
                     onClick={() => setFilter(cat)}
                     className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-200'}`}
                   >
                     {cat}
                   </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto">
         
         {/* GRID VIEW */}
         {viewMode === 'grid' && (
           <div className="pt-8 md:pt-12 pb-20 px-4 max-w-7xl mx-auto">
              {filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <Utensils size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-600 mb-2">No items found</h3>
                  <p className="text-gray-500 dark:text-gray-500">Add menu items to see them here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item: any) => (
                    <TiltCard key={item.id} item={item} onClick={setSelectedItem} />
                  ))}
                </div>
              )}
           </div>
         )}

         {/* SNAP STREAM VIEW */}
         {viewMode === 'stream' && (
           <div className="snap-container bg-gray-100 dark:bg-gray-900">
              {filteredItems.length === 0 ? (
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <Utensils size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-400 dark:text-gray-600 mb-2">No items found</h3>
                    <p className="text-gray-500 dark:text-gray-500">Add menu items to see them here</p>
                  </div>
                </div>
              ) : (
                filteredItems.map((item: any) => (
                  <MobileStreamCard key={item.id} item={item} onClick={setSelectedItem} />
                ))
              )}
           </div>
         )}
      </main>

      {/* Item Detail Overlay */}
      {selectedItem && (
         <DetailView item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
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

export default CampusBiteFoodScroll;
