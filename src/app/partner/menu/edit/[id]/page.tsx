"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useMenu } from '@/contexts/MenuContext';
import { MenuItem } from '@/types';
import { ArrowLeft, Upload, Save, Moon, Sun, X } from 'lucide-react';

const categories = ['Burgers', 'Pizza', 'Sushi', 'Salads', 'Desserts', 'Beverages', 'Coffee', 'Sandwiches', 'Pasta', 'Asian', 'Mexican', 'Healthy'];

const EditMenuItem = () => {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { user, isAuthenticated, getCafeteria } = useAuth();
  const { getMenuItemsByCafeteria, updateMenuItem } = useMenu();
  const cafeteria = getCafeteria();

  const [isDark, setIsDark] = useState(false);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Burgers',
    prepTime: '',
    calories: '',
    ingredients: '',
    allergens: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load menu item data
  useEffect(() => {
    if (cafeteria && itemId) {
      const items = getMenuItemsByCafeteria(cafeteria.id);
      const item = items.find(i => i.id === itemId);
      
      if (item) {
        setMenuItem(item);
        setFormData({
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          image: item.image,
          category: item.category,
          prepTime: item.prepTime,
          calories: item.calories?.toString() || '',
          ingredients: item.ingredients?.join(', ') || '',
          allergens: item.allergens?.join(', ') || '',
        });
        setIsLoading(false);
      } else {
        alert('Menu item not found');
        router.push('/partner/menu');
      }
    }
  }, [cafeteria?.id, itemId]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    if (!formData.prepTime.trim()) {
      newErrors.prepTime = 'Prep time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !menuItem) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateMenuItem(itemId, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        category: formData.category,
        prepTime: formData.prepTime,
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        ingredients: formData.ingredients ? formData.ingredients.split(',').map(i => i.trim()) : undefined,
        allergens: formData.allergens ? formData.allergens.split(',').map(a => a.trim()) : undefined,
      });

      // Show success and redirect
      alert('Menu item updated successfully!');
      router.push('/partner/menu');
    } catch (error) {
      alert('Failed to update menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !cafeteria || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
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
              <h1 className="text-lg font-black text-gray-900 dark:text-white">
                Edit Menu Item
              </h1>
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="space-y-6">
            {/* Image Preview */}
            {formData.image && (
              <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=No+Image';
                  }}
                />
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Double Cheese Burger"
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${
                      errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your delicious item..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${
                      errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white resize-none`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="12.99"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${
                      errors.price ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white`}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Prep Time *
                  </label>
                  <input
                    type="text"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleChange}
                    placeholder="e.g., 10-15 min"
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${
                      errors.prepTime ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white`}
                  />
                  {errors.prepTime && <p className="text-red-500 text-sm mt-1">{errors.prepTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Calories (optional)
                  </label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    placeholder="e.g., 550"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                Image
              </h2>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${
                    errors.image ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white`}
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter a valid image URL. The image will be displayed in the menu.
                </p>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                Additional Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Ingredients (optional)
                  </label>
                  <textarea
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    placeholder="e.g., Beef patty, Cheese, Lettuce, Tomato, Onion"
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Separate ingredients with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Allergens (optional)
                  </label>
                  <input
                    type="text"
                    name="allergens"
                    value={formData.allergens}
                    onChange={handleChange}
                    placeholder="e.g., Gluten, Dairy, Soy"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Separate allergens with commas
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/partner/menu')}
                className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditMenuItem;
