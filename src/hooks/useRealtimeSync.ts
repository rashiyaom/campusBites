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
        console.log(`[RealtimeSync] Detected change in ${e.key}`);
        onSync();
      }
    };

    // Listen for storage events (fires when localStorage changes in another tab)
    window.addEventListener('storage', handleStorageChange);

    // Also set up a polling interval as a fallback (for same-tab updates)
    const interval = setInterval(() => {
      onSync();
    }, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
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
