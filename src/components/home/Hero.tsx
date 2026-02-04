"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, MapPin, Star, Pizza, Coffee } from 'lucide-react';

const Hero = () => {
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    setOffset(window.scrollY);
  }, []);

  useEffect(() => {
    // Throttle scroll event for better performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  return (
    <div className="relative min-h-[85vh] md:min-h-[110vh] bg-orange-50 dark:bg-gray-950 overflow-hidden flex items-center pt-20 md:pt-20 transition-colors duration-500">
      {/* Dynamic Background Gradients */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-yellow-300 to-orange-400 dark:from-red-900 dark:to-orange-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"
        style={{ transform: `translate(${offset * 0.2}px, ${offset * -0.2}px)` }}
      ></div>
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-red-300 to-pink-400 dark:from-blue-900 dark:to-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-40"
        style={{ transform: `translate(${offset * -0.1}px, ${offset * 0.1}px)` }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 grid lg:grid-cols-2 gap-8 md:gap-12 items-center py-8 md:py-0">
        {/* Left Content */}
        <div className="space-y-6 md:space-y-8 relative z-20" style={{ transform: `translateY(${offset * 0.2}px)` }}>
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-orange-100 dark:border-gray-700 px-4 py-2 rounded-full shadow-lg text-orange-600 dark:text-orange-400 font-bold text-sm uppercase tracking-wide">
            <Flame size={18} className="fill-orange-500 animate-pulse" /> 
            Campus Fastest Delivery
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter">
            Delicious Food<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 relative">
              Delivered Fast
              <svg className="absolute w-full h-4 -bottom-1 left-0 text-red-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
            Premium campus dining delivered to your location. From cafeteria to classroom in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
            <Link 
              href="/order"
              className="px-6 md:px-8 py-4 md:py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg md:text-xl transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 transform hover:-translate-y-1 hover:scale-105 active:scale-95"
            >
              Order Food Now <ArrowRight strokeWidth={3} />
            </Link>
            <button className="px-6 md:px-8 py-4 md:py-5 glass-panel text-gray-900 dark:text-white border-2 border-white/20 dark:border-gray-700 rounded-2xl font-bold text-base md:text-lg hover:bg-white/50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
              <MapPin size={20} className="text-red-500" /> Track Order
            </button>
          </div>

          <div className="flex items-center gap-4 pt-2 md:pt-4 glass-panel p-4 rounded-2xl max-w-sm border border-white/20 dark:border-gray-700">
            <div className="flex -space-x-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i*56}`} alt="User" />
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                <span className="text-red-600 dark:text-red-400">1,204</span> students fed today
              </div>
            </div>
          </div>
        </div>

        {/* Parallax Food Animation Zone */}
        <div className="relative h-[800px] hidden lg:block perspective-1000">
          {/* Main Hero Dish */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-75 ease-out"
            style={{ transform: `translate(-50%, calc(-50% + ${offset * 0.1}px))` }}
          >
            <div className="w-[500px] h-[500px] relative animate-float">
               <img 
                 src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" 
                 className="w-full h-full object-cover rounded-full shadow-2xl border-8 border-white dark:border-gray-800"
                 alt="Delicious Burger"
               />
               <div className="absolute -bottom-10 -right-10 bg-yellow-400 text-gray-900 p-6 rounded-full shadow-2xl font-black text-center rotate-12 border-4 border-white dark:border-gray-800 z-30">
                 <span className="text-sm uppercase tracking-wider block mb-1">Avg Time</span>
                 <span className="text-4xl block leading-none">12</span>
                 <span className="text-sm font-bold">MINS</span>
               </div>
            </div>
          </div>

          {/* Floating Items */}
          <div 
            className="absolute top-20 left-0 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-xl z-10 animate-float-delayed"
            style={{ transform: `translateY(${offset * -0.4}px) rotate(-10deg)` }}
          >
            <Pizza size={50} className="text-orange-500" />
          </div>

          <div 
            className="absolute bottom-40 -right-10 bg-gradient-to-br from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 p-5 rounded-2xl shadow-2xl z-30 animate-float border border-white/20"
            style={{ transform: `translateY(${offset * -0.6}px) rotate(15deg)` }}
          >
             <Coffee size={40} className="text-white" />
          </div>

          <div 
            className="absolute top-40 right-10 z-10"
            style={{ transform: `translateY(${offset * -0.2}px)` }}
          >
            <div className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-600/40 rotate-6">
              Free Delivery!
            </div>
          </div>
          
           <div 
            className="absolute bottom-20 left-20 z-10 blur-[2px]"
            style={{ transform: `translateY(${offset * -0.8}px) scale(0.8)` }}
          >
            <img src="https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=300&q=80" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-800" alt="Food" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
