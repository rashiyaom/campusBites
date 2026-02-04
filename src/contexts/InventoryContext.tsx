"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { triggerSync } from '@/hooks/useRealtimeSync';

export interface InventoryItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  cafeteriaId: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: Date;
  lowStockAlert: boolean;
  notes?: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  getInventoryByCafeteria: (cafeteriaId: string) => InventoryItem[];
  getInventoryByMenuItem: (menuItemId: string) => InventoryItem | undefined;
  updateStock: (itemId: string, newStock: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lowStockAlert' | 'lastRestocked'>) => void;
  removeInventoryItem: (itemId: string) => void;
  getLowStockItems: (cafeteriaId: string) => InventoryItem[];
  restockItem: (itemId: string, quantity: number) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Load inventory from localStorage
  useEffect(() => {
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      const parsed = JSON.parse(savedInventory);
      // Convert date strings back to Date objects
      const inventoryWithDates = parsed.map((item: any) => ({
        ...item,
        lastRestocked: new Date(item.lastRestocked),
      }));
      setInventory(inventoryWithDates);
    } else {
      // Initialize with mock data
      const mockInventory: InventoryItem[] = [
        // The Grill (cafe-1) inventory
        {
          id: 'inv-1',
          menuItemId: 'item-1',
          menuItemName: 'Double Cheese Smash',
          cafeteriaId: 'cafe-1',
          currentStock: 25,
          minStock: 10,
          maxStock: 50,
          unit: 'servings',
          lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lowStockAlert: false,
        },
        {
          id: 'inv-2',
          menuItemId: 'item-1',
          menuItemName: 'Double Cheese Smash',
          cafeteriaId: 'cafe-1',
          currentStock: 8,
          minStock: 15,
          maxStock: 40,
          unit: 'beef patties',
          lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lowStockAlert: true,
          notes: 'Beef patty inventory low - restock needed',
        },
        {
          id: 'inv-3',
          menuItemId: 'item-1',
          menuItemName: 'Double Cheese Smash',
          cafeteriaId: 'cafe-1',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          unit: 'buns',
          lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lowStockAlert: false,
        },
        {
          id: 'inv-4',
          menuItemId: 'item-1',
          menuItemName: 'Double Cheese Smash',
          cafeteriaId: 'cafe-1',
          currentStock: 12,
          minStock: 10,
          maxStock: 30,
          unit: 'cheese slices',
          lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lowStockAlert: false,
        },
        // Sushi Corner (cafe-2) inventory
        {
          id: 'inv-5',
          menuItemId: 'item-2',
          menuItemName: 'Spicy Tuna Roll',
          cafeteriaId: 'cafe-2',
          currentStock: 18,
          minStock: 12,
          maxStock: 40,
          unit: 'servings',
          lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lowStockAlert: false,
        },
        {
          id: 'inv-6',
          menuItemId: 'item-2',
          menuItemName: 'Spicy Tuna Roll',
          cafeteriaId: 'cafe-2',
          currentStock: 5,
          minStock: 8,
          maxStock: 25,
          unit: 'kg tuna',
          lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lowStockAlert: true,
          notes: 'Fresh tuna running low',
        },
        {
          id: 'inv-7',
          menuItemId: 'item-2',
          menuItemName: 'Spicy Tuna Roll',
          cafeteriaId: 'cafe-2',
          currentStock: 30,
          minStock: 15,
          maxStock: 60,
          unit: 'nori sheets',
          lastRestocked: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          lowStockAlert: false,
        },
        // Coffee & Co (cafe-3) inventory
        {
          id: 'inv-8',
          menuItemId: 'item-3',
          menuItemName: 'Caramel Latte',
          cafeteriaId: 'cafe-3',
          currentStock: 35,
          minStock: 20,
          maxStock: 80,
          unit: 'servings',
          lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          lowStockAlert: false,
        },
        {
          id: 'inv-9',
          menuItemId: 'item-3',
          menuItemName: 'Caramel Latte',
          cafeteriaId: 'cafe-3',
          currentStock: 15,
          minStock: 25,
          maxStock: 100,
          unit: 'liters milk',
          lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          lowStockAlert: true,
          notes: 'Milk supply low - order more',
        },
        {
          id: 'inv-10',
          menuItemId: 'item-3',
          menuItemName: 'Caramel Latte',
          cafeteriaId: 'cafe-3',
          currentStock: 8,
          minStock: 10,
          maxStock: 40,
          unit: 'kg coffee beans',
          lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          lowStockAlert: true,
          notes: 'Coffee beans running low',
        },
      ];
      setInventory(mockInventory);
      localStorage.setItem('inventory', JSON.stringify(mockInventory));
    }
  }, []);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
      triggerSync('inventory'); // Notify other tabs
    }
  }, [inventory]);

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      const key = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail?.key;
      
      if (key === 'inventory') {
        const savedInventory = localStorage.getItem('inventory');
        if (savedInventory) {
          try {
            const parsed = JSON.parse(savedInventory);
            const inventoryWithDates = parsed.map((item: any) => ({
              ...item,
              lastRestocked: new Date(item.lastRestocked),
            }));
            
            // Use functional update to avoid dependency warnings
            setInventory(prev => {
              // Only update if data actually changed
              if (JSON.stringify(prev) !== JSON.stringify(inventoryWithDates)) {
                console.log('[InventoryContext] Synced inventory from storage');
                return inventoryWithDates;
              }
              return prev;
            });
          } catch (error) {
            console.error('Failed to sync inventory:', error);
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

  const getInventoryByCafeteria = (cafeteriaId: string): InventoryItem[] => {
    return inventory.filter(item => item.cafeteriaId === cafeteriaId);
  };

  const getInventoryByMenuItem = (menuItemId: string): InventoryItem | undefined => {
    return inventory.find(item => item.menuItemId === menuItemId);
  };

  const updateStock = (itemId: string, newStock: number) => {
    setInventory(prevInventory =>
      prevInventory.map(item => {
        if (item.id === itemId) {
          const lowStockAlert = newStock <= item.minStock;
          return { ...item, currentStock: newStock, lowStockAlert };
        }
        return item;
      })
    );
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lowStockAlert' | 'lastRestocked'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lowStockAlert: item.currentStock <= item.minStock,
      lastRestocked: new Date(),
    };
    setInventory(prevInventory => [...prevInventory, newItem]);
  };

  const removeInventoryItem = (itemId: string) => {
    setInventory(prevInventory => prevInventory.filter(item => item.id !== itemId));
  };

  const getLowStockItems = (cafeteriaId: string): InventoryItem[] => {
    return inventory.filter(item => item.cafeteriaId === cafeteriaId && item.lowStockAlert);
  };

  const restockItem = (itemId: string, quantity: number) => {
    setInventory(prevInventory =>
      prevInventory.map(item => {
        if (item.id === itemId) {
          const newStock = item.currentStock + quantity;
          const lowStockAlert = newStock <= item.minStock;
          return {
            ...item,
            currentStock: newStock,
            lowStockAlert,
            lastRestocked: new Date(),
          };
        }
        return item;
      })
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        getInventoryByCafeteria,
        getInventoryByMenuItem,
        updateStock,
        addInventoryItem,
        removeInventoryItem,
        getLowStockItems,
        restockItem,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
