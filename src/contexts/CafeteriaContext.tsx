"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cafeteria } from '@/types';
import { MOCK_CAFETERIAS } from '@/lib/mockData';

interface CafeteriaContextType {
  cafeterias: Cafeteria[];
  updateCafeteria: (id: string, updates: Partial<Cafeteria>) => void;
  getCafeteriaById: (id: string) => Cafeteria | undefined;
}

const CafeteriaContext = createContext<CafeteriaContextType | undefined>(undefined);

export const CafeteriaProvider = ({ children }: { children: React.ReactNode }) => {
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);

  useEffect(() => {
    // Try to derive cafeterias from businesses first (single source of truth)
    const savedBusinesses = localStorage.getItem('businesses');
    if (savedBusinesses) {
      try {
        const businesses = JSON.parse(savedBusinesses);
        // Convert all businesses to cafeteria-like shape (for backward compat)
        const allCafeterias = businesses.map((b: any) => ({
          id: b.id,
          name: b.name,
          slug: b.slug || b.name?.toLowerCase().replace(/\s+/g, '-') || b.id,
          description: b.description,
          image: b.image,
          location: b.location,
          rating: b.rating,
          isOpen: b.isOpen,
          openingHours: b.openingHours || { open: b.openTime || '08:00', close: b.closeTime || '22:00' },
          categories: b.categories || [],
          partnerId: b.partnerId,
          businessType: b.businessType || b.type || 'food',
        }));
        setCafeterias(allCafeterias);
        return;
      } catch (error) {
        console.error('Failed to load businesses for cafeterias:', error);
      }
    }

    // Fallback: load from cafeterias key
    const savedCafeterias = localStorage.getItem('cafeterias');
    if (savedCafeterias) {
      try {
        setCafeterias(JSON.parse(savedCafeterias));
      } catch (error) {
        console.error('Failed to load cafeterias:', error);
        setCafeterias(MOCK_CAFETERIAS);
      }
    } else {
      setCafeterias(MOCK_CAFETERIAS);
    }
  }, []);

  // Re-sync when storage changes (cross-tab) or businesses update (same tab)
  useEffect(() => {
    const syncFromBusinesses = () => {
      const savedBusinesses = localStorage.getItem('businesses');
      if (savedBusinesses) {
        try {
          const businesses = JSON.parse(savedBusinesses);
          const allCafeterias = businesses.map((b: any) => ({
            id: b.id,
            name: b.name,
            slug: b.slug || b.id,
            description: b.description,
            image: b.image,
            location: b.location,
            rating: b.rating,
            isOpen: b.isOpen,
            openingHours: b.openingHours || { open: '08:00', close: '22:00' },
            categories: b.categories || [],
            partnerId: b.partnerId,
            businessType: b.businessType || b.type || 'food',
          }));
          setCafeterias(allCafeterias);
        } catch (error) {
          console.error('Failed to sync cafeterias:', error);
        }
      }
    };

    window.addEventListener('storage', syncFromBusinesses);
    window.addEventListener('businesses-updated', syncFromBusinesses);
    return () => {
      window.removeEventListener('storage', syncFromBusinesses);
      window.removeEventListener('businesses-updated', syncFromBusinesses);
    };
  }, []);

  const updateCafeteria = (id: string, updates: Partial<Cafeteria>) => {
    setCafeterias(prev =>
      prev.map(cafe =>
        cafe.id === id ? { ...cafe, ...updates } : cafe
      )
    );
  };

  const getCafeteriaById = (id: string) => {
    return cafeterias.find(cafe => cafe.id === id);
  };

  return (
    <CafeteriaContext.Provider
      value={{
        cafeterias,
        updateCafeteria,
        getCafeteriaById,
      }}
    >
      {children}
    </CafeteriaContext.Provider>
  );
};

export const useCafeterias = () => {
  const context = useContext(CafeteriaContext);
  if (context === undefined) {
    throw new Error('useCafeterias must be used within a CafeteriaProvider');
  }
  return context;
};
