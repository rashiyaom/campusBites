"use client";

import React, { memo } from 'react';
import { Store, ArrowRight, ShoppingBag, Utensils, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { useBusinesses } from '@/contexts/BusinessContext';
import ScrollReveal from '@/components/ui/ScrollReveal';

const StoresSection = memo(() => {
  const router = useRouter();
  const { cafeterias } = useCafeterias();
  const { businesses } = useBusinesses();

  // Get cafeterias (food businesses)
  const foodBusinesses = [
    ...cafeterias.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      image: c.image,
      type: 'food' as const,
      location: c.location
    })),
    ...businesses.filter(b => b.businessType === 'food').map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      image: b.image,
      type: 'food' as const,
      location: b.location
    }))
  ].slice(0, 3);

  // Get grocery businesses
  const groceryBusinesses = businesses
    .filter(b => b.businessType === 'grocery')
    .map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      image: b.image,
      type: 'grocery' as const,
      location: b.location
    }))
    .slice(0, 3);

  // Get essentials businesses (stationery + daily essentials)
  const essentialBusinesses = businesses
    .filter(b => b.businessType === 'stationery' || b.businessType === 'daily_essentials')
    .map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      image: b.image,
      type: 'essentials' as const,
      location: b.location
    }))
    .slice(0, 3);

  const handleStoreClick = (storeId: string, type: string) => {
    router.push(`/order/${storeId}`);
  };

  const handleViewAllClick = (category: string) => {
    router.push(`/order?type=${category}`);
  };

  // Store Card Component
  const StoreCard = ({ store, color }: { store: any; color: string }) => (
    <ScrollReveal>
      <div 
        onClick={() => handleStoreClick(store.id, store.type)}
        className="group relative h-80 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
      >
        <img 
          src={store.image} 
          alt={store.name} 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-0 group-hover:opacity-80 transition-opacity duration-500 z-10 mix-blend-multiply`}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
        
        <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <h3 className="text-2xl font-black text-white mb-1">{store.name}</h3>
            <p className="text-white/80 text-sm font-medium mb-2">{store.location}</p>
            <p className="text-white/70 text-xs opacity-0 group-hover:opacity-100 transition-opacity delay-100 line-clamp-2">
              {store.description}
            </p>
            <div className="mt-4 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 delay-200">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );

  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 space-y-20">
        
        {/* CAFETERIAS SECTION */}
        {foodBusinesses.length > 0 && (
          <div>
            <ScrollReveal>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils className="text-orange-500" size={24} />
                    <span className="text-orange-500 font-bold tracking-wider uppercase">Food & Dining</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
                    Cafeterias
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Delicious meals from campus eateries
                  </p>
                </div>
                <button 
                  onClick={() => handleViewAllClick('food')}
                  className="hidden md:flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-orange-500 transition-all group"
                >
                  View All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {foodBusinesses.map((store, i) => (
                <StoreCard key={store.id} store={store} color="from-orange-400 to-red-500" />
              ))}
            </div>

            {/* Mobile View All Button */}
            <ScrollReveal>
              <div className="mt-8 md:hidden flex justify-center">
                <button 
                  onClick={() => handleViewAllClick('food')}
                  className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-orange-500 transition-all bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full"
                >
                  View All Cafeterias <ArrowRight size={20} />
                </button>
              </div>
            </ScrollReveal>
          </div>
        )}

        {/* GROCERIES SECTION */}
        {groceryBusinesses.length > 0 && (
          <div>
            <ScrollReveal>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="text-green-500" size={24} />
                    <span className="text-green-500 font-bold tracking-wider uppercase">Fresh & Daily</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
                    Groceries
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Fresh produce, snacks & daily groceries
                  </p>
                </div>
                <button 
                  onClick={() => handleViewAllClick('grocery')}
                  className="hidden md:flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-green-500 transition-all group"
                >
                  View All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {groceryBusinesses.map((store, i) => (
                <StoreCard key={store.id} store={store} color="from-green-400 to-emerald-600" />
              ))}
            </div>

            {/* Mobile View All Button */}
            <ScrollReveal>
              <div className="mt-8 md:hidden flex justify-center">
                <button 
                  onClick={() => handleViewAllClick('grocery')}
                  className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-green-500 transition-all bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full"
                >
                  View All Groceries <ArrowRight size={20} />
                </button>
              </div>
            </ScrollReveal>
          </div>
        )}

        {/* ESSENTIALS SECTION */}
        {essentialBusinesses.length > 0 && (
          <div>
            <ScrollReveal>
              <div className="flex justify-between items-end mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-blue-500" size={24} />
                    <span className="text-blue-500 font-bold tracking-wider uppercase">Campus Needs</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
                    Essentials
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Stationery & daily essentials for campus life
                  </p>
                </div>
                <button 
                  onClick={() => handleViewAllClick('essentials')}
                  className="hidden md:flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-blue-500 transition-all group"
                >
                  View All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {essentialBusinesses.map((store, i) => (
                <StoreCard key={store.id} store={store} color="from-blue-400 to-indigo-600" />
              ))}
            </div>

            {/* Mobile View All Button */}
            <ScrollReveal>
              <div className="mt-8 md:hidden flex justify-center">
                <button 
                  onClick={() => handleViewAllClick('essentials')}
                  className="flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-blue-500 transition-all bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full"
                >
                  View All Essentials <ArrowRight size={20} />
                </button>
              </div>
            </ScrollReveal>
          </div>
        )}

      </div>
    </section>
  );
});

StoresSection.displayName = 'StoresSection';

export default StoresSection;
