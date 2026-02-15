"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { useCurrentBusiness } from '@/contexts/BusinessContext';
import { Product, BUSINESS_UI_CONFIG, BusinessType } from '@/types/business';
import ProductForm from '@/components/partner/ProductForm';
import { ArrowLeft, Moon, Sun } from 'lucide-react';

const NewProductPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, getCafeteria } = useAuth();
  const { addProduct } = useProducts();
  const cafeteria = getCafeteria();
  const { business } = useCurrentBusiness(user?.id);
  
  const [isDark, setIsDark] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine business type and ID
  const businessId = business?.id || cafeteria?.id || '';
  const businessType: BusinessType = business?.businessType || 'food';
  const uiConfig = BUSINESS_UI_CONFIG[businessType];

  useEffect(() => {
    // Check theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'partner') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSubmit = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      addProduct(productData);
      
      // Success - redirect to menu
      router.push('/partner/menu');
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/partner/menu');
  };

  if (!isAuthenticated || (!cafeteria && !business)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const productLabel = businessType === 'food' ? 'Menu Item' : 'Product';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/partner/menu')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{uiConfig.icon}</span>
                <h1 className="text-lg font-black text-gray-900 dark:text-white">
                  Add New {productLabel}
                </h1>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Adding {productLabel.toLowerCase()}...</p>
            </div>
          ) : (
            <ProductForm
              businessId={businessId}
              businessType={businessType}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default NewProductPage;
