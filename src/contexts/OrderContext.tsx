"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { MOCK_ORDERS } from '@/lib/mockData';
import { triggerSync } from '@/hooks/useRealtimeSync';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, estimatedCompletionMinutes?: number) => void;
  setOrderEstimatedTime: (orderId: string, minutes: number) => void;
  getOrdersByCafeteria: (cafeteriaId: string) => Order[];
  getOrderPreparationTime: (orderId: string) => number; // Returns minutes in current status
  getOrderTotalTime: (orderId: string) => number; // Returns total minutes since creation
  isOrderLate: (orderId: string) => boolean;
  deleteOrder: (orderId: string) => void; // Delete/remove an order
  refreshOrders: () => Promise<void>; // Force refresh from localStorage
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Flag to prevent triggering sync when loading from external source
  const isLoadingFromStorageRef = React.useRef(false);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        // Convert date strings back to Date objects
        const ordersData = parsed.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          scheduledTime: order.scheduledTime ? new Date(order.scheduledTime) : undefined,
        }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
        // Initialize with empty array if parsing fails
        setOrders([]);
        localStorage.setItem('orders', JSON.stringify([]));
      }
    } else {
      // First time - start with NO orders (empty array)
      // Orders will only appear when users actually place them
      setOrders([]);
      localStorage.setItem('orders', JSON.stringify([]));
      console.log('[OrderContext] Initialized with empty order list - orders will appear when users place them');
    }
    setIsInitialized(true);
  }, []);

  // Save orders to localStorage whenever they change (only after initialization)
  // Skip triggering sync if we're loading from storage (to avoid infinite loops)
  useEffect(() => {
    if (isInitialized && !isLoadingFromStorageRef.current) {
      localStorage.setItem('orders', JSON.stringify(orders));
      triggerSync('orders'); // Notify other tabs
      console.log(`[OrderContext] Saved ${orders.length} orders to storage`);
    }
    // Reset the flag after the effect runs
    isLoadingFromStorageRef.current = false;
  }, [orders, isInitialized]);

  // Listen for storage changes from OTHER tabs/windows only (native storage event)
  // We do NOT listen for localStorageUpdate since that's for same-tab which we already handle
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle native storage events (cross-tab)
      if (e.key === 'orders') {
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
          try {
            const parsed = JSON.parse(savedOrders);
            const ordersData = parsed.map((order: any) => ({
              ...order,
              createdAt: new Date(order.createdAt),
              updatedAt: new Date(order.updatedAt),
              scheduledTime: order.scheduledTime ? new Date(order.scheduledTime) : undefined,
            }));
            
            // Set flag to prevent triggering sync when we update from storage
            isLoadingFromStorageRef.current = true;
            
            // Use functional update to only update if data actually changed
            setOrders(prev => {
              const prevIds = prev.map(o => o.id).sort().join(',');
              const newIds = ordersData.map((o: any) => o.id).sort().join(',');
              
              // Also check status changes
              const prevStatuses = prev.map(o => `${o.id}:${o.status}`).sort().join(',');
              const newStatuses = ordersData.map((o: any) => `${o.id}:${o.status}`).sort().join(',');
              
              if (prevIds !== newIds || prevStatuses !== newStatuses) {
                console.log('[OrderContext] Synced orders from other tab');
                return ordersData;
              }
              isLoadingFromStorageRef.current = false; // Reset if no change
              return prev;
            });
          } catch (error) {
            console.error('Failed to sync orders:', error);
            isLoadingFromStorageRef.current = false;
          }
        }
      }
    };

    // Only listen for native storage event (cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, estimatedCompletionMinutes?: number) => {
    setOrders(prev => {
      const updated = prev.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { 
            ...order, 
            status, 
            updatedAt: new Date()
          };
          
          // Set estimated time if provided
          if (estimatedCompletionMinutes) {
            updatedOrder.estimatedTime = `${estimatedCompletionMinutes} mins`;
          }
          
          console.log(`[OrderContext] Updated order ${orderId} status to ${status}`);
          return updatedOrder;
        }
        return order;
      });
      
      return updated;
    });
  };

  const setOrderEstimatedTime = (orderId: string, minutes: number) => {
    setOrders(prev => {
      const updated = prev.map(order =>
        order.id === orderId
          ? { ...order, estimatedTime: `${minutes} mins` }
          : order
      );
      
      return updated;
    });
  };

  const getOrderPreparationTime = (orderId: string): number => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;
    
    const now = new Date();
    const updatedAt = new Date(order.updatedAt);
    const diffMs = now.getTime() - updatedAt.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  };

  const getOrderTotalTime = (orderId: string): number => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;
    
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMs = now.getTime() - createdAt.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  };

  const isOrderLate = (orderId: string): boolean => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    
    // Extract estimated time in minutes
    const estimatedMatch = order.estimatedTime.match(/(\d+)/);
    const estimatedMinutes = estimatedMatch ? parseInt(estimatedMatch[1]) : 15; // Default 15 mins
    
    const totalTime = getOrderTotalTime(orderId);
    
    // Consider late if total time exceeds estimated time + 5 minute buffer
    return totalTime > (estimatedMinutes + 5);
  };

  const getOrdersByCafeteria = (cafeteriaId: string) => {
    return orders.filter(order => order.cafeteriaId === cafeteriaId);
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const refreshOrders = async (): Promise<void> => {
    return new Promise((resolve) => {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);
          // Convert date strings back to Date objects
          const ordersData = parsed.map((order: any) => ({
            ...order,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            scheduledTime: order.scheduledTime ? new Date(order.scheduledTime) : undefined,
          }));
          
          // Set flag to prevent triggering sync (we're just reading, not changing)
          isLoadingFromStorageRef.current = true;
          
          setOrders(prev => {
            // Only update if there are actual changes
            const prevJson = JSON.stringify(prev.map(o => ({ id: o.id, status: o.status, paymentStatus: o.paymentStatus })));
            const newJson = JSON.stringify(ordersData.map((o: any) => ({ id: o.id, status: o.status, paymentStatus: o.paymentStatus })));
            
            if (prevJson !== newJson) {
              console.log(`[OrderContext] Refreshed ${ordersData.length} orders from localStorage`);
              return ordersData;
            }
            console.log('[OrderContext] No changes detected during refresh');
            isLoadingFromStorageRef.current = false; // Reset if no change
            return prev;
          });
          resolve();
        } catch (error) {
          console.error('[OrderContext] Failed to refresh orders:', error);
          isLoadingFromStorageRef.current = false;
          resolve();
        }
      } else {
        console.log('[OrderContext] No orders in localStorage to refresh');
        isLoadingFromStorageRef.current = true;
        setOrders([]);
        resolve();
      }
    });
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        setOrderEstimatedTime,
        getOrdersByCafeteria,
        getOrderPreparationTime,
        getOrderTotalTime,
        isOrderLate,
        deleteOrder,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
