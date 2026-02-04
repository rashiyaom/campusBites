"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/contexts/MenuContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { SEED_MENU_ITEMS } from '@/lib/seedMenuItems';
import { ChefHat, Check, Loader2, ArrowRight } from 'lucide-react';

export default function SeedPage() {
  const router = useRouter();
  const { menuItems, addMenuItem } = useMenu();
  const { cafeterias } = useCafeterias();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeededCount(0);

    // Add items one by one with a delay for visual feedback
    for (let i = 0; i < SEED_MENU_ITEMS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      addMenuItem(SEED_MENU_ITEMS[i]);
      setSeededCount(i + 1);
    }

    setIsSeeding(false);
    setIsComplete(true);
  };

  const cafeStats = cafeterias.map(cafe => ({
    ...cafe,
    itemCount: menuItems.filter(item => item.cafeteriaId === cafe.id).length
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mb-6 shadow-xl">
            <ChefHat size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Seed Menu Items
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Populate your cafeterias with delicious sample menu items. This will add 5 unique products to each cafeteria.
          </p>
        </div>

        {/* Current Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Current Menu Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cafeStats.map(cafe => (
              <div
                key={cafe.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={cafe.image}
                  alt={cafe.name}
                  className="w-full h-32 object-cover rounded-xl mb-3"
                />
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cafe.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {cafe.itemCount} items currently
                </p>
              </div>
            ))}
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-bold text-orange-800 dark:text-orange-400">
              📊 Total Menu Items: {menuItems.length}
            </p>
          </div>
        </div>

        {/* What Will Be Added */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">What Will Be Added</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-2xl border border-orange-200 dark:border-orange-800">
              <div className="bg-orange-500 p-2 rounded-lg">
                <ChefHat size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 dark:text-white mb-1">The Grill</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">5 American classics</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Classic Beef Burger</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">BBQ Bacon Burger</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Crispy Chicken Sandwich</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Loaded Cheese Fries</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Grilled Veggie Burger</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="bg-blue-500 p-2 rounded-lg">
                <ChefHat size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 dark:text-white mb-1">Sushi Corner</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">5 Japanese specialties</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Dragon Roll</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">California Roll</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Salmon Sashimi</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Chicken Teriyaki Bowl</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Miso Soup</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="bg-amber-600 p-2 rounded-lg">
                <ChefHat size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 dark:text-white mb-1">Coffee & Co</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">5 coffee & breakfast items</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Cappuccino</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Iced Mocha</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Blueberry Muffin</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Avocado Toast</span>
                  <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">Chocolate Croissant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isComplete ? (
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed"
          >
            {isSeeding ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Seeding... {seededCount}/{SEED_MENU_ITEMS.length}
              </>
            ) : (
              <>
                <ChefHat size={24} />
                Seed All Menu Items ({SEED_MENU_ITEMS.length} items)
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-green-800 dark:text-green-400 mb-2">
                Successfully Seeded!
              </h3>
              <p className="text-green-700 dark:text-green-500 mb-4">
                Added {SEED_MENU_ITEMS.length} menu items across all cafeterias
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/bite')}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
              >
                View in Bite Feed
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => router.push('/order')}
                className="bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2"
              >
                View Order Pages
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
