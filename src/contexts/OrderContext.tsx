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
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('orders', JSON.stringify(orders));
      triggerSync('orders'); // Notify other tabs
      console.log(`[OrderContext] Saved ${orders.length} orders to storage`);
    }
  }, [orders, isInitialized]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      const key = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail?.key;
      
      if (key === 'orders') {
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
            
            // Use functional update to avoid dependency warnings
            setOrders(prev => {
              // Only update if data actually changed (compare order IDs)
              const prevIds = prev.map(o => o.id).sort().join(',');
              const newIds = ordersData.map((o: any) => o.id).sort().join(',');
              
              if (prevIds !== newIds || prev.length !== ordersData.length) {
                console.log('[OrderContext] Synced orders from storage');
                return ordersData;
              }
              return prev;
            });
          } catch (error) {
            console.error('Failed to sync orders:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageUpdate', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageUpdate', handleStorageChange as EventListener);
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
