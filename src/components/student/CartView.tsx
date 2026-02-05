"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, X, Plus, Minus, Bike, CheckCircle } from 'lucide-react';

interface CartViewProps {
  onClose: () => void;
  cafeteriaId?: string | null; // Optional: if provided, will show only that cafe's cart
}

export const CartView: React.FC<CartViewProps> = ({ onClose, cafeteriaId = null }) => {
  const router = useRouter();
  const { cafeCarts, removeFromCafeCart, updateCafeCartQuantity, getCafeCartTotal, getCafeCartCount } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(cafeteriaId);

  // Filter carts based on cafeteriaId prop (if provided)
  const filteredCafeIds = cafeteriaId 
    ? Object.keys(cafeCarts).filter(id => id === cafeteriaId)
    : Object.keys(cafeCarts);
  
  const cafeIds = filteredCafeIds;
  const totalCafes = cafeIds.length;
  // Auto-select first cafe if only one, or use cafeteriaId prop
  useEffect(() => {
    if (cafeteriaId) {
      // Always prioritize the cafeteriaId prop if provided
      setSelectedCafeId(cafeteriaId);
    } else if (totalCafes === 1 && !selectedCafeId) {
      // Auto-select if only one cafe
      setSelectedCafeId(cafeIds[0]);
    } else if (!selectedCafeId && totalCafes > 0) {
      // Select first available cafe if none selected
      setSelectedCafeId(cafeIds[0]);
    }
  }, [totalCafes, selectedCafeId, cafeIds, cafeteriaId]);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 50);
  }, []);

  const handleCheckout = (cafeteriaId: string) => {
    // Navigate to checkout with cafe ID
    router.push(`/checkout?cafe=${cafeteriaId}`);
  };

  const handleUpdateCart = (cafeteriaId: string, itemId: string, delta: number) => {
    const currentCart = cafeCarts[cafeteriaId];
    const item = currentCart.items.find(i => i.id === itemId);
    if (item) {
      updateCafeCartQuantity(cafeteriaId, itemId, item.quantity + delta);
    }
  };
  const renderCafeCart = (cafeteriaId: string) => {
    const cart = cafeCarts[cafeteriaId];
    if (!cart) return null;

    const subtotal = getCafeCartTotal(cafeteriaId);
    const serviceFee = 165; // Service Fee (₹165)
    const freeDeliveryThreshold = 2075; // ₹2075 for free delivery
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 207; // ₹207
    
    // Calculate discount if promo applied
    let discount = 0;
    if (cart.appliedPromo) {
      if (cart.appliedPromo.type === 'fixed') {
        discount = cart.appliedPromo.discount;
      } else {
        const percentDiscount = (subtotal * cart.appliedPromo.discount) / 100;
        discount = cart.appliedPromo.maxDiscount 
          ? Math.min(percentDiscount, cart.appliedPromo.maxDiscount)
          : percentDiscount;
      }
    }
    
    const total = subtotal + serviceFee + deliveryFee - discount;
    const progress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);
    const remaining = Math.max(freeDeliveryThreshold - subtotal, 0);

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Cafe Header - Fixed */}
        <div className="flex-shrink-0 p-4 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white">
          <h3 className="text-xl font-black">{cart.cafeteriaName}</h3>
          <p className="text-sm opacity-90">{cart.items.length} items • ₹{subtotal.toFixed(2)}</p>
        </div>

        {/* Delivery Progress - Fixed */}
        {cart.items.length > 0 && (
          <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800/80 p-4">
            <div className="flex items-center gap-3">
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
          </div>
        )}

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 cart-items-scroll">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6">
                <ShoppingBag size={64} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Cart Empty</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
                Add items from {cart.cafeteriaName}!
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {cart.items.map((cartItem) => {
                // Calculate item subtotal correctly
                const itemSubtotal = cartItem.menuItem.price * cartItem.quantity;
                return (
                  <div 
                    key={cartItem.id} 
                    className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-center group hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={cartItem.menuItem.image} 
                      alt={cartItem.menuItem.name} 
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{cartItem.menuItem.name}</h4>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">₹{cartItem.menuItem.price.toFixed(2)} each</div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/80 rounded-full px-1 py-1 border border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={() => handleUpdateCart(cafeteriaId, cartItem.id, -1)}
                          className="w-7 h-7 bg-white dark:bg-gray-700 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-90"
                        >
                          <Minus size={14} className="text-gray-700 dark:text-gray-300" />
                        </button>
                        <span className="font-bold text-sm min-w-[12px] text-center text-gray-900 dark:text-white">{cartItem.quantity}</span>
                        <button 
                          onClick={() => handleUpdateCart(cafeteriaId, cartItem.id, 1)}
                          className="w-7 h-7 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white rounded-full shadow-sm flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-colors active:scale-90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-bold">
                        ₹{itemSubtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        {cart.items.length > 0 && (
          <div className="flex-shrink-0 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Service Fee</span>
                <span>₹{serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 dark:text-green-400 font-bold" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold text-sm">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="h-px border-t-2 border-dashed border-gray-200 dark:border-gray-700 my-2"></div>
              <div className="flex justify-between text-xl font-black text-gray-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => handleCheckout(cafeteriaId)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600 text-white py-4 rounded-2xl font-black text-lg hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700 active:scale-95 transition-all shadow-xl shadow-orange-500/40 dark:shadow-orange-500/30"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/60 dark:bg-black/80" onClick={onClose} />
      
      {/* Cart Container */}
      <div className={`relative w-full md:max-w-2xl md:max-h-[85vh] h-[92vh] bg-white dark:bg-gray-900 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-orange-500/20 flex flex-col transition-transform duration-500 ease-out transform border border-gray-200 dark:border-orange-500/30 ${isLoaded ? 'translate-y-0' : 'translate-y-full md:translate-y-20'}`}>
        
        {/* Mobile Pull Indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden z-50"></div>        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {cafeteriaId ? 'Your Cart' : `Your Cart${totalCafes > 1 ? 's' : ''}`}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {cafeteriaId 
                    ? `${cafeCarts[cafeteriaId]?.items.length || 0} items` 
                    : `${totalCafes} ${totalCafes === 1 ? 'cafe' : 'cafes'}`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Cafe Tabs - Only show when multiple cafes and not filtered */}
          {totalCafes > 1 && !cafeteriaId && (
            <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {cafeIds.map(cafeId => {
                const cafeCart = cafeCarts[cafeId];
                const itemCount = getCafeCartCount(cafeId);
                return (
                  <button
                    key={cafeId}
                    onClick={() => setSelectedCafeId(cafeId)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                      selectedCafeId === cafeId
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cafeCart.cafeteriaName}
                    <span className={`ml-2 text-xs ${selectedCafeId === cafeId ? 'opacity-90' : 'opacity-75'}`}>
                      ({itemCount})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart Content */}
        {totalCafes === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6">
              <ShoppingBag size={64} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Carts Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-xs">
              Start adding items from your favorite cafes!
            </p>
            <button 
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-600 active:scale-95 transition-all shadow-xl shadow-orange-500/40"
            >
              <Plus size={20} className="inline mr-2" />
              Browse Menu
            </button>
          </div>
        ) : (
          renderCafeCart(selectedCafeId || cafeIds[0])
        )}
      </div>      {/* Hide scrollbar utility & Custom scrollbar styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom scrollbar for cart items */
        .cart-items-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .cart-items-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .cart-items-scroll::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .dark .cart-items-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .cart-items-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .dark .cart-items-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Smooth scrolling */
        .cart-items-scroll {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};
