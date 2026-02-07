"use client";

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Upload, 
  Check, 
  X, 
  Download,
  History,
  TrendingUp,
  Calendar,
  IndianRupee,
  User,
  Package,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  CheckCircle2,
  ArrowLeft,
  Smartphone,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useRouter } from 'next/navigation';

interface PaymentConfig {
  gpayLink: string;
  upiId: string;
  qrCodeUrl: string;
  merchantName: string;
}

interface PaymentTransaction {
  id: string;
  orderId: string;
  studentName: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

const PaymentManagementPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { orders } = useOrders();
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [config, setConfig] = useState<PaymentConfig>({
    gpayLink: '',
    upiId: '',
    qrCodeUrl: '',
    merchantName: ''
  });
  const [isSaving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Load saved payment config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem(`payment_config_${user?.id}`);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      if (parsed.qrCodeUrl) {
        setQrPreview(parsed.qrCodeUrl);
      }
    }
  }, [user?.id]);

  // Generate payment transactions from orders
  const getPaymentTransactions = (): PaymentTransaction[] => {
    if (!user?.cafeteriaId) return [];
    
    return orders
      .filter(order => 
        order.cafeteriaId === user.cafeteriaId && 
        ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status)
      )
      .map(order => ({
        id: order.id,
        orderId: order.id,
        studentName: order.studentName || order.customerName || 'Guest',
        amount: order.total,
        timestamp: new Date(order.createdAt),
        status: (order.status === 'completed' ? 'completed' : 'pending') as 'completed' | 'pending' | 'failed',
        paymentMethod: order.paymentMethod || 'UPI'
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const transactions = getPaymentTransactions();

  // Filter transactions by date
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return txDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return txDate >= monthAgo;
      default:
        return true;
    }
  });

  // Calculate statistics
  const totalRevenue = filteredTransactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const pendingAmount = filteredTransactions
    .filter(tx => tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const completedCount = filteredTransactions.filter(tx => tx.status === 'completed').length;

  // Handle QR Code Upload
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setQrPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Configuration
  const handleSaveConfig = () => {
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const configToSave = {
        ...config,
        qrCodeUrl: qrPreview
      };
      
      localStorage.setItem(`payment_config_${user?.id}`, JSON.stringify(configToSave));
      setSaving(false);
      setSavedSuccess(true);
      
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 1000);
  };

  // Generate dynamic UPI link with amount
  const generateUpiLink = (amount: number) => {
    if (!config.upiId) return '';
    const merchantName = encodeURIComponent(config.merchantName || 'Merchant');
    return `upi://pay?pa=${config.upiId}&pn=${merchantName}&am=${amount.toFixed(2)}&cu=INR`;
  };

  // Copy UPI ID
  const handleCopyUpiId = () => {
    if (config.upiId) {
      navigator.clipboard.writeText(config.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download QR Code
  const handleDownloadQr = () => {
    if (qrPreview) {
      const link = document.createElement('a');
      link.href = qrPreview;
      link.download = 'payment-qr-code.png';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/partner/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg">
              <CreditCard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Payment Hub
                <Sparkles size={28} className="text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Shield size={16} className="text-emerald-600" />
                Secure payment configuration and transaction tracking
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation - More Aesthetic */}
        <div className="flex gap-3 mb-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-2 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-[1.02]'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
            }`}
          >
            <Zap size={20} className={activeTab === 'settings' ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">Payment Settings</span>
            <span className="sm:hidden">Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-[1.02]'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
            }`}
          >
            <History size={20} />
            <span className="hidden sm:inline">Transaction History</span>
            <span className="sm:hidden">History</span>
            {transactions.length > 0 && (
              <span className="px-2.5 py-0.5 bg-white/30 rounded-full text-xs font-black">
                {transactions.length}
              </span>
            )}
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Dynamic QR Feature Highlight */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-[2px] shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <Zap size={28} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      Dynamic QR Code Generation
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold">ACTIVE</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Real-time payment QR codes with exact amounts
                    </p>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Auto-Generated</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Unique QR for each order with exact amount embedded</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl mb-2">✓</div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Zero Errors</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Amount pre-filled in UPI apps automatically</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Your UPI ID</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Direct payments to your configured UPI account</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">How it works:</span> When students pay, 
                    the system generates a QR code with your UPI ID (configured below) + exact order amount. Students scan once and the 
                    amount is already filled in their UPI app! 🎉
                  </p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {savedSuccess && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-5 flex items-center gap-4 shadow-lg animate-in slide-in-from-top duration-300">
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-900 dark:text-green-100 text-lg">Configuration Saved Successfully!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Your payment settings are now active and will be used for all new orders.</p>
                </div>
              </div>
            )}

            {/* UPI Configuration Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Smartphone size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    UPI Configuration
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full font-bold">Required</span>
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Used for dynamic QR code generation</p>
                </div>
              </div>

              {/* Info Banner */}
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <QrCode size={16} className="flex-shrink-0" />
                  <span><strong>This UPI ID will be used</strong> to generate payment QR codes with exact amounts for each student order.</span>
                </p>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={16} />
                    Merchant/Cafeteria Name
                  </label>
                  <input
                    type="text"
                    value={config.merchantName}
                    onChange={(e) => setConfig({ ...config, merchantName: e.target.value })}
                    placeholder="The Grill Cafeteria"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <CreditCard size={16} />
                    UPI ID
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">Required</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={config.upiId}
                      onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                      placeholder="merchant@paytm"
                      className="w-full px-5 py-4 pr-14 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                    />
                    <button
                      onClick={handleCopyUpiId}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
                      title="Copy UPI ID"
                    >
                      {copied ? (
                        <Check size={18} className="text-green-600 animate-in zoom-in" />
                      ) : (
                        <Copy size={18} className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
                    <Zap size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <strong>Dynamic QR Generation:</strong> Students will see QR codes with the exact order amount automatically embedded.
                    </p>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <ExternalLink size={16} />
                    GPay Payment Link
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">Optional</span>
                  </label>
                  <input
                    type="url"
                    value={config.gpayLink}
                    onChange={(e) => setConfig({ ...config, gpayLink: e.target.value })}
                    placeholder="https://gpay.app.goo.gl/xxxxx"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* QR Code Upload Card */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                  <QrCode size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Static QR Code</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upload a backup payment QR (optional)</p>
                </div>
              </div>

              {/* Dynamic QR Info Banner */}
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                    <Zap size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                      ✨ Dynamic QR Codes Enabled!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                      Students automatically get <span className="font-bold">unique QR codes with exact payment amounts</span> when they pay. 
                      This static QR is only a backup - the system will generate dynamic QR codes with your UPI ID above for each order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div>
                  <label className="block cursor-pointer group">
                    <div className="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                      <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload size={40} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                        Upload QR Code
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview Section */}
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Package size={16} />
                    Preview
                  </p>
                  {qrPreview ? (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                        <img 
                          src={qrPreview} 
                          alt="QR Code Preview" 
                          className="max-w-full h-52 object-contain rounded-xl shadow-lg"
                        />
                      </div>
                      <button
                        onClick={handleDownloadQr}
                        className="w-full py-3 px-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <Download size={18} />
                        Download QR
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="text-center">
                        <QrCode size={56} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          No QR code uploaded yet
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving || !config.upiId || !config.merchantName}
                className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} className="group-hover:rotate-12 transition-transform" />
                    Save Payment Settings
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stats Cards - More Aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl p-6 text-white shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <TrendingUp size={28} />
                    </div>
                    <span className="text-sm font-bold bg-white/30 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      Total Revenue
                    </span>
                  </div>
                  <p className="text-5xl font-black mb-2">₹{totalRevenue.toFixed(0)}</p>
                  <p className="text-emerald-100 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {completedCount} completed transactions
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Package size={28} />
                    </div>
                    <span className="text-sm font-bold bg-white/30 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      Pending
                    </span>
                  </div>
                  <p className="text-5xl font-black mb-2">₹{pendingAmount.toFixed(0)}</p>
                  <p className="text-blue-100 text-sm font-medium">
                    {filteredTransactions.filter(tx => tx.status === 'pending').length} pending payments
                  </p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-rose-600 rounded-3xl p-6 text-white shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Calendar size={28} />
                    </div>
                    <span className="text-sm font-bold bg-white/30 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      Total Orders
                    </span>
                  </div>
                  <p className="text-5xl font-black mb-2">{filteredTransactions.length}</p>
                  <p className="text-purple-100 text-sm font-medium">In selected period</p>
                </div>
              </div>
            </div>

            {/* Filter Buttons - More Refined */}
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-3 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-lg">
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'today', label: 'Today', icon: Calendar },
                  { value: 'week', label: 'This Week', icon: TrendingUp },
                  { value: 'month', label: 'This Month', icon: Package },
                  { value: 'all', label: 'All Time', icon: History }
                ].map(filter => {
                  const IconComponent = filter.icon;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => setDateFilter(filter.value as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 ${
                        dateFilter === filter.value
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-[1.02]'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent size={18} />
                      <span className="hidden sm:inline">{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transaction List - Cleaner Design */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <History size={24} className="text-white" />
                  </div>
                  Transaction History
                  {filteredTransactions.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-black">
                      {filteredTransactions.length}
                    </span>
                  )}
                </h2>
              </div>

              {filteredTransactions.length > 0 ? (
                <div className="divide-y divide-gray-200/50 dark:divide-gray-800/50">
                  {filteredTransactions.map(transaction => (
                    <div key={transaction.id} className="p-5 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer">
                      <div 
                        className="flex items-center justify-between"
                        onClick={() => setExpandedTransaction(
                          expandedTransaction === transaction.id ? null : transaction.id
                        )}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            transaction.status === 'completed' 
                              ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            <IndianRupee size={24} className="text-white font-bold" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <p className="font-black text-gray-900 dark:text-white text-lg">
                                Order #{transaction.orderId}
                              </p>
                              <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${
                                transaction.status === 'completed'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}>
                                {transaction.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 font-medium">
                              <span className="flex items-center gap-1.5">
                                <User size={14} />
                                {transaction.studentName}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {new Date(transaction.timestamp).toLocaleDateString([], { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })} at{' '}
                                {new Date(transaction.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-3xl font-black text-gray-900 dark:text-white">
                            ₹{transaction.amount.toFixed(0)}
                          </p>
                          {expandedTransaction === transaction.id ? (
                            <ChevronUp size={24} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={24} className="text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedTransaction === transaction.id && (
                        <div className="mt-5 pt-5 border-t border-gray-200/50 dark:border-gray-700/50 animate-in slide-in-from-top duration-300">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">Payment Method</p>
                              <p className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <CreditCard size={18} />
                                {transaction.paymentMethod}
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">Transaction ID</p>
                              <p className="font-black text-gray-900 dark:text-white text-lg">
                                {transaction.id}
                              </p>
                            </div>
                          </div>

                          {transaction.status === 'pending' && config.upiId && (
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl">
                              <div className="flex items-center gap-2 mb-3">
                                <QrCode size={20} className="text-blue-600 dark:text-blue-400" />
                                <p className="text-sm font-black text-blue-900 dark:text-blue-100">
                                  Dynamic Payment Link (₹{transaction.amount.toFixed(2)})
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={generateUpiLink(transaction.amount)}
                                  readOnly
                                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-700 rounded-xl text-xs font-mono text-gray-900 dark:text-white font-semibold"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(generateUpiLink(transaction.amount));
                                  }}
                                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 font-bold"
                                >
                                  <Copy size={18} />
                                  Copy
                                </button>
                              </div>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-3 font-medium">
                                💡 This link contains the exact amount and will open directly in the student's UPI app
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center">
                  <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-3xl w-fit mx-auto mb-4">
                    <History size={56} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-bold text-lg mb-2">
                    No Transactions Found
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    There are no transactions for the selected time period
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagementPage;
