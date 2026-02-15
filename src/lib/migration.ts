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
// NOTE: Sample data for all business types lives in 
// /lib/seedBusinessData.ts (BUSINESSES, SAMPLE_PRODUCTS, PARTNER_ACCOUNTS)
// That is the single source of truth.
// ============================================
