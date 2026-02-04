"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '@/types';

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  customizations?: string[];
  subtotal: number;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder?: number;
  maxDiscount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, instructions?: string, customizations?: string[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateInstructions: (itemId: string, instructions: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  appliedPromo: PromoCode | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Available promo codes
const PROMO_CODES: Record<string, PromoCode> = {
  'FIRSTBITE': { code: 'FIRSTBITE', discount: 50, type: 'fixed', minOrder: 100 },
  'HUNGRY50': { code: 'HUNGRY50', discount: 50, type: 'percent', maxDiscount: 200 },
  'CAMPUS20': { code: 'CAMPUS20', discount: 20, type: 'percent' },
  'SAVE100': { code: 'SAVE100', discount: 100, type: 'fixed', minOrder: 300 },
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPromo = localStorage.getItem('appliedPromo');
    
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Convert date strings back to Date objects in menuItems
        const cartWithDates = parsed.map((item: any) => ({
          ...item,
          menuItem: {
            ...item.menuItem,
            createdAt: new Date(item.menuItem.createdAt),
            updatedAt: new Date(item.menuItem.updatedAt),
          }
        }));
        setCartItems(cartWithDates);
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }

    if (savedPromo) {
      try {
        setAppliedPromo(JSON.parse(savedPromo));
      } catch (error) {
        console.error('Failed to load promo:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length >= 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Save promo to localStorage
  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('appliedPromo');
    }
  }, [appliedPromo]);

  const addToCart = (
    item: MenuItem,
    quantity: number = 1,
    instructions?: string,
    customizations?: string[]
  ) => {
    const subtotal = item.price * quantity; // Price is already in INR

    setCartItems(prev => {
      // Check if item already exists (same item, instructions, and customizations)
      const existingIndex = prev.findIndex(
        ci => 
          ci.menuItem.id === item.id &&
          ci.specialInstructions === instructions &&
          JSON.stringify(ci.customizations) === JSON.stringify(customizations)
      );

      if (existingIndex > -1) {
        // Update quantity if exists
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].subtotal = updated[existingIndex].quantity * item.price;
        return updated;
      } else {
        // Add new cart item
        return [...prev, {
          id: `cart-${Date.now()}-${Math.random()}`,
          menuItem: item,
          quantity,
          specialInstructions: instructions,
          customizations,
          subtotal
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity, subtotal: item.menuItem.price * quantity }
          : item
      )
    );
  };

  const updateInstructions = (itemId: string, instructions: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, specialInstructions: instructions }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedPromo');
  };

  const getCartTotal = (): number => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const getCartCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const applyPromoCode = (code: string): boolean => {
    const promo = PROMO_CODES[code.toUpperCase()];
    
    if (!promo) {
      return false;
    }

    const subtotal = getCartTotal();

    // Check minimum order requirement
    if (promo.minOrder && subtotal < promo.minOrder) {
      return false;
    }

    setAppliedPromo(promo);
    return true;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateInstructions,
        clearCart,
        getCartTotal,
        getCartCount,
        applyPromoCode,
        removePromoCode,
        appliedPromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
