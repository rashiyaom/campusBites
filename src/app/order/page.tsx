"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  Star, 
  MapPin,
  Utensils,
  ShoppingBag,
  ArrowRight,
  Flame,
  Coffee,
  Moon,
  Sun,
  Home
} from 'lucide-react';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { useMenu } from '@/contexts/MenuContext';
import { useBusinesses } from '@/contexts/BusinessContext';
import { useProducts } from '@/contexts/ProductContext';

/* --- Custom Animations & Styles --- */
const CustomStyles = () => (
  <style>{`
    @keyframes slide-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-in {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
    
    .glass-nav {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    
    /* Hide scrollbar */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
);

// Icon mapping for cafeterias
const getCafeIcon = (cafeName: string) => {
  const name = cafeName.toLowerCase();
  if (name.includes('grill') || name.includes('burger')) {
    return <Flame className="text-orange-500" size={24} />;
  } else if (name.includes('coffee') || name.includes('grind')) {
    return <Coffee className="text-amber-700" size={24} />;
  } else {
    return <Utensils className="text-red-500" size={24} />;
  }
};

// Color mapping for cafeterias
const getCafeColor = (cafeName: string) => {
  const name = cafeName.toLowerCase();
  if (name.includes('grill') || name.includes('burger')) return 'orange';
  if (name.includes('coffee') || name.includes('grind')) return 'amber';
  return 'red';
};

export default function CafeSelectionPage() {
  const router = useRouter();
  const { cafeterias } = useCafeterias();
  const { menuItems } = useMenu();
  const { businesses } = useBusinesses();
  const { products } = useProducts();
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'cafeterias' | 'groceries' | 'essentials'>('all');

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

  // Calculate delivery time and menu count for each cafe
  const getCafeStats = (cafeteriaId: string) => {
    const menuCount = menuItems.filter(item => 
      item.cafeteriaId === cafeteriaId && item.available
    ).length;
    
    return {
      menuCount,
      deliveryTime: '10-15 min', // Can be made dynamic later
    };
  };

  // Extract unique categories for each cafe
  const getCafeCategories = (cafeteriaId: string) => {
    const items = menuItems.filter(item => item.cafeteriaId === cafeteriaId);
    const categories = Array.from(new Set(items.map(item => item.category)));
    return categories;
  };

  return (
    <div className="font-sans antialiased text-gray-900 dark:text-gray-100 selection:bg-red-100 selection:text-red-900 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <CustomStyles />
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-[60] glass-nav dark:bg-gray-900/90 border-b border-gray-200/50 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-red-600 p-1.5 rounded-lg text-white">
            <Utensils size={20} strokeWidth={2.5} />
          </div>
          <span className="font-black text-xl tracking-tight dark:text-white">
            Campus<span className="text-red-600">Bite</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Home size={20} className="dark:text-gray-400" />
          </Link>
          <Link href="/stores" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Flame size={20} className="text-orange-500" />
          </Link>
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
          <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
            <ShoppingBag size={20} className="dark:text-gray-400" />
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden hover:ring-2 hover:ring-red-500 dark:hover:ring-orange-500 transition-all cursor-pointer"
            title="Go to Profile"
          >
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" alt="User" className="w-full h-full" />
          </button>
        </div>
      </nav>

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center max-w-2xl mx-auto animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              What are you <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                looking for today?
              </span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400">Explore cafeterias, groceries, and essentials on campus.</p>
          </div>

          {/* Premium Minimal Filter */}
          <div className="mb-8 animate-slide-up overflow-x-auto hide-scrollbar pb-2" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-full p-1.5 md:p-2 border border-gray-200/30 dark:border-gray-700/30 shadow-sm inline-flex items-center gap-1.5 md:gap-2 min-w-max">
              {/* All Button */}
              <button
                onClick={() => setActiveSection('all')}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeSection === 'all'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All
              </button>

              {/* Cafeterias */}
              <button
                onClick={() => setActiveSection('cafeterias')}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                  activeSection === 'cafeterias'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Utensils size={14} className="md:w-4 md:h-4" />
                <span>Cafeterias</span>
              </button>

              {/* Groceries */}
              <button
                onClick={() => setActiveSection('groceries')}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                  activeSection === 'groceries'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ShoppingBag size={14} className="md:w-4 md:h-4" />
                <span>Groceries</span>
              </button>

              {/* Essentials */}
              <button
                onClick={() => setActiveSection('essentials')}
                className={`px-3 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 md:gap-2 whitespace-nowrap ${
                  activeSection === 'essentials'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Coffee size={14} className="md:w-4 md:h-4" />
                <span>Essentials</span>
              </button>
            </div>
          </div>

          {/* CAFETERIAS SECTION */}
          {cafeterias.length > 0 && (activeSection === 'all' || activeSection === 'cafeterias') && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="text-orange-500" size={24} />
                    <span className="text-orange-500 font-bold tracking-wider uppercase text-sm">Food & Dining</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                    Cafeterias
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Delicious meals from campus eateries
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {cafeterias.map((cafe, index) => {
                  const stats = getCafeStats(cafe.id);
                  const categories = getCafeCategories(cafe.id);
                  const color = getCafeColor(cafe.name);
                  
                  return (
                    <Link
                      key={cafe.id}
                      href={`/order/${cafe.id}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border border-gray-100 dark:border-gray-800"
                    >
                      {/* Image Section */}
                      <div className="h-64 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <img 
                          src={cafe.image} 
                          alt={cafe.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 z-20 ${cafe.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg`}>
                          <div className={`w-2 h-2 rounded-full ${cafe.isOpen ? 'bg-white' : 'bg-white/70'} animate-pulse`} />
                          {cafe.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                        
                        {/* Floating Badge */}
                        <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg text-gray-900 dark:text-gray-100">
                          <Clock size={12} className={`text-${color}-600 dark:text-${color}-400`} />
                          {stats.deliveryTime}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 relative">
                        {/* Logo Overlap */}
                        <div className="absolute -top-10 left-8 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center z-20 text-3xl border-4 border-gray-50 dark:border-gray-900 group-hover:rotate-12 transition-transform duration-300">
                          {getCafeIcon(cafe.name)}
                        </div>

                        <div className="mt-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-red-600 transition-colors">
                              {cafe.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm line-clamp-1">
                              {cafe.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg font-bold text-sm">
                              <Star size={14} fill="currentColor" /> {cafe.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>

                        {/* Location & Hours */}
                        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{cafe.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{cafe.openingHours.open} - {cafe.openingHours.close}</span>
                          </div>
                        </div>

                        {/* Quick Tags */}
                        <div className="mt-6 flex flex-wrap gap-2">
                          {categories.slice(0, 3).map(cat => (
                            <span 
                              key={cat} 
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wide"
                            >
                              {cat}
                            </span>
                          ))}
                          {categories.length > 3 && (
                            <span className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-500 text-xs font-bold">
                              +{categories.length - 3}
                            </span>
                          )}
                          {stats.menuCount > 0 && (
                            <span className="ml-auto px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold">
                              {stats.menuCount} items
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* GROCERIES SECTION */}
          {businesses.filter(b => b.businessType === 'grocery').length > 0 && (activeSection === 'all' || activeSection === 'groceries') && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="text-green-500" size={24} />
                    <span className="text-green-500 font-bold tracking-wider uppercase text-sm">Fresh & Daily</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                    Groceries
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Fresh produce, snacks & daily groceries
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {businesses.filter(b => b.businessType === 'grocery').map((business, index) => {
                  const productCount = products.filter(p => p.businessId === business.id).length;
                  
                  return (
                    <Link
                      key={business.id}
                      href={`/stores`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border border-gray-100 dark:border-gray-800"
                    >
                      {/* Image Section */}
                      <div className="h-64 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <img 
                          src={business.image} 
                          alt={business.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 z-20 ${business.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg`}>
                          <div className={`w-2 h-2 rounded-full ${business.isOpen ? 'bg-white' : 'bg-white/70'} animate-pulse`} />
                          {business.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 relative">
                        {/* Logo Overlap */}
                        <div className="absolute -top-10 left-8 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center z-20 text-3xl border-4 border-gray-50 dark:border-gray-900 group-hover:rotate-12 transition-transform duration-300">
                          <ShoppingBag size={24} className="text-green-500" />
                        </div>

                        <div className="mt-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-green-600 transition-colors">
                              {business.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm line-clamp-1">
                              {business.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg font-bold text-sm">
                              <Star size={14} fill="currentColor" /> {business.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>

                        {/* Location & Hours */}
                        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{business.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{business.openingHours.open} - {business.openingHours.close}</span>
                          </div>
                        </div>

                        {/* Quick Tags */}
                        <div className="mt-6 flex flex-wrap gap-2">
                          {business.categories.slice(0, 3).map(cat => (
                            <span 
                              key={cat} 
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wide"
                            >
                              {cat}
                            </span>
                          ))}
                          {business.categories.length > 3 && (
                            <span className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-500 text-xs font-bold">
                              +{business.categories.length - 3}
                            </span>
                          )}
                          {productCount > 0 && (
                            <span className="ml-auto px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold">
                              {productCount} items
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ESSENTIALS SECTION */}
          {businesses.filter(b => b.businessType === 'stationery' || b.businessType === 'daily_essentials').length > 0 && (activeSection === 'all' || activeSection === 'essentials') && (
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="text-blue-500" size={24} />
                    <span className="text-blue-500 font-bold tracking-wider uppercase text-sm">Campus Needs</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                    Essentials
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Stationery & daily essentials for campus life
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {businesses.filter(b => b.businessType === 'stationery' || b.businessType === 'daily_essentials').map((business, index) => {
                  const productCount = products.filter(p => p.businessId === business.id).length;
                  
                  return (
                    <Link
                      key={business.id}
                      href={`/stores`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 transform hover:-translate-y-2 animate-slide-up border border-gray-100 dark:border-gray-800"
                    >
                      {/* Image Section */}
                      <div className="h-64 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                        <img 
                          src={business.image} 
                          alt={business.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        />
                        
                        {/* Status Badge */}
                        <div className={`absolute top-4 left-4 z-20 ${business.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg`}>
                          <div className={`w-2 h-2 rounded-full ${business.isOpen ? 'bg-white' : 'bg-white/70'} animate-pulse`} />
                          {business.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 relative">
                        {/* Logo Overlap */}
                        <div className="absolute -top-10 left-8 w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center z-20 text-3xl border-4 border-gray-50 dark:border-gray-900 group-hover:rotate-12 transition-transform duration-300">
                          <Coffee size={24} className="text-blue-500" />
                        </div>

                        <div className="mt-4 flex justify-between items-start">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                              {business.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm line-clamp-1">
                              {business.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg font-bold text-sm">
                              <Star size={14} fill="currentColor" /> {business.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>

                        {/* Location & Hours */}
                        <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{business.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400 dark:text-gray-500" />
                            <span>{business.openingHours.open} - {business.openingHours.close}</span>
                          </div>
                        </div>

                        {/* Quick Tags */}
                        <div className="mt-6 flex flex-wrap gap-2">
                          {business.categories.slice(0, 3).map(cat => (
                            <span 
                              key={cat} 
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wide"
                            >
                              {cat}
                            </span>
                          ))}
                          {business.categories.length > 3 && (
                            <span className="w-8 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-500 text-xs font-bold">
                              +{business.categories.length - 3}
                            </span>
                          )}
                          {productCount > 0 && (
                            <span className="ml-auto px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                              {productCount} items
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Content Message */}
          {cafeterias.length === 0 && businesses.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 max-w-md mx-auto shadow-lg border border-gray-100 dark:border-gray-800">
                <Utensils size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Stores Yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Check back soon for delicious food options!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
