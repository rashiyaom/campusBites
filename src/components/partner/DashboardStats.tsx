"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Star } from 'lucide-react';
import { useOrders } from '@/contexts/OrderContext';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  color: string;
}

const StatCard = ({ icon, label, value, change, color }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'string' ? parseFloat(value) : value;

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = targetValue / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetValue]);

  const formattedValue = typeof value === 'string' && value.includes('₹') 
    ? `₹${(displayValue).toFixed(0)}`
    : displayValue.toFixed(label.includes('Rating') ? 1 : 0);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {change && (
          <span className="text-sm font-bold text-green-600 dark:text-green-400">
            {change}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
        {formattedValue}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
    </div>
  );
};

const DashboardStats = ({ cafeteriaId }: { cafeteriaId: string }) => {
  const { getOrdersByCafeteria } = useOrders();
  const orders = getOrdersByCafeteria(cafeteriaId);

  // Calculate real stats from orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const activeOrders = orders.filter(order => 
    !['completed', 'cancelled'].includes(order.status)
  ).length;

  const todayRevenue = todayOrders.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + order.total : sum, 0
  );

  const totalOrders = orders.filter(order => order.status !== 'cancelled').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={<DollarSign size={24} className="text-emerald-600" strokeWidth={2.5} />}
        label="Today's Revenue"
        value={`₹${todayRevenue}`}
        change="+12.5%"
        color="bg-emerald-50 dark:bg-emerald-900/20"
      />
      <StatCard
        icon={<Package size={24} className="text-blue-600" strokeWidth={2.5} />}
        label="Active Orders"
        value={activeOrders}
        color="bg-blue-50 dark:bg-blue-900/20"
      />
      <StatCard
        icon={<TrendingUp size={24} className="text-purple-600" strokeWidth={2.5} />}
        label="Total Orders"
        value={totalOrders}
        change="+8.2%"
        color="bg-purple-50 dark:bg-purple-900/20"
      />
      <StatCard
        icon={<Star size={24} className="text-yellow-600" strokeWidth={2.5} />}
        label="Average Rating"
        value={4.8}
        color="bg-yellow-50 dark:bg-yellow-900/20"
      />
    </div>
  );
};

export default DashboardStats;
