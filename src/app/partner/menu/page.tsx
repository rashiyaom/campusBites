"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';
import { useCurrentBusiness } from '@/contexts/BusinessContext';
import { Product, BUSINESS_UI_CONFIG, CATEGORY_MAP, isLowStock } from '@/types/business';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Moon, Sun, AlertTriangle, Package } from 'lucide-react';

const MenuManager = () => {
  const router = useRouter();
  const { user, isAuthenticated, getCafeteria } = useAuth();
  const { getProductsByBusiness, updateProduct, deleteProduct, toggleProductAvailability } = useProducts();
  const cafeteria = getCafeteria();
  const { business } = useCurrentBusiness(user?.id);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDark, setIsDark] = useState(false);

  // Get business type config
  const businessId = business?.id || cafeteria?.id;
  const businessType = business?.businessType || 'food';
  const uiConfig = BUSINESS_UI_CONFIG[businessType];
  const categories = CATEGORY_MAP[businessType];

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
      return;
    }
  }, [isAuthenticated, user, router]);

  // Update local state when business changes
  useEffect(() => {
    if (businessId) {
      const items = getProductsByBusiness(businessId);
      setProducts(items);
    }
  }, [businessId]);

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

  const handleToggleAvailability = (productId: string) => {
    toggleProductAvailability(productId);
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
      )
    );
  };

  const handleDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const productCategories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const lowStockCount = products.filter(isLowStock).length;

  if (!isAuthenticated || (!cafeteria && !business)) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
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
                onClick={() => router.push('/partner/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{uiConfig.icon}</span>
                <h1 className="text-lg font-black text-gray-900 dark:text-white">
                  {businessType === 'food' ? 'Menu Manager' : 'Product Manager'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Low Stock Alert */}
              {lowStockCount > 0 && businessType !== 'food' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-medium">
                  <AlertTriangle size={16} />
                  <span>{lowStockCount} low stock</span>
                </div>
              )}
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
              <button
                onClick={() => router.push('/partner/menu/new')}
                className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${uiConfig.gradientFrom} ${uiConfig.gradientTo} text-white rounded-xl font-bold transition-all hover:opacity-90 shadow-md`}
              >
                <Plus size={20} />
                Add {productLabel}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${productLabel.toLowerCase()}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {productCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    filterCategory === category
                      ? `bg-gradient-to-r ${uiConfig.gradientFrom} ${uiConfig.gradientTo} text-white`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all ${
                !product.isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img
                  src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {/* Veg/Non-Veg Badge for Food */}
                  {businessType === 'food' && product.isVeg !== undefined && (
                    <span className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center ${
                      product.isVeg ? 'border-green-500' : 'border-red-500'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        product.isVeg ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.isAvailable
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {product.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                {/* Low Stock Warning */}
                {isLowStock(product) && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">
                    <AlertTriangle size={12} />
                    Low Stock: {product.stock}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`text-2xl font-black ${uiConfig.color}`}>
                      ₹{(product.price).toFixed(2)}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        ₹{product.mrp.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 ${uiConfig.bgColor} rounded-full text-xs font-bold ${uiConfig.color}`}>
                    {product.category}
                  </span>
                </div>

                {/* Product Meta */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 flex-wrap">
                  {product.rating !== undefined && product.rating > 0 && (
                    <>
                      <span>⭐ {product.rating}</span>
                      <span>•</span>
                    </>
                  )}
                  {product.brand && (
                    <>
                      <span>{product.brand}</span>
                      <span>•</span>
                    </>
                  )}
                  {product.stock !== undefined && (
                    <span className="flex items-center gap-1">
                      <Package size={14} />
                      {product.stock} in stock
                    </span>
                  )}
                  {product.prepTime && (
                    <span>⏱️ {product.prepTime}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAvailability(product.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      product.isAvailable
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {product.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {product.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => router.push(`/partner/menu/edit/${product.id}`)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{uiConfig.icon}</div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">
              No {productLabel.toLowerCase()}s found
            </p>
            <button
              onClick={() => router.push('/partner/menu/new')}
              className={`px-6 py-3 bg-gradient-to-r ${uiConfig.gradientFrom} ${uiConfig.gradientTo} text-white rounded-xl font-bold transition-all hover:opacity-90`}
            >
              Add Your First {productLabel}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuManager;
