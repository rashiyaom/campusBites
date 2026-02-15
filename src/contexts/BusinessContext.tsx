"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Business, 
  BusinessType, 
  CATEGORY_MAP, 
  BUSINESS_FEATURES,
  getBusinessFeatures 
} from '@/types/business';
import { Cafeteria } from '@/types/menu';
import { MOCK_CAFETERIAS } from '@/lib/mockData';
import { 
  migrateCafeteriaToBusiness, 
  businessToCafeteria,
  createSampleBusinesses,
  autoMigrate 
} from '@/lib/migration';

// ============================================
// CONTEXT TYPE DEFINITION
// ============================================

interface BusinessContextType {
  // Business data
  businesses: Business[];
  
  // CRUD operations
  addBusiness: (business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  
  // Query methods
  getBusinessById: (id: string) => Business | undefined;
  getBusinessesByType: (type: BusinessType) => Business[];
  getBusinessByPartnerId: (partnerId: string) => Business | undefined;
  
  // Category helpers
  getCategoriesForBusiness: (businessId: string) => string[];
  
  // Feature flags
  getFeatures: (businessId: string) => ReturnType<typeof getBusinessFeatures> | null;
  
  // Backward compatibility - these map to businesses internally
  cafeterias: Cafeteria[];
  getCafeteriaById: (id: string) => Cafeteria | undefined;
  updateCafeteria: (id: string, updates: Partial<Cafeteria>) => void;
  
  // Loading state
  isLoading: boolean;
}

// ============================================
// CONTEXT CREATION
// ============================================

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export const BusinessProvider = ({ children }: { children: React.ReactNode }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // ==========================================
  // INITIALIZATION & MIGRATION
  // ==========================================
  
  useEffect(() => {
    const initializeBusinesses = () => {
      setIsLoading(true);
      
      // First, run auto-migration if needed
      autoMigrate();
      
      // Try to load businesses from localStorage
      const savedBusinesses = localStorage.getItem('businesses');
      
      if (savedBusinesses) {
        try {
          const parsed = JSON.parse(savedBusinesses);
          const businessData = parsed.map((b: any) => ({
            ...b,
            createdAt: new Date(b.createdAt),
            updatedAt: new Date(b.updatedAt)
          }));
          setBusinesses(businessData);
          console.log(`[BusinessContext] Loaded ${businessData.length} businesses from storage`);
        } catch (error) {
          console.error('[BusinessContext] Failed to load businesses:', error);
          initializeWithDefaultData();
        }
      } else {
        // Check if old cafeterias exist and migrate them
        const savedCafeterias = localStorage.getItem('cafeterias');
        
        if (savedCafeterias) {
          try {
            const cafeterias: Cafeteria[] = JSON.parse(savedCafeterias);
            const migratedBusinesses = cafeterias.map(migrateCafeteriaToBusiness);
            
            // Add sample businesses for other types
            const sampleBusinesses = createSampleBusinesses();
            const allBusinesses = [...migratedBusinesses, ...sampleBusinesses];
            
            setBusinesses(allBusinesses);
            localStorage.setItem('businesses', JSON.stringify(allBusinesses));
            console.log(`[BusinessContext] Migrated ${migratedBusinesses.length} cafeterias + ${sampleBusinesses.length} samples`);
          } catch (error) {
            console.error('[BusinessContext] Migration failed:', error);
            initializeWithDefaultData();
          }
        } else {
          initializeWithDefaultData();
        }
      }
      
      setIsLoading(false);
      setIsInitialized(true);
    };
    
    const initializeWithDefaultData = () => {
      // Convert mock cafeterias to businesses
      const foodBusinesses = MOCK_CAFETERIAS.map(migrateCafeteriaToBusiness);
      
      // Add sample businesses for other types
      const sampleBusinesses = createSampleBusinesses();
      
      const allBusinesses = [...foodBusinesses, ...sampleBusinesses];
      setBusinesses(allBusinesses);
      localStorage.setItem('businesses', JSON.stringify(allBusinesses));
      
      // Also save cafeterias for backward compatibility
      localStorage.setItem('cafeterias', JSON.stringify(MOCK_CAFETERIAS));
      
      console.log('[BusinessContext] Initialized with default data');
    };
    
    initializeBusinesses();
  }, []);

  // ==========================================
  // PERSISTENCE
  // ==========================================
  
  useEffect(() => {
    if (isInitialized && businesses.length > 0) {
      localStorage.setItem('businesses', JSON.stringify(businesses));
      
      // Also update cafeterias for backward compatibility
      const foodBusinesses = businesses.filter(b => b.businessType === 'food');
      const cafeterias = foodBusinesses.map(businessToCafeteria);
      localStorage.setItem('cafeterias', JSON.stringify(cafeterias));
    }
  }, [businesses, isInitialized]);

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================
  
  const addBusiness = useCallback((business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBusiness: Business = {
      ...business,
      id: `business-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBusinesses(prev => [...prev, newBusiness]);
  }, []);

  const updateBusiness = useCallback((id: string, updates: Partial<Business>) => {
    setBusinesses(prev => 
      prev.map(business => 
        business.id === id 
          ? { ...business, ...updates, updatedAt: new Date() }
          : business
      )
    );
  }, []);

  const deleteBusiness = useCallback((id: string) => {
    setBusinesses(prev => prev.filter(business => business.id !== id));
  }, []);

  // ==========================================
  // QUERY METHODS
  // ==========================================
  
  const getBusinessById = useCallback((id: string): Business | undefined => {
    return businesses.find(b => b.id === id);
  }, [businesses]);

  const getBusinessesByType = useCallback((type: BusinessType): Business[] => {
    return businesses.filter(b => b.businessType === type);
  }, [businesses]);

  const getBusinessByPartnerId = useCallback((partnerId: string): Business | undefined => {
    return businesses.find(b => b.partnerId === partnerId);
  }, [businesses]);

  const getCategoriesForBusiness = useCallback((businessId: string): string[] => {
    const business = businesses.find(b => b.id === businessId);
    if (!business) return [];
    
    // Return business-specific categories or default for type
    return business.categories.length > 0 
      ? business.categories 
      : CATEGORY_MAP[business.businessType];
  }, [businesses]);

  const getFeatures = useCallback((businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business) return null;
    return BUSINESS_FEATURES[business.businessType];
  }, [businesses]);

  // ==========================================
  // BACKWARD COMPATIBILITY
  // ==========================================
  
  // Cafeterias are just food-type businesses
  const cafeterias: Cafeteria[] = React.useMemo(() => {
    return businesses
      .filter(b => b.businessType === 'food')
      .map(businessToCafeteria);
  }, [businesses]);

  const getCafeteriaById = useCallback((id: string): Cafeteria | undefined => {
    const business = businesses.find(b => b.id === id && b.businessType === 'food');
    return business ? businessToCafeteria(business) : undefined;
  }, [businesses]);

  const updateCafeteria = useCallback((id: string, updates: Partial<Cafeteria>) => {
    // Convert Cafeteria updates to Business updates
    updateBusiness(id, updates);
  }, [updateBusiness]);

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  
  const contextValue: BusinessContextType = {
    businesses,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    getBusinessById,
    getBusinessesByType,
    getBusinessByPartnerId,
    getCategoriesForBusiness,
    getFeatures,
    cafeterias,
    getCafeteriaById,
    updateCafeteria,
    isLoading
  };

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

// ============================================
// HOOKS
// ============================================

/**
 * Main hook for accessing business context
 */
export const useBusinesses = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinesses must be used within a BusinessProvider');
  }
  return context;
};

/**
 * Backward compatibility hook - alias for useCafeterias
 * Returns only food-type businesses as cafeterias
 */
export const useCafeterias = () => {
  const context = useBusinesses();
  return {
    cafeterias: context.cafeterias,
    updateCafeteria: context.updateCafeteria,
    getCafeteriaById: context.getCafeteriaById
  };
};

/**
 * Hook for getting business by current partner
 */
export const useCurrentBusiness = (partnerId: string | undefined) => {
  const { getBusinessByPartnerId, getFeatures, getCategoriesForBusiness } = useBusinesses();
  
  const business = partnerId ? getBusinessByPartnerId(partnerId) : undefined;
  const features = business ? getFeatures(business.id) : null;
  const categories = business ? getCategoriesForBusiness(business.id) : [];
  
  return {
    business,
    businessType: business?.businessType,
    features,
    categories,
    isFood: business?.businessType === 'food',
    isGrocery: business?.businessType === 'grocery',
    isStationery: business?.businessType === 'stationery',
    isEssentials: business?.businessType === 'daily_essentials'
  };
};

/**
 * Hook for business type specific operations
 */
export const useBusinessType = (type: BusinessType) => {
  const { getBusinessesByType } = useBusinesses();
  
  const businesses = getBusinessesByType(type);
  const features = BUSINESS_FEATURES[type];
  const categories = CATEGORY_MAP[type];
  
  return {
    businesses,
    features,
    categories,
    count: businesses.length
  };
};
