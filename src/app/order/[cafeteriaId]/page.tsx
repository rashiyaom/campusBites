"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Star, 
  Clock, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Utensils, 
  ArrowRight,
  AlertCircle,
  Moon,
  Sun,
  X,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { useMenu } from '@/contexts/MenuContext';
import { useCart } from '@/contexts/CartContext';
import { Cafeteria, MenuItem } from '@/types';
import { CartDrawer } from '@/components/student/CartDrawer';

/* --- Custom Animations & Styles --- */
const CustomStyles = () => (
  <style>{`
    @keyframes slide-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes scale-in {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
    .animate-scale-in { animation: scale-in 0.4s ease-out forwards; }
    
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .glass-nav {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    .dark .glass-nav {
      background: rgba(17, 24, 39, 0.9);
    }
  `}</style>
);

export default function MenuExplorerPage() {
  const params = useParams();
  const router = useRouter();
  const cafeteriaId = params.cafeteriaId as string;
  
  const { getCafeteriaById } = useCafeterias();
  const { getMenuItemsByCafeteria } = useMenu();
  const { cartItems, addToCart: addToGlobalCart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  
  const [cafe, setCafe] = useState<Cafeteria | undefined>(undefined);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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

  // Load cafe and menu data
  useEffect(() => {
    const cafeteria = getCafeteriaById(cafeteriaId);
    setCafe(cafeteria);
    
    if (cafeteria) {
      const items = getMenuItemsByCafeteria(cafeteriaId).filter(item => item.available);
      setMenuItems(items);
    }
  }, [cafeteriaId, getCafeteriaById, getMenuItemsByCafeteria]);

  // Handle Scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (itemId: string) => {
    const item = menuItems.find(m => m.id === itemId);
    if (item) {
      addToGlobalCart(item, 1);
    }
  };

  const handleRemoveFromCart = (itemId: string) => {
    const cartItem = cartItems.find(ci => ci.menuItem.id === itemId && ci.menuItem.cafeteriaId === cafeteriaId);
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      } else {
        removeFromCart(cartItem.id);
      }
    }
  };

  const handleAddToCartFromDetail = (item: MenuItem, qty: number) => {
    // Add the item with the specified quantity
    addToGlobalCart(item, qty);
  };

  // Extract unique categories
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const filteredMenu = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  // Loading state
  if (!cafe) {
    return (
      <div className={`${isDark ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading cafeteria...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'dark' : ''} font-sans antialiased text-gray-900 dark:text-white selection:bg-red-100 dark:selection:bg-orange-900 selection:text-red-900 dark:selection:text-orange-100 bg-gray-50 dark:bg-gray-950`}>
      <CustomStyles />
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-[60] glass-nav border-b border-gray-200/50 dark:border-gray-800/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 dark:bg-orange-500 p-1.5 rounded-lg text-white">
            <Utensils size={20} strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tight dark:text-white">
            Campus<span className="text-red-600 dark:text-orange-500">Bite</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
          >
            <ShoppingBag size={20} className="text-gray-900 dark:text-gray-100" />
            {getCartCount() > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 dark:bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {getCartCount()}
              </div>
            )}
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden hover:ring-2 hover:ring-red-500 dark:hover:ring-orange-500 transition-all cursor-pointer"
            title="Go to Profile"
          >
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" alt="User" className="w-full h-full" />
          </button>
        </div>
      </nav>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32 animate-fade-in pt-16">
        {/* Hero Header */}
        <div className="relative h-[40vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-10" />
          <img src={cafe.image} alt={cafe.name} className="w-full h-full object-cover" />
          
          <div className="absolute top-0 left-0 w-full p-4 z-50">
            <button 
              onClick={() => router.back()}
              className="bg-white/20 dark:bg-gray-900/40 backdrop-blur-md hover:bg-white dark:hover:bg-gray-800 text-white hover:text-black dark:hover:text-white p-3 rounded-full transition-all duration-300 flex items-center gap-2 font-bold group border border-white/20 dark:border-gray-700"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="hidden sm:inline">Back to Cafes</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 pb-12 z-20 bg-gradient-to-t from-black/90 to-transparent">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-black text-white mb-2 shadow-sm">
                {cafe.name}
              </h1>
              <p className="text-white/90 text-lg mb-3">{cafe.description}</p>
              <div className="flex items-center gap-4 text-white/90 font-medium flex-wrap">
                <span className="flex items-center gap-1 bg-green-500/20 backdrop-blur px-3 py-1.5 rounded-lg text-green-400 border border-green-500/50">
                  <Star size={16} fill="currentColor" /> {cafe.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg">
                  <Clock size={16} /> {cafe.openingHours.open} - {cafe.openingHours.close}
                </span>
                <span className={`flex items-center gap-2 ${cafe.isOpen ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'} backdrop-blur px-3 py-1.5 rounded-lg border`}>
                  <div className={`w-2 h-2 rounded-full ${cafe.isOpen ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  {cafe.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className={`sticky top-16 z-40 transition-all duration-300 border-b border-gray-100 dark:border-gray-800 ${isScrolled ? 'bg-white dark:bg-gray-900 shadow-md py-4' : 'bg-gray-50 dark:bg-gray-950 py-6'}`}>
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto hide-scrollbar">
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveCategory('All')}
                className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  activeCategory === 'All' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map(cat => {
                const count = menuItems.filter(item => item.category === cat).length;
                return (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${
                      activeCategory === cat 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {filteredMenu.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 max-w-md mx-auto shadow-lg border border-gray-100 dark:border-gray-800">
                <AlertCircle size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Items Available</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeCategory === 'All' 
                    ? 'This cafeteria hasn\'t added any menu items yet.' 
                    : `No items in the ${activeCategory} category.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredMenu.map((item, index) => {
                const cartItem = cartItems.find(ci => ci.menuItem.id === item.id && ci.menuItem.cafeteriaId === cafeteriaId);
                const qty = cartItem?.quantity || 0;
                return (
                  <div 
                    key={item.id} 
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-orange-500/20 transition-all duration-300 flex gap-4 animate-slide-up group cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Item Image */}
                    <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      {item.rating >= 4.5 && (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">
                            {item.name}
                          </h3>
                          <span className="font-black text-gray-900 dark:text-white">₹{(item.price).toFixed(0)}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          {item.calories && <span>{item.calories} kcal</span>}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {item.prepTime}
                          </span>
                          {item.rating > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                                <Star size={12} fill="currentColor" /> {item.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Add Button Area */}
                      <div className="flex justify-end mt-3">
                        {qty === 0 ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item.id);
                            }}
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-orange-500 hover:text-white text-gray-900 dark:text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90"
                          >
                            <Plus size={20} />
                          </button>
                        ) : (
                          <div 
                            className="flex items-center gap-3 bg-gray-900 dark:bg-gradient-to-r dark:from-orange-500 dark:to-red-500 text-white rounded-full px-1 py-1 shadow-lg animate-scale-in"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(item.id);
                              }}
                              className="w-8 h-8 rounded-full bg-gray-700 dark:bg-white/20 flex items-center justify-center hover:bg-gray-600 dark:hover:bg-white/30 transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold w-4 text-center text-sm">{qty}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item.id);
                              }}
                              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Cart Summary */}
        {getCartCount() > 0 && (
          <div className="fixed bottom-6 left-0 w-full px-4 z-50 animate-slide-up">
            <div 
              onClick={() => setIsCartOpen(true)}
              className="max-w-3xl mx-auto bg-gray-900 dark:bg-gradient-to-r dark:from-orange-600 dark:to-red-600 text-white p-4 rounded-2xl shadow-2xl dark:shadow-orange-500/40 flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all ring-4 ring-white/20 dark:ring-orange-500/30"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white text-black w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg relative">
                  {getCartCount()}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-orange-400 rounded-full border-2 border-gray-900 dark:border-red-600 animate-pulse"></div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 dark:text-orange-100">View Cart</div>
                  <div className="text-xl font-bold">₹{getCartTotal().toFixed(0)}</div>
                </div>
              </div>
              
              <button className="flex items-center gap-2 bg-red-600 dark:bg-white dark:text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-500 dark:hover:bg-orange-50 transition-colors">
                Open Cart <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Cart Drawer */}
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
        />

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            cafe={cafe}
            onClose={() => setSelectedItem(null)}
            onAddToCart={handleAddToCartFromDetail}
          />
        )}
      </div>
    </div>
  );
}

// Item Detail Modal Component
const ItemDetailModal = ({ 
  item, 
  cafe, 
  onClose, 
  onAddToCart 
}: { 
  item: MenuItem; 
  cafe: Cafeteria; 
  onClose: () => void; 
  onAddToCart: (item: MenuItem, qty: number) => void;
}) => {
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

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60 dark:bg-black/80" onClick={onClose} />
      
      {/* Content Container */}
      <div className={`relative w-full md:max-w-5xl md:h-[90vh] h-[92vh] bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-orange-500/20 flex flex-col md:flex-row transition-transform duration-500 ease-out transform border border-gray-200 dark:border-orange-500/30 ${isLoaded ? 'translate-y-0' : 'translate-y-full md:translate-y-20'}`}>
        
        {/* Mobile Pull Indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden z-50"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-20 bg-black/30 dark:bg-white/20 hover:bg-black/50 dark:hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md transition-colors">
          <X size={24} />
        </button>

        {/* Left Side: Image */}
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
                <MapPin size={16} /> {cafe.name}
              </div>
           </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 h-[60%] md:h-full p-6 md:p-12 flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
           <div className="flex justify-between items-start mb-6 md:mb-8">
             <div>
               <p className="text-xs md:text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Price</p>
               <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">₹{(item.price * qty).toFixed(0)}</div>
             </div>
             <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-xl">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <span className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{item.rating.toFixed(1)}</span>
             </div>
           </div>

           <div className="space-y-4 md:space-y-6 flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-lg">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                 <div className="p-3 md:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1 font-bold text-xs md:text-sm">
                       <Clock size={16} /> Prep Time
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{item.prepTime}</div>
                 </div>
                 <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1 font-bold text-xs md:text-sm">
                       <Utensils size={16} /> Calories
                    </div>
                    <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{item.calories || 'N/A'}</div>
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
      </div>
    </div>
  );
};
