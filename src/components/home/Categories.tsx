"use client";

import React, { memo } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';

const Categories = memo(() => {
  const categories = [
    { name: "Burgers", count: "12 Places", img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80", color: "from-orange-400 to-red-500" },
    { name: "Pizza", count: "8 Places", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", color: "from-yellow-400 to-orange-500" },
    { name: "Healthy", count: "15 Options", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80", color: "from-green-400 to-emerald-600" },
    { name: "Coffee", count: "5 Cafes", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80", color: "from-brown-400 to-stone-600" },
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
       <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-red-500" size={24} />
                <span className="text-red-500 font-bold tracking-wider uppercase">What's Good</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Popular Categories</h2>
            </div>
            <a href="#" className="hidden md:flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-red-500 transition-all group">
              View Full Menu <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {categories.map((cat, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div className="group relative h-80 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <img 
                  src={cat.img} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-0 group-hover:opacity-80 transition-opacity duration-500 z-10 mix-blend-multiply`}></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                
                <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-black text-white mb-1">{cat.name}</h3>
                    <p className="text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity delay-100">{cat.count}</p>
                    <div className="mt-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 delay-200">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
});

Categories.displayName = 'Categories';

export default Categories;
