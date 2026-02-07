"use client";

import React, { memo, useMemo } from 'react';
import { Clock, MapPin, ShoppingBag, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { useOrders } from '@/contexts/OrderContext';
import { useMenu } from '@/contexts/MenuContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';

interface DisplayItem {
  id: string;
  name: string;
  place: string;
  price: string;
  img: string;
  time: string;
  cal: string;
  cafeteriaId: string;
  orderCount: number;
}

const PopularItems = memo(() => {
  const router = useRouter();
  const { orders } = useOrders();
  const { menuItems } = useMenu();
  const { cafeterias } = useCafeterias();

  // Calculate the most popular items based on order frequency
  const popularItems = useMemo(() => {
    // Count how many times each item was ordered
    const itemOrderCount: Record<string, number> = {};
    
    orders.forEach(order => {
      order.items.forEach(orderItem => {
        const itemId = orderItem.menuItem?.id;
        if (itemId) {
          itemOrderCount[itemId] = (itemOrderCount[itemId] || 0) + orderItem.quantity;
        }
      });
    });

    // Get top 3 most ordered items
    const sortedItemIds = Object.entries(itemOrderCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([itemId]) => itemId);

    // Get full item details from menu
    const topItems = sortedItemIds
      .map(itemId => menuItems.find(item => item.id === itemId))
      .filter(item => item && item.available);

    // If we don't have enough orders yet, show highest-rated items as fallback
    if (topItems.length < 3) {
      const fallbackItems = menuItems
        .filter(item => item.available && !topItems.find(t => t?.id === item.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3 - topItems.length);
      
      return [...topItems, ...fallbackItems].slice(0, 3);
    }

    return topItems;
  }, [orders, menuItems]);

  // Format items for display
  const displayItems = useMemo(() => {
    const formatted = popularItems
      .filter(item => item !== null && item !== undefined)
      .map(item => {
        const cafeteria = cafeterias.find((c) => c.id === item.cafeteriaId);
        
        return {
          id: item.id,
          name: item.name,
          place: cafeteria?.name || 'Campus Cafe',
          price: `₹${Math.round(item.price)}`,
          img: item.image,
          time: item.prepTime || '10-15 min',
          cal: item.calories ? `${item.calories} kcal` : 'N/A',
          cafeteriaId: item.cafeteriaId,
          orderCount: orders.reduce((count, order) => {
            const itemOrders = order.items.filter(oi => oi.menuItem?.id === item.id);
            return count + itemOrders.reduce((sum, oi) => sum + oi.quantity, 0);
          }, 0)
        };
      });
    
    return formatted;
  }, [popularItems, cafeterias, orders]);

  // Fallback to static data if no dynamic data available
  const items: DisplayItem[] = displayItems.length > 0 ? displayItems : [
    { id: 'fallback-1', name: "Double Cheese Smash", place: "Student Union Grill", price: "₹540", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60", time: "10-15 min", cal: "850 kcal", cafeteriaId: "cafe-1", orderCount: 0 },
    { id: 'fallback-2', name: "Spicy Tuna Roll", place: "Sushi Corner (Lib)", price: "₹664", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=60", time: "5 min", cal: "320 kcal", cafeteriaId: "cafe-2", orderCount: 0 },
    { id: 'fallback-3', name: "Loaded Nachos", place: "West Hall Cafe", price: "₹436", img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=60", time: "20 min", cal: "600 kcal", cafeteriaId: "cafe-3", orderCount: 0 },
  ];

  const handleOrderClick = (cafeteriaId: string) => {
    router.push(`/order/${cafeteriaId}`);
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-16">
             <div className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-400 px-5 py-2 rounded-full text-sm font-bold mb-4 uppercase tracking-wider border border-yellow-200 dark:border-yellow-800">
               Top Rated This Week
             </div>
             <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">Most Popular</h2>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <ScrollReveal key={item.id || i} delay={i * 150}>
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-4 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group hover:-translate-y-2">
                <div className="relative h-56 rounded-3xl overflow-hidden mb-5">
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 z-10 text-gray-800 dark:text-white shadow-sm">
                    <Clock size={12} className="text-red-500" /> {item.time}
                  </div>
                  
                  {/* Order Count Badge - Only show if there are actual orders */}
                  {item.orderCount > 0 && (
                    <div className="absolute top-3 right-3 bg-orange-500 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 z-10 text-white shadow-lg">
                      <TrendingUp size={12} /> {item.orderCount} orders
                    </div>
                  )}
                  
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleOrderClick(item.cafeteriaId)}
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform hover:bg-red-500 hover:text-white"
                    >
                      Add to Order <ShoppingBag size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="px-2 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                    <span className="text-xl font-black text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-lg">{item.price}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mb-4">
                    <MapPin size={14} /> {item.place}
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">{item.cal}</span>
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
});

PopularItems.displayName = 'PopularItems';

export default PopularItems;
