// Mock data for demo purposes
import type { Cafeteria, MenuItem, Order, BusinessStats } from '@/types/menu';
import type { User } from '@/types/auth';

export const MOCK_CAFETERIAS: Cafeteria[] = [
  {
    id: 'cafe-1',
    name: 'The Grill',
    slug: 'the-grill',
    description: 'Premium burgers, sandwiches, and American classics',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    location: 'Student Union Building',
    rating: 4.8,
    isOpen: true,
    openingHours: { open: '07:00', close: '22:00' },
    categories: ['Burgers', 'Sandwiches', 'Fries'],
    partnerId: 'partner-1'
  },
  {
    id: 'cafe-2',
    name: 'Sushi Corner',
    slug: 'sushi-corner',
    description: 'Fresh sushi, sashimi, and Japanese cuisine',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80',
    location: 'Library Ground Floor',
    rating: 4.9,
    isOpen: true,
    openingHours: { open: '11:00', close: '20:00' },
    categories: ['Sushi', 'Japanese', 'Healthy'],
    partnerId: 'partner-2'
  },
  {
    id: 'cafe-3',
    name: 'Coffee & Co',
    slug: 'coffee-co',
    description: 'Artisan coffee, pastries, and light bites',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80',
    location: 'North Hall',
    rating: 4.7,
    isOpen: true,
    openingHours: { open: '06:00', close: '18:00' },
    categories: ['Coffee', 'Pastries', 'Breakfast'],
    partnerId: 'partner-3'
  }
];

// Mock partner credentials
export const MOCK_PARTNERS = [
  { email: 'admin@thegrill.com', password: 'demo123', cafeteriaId: 'cafe-1', name: 'The Grill Admin' },
  { email: 'admin@sushicorner.com', password: 'demo123', cafeteriaId: 'cafe-2', name: 'Sushi Corner Admin' },
  { email: 'admin@coffeeco.com', password: 'demo123', cafeteriaId: 'cafe-3', name: 'Coffee & Co Admin' }
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Double Cheese Smash',
    description: 'Double beef patties, aged cheddar, special sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    category: 'Burgers',
    cafeteriaId: 'cafe-1',
    prepTime: '10-15 min',
    calories: 850,
    rating: 4.8,
    reviewCount: 234,
    available: true,
    mealTimes: ['lunch', 'dinner'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'item-2',
    name: 'Spicy Tuna Roll',
    description: 'Fresh tuna, spicy mayo, cucumber, avocado',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
    category: 'Sushi',
    cafeteriaId: 'cafe-2',
    prepTime: '5-8 min',
    calories: 320,
    rating: 4.9,
    reviewCount: 189,
    available: true,
    mealTimes: ['lunch', 'dinner'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'item-3',
    name: 'Caramel Latte',
    description: 'Espresso, steamed milk, caramel drizzle',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80',
    category: 'Coffee',
    cafeteriaId: 'cafe-3',
    prepTime: '3-5 min',
    calories: 250,
    rating: 4.7,
    reviewCount: 445,
    available: true,
    mealTimes: ['all-day'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: '#ORD-1001',
    // Complete Student Information
    studentName: 'Alex Martinez',
    studentId: 'STU-2024-001',
    studentEmail: 'alex.martinez@university.edu',
    studentPhone: '+1 (555) 234-5678',
    studentInstitute: 'University of Technology',
    studentDepartment: 'Computer Science',
    // Legacy fields
    customerName: 'Alex Martinez',
    customerPhone: '+1 (555) 234-5678',
    deliveryAddress: 'Library 3F - Study Room B',
    items: [
      {
        menuItem: MOCK_MENU_ITEMS[0],
        name: 'Double Cheese Smash',
        quantity: 2,
        specialInstructions: 'Extra pickles, no onions',
        subtotal: 25.98
      }
    ],
    total: 25.98,
    status: 'preparing',
    deliveryType: 'delivery',
    deliveryLocation: 'Library 3F',
    cafeteriaId: 'cafe-1',
    cafeteriaName: 'The Grill',
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(),
    estimatedTime: '10 min',
    specialInstructions: 'Please call when arriving'
  },
  {
    id: 'order-2',
    orderNumber: '#ORD-1002',
    // Complete Student Information
    studentName: 'Sarah Johnson',
    studentId: 'STU-2024-042',
    studentEmail: 'sarah.j@university.edu',
    studentPhone: '+1 (555) 876-5432',
    studentInstitute: 'University of Technology',
    studentDepartment: 'Electrical Engineering',
    // Legacy fields
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 876-5432',
    deliveryAddress: 'Cafeteria Pickup Counter',
    items: [
      {
        menuItem: MOCK_MENU_ITEMS[1],
        name: 'Spicy Tuna Roll',
        quantity: 1,
        specialInstructions: 'Light on wasabi',
        subtotal: 14.50
      }
    ],
    total: 14.50,
    status: 'confirmed',
    deliveryType: 'pickup',
    cafeteriaId: 'cafe-2',
    cafeteriaName: 'Sushi Corner',
    createdAt: new Date(Date.now() - 2 * 60000),
    updatedAt: new Date(),
    estimatedTime: '5 min'
  }
];

export const MOCK_STATS: BusinessStats = {
  todayRevenue: 2847.50,
  activeOrders: 12,
  totalOrders: 187,
  averageRating: 4.8,
  completionRate: 98.5
};
