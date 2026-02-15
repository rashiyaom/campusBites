"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { MOCK_PARTNERS, MOCK_CAFETERIAS } from '@/lib/mockData';

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

    if (partner) {
      const user: User = {
        id: partner.id || partner.cafeteriaId,
        email: partner.email,
        name: partner.name,
        role: 'partner',
        cafeteriaId: partner.businessId || partner.cafeteriaId
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
    if (authState.user?.cafeteriaId) {
      // Try to get from localStorage first (for updated data)
      const savedCafeterias = localStorage.getItem('cafeterias');
      if (savedCafeterias) {
        try {
          const cafeterias = JSON.parse(savedCafeterias);
          return cafeterias.find((c: any) => c.id === authState.user?.cafeteriaId);
        } catch (error) {
          console.error('Failed to load cafeterias:', error);
        }
      }
      // Fallback to MOCK_CAFETERIAS
      return MOCK_CAFETERIAS.find(c => c.id === authState.user?.cafeteriaId);
    }
    return null;
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
