"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { MOCK_PARTNERS, MOCK_CAFETERIAS, ADMIN_ACCOUNT } from '@/lib/mockData';
import { PARTNER_ACCOUNTS } from '@/lib/seedBusinessData';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  getCafeteria: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Restore partner session from localStorage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('partnerUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } catch (error) {
        localStorage.removeItem('partnerUser');
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check admin credentials first
    const adminAccount = ADMIN_ACCOUNT;
    if (credentials.email === adminAccount.email && credentials.password === adminAccount.password) {
      const user: User = {
        id: adminAccount.id,
        email: adminAccount.email,
        name: adminAccount.name,
        role: 'admin',
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      localStorage.setItem('partnerUser', JSON.stringify(user));
      return;
    }

    // Check localStorage partners first (seeded data)
    let partner = null;
    const savedPartners = localStorage.getItem('partners');
    if (savedPartners) {
      try {
        const partners = JSON.parse(savedPartners);
        partner = partners.find(
          (p: any) => p.email === credentials.email && p.password === credentials.password
        );
      } catch (error) {
        console.error('Failed to parse partners:', error);
      }
    }
    
    // Fallback to MOCK_PARTNERS
    if (!partner) {
      partner = MOCK_PARTNERS.find(
        p => p.email === credentials.email && p.password === credentials.password
      );
    }

    // Final fallback to PARTNER_ACCOUNTS from seedBusinessData
    if (!partner) {
      partner = PARTNER_ACCOUNTS.find(
        p => p.email === credentials.email && p.password === credentials.password
      );
    }

    if (partner) {
      const businessId = partner.businessId || partner.cafeteriaId;
      const user: User = {
        id: partner.id || businessId,
        email: partner.email,
        name: partner.name,
        role: 'partner',
        cafeteriaId: businessId,  // backward compat
        businessId: businessId,   // new field
        businessType: partner.businessType,
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Save partner session to localStorage
      localStorage.setItem('partnerUser', JSON.stringify(user));
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid credentials. Try admin@thegrill.com / demo123'
      });
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    // Remove partner session from localStorage
    localStorage.removeItem('partnerUser');
  }, []);

  const getCafeteria = useCallback(() => {
    const businessId = authState.user?.businessId || authState.user?.cafeteriaId;
    if (!businessId) return null;

    // Try businesses from localStorage first (new system)
    const savedBusinesses = localStorage.getItem('businesses');
    if (savedBusinesses) {
      try {
        const businesses = JSON.parse(savedBusinesses);
        const found = businesses.find((b: any) => b.id === businessId);
        if (found) {
          // Normalize to cafeteria-like shape for backward compat
          return {
            id: found.id,
            name: found.name,
            slug: found.slug,
            description: found.description,
            image: found.image,
            location: found.location,
            rating: found.rating,
            isOpen: found.isOpen,
            openingHours: found.openingHours || { open: '08:00', close: '22:00' },
            categories: found.categories || [],
            partnerId: found.partnerId,
            businessType: found.businessType,
          };
        }
      } catch (error) {
        console.error('Failed to load businesses:', error);
      }
    }

    // Fallback to cafeterias localStorage
    const savedCafeterias = localStorage.getItem('cafeterias');
    if (savedCafeterias) {
      try {
        const cafeterias = JSON.parse(savedCafeterias);
        return cafeterias.find((c: any) => c.id === businessId);
      } catch (error) {
        console.error('Failed to load cafeterias:', error);
      }
    }

    // Final fallback to MOCK_CAFETERIAS
    return MOCK_CAFETERIAS.find(c => c.id === businessId) || null;
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, getCafeteria }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
