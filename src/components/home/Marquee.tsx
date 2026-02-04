"use client";

import React, { memo } from 'react';
import { Star } from 'lucide-react';

const Marquee = memo(() => {
  const items = [
    "Premium Quality", "Fast Delivery", "Fresh Ingredients", "Gourmet Burgers", 
    "Healthy Options", "Artisan Coffee", "Quick Service", "Hot & Fresh", "Daily Specials"
  ];
  
  return (
    <div className="bg-red-600 py-4 overflow-hidden relative z-20 border-y-4 border-white dark:border-gray-900 shadow-2xl">
      <div className="whitespace-nowrap flex animate-marquee">
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 mx-8">
            <span className="text-white font-black text-2xl uppercase tracking-widest stroke-text">{item}</span>
            <Star className="text-yellow-400 fill-yellow-400" size={20} />
          </div>
        ))}
      </div>
    </div>
  );
});

Marquee.displayName = 'Marquee';

export default Marquee;
