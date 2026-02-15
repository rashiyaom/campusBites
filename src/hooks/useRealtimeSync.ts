"use client";

import { useEffect, useRef } from 'react';

/**
 * Hook to synchronize data across tabs/windows using localStorage events
 * This ensures that changes made in one tab (e.g., partner dashboard) 
 * are immediately reflected in other tabs (e.g., student ordering)
 * 
 * IMPORTANT: 
 * - Uses useRef to store the callback to avoid infinite re-renders
 * - Only listens for cross-tab storage events (native 'storage' event)
 * - Does NOT listen for same-tab events to avoid infinite loops
 * - Uses polling as backup for cases where storage events might be missed
 */
export const useRealtimeSync = (
  storageKeys: string[],
  onSync: () => void
) => {
  // Use ref to store callback - this prevents infinite loops when onSync is inline function
  const onSyncRef = useRef(onSync);
  const keysRef = useRef(storageKeys);
  const lastSyncRef = useRef<number>(0);
  
  // Update refs whenever values change (without triggering re-render)
  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  useEffect(() => {
    keysRef.current = storageKeys;
  }, [storageKeys]);

  useEffect(() => {
    // Handle cross-tab storage changes only
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && keysRef.current.includes(e.key)) {
        console.log(`[RealtimeSync] Detected change in ${e.key} from another tab`);
        lastSyncRef.current = Date.now();
        onSyncRef.current();
      }
    };

    // Listen for storage events (fires when localStorage changes in another tab)
    window.addEventListener('storage', handleStorageChange);

    // Polling as backup - but with throttling to avoid excessive calls
    const interval = setInterval(() => {
      // Only poll if no recent sync happened
      if (Date.now() - lastSyncRef.current > 1500) {
        onSyncRef.current();
        lastSyncRef.current = Date.now();
      }
    }, 2000);

    console.log(`[RealtimeSync] Started monitoring: ${storageKeys.join(', ')}`);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      console.log(`[RealtimeSync] Stopped monitoring: ${storageKeys.join(', ')}`);
    };
  }, []); // Empty dependency array - setup only once
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
