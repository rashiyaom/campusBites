"use client";

import React, { useState, lazy, Suspense, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import Footer from '@/components/layout/Footer';

// Lazy load below-the-fold components for better performance
const LiveFeed = lazy(() => import('@/components/home/LiveFeed'));
const DeliveryMethods = lazy(() => import('@/components/home/DeliveryMethods'));
const Categories = lazy(() => import('@/components/home/Categories'));
const PopularItems = lazy(() => import('@/components/home/PopularItems'));
const AppDownload = lazy(() => import('@/components/home/AppDownload'));

// Loading placeholder component
const SectionLoader = () => (
  <div className="py-24 flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const HomePage = () => {
  const [isDark, setIsDark] = useState(false);

  // Dark mode persistence
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

  return (
    <div className={`${isDark ? 'dark' : ''} transition-colors duration-500`}>
      <div className="font-sans antialiased text-gray-900 bg-white dark:bg-gray-900 min-h-screen selection:bg-red-500 selection:text-white">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
        <main className="overflow-x-hidden">
          <Hero />
          <Marquee />
          
          <Suspense fallback={<SectionLoader />}>
            <LiveFeed />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <DeliveryMethods />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <Categories />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <PopularItems />
          </Suspense>
          
          <Suspense fallback={<SectionLoader />}>
            <AppDownload />
          </Suspense>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
