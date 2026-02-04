"use client";

import React, { memo } from 'react';
import { MapPin } from 'lucide-react';

const LiveFeed = memo(() => {
  const activities = [
    { user: "Alex M.", action: "ordered", item: "Spicy Chicken Wrap", loc: "Library 3F", time: "Just now" },
    { user: "Sarah K.", action: "picked up", item: "Iced Latte", loc: "Student Union", time: "2m ago" },
    { user: "Jaden R.", action: "ordered", item: "Pepperoni Pizza", loc: "North Hall", time: "4m ago" },
    { user: "Emily W.", action: "reviewed", item: "Sushi Combo", loc: "⭐⭐⭐⭐⭐", time: "5m ago" },
    { user: "Mike T.", action: "ordered", item: "Double Cheeseburger", loc: "Gym", time: "6m ago" },
    { user: "Lisa P.", action: "ordered", item: "Vegan Bowl", loc: "Design Block", time: "8m ago" },
  ];

  return (
    <div className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Live Activity</h3>
         </div>
         <div className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden sm:block">Real-time order updates</div>
      </div>
      
      {/* Horizontal Scrolling Cards */}
      <div className="flex gap-6 animate-marquee">
        {[...activities, ...activities, ...activities].map((act, i) => (
          <div key={i} className="flex-shrink-0 w-80 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
               {act.user[0]}
             </div>
             <div className="flex-1">
               <div className="text-sm text-gray-900 dark:text-white font-semibold">
                 {act.user} <span className="font-normal text-gray-500 dark:text-gray-400">{act.action}</span>
               </div>
               <div className="text-red-600 dark:text-red-400 font-bold text-sm mt-0.5">{act.item}</div>
               <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                 <MapPin size={10} className="flex-shrink-0" /> 
                 <span className="truncate">{act.loc}</span>
                 <span className="flex-shrink-0">• {act.time}</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
});

LiveFeed.displayName = 'LiveFeed';

export default LiveFeed;
