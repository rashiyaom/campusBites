"use client";

import React, { createContext, useContext, useState } from 'react';
import { MenuItem, MealTime } from '@/types';
import { SEED_MENU_ITEMS } from '@/lib/seedMenuItems';
import { triggerSync } from '@/hooks/useRealtimeSync';

interface MenuContextType {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  getMenuItemsByCafeteria: (cafeteriaId: string) => MenuItem[];
  getMenuItemsByMealTime: (cafeteriaId: string, mealTime: MealTime) => MenuItem[];
  getCurrentMealTime: () => MealTime;
  toggleMenuItemAvailability: (id: string) => void;
  bulkUpdateMealTimes: (itemIds: string[], mealTimes: MealTime[]) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load menu items from localStorage on mount, or initialize with seed data
  React.useEffect(() => {
    const savedItems = localStorage.getItem('menuItems');
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        // Convert date strings back to Date objects
        const items = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setMenuItems(items);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load menu items:', error);
      }
    } else {
      // Initialize with seed data if no saved items exist
      const initialItems = SEED_MENU_ITEMS.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      setMenuItems(initialItems);
      localStorage.setItem('menuItems', JSON.stringify(initialItems));
      setIsInitialized(true);
    }
  }, []);

  // Save menu items to localStorage whenever they change (only after initialization)
  React.useEffect(() => {
    if (isInitialized && menuItems.length > 0) {
      localStorage.setItem('menuItems', JSON.stringify(menuItems));
      triggerSync('menuItems'); // Notify other tabs
    }
  }, [menuItems, isInitialized]);

  // Listen for storage changes from other tabs/windows
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      const key = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail?.key;
      
      if (key === 'menuItems') {
        const savedItems = localStorage.getItem('menuItems');
        if (savedItems) {
          try {
            const parsed = JSON.parse(savedItems);
            const items = parsed.map((item: any) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            }));
            
            // Use functional update to avoid dependency warnings
            setMenuItems(prev => {
              // Only update if data actually changed (compare item IDs)
              const prevIds = prev.map(i => i.id).sort().join(',');
              const newIds = items.map((i: any) => i.id).sort().join(',');
              
              if (prevIds !== newIds || prev.length !== items.length) {
                console.log('[MenuContext] Synced menu items from storage');
                return items;
              }
              return prev;
            });
          } catch (error) {
            console.error('Failed to sync menu items:', error);
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

  const addMenuItem = (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      )
    );
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const getMenuItemsByCafeteria = (cafeteriaId: string) => {
    return menuItems.filter(item => item.cafeteriaId === cafeteriaId);
  };

  const getMenuItemsByMealTime = (cafeteriaId: string, mealTime: MealTime) => {
    return menuItems.filter(item => 
      item.cafeteriaId === cafeteriaId && 
      item.available &&
      (item.mealTimes?.includes(mealTime) || item.mealTimes?.includes('all-day'))
    );
  };

  const getCurrentMealTime = (): MealTime => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'all-day';
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, available: !item.available, updatedAt: new Date() }
          : item
      )
    );
  };

  const bulkUpdateMealTimes = (itemIds: string[], mealTimes: MealTime[]) => {
    setMenuItems(prev =>
      prev.map(item =>
        itemIds.includes(item.id)
          ? { ...item, mealTimes, updatedAt: new Date() }
          : item
      )
    );
  };

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getMenuItemsByCafeteria,
        getMenuItemsByMealTime,
        getCurrentMealTime,
        toggleMenuItemAvailability,
        bulkUpdateMealTimes,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
