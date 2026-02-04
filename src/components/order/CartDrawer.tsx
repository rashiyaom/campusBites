"use client";

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Bike, CheckCircle } from 'lucide-react';
import { MenuItem, Cafeteria } from '@/types';
import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [key: string]: number };
  menuItems: MenuItem[];
  cafe: Cafeteria | undefined;
  updateCart: (itemId: string, delta: number) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  menuItems,
  cafe,
  updateCart 
}) => {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Animation trigger
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsLoaded(true), 50);
    } else {
      setIsLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  if (!cafe) return null;

  // Transform cart object {id: qty} into array of items with details
  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = menuItems.find(i => i.id === id);
    return item ? { ...item, qty } : null;
  }).filter(Boolean) as Array<MenuItem & { qty: number }>;

  // Calculate Totals & Fees (INR)
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const fee = 165; // Service Fee (₹165, was $1.99)
  const freeDeliveryThreshold = 2075; // ₹2075 for free delivery (was $25)
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 207; // ₹207 (was $2.49)
  const total = subtotal + fee + deliveryFee;

  // Calculate Progress Bar for Free Delivery
  const progress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);
  const remaining = Math.max(freeDeliveryThreshold - subtotal, 0);

  // Handle checkout navigation
  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onClose();
    router.push('/checkout');
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-xl bg-black/60 dark:bg-black/80"
        onClick={onClose}
      />
      
      {/* Cart Container - Unified Design */}
      <div className={`relative w-full md:max-w-2xl md:max-h-[85vh] h-[92vh] bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-orange-500/20 flex flex-col transition-transform duration-500 ease-out transform border border-gray-200 dark:border-orange-500/30 ${isLoaded ? 'translate-y-0' : 'translate-y-full md:translate-y-20'}`}>
        
        {/* Mobile Pull Indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden z-50"></div>

        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your Cart</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{cartItems.length} items</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {cartItems.length > 0 && (
            <>
              {/* Gamified Delivery Tracker */}
              <div className="bg-gray-100 dark:bg-gray-800/80 rounded-xl p-4 relative overflow-hidden mt-4">
                <div className="flex items-center gap-3 relative z-10">
                  <div className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm text-green-600 dark:text-green-400">
                    <Bike size={20} />
                  </div>
                  <div className="flex-1">
                    {remaining > 0 ? (
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Add <span className="text-green-600 dark:text-green-400">₹{remaining.toFixed(0)}</span> for Free Delivery
                      </p>
                    ) : (
                      <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                        Free Delivery Unlocked! <CheckCircle size={14}/>
                      </p>
                    )}
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-green-500 dark:bg-green-600 transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                {/* Green background fill effect when unlocked */}
                {remaining <= 0 && <div className="absolute inset-0 bg-green-500/10 dark:bg-green-500/20 z-0"></div>}
              </div>

              {/* Cafeteria Info */}
              <div className="mt-4 flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/30">
                <img 
                  src={cafe.image} 
                  alt={cafe.name} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cafe.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cafe.location}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-6">{cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6">
                <ShoppingBag size={64} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Cart Empty</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
                Looks like you haven't added any delicious items yet!
              </p>
              <button 
                onClick={onClose}
                className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 active:scale-95 transition-all shadow-xl shadow-orange-500/40 dark:shadow-orange-500/30 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Items
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center group hover:shadow-md transition-shadow"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h4>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">₹{(item.price).toFixed(0)}</div>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/80 rounded-full px-1 py-1 border border-gray-200 dark:border-gray-700">
                      <button 
                        onClick={() => updateCart(item.id, -1)}
                        className="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} className="text-gray-700 dark:text-gray-300" />
                      </button>
                      <span className="font-bold text-sm w-3 text-center text-gray-900 dark:text-white">{item.qty}</span>
                      <button 
                        onClick={() => updateCart(item.id, 1)}
                        className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white rounded-full shadow-sm flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-colors active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-bold">
                      ₹{(item.price * item.qty).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Only show when cart has items */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Service Fee</span>
                <span>₹{fee.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 dark:text-green-400 font-bold" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(0)}`}
                </span>
              </div>
              <div className="h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-2"></div>
              <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white py-4 rounded-2xl font-black text-lg hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 active:scale-95 transition-all shadow-xl shadow-orange-500/40 dark:shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
