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
    // Try to load from localStorage first
    const savedCafeterias = localStorage.getItem('cafeterias');
    if (savedCafeterias) {
      try {
        setCafeterias(JSON.parse(savedCafeterias));
      } catch (error) {
        console.error('Failed to load cafeterias:', error);
        // Fallback to mock data
        setCafeterias(MOCK_CAFETERIAS);
        localStorage.setItem('cafeterias', JSON.stringify(MOCK_CAFETERIAS));
      }
    } else {
      // First time - use mock data and save it
      setCafeterias(MOCK_CAFETERIAS);
      localStorage.setItem('cafeterias', JSON.stringify(MOCK_CAFETERIAS));
    }
  }, []);

  // Save to localStorage whenever cafeterias change
  useEffect(() => {
    if (cafeterias.length > 0) {
      localStorage.setItem('cafeterias', JSON.stringify(cafeterias));
    }
  }, [cafeterias]);

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
