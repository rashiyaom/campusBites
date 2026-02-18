"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { PARTNER_ACCOUNTS } from '@/lib/seedBusinessData';
import { BUSINESS_UI_CONFIG, BusinessType } from '@/types/business';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import * as XLSX from 'xlsx';
import {
  Shield, Users, ShoppingBag, DollarSign, TrendingUp, LogOut, Search, Moon, Sun,
  Eye, EyeOff, Trash2, Plus, ChevronDown, ChevronRight, Package, CreditCard, Wallet,
  Banknote, Smartphone, X, Check, Copy, Store, BarChart3, Clock, AlertCircle,
  UserPlus, Download, ArrowUpRight, CalendarDays, Building2, Mail, Phone,
  GraduationCap, Hash, Edit3, Save, FileSpreadsheet, Layers, Activity, Receipt,
  PieChart, IndianRupee, ShieldCheck, BadgeCheck, MoreHorizontal, ExternalLink
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  department: string;
  studentId: string;
  password?: string;
  createdAt: Date;
}

interface PartnerAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  businessId: string;
  businessType: BusinessType;
  businessName: string;
}

type AdminTab = 'overview' | 'students' | 'orders' | 'partners';

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { orders, refreshOrders } = useOrders();

  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Students state
  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Orders state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');

  // Partners state
  const [partners, setPartners] = useState<PartnerAccount[]>([]);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [showCreatePartner, setShowCreatePartner] = useState(false);
  const [editingPartner, setEditingPartner] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PartnerAccount>>({});
  const [newPartner, setNewPartner] = useState({
    email: '', password: '', name: '', businessName: '', businessType: 'food' as BusinessType,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Platform fees state (per store)
  const [platformFees, setPlatformFees] = useState<Record<string, number>>({});
  const [editingFee, setEditingFee] = useState<string | null>(null);
  const [feeInput, setFeeInput] = useState('');

  // Real-time sync
  useRealtimeSync(['orders', 'mockStudents', 'partners', 'platformFees'], async () => {
    await refreshOrders();
    loadStudents();
    loadPartners();
    loadPlatformFees();
  });

  // ============================================
  // AUTH CHECK
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => setIsAuthChecking(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthChecking && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isAuthChecking, router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') { setIsDark(true); document.documentElement.classList.add('dark'); }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  // ============================================
  // DATA LOADERS
  // ============================================
  const loadStudents = useCallback(() => {
    const saved = localStorage.getItem('mockStudents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) })));
      } catch { setStudents([]); }
    }
  }, []);

  const loadPartners = useCallback(() => {
    const saved = localStorage.getItem('partners');
    if (saved) {
      try { setPartners(JSON.parse(saved)); } catch { setPartners(PARTNER_ACCOUNTS); }
    } else {
      setPartners(PARTNER_ACCOUNTS);
    }
  }, []);

  const loadPlatformFees = useCallback(() => {
    const saved = localStorage.getItem('platformFees');
    if (saved) {
      try { setPlatformFees(JSON.parse(saved)); } catch { setPlatformFees({}); }
    }
  }, []);

  useEffect(() => { loadStudents(); loadPartners(); loadPlatformFees(); }, [loadStudents, loadPartners, loadPlatformFees]);

  // ============================================
  // COMPUTED DATA
  // ============================================
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed');
    const cancelledOrders = orders.filter(o => ['cancelled', 'declined'].includes(o.status));
    const pendingOrders = orders.filter(o => ['pending', 'approved', 'payment_pending', 'confirmed', 'preparing', 'ready'].includes(o.status));

    // Actual platform fees collected from orders (stored on each order)
    const totalPlatformFees = orders.reduce((sum, o) => sum + (o.platformFee || 0), 0);
    const deliveryOrders = orders.filter(o => o.deliveryType === 'delivery');
    const totalDeliveryFees = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    // Product revenue = total - platformFees - deliveryFees
    const productRevenue = totalRevenue - totalPlatformFees - totalDeliveryFees;

    const paymentBreakdown = {
      cash: orders.filter(o => o.paymentMethod === 'cash'),
      upi: orders.filter(o => o.paymentMethod === 'upi'),
      card: orders.filter(o => o.paymentMethod === 'card'),
      wallet: orders.filter(o => o.paymentMethod === 'wallet'),
      unpaid: orders.filter(o => !o.paymentMethod || o.paymentStatus === 'unpaid'),
    };

    const businessBreakdown: Record<string, typeof orders> = {};
    orders.forEach(o => {
      const partner = partners.find(p => p.businessId === o.cafeteriaId);
      const type = partner?.businessType || 'food';
      if (!businessBreakdown[type]) businessBreakdown[type] = [];
      businessBreakdown[type].push(o);
    });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalStudents: students.length, totalOrders: orders.length, totalRevenue,
      pendingOrders: pendingOrders.length, completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length, totalPartners: partners.length,
      totalPlatformFees, totalDeliveryFees, platformEarnings: totalPlatformFees + totalDeliveryFees,
      productRevenue,
      paymentBreakdown, businessBreakdown,
      todayOrders: todayOrders.length, todayRevenue,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      deliveryOrders: deliveryOrders.length,
    };
  }, [orders, students, partners]);

  const filteredStudents = useMemo(() => {
    return students.filter(s =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = orderSearch === '' ||
        o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.studentName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.cafeteriaName?.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      const matchesPayment = orderPaymentFilter === 'all' ||
        (orderPaymentFilter === 'paid' && o.paymentStatus === 'completed') ||
        (orderPaymentFilter === 'unpaid' && (o.paymentStatus === 'unpaid' || !o.paymentStatus)) ||
        (orderPaymentFilter === 'refunded' && o.paymentStatus === 'refunded') ||
        (orderPaymentFilter === o.paymentMethod);
      return matchesSearch && matchesStatus && matchesPayment;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, orderSearch, orderStatusFilter, orderPaymentFilter]);

  const filteredPartners = useMemo(() => {
    return partners.filter(p =>
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.businessName.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      p.businessType.toLowerCase().includes(partnerSearch.toLowerCase())
    );
  }, [partners, partnerSearch]);

  // ============================================
  // EXCEL EXPORT
  // ============================================
  const exportToExcel = useCallback((type: 'students' | 'orders' | 'partners' | 'all') => {
    const wb = XLSX.utils.book_new();

    if (type === 'students' || type === 'all') {
      const data = students.map(s => ({
        'Name': s.name, 'Email': s.email, 'Phone': s.phone || 'N/A',
        'Student ID': s.studentId, 'Institute': s.institute || 'N/A',
        'Department': s.department || 'N/A',
        'Orders': orders.filter(o => o.studentEmail === s.email).length,
        'Total Spent (₹)': orders.filter(o => o.studentEmail === s.email).reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2),
        'Joined': new Date(s.createdAt).toLocaleDateString(),
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 8 }, { wch: 15 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
    }

    if (type === 'orders' || type === 'all') {
      const data = orders.map(o => ({
        'Order #': o.orderNumber || o.id, 'Student': o.studentName || o.customerName || 'N/A',
        'Email': o.studentEmail || '', 'Store': o.cafeteriaName || 'N/A',
        'Items': o.items?.map((i: any) => `${i.name} x${i.quantity}`).join(', ') || '',
        'Product Total (₹)': ((o.total || 0) - (o.platformFee || 0) - (o.deliveryFee || 0)).toFixed(2),
        'Platform Fee (₹)': (o.platformFee || 0).toFixed(2),
        'Delivery Fee (₹)': (o.deliveryFee || 0).toFixed(2),
        'Order Total (₹)': (o.total || 0).toFixed(2),
        'Status': o.status, 'Payment Status': o.paymentStatus || 'unpaid',
        'Payment Method': o.paymentMethod || 'N/A', 'Delivery Type': o.deliveryType || 'pickup',
        'Date': new Date(o.createdAt).toLocaleString(),
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = Array(13).fill({ wch: 16 });
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    }

    if (type === 'partners' || type === 'all') {
      const data = partners.map(p => {
        const pOrders = orders.filter(o => o.cafeteriaId === p.businessId);
        return {
          'Name': p.name, 'Email': p.email, 'Password': p.password, 'Business': p.businessName,
          'Type': BUSINESS_UI_CONFIG[p.businessType]?.label || p.businessType,
          'Business ID': p.businessId, 'Platform Fee (₹)': platformFees[p.businessId] || 0,
          'Orders': pOrders.length,
          'Revenue (₹)': pOrders.reduce((s, o) => s + (o.total || 0), 0).toFixed(2),
          'Platform Fees Collected (₹)': pOrders.reduce((s, o) => s + (o.platformFee || 0), 0).toFixed(2),
        };
      });
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, { wch: 8 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Partners');
    }

    if (type === 'all') {
      const data = [
        { 'Metric': 'Total Students', 'Value': stats.totalStudents },
        { 'Metric': 'Total Orders', 'Value': stats.totalOrders },
        { 'Metric': 'Total Revenue (₹)', 'Value': stats.totalRevenue.toFixed(2) },
        { 'Metric': 'Product Revenue (₹)', 'Value': stats.productRevenue.toFixed(2) },
        { 'Metric': 'Platform Fees Collected (₹)', 'Value': stats.totalPlatformFees.toFixed(2) },
        { 'Metric': 'Delivery Fees Collected (₹)', 'Value': stats.totalDeliveryFees.toFixed(2) },
        { 'Metric': 'Platform Earnings (₹)', 'Value': stats.platformEarnings.toFixed(2) },
        { 'Metric': 'Avg Order Value (₹)', 'Value': stats.avgOrderValue.toFixed(2) },
        { 'Metric': 'Total Partners', 'Value': stats.totalPartners },
      ];
      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    }

    XLSX.writeFile(wb, `CampusBite_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [students, orders, partners, stats, platformFees]);

  // ============================================
  // ACTIONS
  // ============================================
  const handleCreatePartner = () => {
    if (!newPartner.email || !newPartner.password || !newPartner.name || !newPartner.businessName) return alert('Fill all fields');
    if (partners.some(p => p.email === newPartner.email)) return alert('Email already exists');

    const businessId = `business-${Date.now()}`;
    const partnerId = `partner-${Date.now()}`;
    const account: PartnerAccount = {
      id: partnerId, email: newPartner.email, password: newPartner.password,
      name: newPartner.name, role: 'partner', businessId,
      businessType: newPartner.businessType, businessName: newPartner.businessName,
    };
    const updated = [...partners, account];
    setPartners(updated);
    localStorage.setItem('partners', JSON.stringify(updated));

    const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
    businesses.push({
      id: businessId, name: newPartner.businessName,
      slug: newPartner.businessName.toLowerCase().replace(/\s+/g, '-'),
      businessType: newPartner.businessType,
      description: `${newPartner.businessName} - ${BUSINESS_UI_CONFIG[newPartner.businessType].label}`,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      rating: 4.0, location: 'Campus Area', openingHours: { open: '08:00', close: '22:00' },
      isOpen: true, partnerId, categories: [], createdAt: new Date(), updatedAt: new Date(),
    });
    localStorage.setItem('businesses', JSON.stringify(businesses));
    window.dispatchEvent(new Event('storage'));
    setNewPartner({ email: '', password: '', name: '', businessName: '', businessType: 'food' });
    setShowCreatePartner(false);
  };

  const handleEditPartner = (p: PartnerAccount) => { setEditingPartner(p.id); setEditForm({ ...p }); };

  const handleSavePartner = () => {
    if (!editingPartner) return;
    const updated = partners.map(p => p.id === editingPartner ? { ...p, ...editForm } as PartnerAccount : p);
    setPartners(updated);
    localStorage.setItem('partners', JSON.stringify(updated));
    if (editForm.businessName || editForm.businessType) {
      const businesses = JSON.parse(localStorage.getItem('businesses') || '[]');
      const partner = updated.find(p => p.id === editingPartner);
      if (partner) {
        const idx = businesses.findIndex((b: any) => b.id === partner.businessId);
        if (idx >= 0) {
          if (editForm.businessName) businesses[idx].name = editForm.businessName;
          if (editForm.businessType) businesses[idx].businessType = editForm.businessType;
          businesses[idx].updatedAt = new Date();
          localStorage.setItem('businesses', JSON.stringify(businesses));
        }
      }
    }
    window.dispatchEvent(new Event('storage'));
    setEditingPartner(null); setEditForm({});
  };

  const handleDeletePartner = (id: string) => {
    if (!confirm('Delete this partner?')) return;
    const p = partners.find(x => x.id === id);
    if (!p) return;
    const updated = partners.filter(x => x.id !== id);
    setPartners(updated);
    localStorage.setItem('partners', JSON.stringify(updated));
    const businesses = JSON.parse(localStorage.getItem('businesses') || '[]').filter((b: any) => b.id !== p.businessId);
    localStorage.setItem('businesses', JSON.stringify(businesses));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteStudent = (id: string) => {
    if (!confirm('Delete this student?')) return;
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    localStorage.setItem('mockStudents', JSON.stringify(updated));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePlatformFee = (businessId: string) => {
    const fee = parseFloat(feeInput);
    if (isNaN(fee) || fee < 0) return alert('Enter a valid fee (₹0 or more)');
    const updated = { ...platformFees, [businessId]: fee };
    setPlatformFees(updated);
    localStorage.setItem('platformFees', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setEditingFee(null);
    setFeeInput('');
  };

  // ============================================
  // STATUS COLORS
  // ============================================
  const statusColor = (s: string) => ({
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    approved: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    payment_pending: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
    confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
    preparing: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
    cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
    declined: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  }[s] || 'bg-gray-50 text-gray-700 border-gray-200');

  const payColor = (s?: string) => ({
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    unpaid: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
    refunded: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
  }[s || 'unpaid'] || 'bg-gray-50 text-gray-700 border-gray-200');

  // ============================================
  // LOADING
  // ============================================
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 border-[3px] border-red-500/20 rounded-full" />
            <div className="w-20 h-20 border-[3px] border-red-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
            <Shield className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-400 font-semibold text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated || user?.role !== 'admin') return null;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Layers size={17} /> },
    { id: 'students', label: 'Students', icon: <Users size={17} />, count: stats.totalStudents },
    { id: 'orders', label: 'Orders', icon: <Receipt size={17} />, count: stats.totalOrders },
    { id: 'partners', label: 'Partners', icon: <Store size={17} />, count: stats.totalPartners },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-[#0a0a0f]' : 'bg-[#f8f9fc]'}`}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#0a0a0f]/70 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldCheck size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">Admin Panel</h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-500 font-medium leading-tight">CampusBite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportToExcel('all')} className="hidden sm:flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors border border-gray-200/60 dark:border-white/[0.06]">
              <FileSpreadsheet size={13} /> Export All
            </button>
            <button onClick={toggleTheme} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors border border-gray-200/60 dark:border-white/[0.06]">
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200/60 dark:border-red-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">{user?.email}</span>
            </div>
            <button onClick={() => { logout(); router.push('/login'); }} className="flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.05] rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors border border-gray-200/60 dark:border-white/[0.06]">
              <LogOut size={13} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* TAB BAR */}
      <div className="sticky top-[60px] z-40 bg-white/50 dark:bg-[#0a0a0f]/50 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-0.5 overflow-x-auto py-1.5 scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold text-[13px] whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
              }`}>
              {tab.icon} {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${activeTab === tab.id ? 'bg-white/20 dark:bg-gray-900/20' : 'bg-gray-200 dark:bg-white/[0.08]'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Students', value: stats.totalStudents, icon: <Users size={18} />, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200/60 dark:border-blue-500/20', sub: 'Registered' },
                { label: 'Orders', value: stats.totalOrders, icon: <Receipt size={18} />, gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200/60 dark:border-orange-500/20', sub: `${stats.todayOrders} today` },
                { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <IndianRupee size={18} />, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/60 dark:border-emerald-500/20', sub: `₹${stats.todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} today` },
                { label: 'Partners', value: stats.totalPartners, icon: <Store size={18} />, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200/60 dark:border-purple-500/20', sub: `${Object.keys(stats.businessBreakdown).length} types` },
              ].map((c, i) => (
                <div key={i} className={`${c.bg} rounded-2xl border ${c.border} p-4 hover:shadow-lg transition-shadow`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`bg-gradient-to-br ${c.gradient} p-2 rounded-xl text-white shadow-lg`}>{c.icon}</div>
                    <ArrowUpRight size={14} className="text-emerald-500 opacity-60" />
                  </div>
                  <p className="text-2xl sm:text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">{c.value}</p>
                  <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-400 mt-0.5">{c.label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{c.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-3">
              {/* Platform Earnings */}
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center"><IndianRupee size={14} className="text-emerald-600 dark:text-emerald-400" /></div>
                    Platform Earnings
                  </h3>
                  <span className="text-[22px] font-extrabold text-emerald-600 dark:text-emerald-400">₹{stats.platformEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Platform Fees', detail: `from ${orders.filter(o => (o.platformFee || 0) > 0).length} orders`, amount: stats.totalPlatformFees },
                    { label: 'Delivery Fees', detail: `from ${stats.deliveryOrders} delivery orders`, amount: stats.totalDeliveryFees },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                      <div>
                        <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
                        <p className="text-[10px] text-gray-400">{item.detail}</p>
                      </div>
                      <span className="text-[14px] font-bold text-gray-900 dark:text-white">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Product Revenue</span>
                    <span className="text-[14px] font-bold text-blue-600 dark:text-blue-400">₹{stats.productRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">Avg Order Value</span>
                    <span className="text-[14px] font-bold text-orange-600 dark:text-orange-400">₹{stats.avgOrderValue.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
                <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center"><CreditCard size={14} className="text-purple-600 dark:text-purple-400" /></div>
                  Payment Breakdown
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'UPI', icon: <Smartphone size={14} />, data: stats.paymentBreakdown.upi, bg: 'bg-purple-50 dark:bg-purple-500/10', color: 'text-purple-600 dark:text-purple-400' },
                    { label: 'Card', icon: <CreditCard size={14} />, data: stats.paymentBreakdown.card, bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Cash', icon: <Banknote size={14} />, data: stats.paymentBreakdown.cash, bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Wallet', icon: <Wallet size={14} />, data: stats.paymentBreakdown.wallet, bg: 'bg-orange-50 dark:bg-orange-500/10', color: 'text-orange-600 dark:text-orange-400' },
                    { label: 'Unpaid', icon: <AlertCircle size={14} />, data: stats.paymentBreakdown.unpaid, bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-600 dark:text-red-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>{item.icon}</div>
                        <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">{item.data.length}</span>
                        <span className="text-[10px] text-gray-400 ml-1.5">₹{item.data.reduce((s, o) => s + (o.total || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Type Revenue */}
            <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5">
              <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center"><PieChart size={14} className="text-indigo-600 dark:text-indigo-400" /></div>
                Revenue by Type
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {(['food', 'grocery', 'stationery', 'daily_essentials'] as BusinessType[]).map(type => {
                  const config = BUSINESS_UI_CONFIG[type];
                  const typeOrders = stats.businessBreakdown[type] || [];
                  const typeRevenue = typeOrders.reduce((s, o) => s + (o.total || 0), 0);
                  return (
                    <div key={type} className="rounded-xl p-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04] hover:shadow-md transition-shadow">
                      <div className="text-2xl mb-2">{config.icon}</div>
                      <p className="text-[13px] font-bold text-gray-900 dark:text-white">{config.label}</p>
                      <p className="text-[10px] text-gray-400 mb-2">{partners.filter(p => p.businessType === type).length} partners</p>
                      <div className="pt-2 border-t border-gray-200 dark:border-white/[0.06]">
                        <p className="text-lg font-extrabold text-gray-900 dark:text-white">₹{typeRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <p className="text-[10px] text-gray-400">{typeOrders.length} orders</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { label: 'Manage Students', icon: <Users size={16} />, action: () => setActiveTab('students') },
                { label: 'View Orders', icon: <Receipt size={16} />, action: () => setActiveTab('orders') },
                { label: 'Manage Partners', icon: <Store size={16} />, action: () => setActiveTab('partners') },
                { label: 'Add Partner', icon: <UserPlus size={16} />, action: () => { setActiveTab('partners'); setShowCreatePartner(true); } },
              ].map((a, i) => (
                <button key={i} onClick={a.action} className="flex items-center gap-2.5 p-3.5 bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] hover:shadow-md transition-all group text-left">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform">{a.icon}</div>
                  <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">{a.label}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300 dark:text-gray-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search students..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-blue-500/30 outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <button onClick={() => exportToExcel('students')} className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/[0.03] rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors border border-gray-200/60 dark:border-white/[0.06] whitespace-nowrap">
                <Download size={13} /> Export
              </button>
              <div className="px-3.5 py-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-[12px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-500/20">
                <Users size={14} /> {filteredStudents.length}
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/60 dark:border-white/[0.06]">
                <Users size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-[13px] text-gray-500 font-medium">{studentSearch ? 'No match' : 'No students yet'}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredStudents.map(student => {
                  const sOrders = orders.filter(o => o.studentEmail === student.email || o.studentId === student.studentId);
                  const spent = sOrders.reduce((s, o) => s + (o.total || 0), 0);
                  const isExp = expandedStudent === student.id;
                  return (
                    <div key={student.id} className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden hover:border-gray-300 dark:hover:border-white/[0.1] transition-colors">
                      <button onClick={() => setExpandedStudent(isExp ? null : student.id)} className="w-full flex items-center gap-3 p-3.5 text-left">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[13px] shrink-0 shadow-sm">{student.name.charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-[13px] truncate">{student.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/[0.05] rounded-md font-medium">{student.studentId}</span>
                          <span>{sOrders.length} orders</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{spent.toFixed(0)}</span>
                        </div>
                        <ChevronDown size={14} className={`text-gray-300 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                      </button>
                      {isExp && (
                        <div className="border-t border-gray-100 dark:border-white/[0.04] px-3.5 py-3 bg-gray-50/50 dark:bg-white/[0.01]">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[11px]">
                            {[
                              { icon: <Mail size={10} />, l: 'Email', v: student.email },
                              { icon: <Phone size={10} />, l: 'Phone', v: student.phone || 'N/A' },
                              { icon: <GraduationCap size={10} />, l: 'Institute', v: student.institute || 'N/A' },
                              { icon: <Building2 size={10} />, l: 'Department', v: student.department || 'N/A' },
                              { icon: <Hash size={10} />, l: 'Student ID', v: student.studentId },
                              { icon: <CalendarDays size={10} />, l: 'Joined', v: new Date(student.createdAt).toLocaleDateString() },
                            ].map((f, i) => (
                              <div key={i}>
                                <p className="text-gray-400 mb-0.5 flex items-center gap-1">{f.icon}{f.l}</p>
                                <p className="font-medium text-gray-700 dark:text-gray-300 break-all">{f.v}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-200/60 dark:border-white/[0.04]">
                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-[11px] font-bold border border-blue-200/60 dark:border-blue-500/20">{sOrders.length} orders</span>
                            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[11px] font-bold border border-emerald-200/60 dark:border-emerald-500/20">₹{spent.toFixed(0)}</span>
                            <button onClick={() => handleDeleteStudent(student.id)} className="ml-auto p-1.5 rounded-lg text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search orders..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-orange-500/30 outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[12px] font-medium text-gray-700 dark:text-gray-300 outline-none">
                <option value="all">All Status</option>
                {['pending','approved','confirmed','preparing','ready','completed','cancelled','declined'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <select value={orderPaymentFilter} onChange={e => setOrderPaymentFilter(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[12px] font-medium text-gray-700 dark:text-gray-300 outline-none">
                <option value="all">All Payments</option>
                {['paid','unpaid','refunded','upi','card','cash','wallet'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <button onClick={() => exportToExcel('orders')} className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/[0.03] rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors border border-gray-200/60 dark:border-white/[0.06] whitespace-nowrap">
                <Download size={13} /> Export
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { l: 'Matching', v: filteredOrders.length, c: 'text-gray-900 dark:text-white' },
                { l: 'Value', v: `₹${filteredOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString('en-IN',{maximumFractionDigits:0})}`, c: 'text-emerald-600 dark:text-emerald-400' },
                { l: 'Paid', v: filteredOrders.filter(o => o.paymentStatus === 'completed').length, c: 'text-emerald-600 dark:text-emerald-400' },
                { l: 'Unpaid', v: filteredOrders.filter(o => !o.paymentStatus || o.paymentStatus === 'unpaid').length, c: 'text-red-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-3 text-center">
                  <p className={`text-xl font-extrabold ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{s.l}</p>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/60 dark:border-white/[0.06]">
                <Receipt size={40} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-[13px] text-gray-500 font-medium">No orders found</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.04]">
                        {['Order','Student','Store','Items','Total','P.Fee','Status','Payment','Method','Date'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-bold text-gray-400 dark:text-gray-600 text-[10px] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                      {filteredOrders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">{o.orderNumber || o.id.slice(0,8)}</td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-gray-800 dark:text-gray-200">{o.studentName || o.customerName || '—'}</p>
                            <p className="text-[10px] text-gray-400">{o.studentEmail || ''}</p>
                          </td>
                          <td className="px-3 py-2.5 font-medium text-gray-600 dark:text-gray-400">{o.cafeteriaName || '—'}</td>
                          <td className="px-3 py-2.5 text-gray-500">{o.items?.length || 0}</td>
                          <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white">₹{(o.total||0).toFixed(0)}</td>
                          <td className="px-3 py-2.5 text-gray-500">{(o.platformFee||0) > 0 ? `₹${o.platformFee}` : '—'}</td>
                          <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor(o.status)}`}>{o.status}</span></td>
                          <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${payColor(o.paymentStatus)}`}>{o.paymentStatus||'unpaid'}</span></td>
                          <td className="px-3 py-2.5 text-gray-500 capitalize">{o.paymentMethod||'—'}</td>
                          <td className="px-3 py-2.5 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PARTNERS */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} placeholder="Search partners..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[13px] font-medium focus:ring-2 focus:ring-purple-500/30 outline-none text-gray-900 dark:text-white placeholder:text-gray-400" />
              </div>
              <button onClick={() => exportToExcel('partners')} className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-white/[0.03] rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors border border-gray-200/60 dark:border-white/[0.06] whitespace-nowrap">
                <Download size={13} /> Export
              </button>
              <button onClick={() => setShowCreatePartner(!showCreatePartner)} className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold text-[12px] hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors whitespace-nowrap shadow-sm">
                <Plus size={14} /> New Partner
              </button>
            </div>

            {showCreatePartner && (
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 p-5 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-gray-900 dark:text-white flex items-center gap-2"><UserPlus size={16} className="text-emerald-500" /> New Partner</h3>
                  <button onClick={() => setShowCreatePartner(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg"><X size={14} className="text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { l: 'Name *', k: 'name', v: newPartner.name, p: 'John Doe', t: 'text' },
                    { l: 'Email *', k: 'email', v: newPartner.email, p: 'admin@store.com', t: 'email' },
                    { l: 'Password *', k: 'password', v: newPartner.password, p: 'Password', t: showPassword ? 'text' : 'password' },
                    { l: 'Business Name *', k: 'businessName', v: newPartner.businessName, p: 'Store Name', t: 'text' },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="text-[11px] font-bold text-gray-500 mb-1 block">{f.l}</label>
                      <div className="relative">
                        <input type={f.t} value={f.v} onChange={e => setNewPartner(prev => ({...prev, [f.k]: e.target.value}))} placeholder={f.p}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[12px] outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900 dark:text-white" />
                        {f.k === 'password' && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={13}/> : <Eye size={13}/>}</button>}
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 mb-1 block">Type *</label>
                    <select value={newPartner.businessType} onChange={e => setNewPartner(p => ({...p, businessType: e.target.value as BusinessType}))}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl text-[12px] outline-none focus:ring-2 focus:ring-emerald-500/30 text-gray-900 dark:text-white">
                      <option value="food">🍔 Food</option><option value="grocery">🛒 Grocery</option><option value="stationery">✏️ Stationery</option><option value="daily_essentials">🧴 Essentials</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleCreatePartner} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-[12px] hover:bg-emerald-700 transition-colors shadow-sm"><Check size={14} /> Create</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {(['food','grocery','stationery','daily_essentials'] as BusinessType[]).map(type => {
                const config = BUSINESS_UI_CONFIG[type];
                return (
                  <div key={type} className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] p-3 text-center">
                    <span className="text-xl">{config.icon}</span>
                    <p className="text-lg font-extrabold text-gray-900 dark:text-white">{filteredPartners.filter(p => p.businessType === type).length}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{config.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1.5">
              {filteredPartners.map(partner => {
                const config = BUSINESS_UI_CONFIG[partner.businessType] || BUSINESS_UI_CONFIG.food;
                const pOrders = orders.filter(o => o.cafeteriaId === partner.businessId);
                const pRevenue = pOrders.reduce((s, o) => s + (o.total || 0), 0);
                const isEditing = editingPartner === partner.id;

                return (
                  <div key={partner.id} className="bg-white dark:bg-white/[0.02] rounded-xl border border-gray-200/60 dark:border-white/[0.06] overflow-hidden hover:border-gray-300 dark:hover:border-white/[0.1] transition-colors">
                    {isEditing ? (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[13px] font-bold text-gray-900 dark:text-white flex items-center gap-2"><Edit3 size={14} className="text-blue-500" /> Edit Partner</h4>
                          <div className="flex items-center gap-1.5">
                            <button onClick={handleSavePartner} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700"><Save size={12} /> Save</button>
                            <button onClick={() => { setEditingPartner(null); setEditForm({}); }} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] rounded-lg"><X size={13} /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {[
                            { l: 'Name', k: 'name', v: editForm.name || '' },
                            { l: 'Email', k: 'email', v: editForm.email || '' },
                            { l: 'Password', k: 'password', v: editForm.password || '' },
                            { l: 'Business Name', k: 'businessName', v: editForm.businessName || '' },
                          ].map(f => (
                            <div key={f.k}>
                              <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">{f.l}</label>
                              <input type="text" value={f.v} onChange={e => setEditForm(prev => ({...prev, [f.k]: e.target.value}))}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white" />
                            </div>
                          ))}
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 mb-0.5 block">Type</label>
                            <select value={editForm.businessType || 'food'} onChange={e => setEditForm(prev => ({...prev, businessType: e.target.value as BusinessType}))}
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white">
                              <option value="food">🍔 Food</option><option value="grocery">🛒 Grocery</option><option value="stationery">✏️ Stationery</option><option value="daily_essentials">🧴 Essentials</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-xl shrink-0 border border-gray-200/60 dark:border-white/[0.06]">{config.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900 dark:text-white text-[13px]">{partner.businessName}</p>
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-white/[0.05] text-gray-500 border border-gray-200/60 dark:border-white/[0.06]">{config.label}</span>
                            </div>
                            <p className="text-[11px] text-gray-400">{partner.name} • {partner.email}</p>
                          </div>
                          <div className="hidden sm:flex items-center gap-3 text-[11px]">
                            <span className="text-gray-500 font-medium">{pOrders.length} orders</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{pRevenue.toLocaleString('en-IN',{maximumFractionDigits:0})}</span>
                            {/* Platform Fee Badge */}
                            {editingFee === partner.businessId ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-gray-400">₹</span>
                                <input type="number" value={feeInput} onChange={e => setFeeInput(e.target.value)}
                                  className="w-16 px-1.5 py-0.5 bg-white dark:bg-white/[0.05] border border-blue-300 dark:border-blue-500/40 rounded text-[11px] outline-none text-gray-900 dark:text-white"
                                  placeholder="0" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSavePlatformFee(partner.businessId); if (e.key === 'Escape') setEditingFee(null); }} />
                                <button onClick={() => handleSavePlatformFee(partner.businessId)} className="p-0.5 text-emerald-500 hover:text-emerald-600"><Check size={12} /></button>
                                <button onClick={() => setEditingFee(null)} className="p-0.5 text-gray-400 hover:text-gray-600"><X size={12} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingFee(partner.businessId); setFeeInput(String(platformFees[partner.businessId] || 0)); }}
                                className={`px-2 py-0.5 rounded-md font-bold border text-[10px] transition-colors ${
                                  (platformFees[partner.businessId] || 0) > 0
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20 hover:bg-indigo-100'
                                    : 'bg-gray-50 dark:bg-white/[0.03] text-gray-400 border-gray-200/60 dark:border-white/[0.06] hover:bg-gray-100'
                                }`} title="Click to set platform fee">
                                Fee: ₹{platformFees[partner.businessId] || 0}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => handleEditPartner(partner)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 transition-colors" title="Edit"><Edit3 size={13} /></button>
                            <button onClick={() => copyToClipboard(`Email: ${partner.email}\nPassword: ${partner.password}`, partner.id)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-600 transition-colors" title="Copy">
                              {copiedId === partner.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                            </button>
                            <button onClick={() => handleDeletePartner(partner.id)} className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-white/[0.04] flex items-center gap-2 text-[11px] flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.04]">
                            <Mail size={10} className="text-gray-400 shrink-0" /><span className="font-mono text-gray-500">{partner.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.04]">
                            <span className="text-[10px]">🔑</span><span className="font-mono text-gray-500">{partner.password}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-100 dark:border-white/[0.04]">
                            <span className="text-[10px]">🏪</span><span className="font-mono text-gray-500 text-[10px]">{partner.businessId}</span>
                          </div>
                          {/* Mobile platform fee display */}
                          <div className="sm:hidden flex items-center gap-1">
                            {editingFee === partner.businessId ? (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200/60 dark:border-blue-500/20">
                                <span className="text-[10px] text-gray-400">₹</span>
                                <input type="number" value={feeInput} onChange={e => setFeeInput(e.target.value)}
                                  className="w-14 px-1 py-0 bg-transparent border-none text-[11px] outline-none text-gray-900 dark:text-white" placeholder="0"
                                  autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSavePlatformFee(partner.businessId); if (e.key === 'Escape') setEditingFee(null); }} />
                                <button onClick={() => handleSavePlatformFee(partner.businessId)} className="text-emerald-500"><Check size={11} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingFee(partner.businessId); setFeeInput(String(platformFees[partner.businessId] || 0)); }}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border ${
                                  (platformFees[partner.businessId] || 0) > 0
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20'
                                    : 'bg-gray-50 dark:bg-white/[0.03] text-gray-400 border-gray-100 dark:border-white/[0.04]'
                                }`}>
                                Fee: ₹{platformFees[partner.businessId] || 0}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
