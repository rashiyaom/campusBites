"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { MenuItem } from '@/types';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Moon, Sun } from 'lucide-react';

const MenuManager = () => {
  const router = useRouter();
  const { user, isAuthenticated, getCafeteria } = useAuth();
  const { getMenuItemsByCafeteria, updateMenuItem, deleteMenuItem } = useMenu();
  const cafeteria = getCafeteria();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDark, setIsDark] = useState(false);

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

  // Update local state when cafeteria changes
  useEffect(() => {
    if (cafeteria) {
      const items = getMenuItemsByCafeteria(cafeteria.id);
      setMenuItems(items);
    }
  }, [cafeteria?.id]); // Only depend on cafeteria.id, not the function

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

  const toggleAvailability = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
      updateMenuItem(itemId, { available: !item.available });
      setMenuItems(prev =>
        prev.map(i =>
          i.id === itemId ? { ...i, available: !i.available } : i
        )
      );
    }
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMenuItem(itemId);
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  if (!isAuthenticated || !cafeteria) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

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
              <h1 className="text-lg font-black text-gray-900 dark:text-white">
                Menu Manager
              </h1>
            </div>
            <div className="flex items-center gap-2">
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
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
              >
                <Plus size={20} />
                Add Item
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
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    filterCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              {/* Item Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.available
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Item Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-red-600">
                    ₹{(item.price).toFixed(2)}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span>⭐ {item.rating}</span>
                  <span>•</span>
                  <span>{item.reviewCount} reviews</span>
                  <span>•</span>
                  <span>{item.prepTime}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      item.available
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {item.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {item.available ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => router.push(`/partner/menu/edit/${item.id}`)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No menu items found
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MenuManager;
