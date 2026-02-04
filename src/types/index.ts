// Type definitions for CampusBites

// Re-export all types from menu and auth modules
export * from './menu';
export * from './auth';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'runner' | 'admin' | 'partner';
  cafeteriaId?: string;
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
