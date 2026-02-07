"use client";

import React, { memo } from 'react';
import { Menu, ShoppingBag, Truck, Apple, Smartphone, Pizza, Coffee } from 'lucide-react';

const AppDownload = memo(() => {
  return (
    <section className="py-24 bg-yellow-400 dark:bg-yellow-500 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="md:w-1/2 mb-12 md:mb-0 space-y-6">
          <div className="inline-block bg-black text-yellow-400 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider mb-2">
            Beta Access
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-[0.9]">
            Track Every<br/>Delivery
          </h2>
          <p className="text-xl text-gray-900 max-w-md leading-relaxed">
            Real-time tracking from kitchen to your location. Know exactly when your order arrives.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all hover:scale-105 flex items-center gap-3 shadow-2xl">
              <Apple size={28} strokeWidth={2.5} />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium uppercase text-gray-400">Coming Soon on</div>
                <div className="text-lg">iOS Devices</div>
              </div>
            </button>
            <button className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all hover:scale-105 flex items-center gap-3 shadow-2xl">
              <Smartphone size={24} strokeWidth={2.5} />
              <div className="text-left leading-tight">
                <div className="text-[10px] font-medium uppercase text-gray-400">Coming Soon on</div>
                <div className="text-lg">Android</div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="md:w-1/2 relative flex justify-center perspective-1000">
          <div className="relative w-72 h-[550px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl transform hover:rotate-0 transition-all duration-700">
             <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden">
               <div className="h-full w-full bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80')" }}>
                 <div className="absolute top-0 w-full p-6 pt-12 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex justify-between text-white">
                       <Menu />
                       <ShoppingBag />
                    </div>
                 </div>
                 <div className="absolute bottom-0 w-full bg-white dark:bg-gray-900 p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Truck size={24} className="text-white" strokeWidth={2.5} />
                      </div>
                      <div>
                         <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status</div>
                         <div className="font-bold text-gray-900 dark:text-white">Driver Nearby</div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-green-500 rounded-full"></div>
                    </div>
                 </div>
               </div>
             </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 -right-10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl shadow-2xl animate-float border border-gray-100 dark:border-gray-700">
            <Pizza size={32} className="text-orange-500" strokeWidth={2} />
          </div>
          <div className="absolute bottom-40 -left-10 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl shadow-2xl animate-float-delayed border border-gray-100 dark:border-gray-700">
             <Coffee size={32} className="text-amber-600" strokeWidth={2} />
          </div>
        </div>
      </div>
      
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
    </section>
  );
});

AppDownload.displayName = 'AppDownload';

export default AppDownload;
