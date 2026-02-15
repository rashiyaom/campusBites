// Type definitions for CampusBites

// Re-export all types from menu and auth modules
export * from './menu';
export * from './auth';

// Re-export business types (excluding MealTime which conflicts with menu.ts)
export type { 
  BusinessType, 
  Business, 
  BusinessSettings,
  Product,
  ProductUnit,
  BusinessFeatureFlags,
  BusinessUIConfig,
  ProductFormField 
} from './business';

export { 
  CATEGORY_MAP,
  BUSINESS_FEATURES,
  ORDER_STATUS_CONFIG,
  BUSINESS_UI_CONFIG,
  PRODUCT_FORM_FIELDS,
  getBusinessTypeLabel,
  getCategoriesForBusinessType,
  requiresInventoryTracking,
  isLowStock
} from './business';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'runner' | 'admin' | 'partner';
  cafeteriaId?: string;
  businessId?: string; // For multi-business support
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  cafeteria: string;
  prepTime: string;
  calories?: number;
  rating: number;
  reviewCount: number;
  available: boolean;
}

export interface Activity {
  id: string;
  user: string;
  action: 'ordered' | 'picked up' | 'reviewed';
  item: string;
  location: string;
  time: string;
}
