"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { triggerSync } from '@/hooks/useRealtimeSync';

export interface Notification {
  id: string;
  type: 'order_approved' | 'order_declined' | 'order_update' | 'payment_required' | 'order_ready' | 'info';
  title: string;
  message: string;
  orderId?: string;
  status?: OrderStatus;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  // For popup display
  activePopup: Notification | null;
  dismissPopup: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activePopup, setActivePopup] = useState<Notification | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const notificationsData = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsData);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  // Listen for notification events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      const key = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail?.key;
      
      if (key === 'notifications') {
        const saved = localStorage.getItem('notifications');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const notificationsData = parsed.map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp),
            }));
            setNotifications(notificationsData);
          } catch (error) {
            console.error('Failed to sync notifications:', error);
          }
        }
      }
      
      // Listen for new popup notification trigger
      if (key === 'newNotificationPopup') {
        const popupData = localStorage.getItem('newNotificationPopup');
        if (popupData) {
          try {
            const popup = JSON.parse(popupData);
            popup.timestamp = new Date(popup.timestamp);
            setActivePopup(popup);
            // Clear the trigger
            localStorage.removeItem('newNotificationPopup');
          } catch (error) {
            console.error('Failed to show popup:', error);
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

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show popup for important notifications
    if (notification.actionRequired || 
        notification.type === 'order_approved' || 
        notification.type === 'order_declined' ||
        notification.type === 'order_ready') {
      setActivePopup(newNotification);
      
      // Store in localStorage to trigger popup in other tabs
      localStorage.setItem('newNotificationPopup', JSON.stringify(newNotification));
      triggerSync('notifications');
    }
    
    console.log('[NotificationContext] Added notification:', newNotification.title);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (activePopup?.id === id) {
      setActivePopup(null);
    }
  }, [activePopup]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setActivePopup(null);
  }, []);

  const dismissPopup = useCallback(() => {
    if (activePopup) {
      markAsRead(activePopup.id);
    }
    setActivePopup(null);
  }, [activePopup, markAsRead]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        activePopup,
        dismissPopup,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
