"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { useCurrentBusiness } from '@/contexts/BusinessContext';
import ProductForm from '@/components/partner/ProductForm';
import { Product, BUSINESS_UI_CONFIG, BusinessType } from '@/types/business';
import { ArrowLeft, Moon, Sun, Edit } from 'lucide-react';

const EditMenuItem = () => {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { user, isAuthenticated } = useAuth();
  const { products, updateProduct } = useProducts();
  const { business } = useCurrentBusiness(user?.id);

  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const businessType: BusinessType = (business as any)?.type || 'food';
  const uiConfig = BUSINESS_UI_CONFIG[businessType];

  useEffect(() => {
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
      return;
    }
  }, [isAuthenticated, user, router]);

  // Load product data
  useEffect(() => {
    if (itemId && products.length > 0) {
      const found = products.find(p => p.id === itemId);
      if (found) {
        setProduct(found);
        setIsLoading(false);
      } else {
        alert('Product not found');
        router.push('/partner/menu');
      }
    } else if (products.length > 0) {
      setIsLoading(false);
    }
  }, [itemId, products, router]);

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

  const handleSubmit = async (data: Partial<Product>) => {
    if (!product) return;
    
    try {
      updateProduct(product.id, data);
      alert('Product updated successfully!');
      router.push('/partner/menu');
    } catch (error) {
      alert('Failed to update product. Please try again.');
      throw error;
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin`} 
             style={{ borderColor: `${uiConfig.color} transparent transparent transparent` }}></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Product not found</p>
          <button 
            onClick={() => router.push('/partner/menu')}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg`} style={{ background: `linear-gradient(to right, ${uiConfig.gradientFrom}, ${uiConfig.gradientTo})` }}>
                  <Edit size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-gray-900 dark:text-white">
                    Edit Product
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {uiConfig.label} • {product.name}
                  </p>
                </div>
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
        {/* Current Product Preview */}
        {product.image && (
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-20 h-20 rounded-xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                }}
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                <p className="text-lg font-black" style={{ color: uiConfig.color }}>₹{product.price}</p>
              </div>
              {product.isAvailable ? (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">
                  Available
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                  Unavailable
                </span>
              )}
            </div>
          </div>
        )}

        {/* Edit Form */}
        <ProductForm
          businessId={business?.id || product.businessId}
          businessType={businessType}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/partner/menu')}
          initialData={product}
        />
      </main>
    </div>
  );
};

export default EditMenuItem;
