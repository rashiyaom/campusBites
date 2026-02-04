"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { ArrowLeft, Building2, MapPin, Clock, Phone, Mail, Globe, Save, Upload, Moon, Sun } from 'lucide-react';

const Settings = () => {
  const router = useRouter();
  const { user, getCafeteria } = useAuth();
  const { updateCafeteria } = useCafeterias();
  const cafeteria = getCafeteria();
  
  const [isDark, setIsDark] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image: '',
    openTime: '',
    closeTime: '',
    phone: '',
  });

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
    if (cafeteria) {
      setFormData({
        name: cafeteria.name,
        location: cafeteria.location,
        description: cafeteria.description || '',
        image: cafeteria.image,
        openTime: cafeteria.openingHours.open,
        closeTime: cafeteria.openingHours.close,
        phone: '',
      });
    }
  }, [cafeteria?.id]); // Only depend on ID to prevent infinite loops

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!cafeteria) return;

    setIsSaving(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateCafeteria(cafeteria.id, {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        image: formData.image,
        openingHours: {
          open: formData.openTime,
          close: formData.closeTime,
        },
      });

      setIsEditing(false);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!cafeteria) {
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
                Settings
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
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      if (cafeteria) {
                        setFormData({
                          name: cafeteria.name,
                          location: cafeteria.location,
                          description: cafeteria.description || '',
                          image: cafeteria.image,
                          openTime: cafeteria.openingHours.open,
                          closeTime: cafeteria.openingHours.close,
                          phone: '',
                        });
                      }
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cafeteria Profile Image */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Cafeteria Profile
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                {formData.image ? (
                  <Image
                    src={formData.image}
                    alt={formData.name}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <Upload size={16} className="inline mr-2" />
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm"
                  />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Cafeteria Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white ${
                    isEditing 
                      ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Tell students about your cafeteria..."
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white resize-none ${
                    isEditing 
                      ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cafeteria Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Location & Hours
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <MapPin size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white ${
                    isEditing 
                      ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <Clock size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Opening Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="openTime"
                    placeholder="Opens at"
                    value={formData.openTime}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`px-4 py-3 border rounded-xl text-gray-900 dark:text-white ${
                      isEditing 
                        ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  />
                  <input
                    type="text"
                    name="closeTime"
                    placeholder="Closes at"
                    value={formData.closeTime}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`px-4 py-3 border rounded-xl text-gray-900 dark:text-white ${
                      isEditing 
                        ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Account Information
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <Mail size={24} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <Phone size={24} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white ${
                    isEditing 
                      ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} />
            <h2 className="text-xl font-black">CampusBites Partner</h2>
          </div>
          <p className="text-red-100 mb-4">
            Manage your cafeteria operations with ease. Track orders, update menus, and grow your business.
          </p>
          <p className="text-sm text-red-200">
            Version 1.0.0 • © 2024 CampusBites
          </p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
