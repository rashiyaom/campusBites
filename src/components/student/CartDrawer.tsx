"use client";

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Ticket, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { cafeterias } = useCafeterias();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    getCartCount,
    applyPromoCode,
    removePromoCode,
    appliedPromo 
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  // Helper to get cafeteria name
  const getCafeteriaName = (cafeteriaId: string): string => {
    const cafe = cafeterias.find(c => c.id === cafeteriaId);
    return cafe?.name || 'Unknown Cafe';
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const success = applyPromoCode(promoInput.toUpperCase());
    
    if (success) {
      setPromoInput('');
    } else {
      setPromoError('Invalid promo code or minimum order not met');
    }
  };

  const calculateDiscount = (): number => {
    if (!appliedPromo) return 0;

    const subtotal = getCartTotal();

    if (appliedPromo.type === 'fixed') {
      return appliedPromo.discount;
    } else {
      const percentDiscount = (subtotal * appliedPromo.discount) / 100;
      return appliedPromo.maxDiscount 
        ? Math.min(percentDiscount, appliedPromo.maxDiscount)
        : percentDiscount;
    }
  };

  const subtotal = getCartTotal();
  const discount = calculateDiscount();
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onClose();
    
    // If all items are from the same cafe, pass that cafe ID
    const uniqueCafeIds = Array.from(new Set(cartItems.map(item => item.menuItem.cafeteriaId)));
    if (uniqueCafeIds.length === 1 && uniqueCafeIds[0]) {
      router.push(`/checkout?cafe=${uniqueCafeIds[0]}`);
    } else {
      router.push('/checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Your Cart</h2>
              <p className="text-sm text-gray-500">{getCartCount()} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-4">
                <ShoppingBag size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">Add some delicious items to get started!</p>
              <button
                onClick={onClose}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex gap-4 group hover:shadow-md transition-shadow"
                >
                  {/* Item Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {item.menuItem.image ? (
                      <Image
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-black text-2xl">
                        {item.menuItem.name[0]}
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {getCafeteriaName(item.menuItem.cafeteriaId)}
                    </p>
                    
                    {/* Customizations */}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="text-xs text-orange-600 mb-2">
                        {item.customizations.join(', ')}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.specialInstructions && (
                      <div className="text-xs text-gray-500 italic mb-2">
                        Note: {item.specialInstructions}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          {item.quantity === 1 ? (
                            <Trash2 size={16} className="text-red-500" />
                          ) : (
                            <Minus size={16} />
                          )}
                        </button>
                        <span className="w-8 text-center font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="font-bold text-orange-500">
                        ₹{item.subtotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer with Promo and Total */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-6 space-y-4">
            
            {/* Promo Code Input */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Promo Code
              </label>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-bold text-green-700 dark:text-green-400">
                      {appliedPromo.code}
                    </span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-red-500 hover:text-red-600 text-sm font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <Ticket size={18} className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent outline-none font-bold text-gray-900 dark:text-white placeholder:font-normal"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="bg-orange-500 text-white px-6 rounded-xl font-bold hover:bg-orange-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-xs text-red-500 mt-2">{promoError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2"></div>
              
              <div className="flex justify-between items-center text-xl font-black">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-orange-500 font-mono">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
