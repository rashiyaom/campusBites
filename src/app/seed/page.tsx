"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMenu } from '@/contexts/MenuContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { SEED_MENU_ITEMS } from '@/lib/seedMenuItems';
import { seedAllBusinessData, getCredentialsInfo, BUSINESSES, SAMPLE_PRODUCTS } from '@/lib/seedBusinessData';
import { BUSINESS_UI_CONFIG, BusinessType } from '@/types/business';
import { ChefHat, Check, Loader2, ArrowRight, Store, Pencil, Package, RefreshCw, Copy, CheckCircle } from 'lucide-react';

export default function SeedPage() {
  const router = useRouter();
  const { menuItems, addMenuItem } = useMenu();
  const { cafeterias } = useCafeterias();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seededCount, setSeededCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleSeedMenu = async () => {
    setIsSeeding(true);
    setSeededCount(0);

    // Add items one by one with a delay for visual feedback
    for (let i = 0; i < SEED_MENU_ITEMS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      addMenuItem(SEED_MENU_ITEMS[i]);
      setSeededCount(i + 1);
    }

    setIsSeeding(false);
    setIsComplete(true);
  };

  const handleSeedBusinesses = () => {
    const result = seedAllBusinessData();
    setSeedResult(result);
    setIsComplete(true);
  };

  const copyToClipboard = (text: string, email: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const credentials = getCredentialsInfo();

  const cafeStats = cafeterias.map(cafe => ({
    ...cafe,
    itemCount: menuItems.filter(item => item.cafeteriaId === cafe.id).length
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mb-6 shadow-xl">
            <RefreshCw size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Seed Database
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Set up sample data for all business types: Food, Grocery, Stationery & Daily Essentials
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Seed All Businesses */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Store size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Seed All Businesses</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creates partner accounts & products</p>
              </div>
            </div>
            
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              This will add:
              <ul className="mt-2 space-y-1">
                <li>• <strong>10 Partner accounts</strong> (1 Food, 4 Grocery, 1 Stationery, 4 Essentials)</li>
                <li>• <strong>10 Businesses</strong> across all categories</li>
                <li>• <strong>{SAMPLE_PRODUCTS.length} Sample products</strong> (5 per store)</li>
              </ul>
            </div>

            <button
              onClick={handleSeedBusinesses}
              disabled={isSeeding}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {seedResult ? (
                <>
                  <CheckCircle size={20} />
                  Seeded! ({seedResult.productsAdded} new products)
                </>
              ) : (
                <>
                  <Store size={20} />
                  Seed All Business Data
                </>
              )}
            </button>
          </div>

          {/* Seed Food Menu */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                <ChefHat size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Seed Food Menu</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add menu items to existing cafeterias</p>
              </div>
            </div>
            
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Current status:
              <ul className="mt-2 space-y-1">
                {cafeStats.slice(0, 3).map(cafe => (
                  <li key={cafe.id}>• {cafe.name}: {cafe.itemCount} items</li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSeedMenu}
              disabled={isSeeding || isComplete}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Seeding... ({seededCount}/{SEED_MENU_ITEMS.length})
                </>
              ) : isComplete && !seedResult ? (
                <>
                  <Check size={20} />
                  Food Menu Seeded!
                </>
              ) : (
                <>
                  <ChefHat size={20} />
                  Seed Food Items
                </>
              )}
            </button>
          </div>
        </div>

        {/* Partner Credentials */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            🔐 Partner Login Credentials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((cred) => {
              const config = BUSINESS_UI_CONFIG[cred.businessType];
              return (
                <div
                  key={cred.email}
                  className="p-4 rounded-2xl border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: config.color + '40', backgroundColor: config.color + '08' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white">{cred.businessName}</h3>
                      <span 
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500 dark:text-gray-400">Email:</span>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-gray-900 dark:text-white">{cred.email}</code>
                        <button 
                          onClick={() => copyToClipboard(cred.email, cred.email)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          {copiedEmail === cred.email ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-2">
                      <span className="text-gray-500 dark:text-gray-400">Password:</span>
                      <code className="font-mono text-gray-900 dark:text-white">{cred.password}</code>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business Preview */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
            📦 Sample Products by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['food', 'grocery', 'stationery', 'daily_essentials'] as BusinessType[]).map((type) => {
              const config = BUSINESS_UI_CONFIG[type];
              const products = SAMPLE_PRODUCTS.filter(p => p.businessType === type);
              const business = BUSINESSES.find(b => b.type === type);
              
              return (
                <div
                  key={type}
                  className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: config.color + '30' }}
                >
                  <div 
                    className="p-4 text-white"
                    style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
                  >
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <h3 className="font-black">{business?.name || config.label}</h3>
                    <p className="text-xs opacity-80">{products.length} products</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 space-y-2">
                    {products.slice(0, 3).map(product => (
                      <div key={product.id} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-gray-700 dark:text-gray-300 truncate">{product.name}</span>
                        <span className="ml-auto font-bold" style={{ color: config.color }}>₹{product.price}</span>
                      </div>
                    ))}
                    {products.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">+{products.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.push('/bite')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            Browse Products <ArrowRight size={18} />
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold flex items-center gap-2 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            Partner Login <ArrowRight size={18} />
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
