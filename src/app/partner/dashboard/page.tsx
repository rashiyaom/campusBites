"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useMenu } from '@/contexts/MenuContext';
import { useInventory } from '@/contexts/InventoryContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { OrderStatus } from '@/types';
import OrderTimeTracker from '@/components/partner/OrderTimeTracker';
import DailySalesAnalytics from '@/components/partner/DailySalesAnalytics';
import LiveOrderStream from '@/components/partner/LiveOrderStream';
import { 
  LogOut, 
  Menu as MenuIcon, 
  Settings, 
  Moon, 
  Sun,
  TrendingUp,
  Package,
  DollarSign,
  Star,
  PlusCircle,
  BarChart3,
  Clock,
  CheckCircle2,
  Utensils,
  ChevronRight,
  LayoutGrid,
  ShoppingBag,
  Edit,
  Trash2,
  Search,
  Eye,
  List,
  X,
  PackageSearch,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  User,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  CheckSquare,
  Square,
  Printer,
  Copy,
  Percent,
  EyeOff,
  Timer,
  CreditCard,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { exportToExcel } from '@/lib/excelExport';

type TabType = 'overview' | 'analytics' | 'menu' | 'orders' | 'inventory' | 'payments';

const PartnerDashboard = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout, getCafeteria } = useAuth();
  const { getOrdersByCafeteria, updateOrderStatus, setOrderEstimatedTime, deleteOrder } = useOrders();
  const { getMenuItemsByCafeteria } = useMenu();
  const { getInventoryByCafeteria, getLowStockItems, updateStock, restockItem } = useInventory();
  const { getAnalytics } = useAnalytics();
  const cafeteria = getCafeteria();
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed'>('all');
  const [orderViewMode, setOrderViewMode] = useState<'grid' | 'detailed'>('detailed');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState(7);
  const [restockQuantity, setRestockQuantity] = useState<Record<string, number>>({});
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  // Load dashboard state from localStorage on mount
  useEffect(() => {
    const savedDashboardState = localStorage.getItem('partnerDashboardState');
    if (savedDashboardState) {
      try {
        const state = JSON.parse(savedDashboardState);
        // Restore tab selection
        if (state.activeTab) setActiveTab(state.activeTab);
        // Restore order filters and view mode
        if (state.orderFilter) setOrderFilter(state.orderFilter);
        if (state.orderViewMode) setOrderViewMode(state.orderViewMode);
        // Restore analytics time range
        if (state.analyticsTimeRange) setAnalyticsTimeRange(state.analyticsTimeRange);
        // Restore search query
        if (state.searchQuery) setSearchQuery(state.searchQuery);
      } catch (error) {
        console.error('Failed to load dashboard state:', error);
      }
    }
  }, []);

  // Save dashboard state to localStorage whenever preferences change
  useEffect(() => {
    const dashboardState = {
      activeTab,
      orderFilter,
      orderViewMode,
      analyticsTimeRange,
      searchQuery,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('partnerDashboardState', JSON.stringify(dashboardState));
  }, [activeTab, orderFilter, orderViewMode, analyticsTimeRange, searchQuery]);

  // Clear bulk selection when changing filters or tabs
  useEffect(() => {
    setSelectedOrders(new Set());
    setBulkActionMode(false);
  }, [orderFilter, activeTab]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Check authentication after initial mount
  useEffect(() => {
    // Give AuthContext time to restore session from localStorage
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
      if (!isAuthenticated || user?.role !== 'partner') {
        router.push('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Reset dashboard preferences to defaults
  const resetDashboardPreferences = () => {
    localStorage.removeItem('partnerDashboardState');
    setActiveTab('overview');
    setOrderFilter('all');
    setOrderViewMode('detailed');
    setAnalyticsTimeRange(7);
    setSearchQuery('');
    setSelectedOrders(new Set());
    setBulkActionMode(false);
  };

  // Export dashboard state (for backup/debugging)
  const exportDashboardState = () => {
    const state = {
      activeTab,
      orderFilter,
      orderViewMode,
      analyticsTimeRange,
      theme: isDark ? 'dark' : 'light',
      timestamp: new Date().toISOString(),
      cafeteriaId: cafeteria?.id,
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-state-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics - memoized to prevent unnecessary re-renders
  // MUST be called before early return to follow Rules of Hooks
  const orders = React.useMemo(() => 
    cafeteria ? getOrdersByCafeteria(cafeteria.id) : [], 
    [cafeteria?.id, getOrdersByCafeteria]
  );
  
  const menuItems = React.useMemo(() => 
    cafeteria ? getMenuItemsByCafeteria(cafeteria.id) : [], 
    [cafeteria?.id, getMenuItemsByCafeteria]
  );
  
  const today = React.useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const todayOrders = React.useMemo(() => orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  }), [orders, today]);

  const activeOrders = React.useMemo(() => orders.filter(order => 
    !['completed', 'cancelled'].includes(order.status)
  ), [orders]);

  const todayRevenue = React.useMemo(() => todayOrders.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + order.total : sum, 0
  ), [todayOrders]);

  // Calculate total revenue (all time) - memoized
  const totalRevenue = React.useMemo(() => orders.reduce((sum, order) => 
    order.status !== 'cancelled' ? sum + order.total : sum, 0
  ), [orders]);

  // Calculate average rating (mock for now - will be real when rating system is implemented)
  const completedOrders = React.useMemo(() => orders.filter(order => order.status === 'completed'), [orders]);
  const avgRating = completedOrders.length > 0 ? 4.7 : 0; // Default until rating system is implemented

  // Calculate yesterday's revenue for growth percentage - memoized
  const yesterdayRevenue = React.useMemo(() => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === yesterday.getTime();
    });
    return yesterdayOrders.reduce((sum, order) => 
      order.status !== 'cancelled' ? sum + order.total : sum, 0
    );
  }, [orders, today]);

  const revenueGrowth = React.useMemo(() => {
    if (yesterdayRevenue > 0) {
      return (((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1);
    }
    return todayRevenue > 0 ? '+100' : '0';
  }, [todayRevenue, yesterdayRevenue]);

  // Filter orders based on selected filter - memoized
  const filteredOrders = React.useMemo(() => {
    return orderFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status === orderFilter);
  }, [orderFilter, orders]);

  // Filter menu items based on search - memoized
  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  // Early return AFTER all hooks have been called
  if (!isAuthenticated || !user || !cafeteria || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Handle order actions
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    // Update selectedOrder if it's the one being updated
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // ========== BULK ORDER ACTIONS ==========
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleAllOrders = (orders: any[]) => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)));
    }
  };

  const handleBulkStatusUpdate = (status: OrderStatus) => {
    selectedOrders.forEach(orderId => {
      updateOrderStatus(orderId, status);
    });
    setSelectedOrders(new Set());
    setBulkActionMode(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedOrders.size} selected order${selectedOrders.size !== 1 ? 's' : ''}?`)) {
      selectedOrders.forEach(orderId => {
        deleteOrder(orderId);
      });
      setSelectedOrders(new Set());
      setBulkActionMode(false);
    }
  };

  const handlePrintOrders = () => {
    const ordersToPrint = orders.filter(o => selectedOrders.has(o.id));
    // In a real app, this would open a print dialog with formatted order slips
    alert(`Printing ${ordersToPrint.length} orders...`);
  };

  // ========== EXPORT TO EXCEL ==========
  const handleExportToExcel = () => {
    if (!cafeteria) return;
    
    try {
      const analytics = getAnalytics(cafeteria.id, analyticsTimeRange);
      
      exportToExcel({
        cafeteriaName: cafeteria.name,
        orders: orders,
        menuItems: menuItems,
        analytics: analytics,
        timeRange: analyticsTimeRange
      });
      
      // Show success message
      setTimeout(() => {
        alert('✅ Excel report generated successfully! Check your downloads folder.');
      }, 100);
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ Failed to export data. Please try again.');
    }
  };

  // ========== OVERVIEW TAB ==========
  const renderOverviewTab = () => (
    <>
      {/* Today's Stats */}
      <section className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-red-600 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Today's Overview</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-md sm:rounded-lg">
                <DollarSign size={14} className="text-white sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              </div>
              {revenueGrowth !== '0' && (
                <span className={`text-[10px] sm:text-xs font-bold ${
                  revenueGrowth.startsWith('-') 
                    ? 'text-red-700 dark:text-red-400' 
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}>
                  {revenueGrowth.startsWith('-') ? '' : '+'}{revenueGrowth}%
                </span>
              )}
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-100">
              ₹{todayRevenue.toFixed(2)}
            </h4>
            <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium">Revenue</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-blue-500 rounded-md sm:rounded-lg">
                <Package size={14} className="text-white sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              </div>
              {activeOrders.length > 0 && (
                <span className="px-1.5 sm:px-2 py-0.5 bg-blue-500 text-white text-[10px] sm:text-xs font-bold rounded-full animate-pulse">Live</span>
              )}
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-100">{activeOrders.length}</h4>
            <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-medium">Active Orders</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-purple-500 rounded-md sm:rounded-lg">
                <CheckCircle2 size={14} className="text-white sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              </div>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-purple-900 dark:text-purple-100">{todayOrders.length}</h4>
            <p className="text-[10px] sm:text-xs text-purple-700 dark:text-purple-400 font-medium">Total Today</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-amber-500 rounded-md sm:rounded-lg">
                <Star size={14} className="text-white sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              </div>
            </div>
            <h4 className="text-2xl font-black text-amber-900 dark:text-amber-100">
              {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              {avgRating > 0 ? 'Avg Rating' : 'No Ratings Yet'}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Package size={18} className="text-blue-600 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Quick Actions</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          <button
            onClick={() => router.push('/partner/menu')}
            className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform">
                <Utensils size={14} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-600 sm:w-4 sm:h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600">Manage Menu</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">View & edit items</p>
          </button>

          <button
            onClick={() => router.push('/partner/menu/new')}
            className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 hover:border-green-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform">
                <PlusCircle size={14} className="text-green-600 sm:w-[18px] sm:h-[18px]" />
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-green-600 sm:w-4 sm:h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-hover:text-green-600">Add Item</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Create new dish</p>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 hover:border-purple-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform">
                <BarChart3 size={14} className="text-purple-600 sm:w-[18px] sm:h-[18px]" />
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-purple-600 sm:w-4 sm:h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-hover:text-purple-600">Analytics</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">View insights</p>
          </button>

          <button
            onClick={() => router.push('/partner/payment')}
            className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign size={14} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" />
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-emerald-600 sm:w-4 sm:h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-hover:text-emerald-600">Payments</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">QR & History</p>
          </button>

          <button
            onClick={() => router.push('/partner/settings')}
            className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 hover:border-orange-500 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="p-1.5 sm:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md sm:rounded-lg group-hover:scale-110 transition-transform">
                <Settings size={14} className="text-orange-600 sm:w-[18px] sm:h-[18px]" />
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-orange-600 sm:w-4 sm:h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white group-hover:text-orange-600">Settings</h4>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Cafe preferences</p>
          </button>
        </div>
      </section>

      {/* Recent Orders */}
      {activeOrders.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-orange-600" />
              Live Orders
            </h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            {activeOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Package size={16} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.items.length} items • ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  order.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                  order.status === 'preparing' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                  'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dashboard Preferences */}
      <section className="mt-6">
        <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Settings size={20} className="text-gray-600 dark:text-gray-400" />
          Dashboard Preferences
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <div className="space-y-4">
            {/* Saved State Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active Tab</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{activeTab}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Filter</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{orderFilter}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">View Mode</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{orderViewMode}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Analytics Range</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{analyticsTimeRange} days</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Theme</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{isDark ? 'Dark' : 'Light'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bulk Mode</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{bulkActionMode ? 'Active' : 'Inactive'}</p>
              </div>
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Auto-Saved Preferences</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Your dashboard preferences are automatically saved in your browser. They will be restored when you return.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={resetDashboardPreferences}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold text-sm transition-colors"
              >
                <RefreshCw size={16} />
                Reset to Defaults
              </button>
              <button
                onClick={exportDashboardState}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg font-bold text-sm transition-colors"
              >
                <Copy size={16} />
                Export State
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  // ========== ANALYTICS TAB ==========
  const renderAnalyticsTab = () => {
    if (!cafeteria) return null;
    
    const analytics = getAnalytics(cafeteria.id, analyticsTimeRange);

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Time Range Selector and Export Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Sales Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your performance and growth</p>
          </div>
          <div className="flex gap-2">
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setAnalyticsTimeRange(days)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    analyticsTimeRange === days
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
            
            {/* Export to Excel Button */}
            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105"
            >
              <FileSpreadsheet size={18} />
              <span className="hidden sm:inline">Export to Excel</span>
              <Download size={16} className="hidden sm:inline" />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={20} className="sm:w-6 sm:h-6" />
              {analytics.revenueGrowth >= 0 ? (
                <ArrowUpRight size={16} className="sm:w-5 sm:h-5" />
              ) : (
                <ArrowDownRight size={16} className="sm:w-5 sm:h-5" />
              )}
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black">
              ₹{analytics.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs sm:text-sm text-green-100 mt-1">Total Revenue</p>
            <p className={`text-xs sm:text-sm font-bold mt-1 ${analytics.revenueGrowth >= 0 ? 'text-green-100' : 'text-red-200'}`}>
              {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}% vs prev period
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
              {analytics.ordersGrowth >= 0 ? (
                <ArrowUpRight size={16} className="sm:w-5 sm:h-5" />
              ) : (
                <ArrowDownRight size={16} className="sm:w-5 sm:h-5" />
              )}
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black">{analytics.totalOrders}</p>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">Total Orders</p>
            <p className={`text-xs sm:text-sm font-bold mt-1 ${analytics.ordersGrowth >= 0 ? 'text-blue-100' : 'text-red-200'}`}>
              {analytics.ordersGrowth >= 0 ? '+' : ''}{analytics.ordersGrowth.toFixed(1)}% vs prev period
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black">
              ₹{analytics.averageOrderValue.toFixed(2)}
            </p>
            <p className="text-xs sm:text-sm text-purple-100 mt-1">Avg Order Value</p>
            <p className="text-xs sm:text-sm font-bold mt-1 text-purple-100">
              Per transaction
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black">{analytics.peakHours[0]}</p>
            <p className="text-xs sm:text-sm text-orange-100 mt-1">Peak Hour</p>
            <p className="text-xs sm:text-sm font-bold mt-1 text-orange-100">
              Busiest time
            </p>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Top Selling Items
          </h3>
          <div className="space-y-3">
            {analytics.topSellingItems.slice(0, 5).map((item, idx) => (
              <div key={item.itemId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white font-black flex items-center justify-center text-sm">
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.itemName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} sold • {item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-gray-900 dark:text-white text-sm">
                    ₹{item.revenue.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Sales - New Calendar/List View */}
        <DailySalesAnalytics salesByDay={analytics.salesByDay} />

        {/* Order Status Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Order Status Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {analytics.orderStatusBreakdown.map((status) => {
              const statusColors: Record<string, string> = {
                pending: 'bg-yellow-500',
                preparing: 'bg-blue-500',
                ready: 'bg-green-500',
                completed: 'bg-gray-500',
                cancelled: 'bg-red-500',
              };
              
              return (
                <div key={status.status} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`w-12 h-12 rounded-full ${statusColors[status.status]} mx-auto mb-2 flex items-center justify-center text-white font-black text-lg`}>
                    {status.count}
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{status.status}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{status.percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ========== MENU TAB ==========
  const renderMenuTab = () => (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => router.push('/partner/menu/new')}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <PlusCircle size={18} />
          Add New Item
        </button>
      </div>

      {/* Menu Items Grid */}
      {filteredMenuItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Utensils size={32} className="text-gray-400" />
          </div>
          <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No items found' : 'No Menu Items Yet'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery ? 'Try a different search term' : 'Start by adding your first menu item'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/partner/menu/new')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold inline-flex items-center gap-2"
            >
              <PlusCircle size={18} />
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all group"
            >
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
                {item.available && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    Available
                  </div>
                )}
              </div>
              <div className="p-3">
                <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 truncate">{item.name}</h5>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">₹{item.price.toFixed(2)}</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => router.push(`/partner/menu?edit=${item.id}`)}
                      className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      title="Edit"
                    >
                      <Edit size={14} className="text-blue-600" />
                    </button>
                    <button
                      className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>  );
  // ========== ORDERS TAB ==========
  const renderOrdersTab = () => {
    if (!cafeteria) return null;
    
    return (
      <div className="space-y-6">
        <LiveOrderStream cafeteriaId={cafeteria.id} />
      </div>
    );
  };

  // ========== INVENTORY TAB ==========
  const renderInventoryTab = () => {
    if (!cafeteria) return null;
    
    const inventoryItems = getInventoryByCafeteria(cafeteria.id);
    const lowStockItems = getLowStockItems(cafeteria.id);

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-blue-500" size={20} />
              <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Total Items</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">{inventoryItems.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-orange-500" size={20} />
              <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Low Stock</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-orange-600">{lowStockItems.length}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="text-green-500" size={20} />
              <p className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">In Stock</p>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-green-600">{inventoryItems.length - lowStockItems.length}</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-orange-600" size={20} />
              <h3 className="font-black text-orange-900 dark:text-orange-100">Low Stock Alert</h3>
            </div>
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
              {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <span key={item.id} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 rounded-full text-xs font-bold">
                  {item.menuItemName}: {item.currentStock} {item.unit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Items */}
        <div className="space-y-3">
          {inventoryItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <PackageSearch size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2">No Inventory Items</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start tracking your inventory</p>
            </div>
          ) : (
            inventoryItems.map(item => {
              const stockPercentage = (item.currentStock / item.maxStock) * 100;
              const isLowStock = item.lowStockAlert;
              const isCritical = item.currentStock < item.minStock * 0.5;
              
              return (
                <div 
                  key={item.id}
                  className={`bg-white dark:bg-gray-900 rounded-xl p-4 border transition-all ${
                    isCritical 
                      ? 'border-red-300 dark:border-red-800 shadow-lg shadow-red-100 dark:shadow-red-900/20' 
                      : isLowStock 
                        ? 'border-orange-300 dark:border-orange-800' 
                        : 'border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {item.menuItemName}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Last restocked: {new Date(item.lastRestocked).toLocaleDateString()}
                          </p>
                        </div>
                        {isLowStock && (
                          <span className={`px-2 py-1 ${isCritical ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'} rounded-full text-[10px] font-bold flex-shrink-0 ml-2`}>
                            {isCritical ? 'CRITICAL' : 'LOW'}
                          </span>
                        )}
                      </div>
                      
                      {/* Stock Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.currentStock} / {item.maxStock} {item.unit}
                          </span>
                          <span className={`font-bold ${
                            isCritical ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {stockPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isCritical 
                                ? 'bg-gradient-to-r from-red-600 to-red-500' 
                                : isLowStock 
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-400' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Restock Actions */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={restockQuantity[item.id] || ''}
                        onChange={(e) => setRestockQuantity(prev => ({
                          ...prev,
                          [item.id]: parseInt(e.target.value) || 0
                        }))}
                        className="w-16 sm:w-20 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center"
                      />
                      <button
                        onClick={() => {
                          if (restockQuantity[item.id] && restockQuantity[item.id] > 0) {
                            restockItem(item.id, restockQuantity[item.id]);
                            setRestockQuantity(prev => ({ ...prev, [item.id]: 0 }));
                          }
                        }}
                        disabled={!restockQuantity[item.id] || restockQuantity[item.id] <= 0}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-bold transition-colors text-xs sm:text-sm flex items-center gap-1 disabled:cursor-not-allowed"
                      >
                        <RefreshCw size={14} />
                        <span className="hidden sm:inline">Restock</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-3">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <MenuIcon size={18} className="text-white sm:w-5 sm:h-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate">
                  {cafeteria.name}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Partner Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => router.push('/partner/payment')}
                className="p-1.5 sm:p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors group"
                title="Payment Management"
              >
                <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400 sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isDark ? <Sun size={16} className="text-yellow-500 sm:w-[18px] sm:h-[18px]" /> : <Moon size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />}
              </button>
              <button
                onClick={() => router.push('/partner/settings')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors hidden xs:block"
              >
                <Settings size={16} className="text-gray-600 dark:text-gray-400 sm:w-[18px] sm:h-[18px]" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all text-xs sm:text-sm font-medium"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-8">
        {/* Enhanced Welcome Banner */}
        <div className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-3 sm:mb-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">
                Welcome back, {user.name.split(' ')[0]}! 👋
              </h2>
              <p className="text-sm sm:text-base text-red-100 mb-3 sm:mb-0">
                {cafeteria.name} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black">{activeOrders.length}</p>
                <p className="text-xs text-red-100">Active Orders</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black">{todayOrders.length}</p>
                <p className="text-xs text-red-100">Today's Orders</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black">₹{todayRevenue.toFixed(2)}</p>
                <p className="text-xs text-red-100">Today's Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 sm:gap-2 min-w-max sm:min-w-0 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Analytics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'menu'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Utensils size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Menu</span>
                <span className="hidden sm:inline">({menuItems.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Orders</span>
                {activeOrders.length > 0 && (
                  <span className="px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                    {activeOrders.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <PackageSearch size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Inventory</span>
                {cafeteria && getLowStockItems(cafeteria.id).length > 0 && (
                  <span className="px-1.5 sm:px-2 py-0.5 bg-orange-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                    {getLowStockItems(cafeteria.id).length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => router.push('/partner/payment')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold text-xs sm:text-base transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-red-600 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Payments</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'menu' && renderMenuTab()}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
      </main>

      {/* Order Management Modal */}
      {isOrderModalOpen && selectedOrder && (
        <OrderManagementModal
          order={selectedOrder}
          onClose={() => {
            setIsOrderModalOpen(false);
            setSelectedOrder(null);
          }}
          onUpdateStatus={handleUpdateOrderStatus}
          onSetEstimatedTime={setOrderEstimatedTime}
        />
      )}
    </div>
  );
};

// Order Management Modal Component - Compact & Minimal
const OrderManagementModal = ({ 
  order, 
  onClose, 
  onUpdateStatus,
  onSetEstimatedTime 
}: { 
  order: any; 
  onClose: () => void; 
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onSetEstimatedTime: (orderId: string, minutes: number) => void;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsLoaded(true), 50);
  }, []);

  const statusOptions: { value: OrderStatus; label: string; color: string; icon: string }[] = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: '⏳' },
    { value: 'preparing', label: 'Preparing', color: 'bg-blue-500', icon: '👨‍🍳' },
    { value: 'ready', label: 'Ready', color: 'bg-green-500', icon: '✅' },
    { value: 'completed', label: 'Done', color: 'bg-gray-500', icon: '🎉' },
    { value: 'cancelled', label: 'Cancel', color: 'bg-red-500', icon: '❌' },
  ];

  const currentStatus = statusOptions.find(opt => opt.value === order.status);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50 dark:bg-black/70" onClick={onClose} />
      
      {/* Modal Container - Professional Design */}
      <div className={`relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-transform duration-200 m-4 ${isLoaded ? 'scale-100' : 'scale-95'}`}>
        
        {/* Elegant Header */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-6 sm:px-8 py-6 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentStatus?.color || 'from-red-500 to-orange-500'} shadow-lg`}>
                  <span className="text-xl sm:text-2xl">{currentStatus?.icon || '🍕'}</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus?.color || 'bg-red-500'} text-white border border-white/20`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all group flex-shrink-0"
            >
              <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content - Professional Card Layout */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Order Time Tracker */}
          <OrderTimeTracker
            orderId={order.id}
            status={order.status}
            estimatedTime={order.estimatedTime}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
            onSetEstimatedTime={(minutes) => onSetEstimatedTime(order.id, minutes)}
          />

          {/* Customer Info Card */}
          {order.customerName && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Customer Details</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {order.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{order.customerName}</p>
                  {order.customerPhone && (
                    <a 
                      href={`tel:${order.customerPhone}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Phone size={12} />
                      {order.customerPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Items Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <MenuIcon size={18} className="text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Order Items</span>
            </div>
            
            <div className="space-y-3 mb-5">
              {order.items.map((item: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
                      {item.quantity}×
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">Total Amount</span>
                <span className="text-white text-2xl sm:text-3xl font-black">
                  ₹{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Professional Grid */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">Update Order Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdateStatus(order.id, option.value)}
                  disabled={order.status === option.value}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                    order.status === option.value
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : `${option.color} text-white hover:scale-105 active:scale-95 shadow-md hover:shadow-lg`
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div>{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PartnerDashboard;
