// Menu and Order types

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'all-day';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  cafeteriaId: string;
  prepTime: string;
  calories?: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  ingredients?: string[];
  allergens?: string[];
  mealTimes?: MealTime[]; // When this item is available (optional, defaults to all-day)
  isPopular?: boolean; // Marked by partner or auto-calculated
  isFeatured?: boolean; // Featured items shown prominently
  customizationOptions?: string[]; // e.g., ["Extra cheese", "No onions"]
  createdAt: Date;
  updatedAt: Date;
}

export interface Cafeteria {
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
}

export interface Order {
  id: string;
  orderNumber: string;
  // Student Information
  studentName: string;
  studentId: string;
  studentEmail?: string;
  studentPhone?: string;
  studentInstitute?: string;
  studentDepartment?: string;
  // Legacy customer fields (for backward compatibility)
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryType: 'pickup' | 'delivery' | 'scheduled';
  deliveryLocation?: string;
  scheduledTime?: Date;
  cafeteriaId: string;
  cafeteriaName: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedTime: string;
  specialInstructions?: string;
  statusHistory?: OrderStatusUpdate[]; // Track status changes
  notifyCustomer?: boolean; // Whether to send notifications
  // Payment tracking
  paymentStatus?: 'unpaid' | 'pending' | 'completed' | 'refunded';
  paymentMethod?: 'cash' | 'upi' | 'card' | 'wallet';
  paymentId?: string;
  paidAt?: Date;
  // Partner response
  partnerNote?: string; // Note from partner (approval/decline reason)
  approvedAt?: Date;
  declinedAt?: Date;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: Date;
  updatedBy: string; // Partner ID or system
  notes?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  name: string;
  quantity: number;
  specialInstructions?: string;
  subtotal: number;
}

export type OrderStatus = 
  | 'pending'           // Order request submitted, awaiting partner approval
  | 'approved'          // Partner approved, awaiting student payment
  | 'payment_pending'   // Alias for approved (awaiting payment)
  | 'declined'          // Partner declined the order request
  | 'confirmed'         // Payment completed, order confirmed
  | 'preparing'         // Being prepared by kitchen
  | 'ready'             // Ready for pickup/delivery
  | 'completed'         // Order completed
  | 'cancelled';        // Order cancelled

export interface BusinessStats {
  todayRevenue: number;
  activeOrders: number;
  totalOrders: number;
  averageRating: number;
  completionRate: number;
}
