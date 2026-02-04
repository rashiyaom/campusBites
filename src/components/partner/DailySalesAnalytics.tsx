"use client";

import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay } from 'date-fns';
import { SalesData } from '@/contexts/AnalyticsContext';
import { Calendar, List, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

interface DailySalesAnalyticsProps {
  salesByDay: SalesData[];
}

const DailySalesAnalytics: React.FC<DailySalesAnalyticsProps> = ({ salesByDay }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const selectedDayData = salesByDay.find(day => isSameDay(new Date(day.date), selectedDay || new Date()));

  const calendarFooter = selectedDayData ? (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
      <p className="font-bold text-sm text-gray-900 dark:text-white">
        {format(selectedDay || new Date(), 'MMMM d, yyyy')}
      </p>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
        <span className="font-bold text-green-600">₹{(selectedDayData.revenue).toFixed(0)}</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs">
        <span className="text-gray-600 dark:text-gray-400">Orders:</span>
        <span className="font-bold text-blue-600">{selectedDayData.orders}</span>
      </div>
    </div>
  ) : (
    <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
      Select a day to see details
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <style>{`
        /* Base calendar styles */
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #EA580C;
          --rdp-background-color: #FDBA74;
          --rdp-outline: 2px solid var(--rdp-accent-color);
          margin: 1em;
        }
        
        /* Light mode calendar text */
        .rdp-caption {
          color: #111827;
        }
        .rdp-caption_label {
          color: #111827;
          font-weight: 600;
        }
        .rdp-weekday {
          color: #6B7280;
          font-weight: 500;
        }
        .rdp-day {
          color: #374151;
        }
        .rdp-day_selected {
          background-color: #EA580C;
          color: white;
          font-weight: bold;
        }
        .rdp-day_today {
          font-weight: bold;
          color: #EA580C;
        }
        .rdp-nav_button {
          color: #6B7280;
        }
        .rdp-nav_button:hover {
          background-color: #F3F4F6;
        }
        .rdp-head_cell {
          color: #6B7280;
          font-weight: 500;
        }
        
        /* Dark mode overrides */
        .dark .rdp {
          --rdp-accent-color: #EA580C;
          --rdp-background-color: #374151;
        }
        .dark .rdp-caption {
          color: #F9FAFB;
        }
        .dark .rdp-caption_label {
          color: #F9FAFB;
          font-weight: 600;
        }
        .dark .rdp-weekday {
          color: #D1D5DB;
          font-weight: 500;
        }
        .dark .rdp-day {
          color: #D1D5DB;
        }
        .dark .rdp-day:hover {
          background-color: #374151;
        }
        .dark .rdp-day_selected {
          background-color: #EA580C;
          color: white;
        }
        .dark .rdp-day_today {
          color: #FDBA74;
          font-weight: bold;
        }
        .dark .rdp-nav_button {
          color: #9CA3AF;
        }
        .dark .rdp-nav_button:hover {
          background-color: #374151;
        }
        .dark .rdp-head_cell {
          color: #9CA3AF;
        }
        .dark .rdp-day_outside {
          color: #4B5563;
        }
        .dark .rdp-day_disabled {
          color: #4B5563;
        }
        
        /* Sales day indicator (green dot) */
        .sales-day {
          position: relative;
          font-weight: bold;
          color: #16A34A;
        }
        .sales-day::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: #16A34A;
          border-radius: 50%;
        }
        .dark .sales-day {
          color: #4ADE80;
        }
        .dark .sales-day::after {
          background-color: #4ADE80;
        }
      `}</style>
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
        modifiers={{ sales: salesByDay.filter(d => d.revenue > 0).map(d => new Date(d.date)) }}
        modifiersClassNames={{ sales: 'sales-day' }}
        footer={calendarFooter}
        className="p-0"
      />
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {salesByDay.map((day) => {
        const maxRevenue = Math.max(...salesByDay.map(d => d.revenue));
        const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
        
        return (
          <div key={day.date} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {format(new Date(day.date), 'EEEE, MMM d')}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-green-600">
                  <DollarSign size={14} /> ₹{(day.revenue).toFixed(0)}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-blue-600">
                  <ShoppingBag size={14} /> {day.orders} Orders
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="text-red-500" size={20} />
          Daily Sales
        </h3>
        <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
      
      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
    </div>
  );
};

export default DailySalesAnalytics;
