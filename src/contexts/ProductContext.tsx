"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, 
  BusinessType, 
  MealTime,
  isLowStock,
  BUSINESS_FEATURES 
} from '@/types/business';
import { MenuItem } from '@/types/menu';
import { SEED_MENU_ITEMS } from '@/lib/seedMenuItems';
import { 
  migrateMenuItemToProduct, 
  productToMenuItem,
  SAMPLE_GROCERY_PRODUCTS,
  SAMPLE_STATIONERY_PRODUCTS,
  SAMPLE_ESSENTIALS_PRODUCTS
} from '@/lib/migration';
import { triggerSync } from '@/hooks/useRealtimeSync';

// ============================================
// CONTEXT TYPE DEFINITION
// ============================================

interface ProductContextType {
  // Product data
  products: Product[];
  
  // CRUD operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Query methods
  getProductsByBusiness: (businessId: string) => Product[];
  getProductsByCategory: (businessId: string, category: string) => Product[];
  getProductsByMealTime: (businessId: string, mealTime: MealTime) => Product[];
  getAvailableProducts: (businessId: string) => Product[];
  searchProducts: (businessId: string, query: string) => Product[];
  
  // Inventory management
  updateStock: (productId: string, quantity: number) => void;
  decrementStock: (productId: string, quantity: number) => boolean;
  getLowStockProducts: (businessId: string) => Product[];
  
  // Availability
  toggleProductAvailability: (id: string) => void;
  bulkUpdateAvailability: (productIds: string[], available: boolean) => void;
  
  // Food-specific
  getCurrentMealTime: () => MealTime;
  bulkUpdateMealTimes: (productIds: string[], mealTimes: MealTime[]) => void;
  
  // Backward compatibility - MenuItem support
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  getMenuItemsByCafeteria: (cafeteriaId: string) => MenuItem[];
  getMenuItemsByMealTime: (cafeteriaId: string, mealTime: MealTime) => MenuItem[];
  toggleMenuItemAvailability: (id: string) => void;
  
  // Loading state
  isLoading: boolean;
}

// ============================================
// CONTEXT CREATION
// ============================================

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ==========================================
  // INITIALIZATION
  // ==========================================
  
  useEffect(() => {
    const initializeProducts = () => {
      setIsLoading(true);
      
      // Try to load products from localStorage
      const savedProducts = localStorage.getItem('products');
      
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          const productData = parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            expiryDate: p.expiryDate ? new Date(p.expiryDate) : undefined,
            manufacturingDate: p.manufacturingDate ? new Date(p.manufacturingDate) : undefined
          }));
          setProducts(productData);
          console.log(`[ProductContext] Loaded ${productData.length} products from storage`);
        } catch (error) {
          console.error('[ProductContext] Failed to load products:', error);
          initializeWithDefaultData();
        }
      } else {
        // Check if old menuItems exist and migrate
        const savedMenuItems = localStorage.getItem('menuItems');
        
        if (savedMenuItems) {
          try {
            const menuItems = JSON.parse(savedMenuItems).map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt)
            }));
            const migratedProducts = menuItems.map(migrateMenuItemToProduct);
            
            // Add sample products for other business types
            const sampleProducts = createSampleProducts();
            const allProducts = [...migratedProducts, ...sampleProducts];
            
            setProducts(allProducts);
            localStorage.setItem('products', JSON.stringify(allProducts));
            console.log(`[ProductContext] Migrated ${migratedProducts.length} + ${sampleProducts.length} samples`);
          } catch (error) {
            console.error('[ProductContext] Migration failed:', error);
            initializeWithDefaultData();
          }
        } else {
          initializeWithDefaultData();
        }
      }
      
      setIsLoading(false);
      setIsInitialized(true);
    };
    
    const initializeWithDefaultData = () => {
      // Convert seed menu items to products
      const foodProducts = SEED_MENU_ITEMS.map((item, idx) => 
        migrateMenuItemToProduct({
          ...item,
          id: `item-${Date.now()}-${idx}`,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      );
      
      // Add sample products for other types
      const sampleProducts = createSampleProducts();
      
      const allProducts = [...foodProducts, ...sampleProducts];
      setProducts(allProducts);
      localStorage.setItem('products', JSON.stringify(allProducts));
      
      // Also save as menuItems for backward compatibility
      localStorage.setItem('menuItems', JSON.stringify(foodProducts.map(productToMenuItem)));
      
      console.log('[ProductContext] Initialized with default data');
    };
    
    initializeProducts();
  }, []);

  // Helper to create sample products for non-food businesses
  const createSampleProducts = (): Product[] => {
    const timestamp = Date.now();
    const samples: Product[] = [];
    
    // Grocery products
    SAMPLE_GROCERY_PRODUCTS.forEach((p, idx) => {
      samples.push({
        ...p,
        id: `grocery-product-${timestamp}-${idx}`,
        businessId: 'grocery-1',
        rating: 4.5,
        reviewCount: Math.floor(Math.random() * 100),
        createdAt: new Date(),
        updatedAt: new Date()
      } as Product);
    });
    
    // Stationery products
    SAMPLE_STATIONERY_PRODUCTS.forEach((p, idx) => {
      samples.push({
        ...p,
        id: `stationery-product-${timestamp}-${idx}`,
        businessId: 'stationery-1',
        rating: 4.6,
        reviewCount: Math.floor(Math.random() * 100),
        createdAt: new Date(),
        updatedAt: new Date()
      } as Product);
    });
    
    // Essentials products
    SAMPLE_ESSENTIALS_PRODUCTS.forEach((p, idx) => {
      samples.push({
        ...p,
        id: `essentials-product-${timestamp}-${idx}`,
        businessId: 'essentials-1',
        rating: 4.4,
        reviewCount: Math.floor(Math.random() * 100),
        createdAt: new Date(),
        updatedAt: new Date()
      } as Product);
    });
    
    return samples;
  };

  // ==========================================
  // PERSISTENCE
  // ==========================================
  
  useEffect(() => {
    if (isInitialized && products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
      
      // Also update menuItems for backward compatibility (only food products)
      const foodProducts = products.filter(p => {
        // Check if businessId matches a food business (cafe-*)
        return p.businessId.startsWith('cafe-');
      });
      const menuItems = foodProducts.map(productToMenuItem);
      localStorage.setItem('menuItems', JSON.stringify(menuItems));
      
      triggerSync('products');
      triggerSync('menuItems');
    }
  }, [products, isInitialized]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'products') {
        const saved = localStorage.getItem('products');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const productData = parsed.map((p: any) => ({
              ...p,
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt)
            }));
            setProducts(productData);
          } catch (error) {
            console.error('[ProductContext] Failed to sync products:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================
  
  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `product-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id 
          ? { ...product, ...updates, updatedAt: new Date() }
          : product
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  }, []);

  // ==========================================
  // QUERY METHODS
  // ==========================================
  
  const getProductsByBusiness = useCallback((businessId: string): Product[] => {
    return products.filter(p => p.businessId === businessId);
  }, [products]);

  const getProductsByCategory = useCallback((businessId: string, category: string): Product[] => {
    return products.filter(p => p.businessId === businessId && p.category === category);
  }, [products]);

  const getProductsByMealTime = useCallback((businessId: string, mealTime: MealTime): Product[] => {
    return products.filter(p => 
      p.businessId === businessId && 
      p.isAvailable &&
      (p.mealTimes?.includes(mealTime) || p.mealTimes?.includes('all-day') || !p.mealTimes)
    );
  }, [products]);

  const getAvailableProducts = useCallback((businessId: string): Product[] => {
    return products.filter(p => p.businessId === businessId && p.isAvailable);
  }, [products]);

  const searchProducts = useCallback((businessId: string, query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      p.businessId === businessId && (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.brand?.toLowerCase().includes(lowerQuery) ||
        p.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
  }, [products]);

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================
  
  const updateStock = useCallback((productId: string, quantity: number) => {
    updateProduct(productId, { stock: quantity });
  }, [updateProduct]);

  const decrementStock = useCallback((productId: string, quantity: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === undefined) return true; // No stock tracking
    
    if (product.stock < quantity) return false; // Insufficient stock
    
    updateProduct(productId, { stock: product.stock - quantity });
    return true;
  }, [products, updateProduct]);

  const getLowStockProducts = useCallback((businessId: string): Product[] => {
    return products.filter(p => 
      p.businessId === businessId && isLowStock(p)
    );
  }, [products]);

  // ==========================================
  // AVAILABILITY
  // ==========================================
  
  const toggleProductAvailability = useCallback((id: string) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id 
          ? { ...product, isAvailable: !product.isAvailable, updatedAt: new Date() }
          : product
      )
    );
  }, []);

  const bulkUpdateAvailability = useCallback((productIds: string[], available: boolean) => {
    setProducts(prev => 
      prev.map(product => 
        productIds.includes(product.id)
          ? { ...product, isAvailable: available, updatedAt: new Date() }
          : product
      )
    );
  }, []);

  // ==========================================
  // FOOD-SPECIFIC
  // ==========================================
  
  const getCurrentMealTime = useCallback((): MealTime => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'all-day';
  }, []);

  const bulkUpdateMealTimes = useCallback((productIds: string[], mealTimes: MealTime[]) => {
    setProducts(prev => 
      prev.map(product => 
        productIds.includes(product.id)
          ? { ...product, mealTimes, updatedAt: new Date() }
          : product
      )
    );
  }, []);

  // ==========================================
  // BACKWARD COMPATIBILITY - MenuItem Support
  // ==========================================
  
  // Convert products to menu items (only food products from cafe-* businesses)
  const menuItems: MenuItem[] = React.useMemo(() => {
    return products
      .filter(p => p.businessId.startsWith('cafe-'))
      .map(productToMenuItem);
  }, [products]);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product = migrateMenuItemToProduct({
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    addProduct(product);
  }, [addProduct]);

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    // Convert MenuItem updates to Product updates
    const productUpdates: Partial<Product> = {
      ...updates,
      businessId: updates.cafeteriaId,
      isAvailable: updates.available
    };
    delete (productUpdates as any).cafeteriaId;
    delete (productUpdates as any).available;
    updateProduct(id, productUpdates);
  }, [updateProduct]);

  const deleteMenuItem = useCallback((id: string) => {
    deleteProduct(id);
  }, [deleteProduct]);

  const getMenuItemsByCafeteria = useCallback((cafeteriaId: string): MenuItem[] => {
    return products
      .filter(p => p.businessId === cafeteriaId)
      .map(productToMenuItem);
  }, [products]);

  const getMenuItemsByMealTime = useCallback((cafeteriaId: string, mealTime: MealTime): MenuItem[] => {
    return products
      .filter(p => 
        p.businessId === cafeteriaId && 
        p.isAvailable &&
        (p.mealTimes?.includes(mealTime) || p.mealTimes?.includes('all-day'))
      )
      .map(productToMenuItem);
  }, [products]);

  const toggleMenuItemAvailability = useCallback((id: string) => {
    toggleProductAvailability(id);
  }, [toggleProductAvailability]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  
  const contextValue: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByBusiness,
    getProductsByCategory,
    getProductsByMealTime,
    getAvailableProducts,
    searchProducts,
    updateStock,
    decrementStock,
    getLowStockProducts,
    toggleProductAvailability,
    bulkUpdateAvailability,
    getCurrentMealTime,
    bulkUpdateMealTimes,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemsByCafeteria,
    getMenuItemsByMealTime,
    toggleMenuItemAvailability,
    isLoading
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

// ============================================
// HOOKS
// ============================================

/**
 * Main hook for accessing product context
 */
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

/**
 * Backward compatibility hook - alias for useMenu
 */
export const useMenu = () => {
  const context = useProducts();
  return {
    menuItems: context.menuItems,
    addMenuItem: context.addMenuItem,
    updateMenuItem: context.updateMenuItem,
    deleteMenuItem: context.deleteMenuItem,
    getMenuItemsByCafeteria: context.getMenuItemsByCafeteria,
    getMenuItemsByMealTime: context.getMenuItemsByMealTime,
    getCurrentMealTime: context.getCurrentMealTime,
    toggleMenuItemAvailability: context.toggleMenuItemAvailability,
    bulkUpdateMealTimes: context.bulkUpdateMealTimes
  };
};

/**
 * Hook for business-specific product operations
 */
export const useBusinessProducts = (businessId: string) => {
  const {
    getProductsByBusiness,
    getProductsByCategory,
    getAvailableProducts,
    searchProducts,
    getLowStockProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    decrementStock,
    toggleProductAvailability
  } = useProducts();
  
  const products = getProductsByBusiness(businessId);
  const availableProducts = getAvailableProducts(businessId);
  const lowStockProducts = getLowStockProducts(businessId);
  
  return {
    products,
    availableProducts,
    lowStockProducts,
    getByCategory: (category: string) => getProductsByCategory(businessId, category),
    search: (query: string) => searchProducts(businessId, query),
    add: addProduct,
    update: updateProduct,
    remove: deleteProduct,
    updateStock,
    decrementStock,
    toggleAvailability: toggleProductAvailability,
    totalCount: products.length,
    availableCount: availableProducts.length,
    lowStockCount: lowStockProducts.length
  };
};
