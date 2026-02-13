"use client";

import { useEffect } from 'react';

/**
 * Hook to synchronize data across tabs/windows using localStorage events
 * This ensures that changes made in one tab (e.g., partner dashboard) 
 * are immediately reflected in other tabs (e.g., student ordering)
 */
export const useRealtimeSync = (
  storageKeys: string[],
  onSync: () => void
) => {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check if the changed key is one we're monitoring
      if (e.key && storageKeys.includes(e.key)) {
        console.log(`[RealtimeSync] Detected change in ${e.key} from another tab`);
        onSync();
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      // Handle same-tab updates via custom event
      if (e.detail?.key && storageKeys.includes(e.detail.key)) {
        console.log(`[RealtimeSync] Detected change in ${e.detail.key} from same tab`);
        onSync();
      }
    };

    // Listen for storage events (fires when localStorage changes in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (fires when localStorage changes in the same tab)
    window.addEventListener('localStorageUpdate', handleCustomStorageChange as EventListener);

    // Set up a fast polling interval for real-time updates (2 seconds for better UX)
    const interval = setInterval(() => {
      onSync();
    }, 2000); // Poll every 2 seconds for near real-time updates

    console.log(`[RealtimeSync] Started monitoring: ${storageKeys.join(', ')}`);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange as EventListener);
      clearInterval(interval);
      console.log(`[RealtimeSync] Stopped monitoring: ${storageKeys.join(', ')}`);
    };
  }, [storageKeys, onSync]);
};

/**
 * Trigger a manual sync event
 * Call this after making changes to localStorage to notify other tabs
 */
export const triggerSync = (key: string) => {
  // Dispatch a custom event to notify same-tab listeners
  window.dispatchEvent(new CustomEvent('localStorageUpdate', { detail: { key } }));
  
  // For cross-tab communication, we rely on the native 'storage' event
  // which fires automatically when localStorage is modified
  console.log(`[RealtimeSync] Triggered sync for ${key}`);
};
