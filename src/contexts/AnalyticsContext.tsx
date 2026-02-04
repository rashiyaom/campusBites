"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useOrders } from './OrderContext';
import { useMenu } from './MenuContext';

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  revenue: number;
  category: string;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface HourlyData {
  hour: string;
  orders: number;
  revenue: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topSellingItems: TopSellingItem[];
  salesByDay: SalesData[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  hourlyDistribution: HourlyData[];
  peakHours: string[];
}

interface AnalyticsContextType {
  getAnalytics: (cafeteriaId: string, days?: number) => AnalyticsData;
  getRevenueByDateRange: (cafeteriaId: string, startDate: Date, endDate: Date) => number;
  getTopSellingItems: (cafeteriaId: string, limit?: number) => TopSellingItem[];
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getOrdersByCafeteria } = useOrders();
  const { getMenuItemsByCafeteria } = useMenu();

  const getAnalytics = (cafeteriaId: string, days: number = 7): AnalyticsData => {
    const orders = getOrdersByCafeteria(cafeteriaId);
    const menuItems = getMenuItemsByCafeteria(cafeteriaId);
    
    // Filter orders by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate && order.status !== 'cancelled';
    });

    // Calculate previous period for growth comparison
    const previousCutoffDate = new Date();
    previousCutoffDate.setDate(previousCutoffDate.getDate() - (days * 2));
    
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousCutoffDate && orderDate < cutoffDate && order.status !== 'cancelled';
    });

    // Total revenue and orders
    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = recentOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Previous period metrics
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    const previousOrderCount = previousOrders.length;

    // Growth calculations
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const ordersGrowth = previousOrderCount > 0 
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    // Top selling items
    const itemSales = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();
    
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const menuItem = item.menuItem;
        const existing = itemSales.get(menuItem.id) || { 
          name: item.name, 
          quantity: 0, 
          revenue: 0,
          category: menuItem?.category || 'Other'
        };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        itemSales.set(menuItem.id, existing);
      });
    });

    const topSellingItems: TopSellingItem[] = Array.from(itemSales.entries())
      .map(([itemId, data]) => ({
        itemId,
        itemName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
        category: data.category,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Sales by day
    const salesByDay: SalesData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = recentOrders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      salesByDay.push({
        date: dateStr,
        revenue,
        orders: dayOrders.length,
      });
    }

    // Order status breakdown
    const statusCounts = new Map<string, number>();
    recentOrders.forEach(order => {
      statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1);
    });

    const orderStatusBreakdown: OrderStatusBreakdown[] = Array.from(statusCounts.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalOrders) * 100,
      }));

    // Hourly distribution
    const hourlyData = new Map<number, { orders: number; revenue: number }>();
    recentOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      const existing = hourlyData.get(hour) || { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += order.total;
      hourlyData.set(hour, existing);
    });

    const hourlyDistribution: HourlyData[] = Array.from({ length: 24 }, (_, i) => {
      const data = hourlyData.get(i) || { orders: 0, revenue: 0 };
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        orders: data.orders,
        revenue: data.revenue,
      };
    });

    // Find peak hours (top 3 busiest hours)
    const peakHours = hourlyDistribution
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 3)
      .map(h => h.hour)
      .sort();

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowth,
      ordersGrowth,
      topSellingItems,
      salesByDay,
      orderStatusBreakdown,
      hourlyDistribution,
      peakHours,
    };
  };

  const getRevenueByDateRange = (cafeteriaId: string, startDate: Date, endDate: Date): number => {
    const orders = getOrdersByCafeteria(cafeteriaId);
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate && order.status !== 'cancelled';
    });

    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const getTopSellingItems = (cafeteriaId: string, limit: number = 5): TopSellingItem[] => {
    const analytics = getAnalytics(cafeteriaId, 30); // Last 30 days
    return analytics.topSellingItems.slice(0, limit);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        getAnalytics,
        getRevenueByDateRange,
        getTopSellingItems,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
