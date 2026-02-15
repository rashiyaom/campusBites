// Business Types for Multi-Vendor Platform
// This enables the system to support Food, Grocery, Stationery, and Daily Essentials

// ============================================
// BUSINESS TYPE DEFINITIONS
// ============================================

export type BusinessType = 'food' | 'grocery' | 'stationery' | 'daily_essentials';

export interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  isOpen: boolean;
  openingHours: {
    open: string;
    close: string;
  };
  categories: string[];
  partnerId: string;
  
  // NEW: Business type differentiation
  businessType: BusinessType;
  
  // Contact info
  phone?: string;
  email?: string;
  
  // Business-specific settings
  settings?: BusinessSettings;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSettings {
  // Order settings
  minOrderAmount?: number;
  maxOrderItems?: number;
  acceptsScheduledOrders: boolean;
  
  // Delivery settings
  deliveryRadius?: number; // in km
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  
  // Business hours (can override for specific days)
  specialHours?: {
    [day: string]: { open: string; close: string; closed?: boolean };
  };
}

// ============================================
// PRODUCT (Universal - replaces MenuItem)
// ============================================

export type ProductUnit = 'piece' | 'kg' | 'g' | 'litre' | 'ml' | 'pack' | 'dozen' | 'box' | 'can' | 'set' | 'ream' | 'tube' | 'bar' | 'bottle' | 'tray' | 'jar' | 'carton' | 'bag';

export interface Product {
  id: string;
  businessId: string;
  businessType?: BusinessType; // NEW: Track which business type this product belongs to
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  
  // Common optional fields
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // ============================================
  // FOOD-SPECIFIC FIELDS
  // ============================================
  isVeg?: boolean;
  prepTime?: string;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  mealTimes?: MealTime[];
  isPopular?: boolean;
  isFeatured?: boolean;
  customizationOptions?: string[];
  servingSize?: string;
  
  // ============================================
  // INVENTORY FIELDS (Grocery, Stationery, Essentials)
  // ============================================
  stock?: number;
  lowStockThreshold?: number;
  unit?: ProductUnit;
  brand?: string;
  sku?: string;
  barcode?: string;
  
  // Pricing variations
  mrp?: number; // Maximum Retail Price
  discountPercent?: number;
  bulkPricing?: {
    minQty: number;
    price: number;
  }[];
  
  // Product specifications
  weight?: string;
  dimensions?: string;
  expiryDate?: Date;
  manufacturingDate?: Date;
  
  // ============================================
  // STATIONERY-SPECIFIC
  // ============================================
  color?: string;
  colorVariants?: string[];
  size?: string;
  sizeVariants?: string[];
  material?: string;
  
  // Tags for better searchability
  tags?: string[];
}

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'all-day';

// ============================================
// CATEGORY CONFIGURATION BY BUSINESS TYPE
// ============================================

export const CATEGORY_MAP: Record<BusinessType, string[]> = {
  food: [
    'Burgers', 'Pizza', 'Sandwiches', 'Beverages', 'Snacks', 
    'Breakfast', 'Lunch Specials', 'Dinner', 'Desserts', 
    'Coffee', 'Tea', 'Healthy', 'Indian', 'Chinese', 'Italian'
  ],
  grocery: [
    'Dairy & Eggs', 'Bakery', 'Snacks', 'Beverages', 'Instant Food',
    'Rice & Grains', 'Cooking Essentials', 'Frozen Food', 'Fruits',
    'Canned Goods', 'Dry Fruits', 'Organic'
  ],
  stationery: [
    'Pens & Pencils', 'Notebooks', 'Art Supplies', 'Office Supplies',
    'Files & Folders', 'Calculators', 'Paper Products', 'Geometry Tools',
    'Markers & Highlighters', 'Exam Essentials', 'Gift Items'
  ],
  daily_essentials: [
    'Toiletries', 'Personal Care', 'Cleaning Supplies', 'Laundry',
    'Health & Hygiene', 'First Aid', 'Batteries & Electronics',
    'Room Essentials', 'Kitchen Essentials'
  ]
};

// ============================================
// BUSINESS FEATURE FLAGS
// ============================================

export interface BusinessFeatureFlags {
  requiresPreparation: boolean;
  trackInventory: boolean;
  allowScheduledOrders: boolean;
  showNutritionInfo: boolean;
  enableCustomization: boolean;
  requiresDelivery: boolean;
  showBrandFilter: boolean;
  showVegFilter: boolean;
  enableBulkOrdering: boolean;
}

export const BUSINESS_FEATURES: Record<BusinessType, BusinessFeatureFlags> = {
  food: {
    requiresPreparation: true,
    trackInventory: false,
    allowScheduledOrders: true,
    showNutritionInfo: true,
    enableCustomization: true,
    requiresDelivery: true,
    showBrandFilter: false,
    showVegFilter: true,
    enableBulkOrdering: false
  },
  grocery: {
    requiresPreparation: false,
    trackInventory: true,
    allowScheduledOrders: true,
    showNutritionInfo: false,
    enableCustomization: false,
    requiresDelivery: true,
    showBrandFilter: true,
    showVegFilter: true,
    enableBulkOrdering: true
  },
  stationery: {
    requiresPreparation: false,
    trackInventory: true,
    allowScheduledOrders: false,
    showNutritionInfo: false,
    enableCustomization: false,
    requiresDelivery: true,
    showBrandFilter: true,
    showVegFilter: false,
    enableBulkOrdering: true
  },
  daily_essentials: {
    requiresPreparation: false,
    trackInventory: true,
    allowScheduledOrders: true,
    showNutritionInfo: false,
    enableCustomization: false,
    requiresDelivery: true,
    showBrandFilter: true,
    showVegFilter: false,
    enableBulkOrdering: false
  }
};

// ============================================
// ORDER STATUS BY BUSINESS TYPE
// ============================================

export const ORDER_STATUS_CONFIG: Record<BusinessType, {
  statuses: string[];
  skipStatuses: string[];
}> = {
  food: {
    statuses: ['pending', 'approved', 'confirmed', 'preparing', 'ready', 'completed'],
    skipStatuses: [] // All statuses apply
  },
  grocery: {
    statuses: ['pending', 'approved', 'confirmed', 'packing', 'ready', 'completed'],
    skipStatuses: ['preparing'] // Skip "preparing" - use "packing" instead
  },
  stationery: {
    statuses: ['pending', 'approved', 'confirmed', 'packing', 'ready', 'completed'],
    skipStatuses: ['preparing']
  },
  daily_essentials: {
    statuses: ['pending', 'approved', 'confirmed', 'packing', 'ready', 'completed'],
    skipStatuses: ['preparing']
  }
};

// ============================================
// UI CONFIGURATION BY BUSINESS TYPE
// ============================================

export interface BusinessUIConfig {
  icon: string;
  color: string;
  bgColor: string;
  gradientFrom: string;
  gradientTo: string;
  label: string;
  description: string;
}

export const BUSINESS_UI_CONFIG: Record<BusinessType, BusinessUIConfig> = {
  food: {
    icon: '🍔',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
    label: 'Food & Beverages',
    description: 'Order delicious food from campus cafeterias'
  },
  grocery: {
    icon: '🛒',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-500',
    label: 'Grocery',
    description: 'Get daily groceries delivered to your doorstep'
  },
  stationery: {
    icon: '✏️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-indigo-500',
    label: 'Stationery',
    description: 'All your academic supplies in one place'
  },
  daily_essentials: {
    icon: '🧴',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-violet-500',
    label: 'Daily Essentials',
    description: 'Toiletries, cleaning supplies, and more'
  }
};

// ============================================
// PRODUCT FORM FIELDS BY BUSINESS TYPE
// ============================================

export interface ProductFormField {
  name: keyof Product;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'toggle' | 'date' | 'multiselect';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
}

export const PRODUCT_FORM_FIELDS: Record<BusinessType, ProductFormField[]> = {
  food: [
    { name: 'name', label: 'Dish Name', type: 'text', required: true, placeholder: 'e.g., Double Cheese Burger' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe your dish...' },
    { name: 'price', label: 'Price (₹)', type: 'number', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true },
    { name: 'isVeg', label: 'Vegetarian', type: 'toggle', required: false },
    { name: 'prepTime', label: 'Preparation Time', type: 'text', required: false, placeholder: '10-15 min' },
    { name: 'calories', label: 'Calories', type: 'number', required: false },
    { name: 'ingredients', label: 'Ingredients', type: 'text', required: false, placeholder: 'Comma separated' },
    { name: 'allergens', label: 'Allergens', type: 'text', required: false, placeholder: 'Comma separated' },
    { name: 'mealTimes', label: 'Available During', type: 'multiselect', required: false, options: [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'all-day', label: 'All Day' }
    ]},
    { name: 'customizationOptions', label: 'Customization Options', type: 'text', required: false, placeholder: 'Comma separated' },
    { name: 'isAvailable', label: 'Available Now', type: 'toggle', required: false }
  ],
  grocery: [
    { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Basmati Rice' },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'brand', label: 'Brand', type: 'text', required: false, placeholder: 'e.g., Fortune' },
    { name: 'price', label: 'Selling Price (₹)', type: 'number', required: true },
    { name: 'mrp', label: 'MRP (₹)', type: 'number', required: false },
    { name: 'discountPercent', label: 'Discount %', type: 'number', required: false },
    { name: 'category', label: 'Category', type: 'select', required: true },
    { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'piece', label: 'Piece' },
      { value: 'kg', label: 'Kilogram' },
      { value: 'g', label: 'Gram' },
      { value: 'litre', label: 'Litre' },
      { value: 'ml', label: 'Millilitre' },
      { value: 'pack', label: 'Pack' }
    ]},
    { name: 'weight', label: 'Weight/Size', type: 'text', required: false, placeholder: 'e.g., 1kg, 500ml' },
    { name: 'lowStockThreshold', label: 'Low Stock Alert At', type: 'number', required: false, helperText: 'Get notified when stock falls below this' },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: false },
    { name: 'isVeg', label: 'Vegetarian', type: 'toggle', required: false },
    { name: 'isAvailable', label: 'In Stock', type: 'toggle', required: false }
  ],
  stationery: [
    { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Pilot V5 Pen' },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'brand', label: 'Brand', type: 'text', required: false, placeholder: 'e.g., Pilot, Camlin' },
    { name: 'price', label: 'Selling Price (₹)', type: 'number', required: true },
    { name: 'mrp', label: 'MRP (₹)', type: 'number', required: false },
    { name: 'discountPercent', label: 'Discount %', type: 'number', required: false },
    { name: 'category', label: 'Category', type: 'select', required: true },
    { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'piece', label: 'Piece' },
      { value: 'pack', label: 'Pack' },
      { value: 'box', label: 'Box' },
      { value: 'dozen', label: 'Dozen' }
    ]},
    { name: 'color', label: 'Color', type: 'text', required: false, placeholder: 'e.g., Blue, Black' },
    { name: 'size', label: 'Size', type: 'text', required: false, placeholder: 'e.g., A4, A5' },
    { name: 'material', label: 'Material', type: 'text', required: false },
    { name: 'lowStockThreshold', label: 'Low Stock Alert At', type: 'number', required: false },
    { name: 'isAvailable', label: 'In Stock', type: 'toggle', required: false }
  ],
  daily_essentials: [
    { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Dettol Soap' },
    { name: 'description', label: 'Description', type: 'textarea', required: false },
    { name: 'brand', label: 'Brand', type: 'text', required: false, placeholder: 'e.g., Dettol, Surf Excel' },
    { name: 'price', label: 'Selling Price (₹)', type: 'number', required: true },
    { name: 'mrp', label: 'MRP (₹)', type: 'number', required: false },
    { name: 'discountPercent', label: 'Discount %', type: 'number', required: false },
    { name: 'category', label: 'Category', type: 'select', required: true },
    { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', required: true, options: [
      { value: 'piece', label: 'Piece' },
      { value: 'pack', label: 'Pack' },
      { value: 'litre', label: 'Litre' },
      { value: 'ml', label: 'Millilitre' },
      { value: 'kg', label: 'Kilogram' },
      { value: 'g', label: 'Gram' }
    ]},
    { name: 'weight', label: 'Weight/Size', type: 'text', required: false, placeholder: 'e.g., 100g, 500ml' },
    { name: 'lowStockThreshold', label: 'Low Stock Alert At', type: 'number', required: false },
    { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: false },
    { name: 'isAvailable', label: 'In Stock', type: 'toggle', required: false }
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get display label for business type
 */
export function getBusinessTypeLabel(type: BusinessType): string {
  return BUSINESS_UI_CONFIG[type].label;
}

/**
 * Get categories for a business type
 */
export function getCategoriesForBusinessType(type: BusinessType): string[] {
  return CATEGORY_MAP[type];
}

/**
 * Get feature flags for a business type
 */
export function getBusinessFeatures(type: BusinessType): BusinessFeatureFlags {
  return BUSINESS_FEATURES[type];
}

/**
 * Check if inventory tracking is required
 */
export function requiresInventoryTracking(type: BusinessType): boolean {
  return BUSINESS_FEATURES[type].trackInventory;
}

/**
 * Check if preparation status applies
 */
export function requiresPreparation(type: BusinessType): boolean {
  return BUSINESS_FEATURES[type].requiresPreparation;
}

/**
 * Get form fields for a business type
 */
export function getProductFormFields(type: BusinessType): ProductFormField[] {
  return PRODUCT_FORM_FIELDS[type];
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(mrp: number, price: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Check if product is low on stock
 */
export function isLowStock(product: Product): boolean {
  if (product.stock === undefined) return false;
  const threshold = product.lowStockThreshold || 10;
  return product.stock <= threshold;
}

/**
 * Format product unit for display
 */
export function formatProductUnit(unit?: ProductUnit, quantity?: number): string {
  if (!unit) return '';
  
  const unitLabels: Record<ProductUnit, { singular: string; plural: string }> = {
    piece: { singular: 'piece', plural: 'pieces' },
    kg: { singular: 'kg', plural: 'kg' },
    g: { singular: 'g', plural: 'g' },
    litre: { singular: 'litre', plural: 'litres' },
    ml: { singular: 'ml', plural: 'ml' },
    pack: { singular: 'pack', plural: 'packs' },
    dozen: { singular: 'dozen', plural: 'dozens' },
    box: { singular: 'box', plural: 'boxes' },
    can: { singular: 'can', plural: 'cans' },
    set: { singular: 'set', plural: 'sets' },
    ream: { singular: 'ream', plural: 'reams' },
    tube: { singular: 'tube', plural: 'tubes' },
    bar: { singular: 'bar', plural: 'bars' },
    bottle: { singular: 'bottle', plural: 'bottles' },
    tray: { singular: 'tray', plural: 'trays' },
    jar: { singular: 'jar', plural: 'jars' },
    carton: { singular: 'carton', plural: 'cartons' },
    bag: { singular: 'bag', plural: 'bags' }
  };
  
  const label = unitLabels[unit];
  if (quantity && quantity > 1) {
    return label.plural;
  }
  return label.singular;
}
