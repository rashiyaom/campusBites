/**
 * Migration Helper for Campus Bites
 * 
 * This module handles backward compatibility and migration from the old
 * cafeteria-based system to the new multi-business platform.
 */

import { Cafeteria, MenuItem } from '@/types/menu';
import { Business, Product, BusinessType } from '@/types/business';

// ============================================
// CAFETERIA → BUSINESS MIGRATION
// ============================================

/**
 * Migrate a single Cafeteria to Business format
 * All existing cafeterias become "food" type businesses
 */
export function migrateCafeteriaToBusiness(cafeteria: Cafeteria): Business {
  return {
    id: cafeteria.id,
    name: cafeteria.name,
    slug: cafeteria.slug,
    description: cafeteria.description,
    image: cafeteria.image,
    location: cafeteria.location,
    rating: cafeteria.rating,
    isOpen: cafeteria.isOpen,
    openingHours: cafeteria.openingHours,
    categories: cafeteria.categories,
    partnerId: cafeteria.partnerId,
    businessType: 'food', // All existing cafeterias are food businesses
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      acceptsScheduledOrders: true,
      deliveryFee: 0,
      freeDeliveryThreshold: 200
    }
  };
}

/**
 * Migrate all cafeterias to businesses
 */
export function migrateAllCafeterias(cafeterias: Cafeteria[]): Business[] {
  return cafeterias.map(migrateCafeteriaToBusiness);
}

// ============================================
// MENUITEM → PRODUCT MIGRATION
// ============================================

/**
 * Migrate a single MenuItem to Product format
 */
export function migrateMenuItemToProduct(menuItem: MenuItem): Product {
  return {
    id: menuItem.id,
    businessId: menuItem.cafeteriaId, // cafeteriaId becomes businessId
    name: menuItem.name,
    description: menuItem.description,
    price: menuItem.price,
    image: menuItem.image,
    category: menuItem.category,
    isAvailable: menuItem.available,
    rating: menuItem.rating,
    reviewCount: menuItem.reviewCount,
    createdAt: menuItem.createdAt,
    updatedAt: menuItem.updatedAt,
    
    // Food-specific fields
    isVeg: true, // Default, should be set properly
    prepTime: menuItem.prepTime,
    calories: menuItem.calories,
    ingredients: menuItem.ingredients,
    allergens: menuItem.allergens,
    mealTimes: menuItem.mealTimes,
    isPopular: menuItem.isPopular,
    isFeatured: menuItem.isFeatured,
    customizationOptions: menuItem.customizationOptions
  };
}

/**
 * Migrate all menu items to products
 */
export function migrateAllMenuItems(menuItems: MenuItem[]): Product[] {
  return menuItems.map(migrateMenuItemToProduct);
}

// ============================================
// BACKWARD COMPATIBILITY HELPERS
// ============================================

/**
 * Convert Business back to Cafeteria format (for backward compatibility)
 */
export function businessToCafeteria(business: Business): Cafeteria {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    image: business.image,
    location: business.location,
    rating: business.rating,
    isOpen: business.isOpen,
    openingHours: business.openingHours,
    categories: business.categories,
    partnerId: business.partnerId
  };
}

/**
 * Convert Product back to MenuItem format (for backward compatibility)
 */
export function productToMenuItem(product: Product): MenuItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    cafeteriaId: product.businessId, // businessId maps back to cafeteriaId
    prepTime: product.prepTime || '10-15 min',
    calories: product.calories,
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    available: product.isAvailable,
    ingredients: product.ingredients,
    allergens: product.allergens,
    mealTimes: product.mealTimes,
    isPopular: product.isPopular,
    isFeatured: product.isFeatured,
    customizationOptions: product.customizationOptions,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
}

// ============================================
// LOCALSTORAGE MIGRATION
// ============================================

/**
 * Check if migration is needed
 */
export function isMigrationNeeded(): boolean {
  // Check if old format exists without new format
  const hasCafeterias = localStorage.getItem('cafeterias') !== null;
  const hasBusinesses = localStorage.getItem('businesses') !== null;
  
  // Migration needed if cafeterias exist but businesses don't
  return hasCafeterias && !hasBusinesses;
}

/**
 * Perform full migration from old format to new format
 */
export function performMigration(): {
  businesses: Business[];
  products: Product[];
  success: boolean;
  message: string;
} {
  try {
    // Migrate cafeterias → businesses
    const cafeteriasJson = localStorage.getItem('cafeterias');
    let businesses: Business[] = [];
    
    if (cafeteriasJson) {
      const cafeterias: Cafeteria[] = JSON.parse(cafeteriasJson);
      businesses = migrateAllCafeterias(cafeterias);
      localStorage.setItem('businesses', JSON.stringify(businesses));
      console.log(`[Migration] Migrated ${businesses.length} cafeterias to businesses`);
    }
    
    // Migrate menuItems → products
    const menuItemsJson = localStorage.getItem('menuItems');
    let products: Product[] = [];
    
    if (menuItemsJson) {
      const menuItems: MenuItem[] = JSON.parse(menuItemsJson).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
      products = migrateAllMenuItems(menuItems);
      localStorage.setItem('products', JSON.stringify(products));
      console.log(`[Migration] Migrated ${products.length} menu items to products`);
    }
    
    // Mark migration as complete
    localStorage.setItem('migrationComplete', JSON.stringify({
      version: '2.0.0',
      migratedAt: new Date().toISOString(),
      cafeteriasCount: businesses.length,
      productsCount: products.length
    }));
    
    return {
      businesses,
      products,
      success: true,
      message: `Successfully migrated ${businesses.length} businesses and ${products.length} products`
    };
  } catch (error) {
    console.error('[Migration] Failed:', error);
    return {
      businesses: [],
      products: [],
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Auto-migrate on app load if needed
 */
export function autoMigrate(): void {
  const migrationInfo = localStorage.getItem('migrationComplete');
  
  if (!migrationInfo && isMigrationNeeded()) {
    console.log('[Migration] Auto-migration starting...');
    const result = performMigration();
    console.log('[Migration] Result:', result.message);
  }
}

// ============================================
// SAMPLE DATA FOR NEW BUSINESS TYPES
// ============================================

export const SAMPLE_GROCERY_PRODUCTS: Partial<Product>[] = [
  {
    name: 'Basmati Rice - Fortune',
    description: 'Premium aged basmati rice, perfect for biryani and pulao',
    brand: 'Fortune',
    price: 180,
    mrp: 200,
    category: 'Rice & Atta',
    stock: 50,
    unit: 'kg',
    weight: '1kg',
    isAvailable: true,
    isVeg: true
  },
  {
    name: 'Toor Dal - Tata Sampann',
    description: 'Unpolished toor dal, rich in protein',
    brand: 'Tata Sampann',
    price: 145,
    mrp: 160,
    category: 'Dal & Pulses',
    stock: 30,
    unit: 'kg',
    weight: '1kg',
    isAvailable: true,
    isVeg: true
  },
  {
    name: 'Amul Butter',
    description: 'Pasteurized butter, made from fresh cream',
    brand: 'Amul',
    price: 56,
    mrp: 58,
    category: 'Dairy & Eggs',
    stock: 40,
    unit: 'pack',
    weight: '100g',
    isAvailable: true,
    isVeg: true
  }
];

export const SAMPLE_STATIONERY_PRODUCTS: Partial<Product>[] = [
  {
    name: 'Pilot V5 Pen - Blue',
    description: 'Extra fine liquid ink rollerball pen',
    brand: 'Pilot',
    price: 45,
    mrp: 50,
    category: 'Pens & Pencils',
    stock: 100,
    unit: 'piece',
    color: 'Blue',
    isAvailable: true
  },
  {
    name: 'Classmate Notebook - 180 Pages',
    description: 'Single line ruled notebook, A4 size',
    brand: 'Classmate',
    price: 60,
    mrp: 65,
    category: 'Notebooks & Registers',
    stock: 75,
    unit: 'piece',
    size: 'A4',
    isAvailable: true
  },
  {
    name: 'Apsara Drawing Pencils Set',
    description: 'Set of 6 grades: 2B, 3B, 4B, 5B, 6B, 8B',
    brand: 'Apsara',
    price: 120,
    mrp: 140,
    category: 'Art Supplies',
    stock: 40,
    unit: 'pack',
    isAvailable: true
  }
];

export const SAMPLE_ESSENTIALS_PRODUCTS: Partial<Product>[] = [
  {
    name: 'Dettol Soap - Original',
    description: 'Antibacterial soap for germ protection',
    brand: 'Dettol',
    price: 40,
    mrp: 45,
    category: 'Toiletries',
    stock: 60,
    unit: 'piece',
    weight: '75g',
    isAvailable: true
  },
  {
    name: 'Surf Excel Matic',
    description: 'Front load washing machine detergent',
    brand: 'Surf Excel',
    price: 230,
    mrp: 250,
    category: 'Laundry',
    stock: 25,
    unit: 'pack',
    weight: '1kg',
    isAvailable: true
  },
  {
    name: 'Colin Glass Cleaner',
    description: 'Streak-free shine for glass surfaces',
    brand: 'Colin',
    price: 95,
    mrp: 110,
    category: 'Cleaning Supplies',
    stock: 30,
    unit: 'piece',
    weight: '500ml',
    isAvailable: true
  }
];

/**
 * Create sample businesses for demo
 */
export function createSampleBusinesses(): Business[] {
  return [
    {
      id: 'grocery-1',
      name: 'Campus Mart',
      slug: 'campus-mart',
      description: 'Your one-stop shop for all grocery needs',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
      location: 'Hostel Block A',
      rating: 4.6,
      isOpen: true,
      openingHours: { open: '08:00', close: '22:00' },
      categories: ['Rice & Atta', 'Dal & Pulses', 'Dairy & Eggs', 'Snacks & Chips'],
      partnerId: 'partner-grocery-1',
      businessType: 'grocery',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'stationery-1',
      name: 'Scholar Supplies',
      slug: 'scholar-supplies',
      description: 'Everything you need for academic success',
      image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
      location: 'Near Library',
      rating: 4.8,
      isOpen: true,
      openingHours: { open: '09:00', close: '20:00' },
      categories: ['Pens & Pencils', 'Notebooks & Registers', 'Files & Folders', 'Art Supplies'],
      partnerId: 'partner-stationery-1',
      businessType: 'stationery',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'essentials-1',
      name: 'Daily Needs Store',
      slug: 'daily-needs-store',
      description: 'Toiletries, cleaning supplies, and daily essentials',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80',
      location: 'Student Center',
      rating: 4.5,
      isOpen: true,
      openingHours: { open: '07:00', close: '23:00' },
      categories: ['Toiletries', 'Cleaning Supplies', 'Laundry', 'Health & Hygiene'],
      partnerId: 'partner-essentials-1',
      businessType: 'daily_essentials',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}
