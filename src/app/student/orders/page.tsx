"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/contexts/OrderContext';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { Order, OrderStatus } from '@/types';
import QRCode from 'qrcode';
import { 
  Clock, 
  Package, 
  CheckCircle2, 
  Truck, 
  ArrowLeft, 
  RefreshCw,
  CreditCard,
  XCircle,
  ChefHat,
  Wallet,
  AlertTriangle,
  Check,
  Bell,
  Smartphone,
  Banknote,
  BadgeDollarSign
} from 'lucide-react';

const statusConfig: Record<OrderStatus, { 
  color: string; 
  bgColor: string; 
  icon: React.ReactNode; 
  label: string;
  description: string;
}> = {
  pending: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: <Clock size={32} />,
    label: 'Awaiting Approval',
    description: 'Your order request is waiting for cafeteria approval'
  },
  approved: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <CreditCard size={32} />,
    label: 'Payment Required',
    description: 'Your order is approved! Please complete payment to confirm'
  },
  payment_pending: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <CreditCard size={32} />,
    label: 'Payment Required',
    description: 'Your order is approved! Please complete payment to confirm'
  },
  declined: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: <XCircle size={32} />,
    label: 'Declined',
    description: 'Sorry, your order request was declined by the cafeteria'
  },
  confirmed: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: <CheckCircle2 size={32} />,
    label: 'Confirmed',
    description: 'Payment received! Your order is now confirmed'
  },
  preparing: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: <ChefHat size={32} />,
    label: 'Preparing',
    description: 'Chef is cooking your delicious meal right now!'
  },
  ready: {
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    icon: <Package size={32} />,
    label: 'Ready for Pickup',
    description: 'Your order is ready! Head over to pick it up'
  },
  completed: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    icon: <Truck size={32} />,
    label: 'Completed',
    description: 'Order has been delivered/picked up. Enjoy!'
  },
  cancelled: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: <XCircle size={32} />,
    label: 'Cancelled',
    description: 'This order has been cancelled'
  }
};

// Payment Modal Component
interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onPaymentComplete: (orderId: string, method: string) => void;
}

const PaymentModal = ({ order, onClose, onPaymentComplete }: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [partnerPaymentConfig, setPartnerPaymentConfig] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  // Load partner's payment configuration
  useEffect(() => {
    if (order.cafeteriaId) {
      const savedConfig = localStorage.getItem(`payment_config_${order.cafeteriaId}`);
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setPartnerPaymentConfig(config);
        } catch (error) {
          console.error('Failed to load partner payment config:', error);
        }
      }
    }
  }, [order.cafeteriaId]);

  // Generate UPI payment string with partner's UPI ID
  const upiId = partnerPaymentConfig?.upiId || 'campusbites@paytm';
  const merchantName = partnerPaymentConfig?.merchantName || 'CampusBites';
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${order.total.toFixed(2)}&cu=INR&tn=Order%20${order.id}`;

  // Generate QR code when showing QR view
  useEffect(() => {
    if (showQRCode && !qrCodeDataUrl) {
      setIsGeneratingQR(true);
      QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      })
        .then(url => {
          setQrCodeDataUrl(url);
          setIsGeneratingQR(false);
        })
        .catch(err => {
          console.error('Failed to generate QR code:', err);
          setIsGeneratingQR(false);
        });
    }
  }, [showQRCode, upiString, qrCodeDataUrl]);

  const paymentMethods = [
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: Smartphone, 
      description: 'Pay via UPI apps',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    { 
      id: 'card', 
      name: 'Card', 
      icon: CreditCard, 
      description: 'Credit/Debit Card',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      id: 'wallet', 
      name: 'Wallet', 
      icon: Wallet, 
      description: 'CampusBites Wallet',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    { 
      id: 'cash', 
      name: 'Cash', 
      icon: Banknote, 
      description: 'Pay on pickup',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
  ];

  const handlePayment = async () => {
    if (selectedMethod === 'upi') {
      setShowQRCode(true);
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    onPaymentComplete(order.id, selectedMethod);
    setIsProcessing(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <CreditCard size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Complete Payment</h2>
                <p className="text-white/80 text-xs">Order {order.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close payment modal"
            >
              <XCircle size={20} className="text-white" />
            </button>
          </div>
        </div>        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!showQRCode ? (
            <>
              {/* Order Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Order Summary</h3>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white font-bold">Total</span>
                      <span className="text-green-600 dark:text-green-400 text-lg font-bold">₹{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left group hover:shadow-md ${
                          selectedMethod === method.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className={`p-2 rounded-lg w-fit mb-2 transition-colors ${
                          selectedMethod === method.id ? method.bgColor : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <IconComponent 
                            size={24} 
                            className={selectedMethod === method.id ? method.color : 'text-gray-500 dark:text-gray-400'}
                          />
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{method.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Notice */}
              {selectedMethod === 'cash' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                      <AlertTriangle size={20} className="text-amber-600 dark:text-amber-500 flex-shrink-0" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Cash on Pickup</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Please pay ₹{order.total.toFixed(2)} when you collect your order
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* QR Code Payment View */}
              <div className="text-center">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Scan to Pay</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
                  Scan this QR code with any UPI app to complete payment
                </p>

                {/* QR Code Container */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 p-6 rounded-xl shadow-lg mx-auto w-fit mb-5 border border-gray-200 dark:border-gray-700">
                  <div className="bg-white p-4 rounded-lg border-2 border-green-500">
                    {/* QR Code - Dynamically Generated */}
                    <div className="w-48 h-48 bg-white rounded flex items-center justify-center overflow-hidden">
                      {isGeneratingQR ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw size={32} className="text-green-500 animate-spin" />
                          <p className="text-xs text-gray-500">Generating QR...</p>
                        </div>
                      ) : qrCodeDataUrl ? (
                        <img 
                          src={qrCodeDataUrl}
                          alt="Payment QR Code"
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-xs text-red-500">Failed to generate QR code</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5 mb-4">
                  <p className="text-xs font-medium mb-1 opacity-90">Amount to Pay</p>
                  <p className="text-3xl font-bold">₹{order.total.toFixed(2)}</p>
                </div>

                {/* UPI ID */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">UPI ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{upiId}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(upiId);
                        // Could add a toast notification here
                        const btn = document.activeElement as HTMLButtonElement;
                        const originalText = btn.textContent;
                        btn.textContent = '✓ Copied';
                        setTimeout(() => {
                          if (btn) btn.textContent = originalText || 'Copy';
                        }, 2000);
                      }}
                      className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-5 text-left bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <Smartphone size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-bold text-blue-900 dark:text-blue-100 text-sm">How to pay:</p>
                  </div>
                  <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1.5 list-decimal list-inside ml-1">
                    <li>Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                    <li>Scan the QR code above</li>
                    <li>Verify the amount and complete payment</li>
                    <li>Click "I've Completed Payment" button below</li>
                  </ol>
                </div>

                {/* Confirmation Button */}
                <button
                  onClick={() => {
                    onPaymentComplete(order.id, 'upi');
                  }}
                  className="w-full mt-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <Check size={20} />
                  I've Completed Payment
                </button>

                {/* Back Button */}
                <button
                  onClick={() => setShowQRCode(false)}
                  className="w-full mt-2.5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold text-sm transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ← Choose Different Method
                </button>
              </div>
            </>
          )}
        </div>        {/* Action Buttons */}
        {!showQRCode && (
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check size={20} />
                  {selectedMethod === 'cash' ? 'Confirm Cash on Pickup' : selectedMethod === 'upi' ? 'Show QR Code' : `Pay ₹${order.total.toFixed(2)}`}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default function StudentOrdersPage() {
  const router = useRouter();
  const { orders, updateOrderStatus, refreshOrders } = useOrders();
  const { student, isAuthenticated, isLoading } = useStudentAuth();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  // Load student orders - memoized to prevent unnecessary re-renders
  const myOrdersList = React.useMemo(() => {
    if (!student) return [];
    
    // Filter orders for this student - show ALL orders including pending
    const studentOrders = orders.filter(
      order => order.studentEmail === student.email || order.studentId === student.studentId
    );
    
    // Sort by most recent first
    return studentOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, student]);

  // Update myOrders state when the memoized list changes
  useEffect(() => {
    console.log('[StudentOrders] Orders updated:', myOrdersList.length);
    setMyOrders(myOrdersList);

    // Auto-select the most recent order if none selected or if selected order no longer exists
    if (myOrdersList.length > 0) {
      if (!selectedOrder || !myOrdersList.find(o => o.id === selectedOrder.id)) {
        console.log('[StudentOrders] Auto-selecting first order');
        setSelectedOrder(myOrdersList[0]);
      } else {
        // Update selected order if it changed (status, estimatedTime, etc.)
        const updated = myOrdersList.find(o => o.id === selectedOrder.id);
        if (updated) {
          // Deep comparison to detect any changes
          const hasChanged = JSON.stringify(updated) !== JSON.stringify(selectedOrder);
          if (hasChanged) {
            console.log('[StudentOrders] Selected order updated, refreshing:', updated.status);
            setSelectedOrder(updated);
          }
        }
      }
    } else {
      setSelectedOrder(null);
    }
  }, [myOrdersList]);

  // Listen for localStorage changes from other tabs (partner dashboard)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      const key = e instanceof StorageEvent ? e.key : (e as CustomEvent).detail?.key;
      
      if (key === 'orders') {
        console.log('[StudentOrders] Detected order changes from storage');
        // The OrderContext will handle the update, but we force a re-render
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 300);
      }
    };

    window.addEventListener('storage', handleStorageChange as EventListener);
    window.addEventListener('localStorageUpdate', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange as EventListener);
      window.removeEventListener('localStorageUpdate', handleStorageChange as EventListener);
    };
  }, []);

  // Auth check
  useEffect(() => {
    // Wait for auth loading to complete before checking authentication
    if (isLoading) return;
    
    if (!isAuthenticated || !student) {
      router.push('/student/login');
      return;
    }
  }, [isAuthenticated, isLoading, student, router]);

  // Refresh orders
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Force reload from localStorage
      await refreshOrders();
      console.log('[StudentOrders] Orders refreshed from storage');
      
      // Update myOrders with the latest data
      setTimeout(() => {
        const studentOrders = orders.filter(
          order => order.studentEmail === student?.email || order.studentId === student?.studentId
        );
        const sortedOrders = studentOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setMyOrders(sortedOrders);
        
        // Update selected order if it exists
        if (selectedOrder) {
          const updated = sortedOrders.find(o => o.id === selectedOrder.id);
          if (updated) {
            setSelectedOrder(updated);
            console.log('[StudentOrders] Selected order updated after refresh');
          }
        }
        setIsRefreshing(false);
      }, 100);
    } catch (error) {
      console.error('[StudentOrders] Refresh failed:', error);
      setIsRefreshing(false);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (orderId: string, method: string) => {
    updateOrderStatus(orderId, 'confirmed');
    
    // Update local order with payment info
    setMyOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'confirmed' as OrderStatus, paymentStatus: 'completed' as const, paymentMethod: method as any, paidAt: new Date() }
        : order
    ));

    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: 'confirmed' as OrderStatus, 
        paymentStatus: 'completed' as const,
        paymentMethod: method as any,
        paidAt: new Date()
      } : null);
    }

    setShowPaymentModal(false);
    setPaymentOrder(null);
  };

  // Open payment modal
  const openPaymentModal = (order: Order) => {
    setPaymentOrder(order);
    setShowPaymentModal(true);
  };

  // Get progress percentage for status bar
  const getProgressPercentage = (status: OrderStatus): number => {
    const statusMap: Record<OrderStatus, number> = {
      pending: 10,
      approved: 20,
      payment_pending: 20,
      declined: 0,
      confirmed: 40,
      preparing: 60,
      ready: 80,
      completed: 100,
      cancelled: 0
    };
    return statusMap[status] || 0;
  };

  if (!isAuthenticated || !student) {
    return null;
  }

  const config = selectedOrder ? statusConfig[selectedOrder.status] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 border-b border-orange-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">My Orders</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{myOrders.length} total orders</p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {myOrders.length === 0 ? (
          // Empty State
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-xl">
            <Package size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Orders Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't placed any orders yet. Start exploring our cafeterias!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
            {/* Orders List */}
            <div className="space-y-3">
              <h2 className="text-lg font-black text-gray-800 dark:text-white mb-4">Your Orders</h2>
              {myOrders.map((order) => {
                const orderConfig = statusConfig[order.status];
                const isSelected = selectedOrder?.id === order.id;
                const needsPayment = order.status === 'approved' || order.status === 'payment_pending';
                const isPending = order.status === 'pending';
                
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-gray-900 dark:text-white">{order.id}</span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${orderConfig.bgColor} ${orderConfig.color}`}>
                        {orderConfig.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{order.items.length} items</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</span>
                    </div>
                    {isPending && (
                      <div className="mt-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm font-bold">
                        <Clock size={14} className="animate-pulse" />
                        Awaiting Approval
                      </div>
                    )}
                    {needsPayment && (
                      <div className="mt-2 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold">
                        <CreditCard size={14} />
                        Payment Required
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Order Details */}
            {selectedOrder && config && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                {/* Status Header */}
                <div className={`${config.bgColor} p-6`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-2xl bg-white/20 ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <h2 className={`text-2xl font-black ${config.color}`}>{config.label}</h2>
                      <p className="text-gray-600 dark:text-gray-400">{config.description}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar - Only for active orders */}
                  {!['cancelled', 'declined', 'completed'].includes(selectedOrder.status) && (
                    <div className="mt-4">
                      <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-2 text-gray-500">
                        <span>Request</span>
                        <span>Approved</span>
                        <span>Paid</span>
                        <span>Preparing</span>
                        <span>Ready</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Pending Approval Alert */}
                  {selectedOrder.status === 'pending' && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock size={28} className="animate-pulse" />
                        <h3 className="text-xl font-black">Awaiting Approval</h3>
                      </div>
                      <p className="text-white/90 mb-2">
                        Your order request has been sent to {selectedOrder.cafeteriaName}. 
                        Please wait while they review your order.
                      </p>
                      <p className="text-white/70 text-sm">
                        You'll be notified once the cafeteria accepts or declines your order.
                      </p>
                      <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-xl p-3">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-semibold">Waiting for cafeteria response...</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Required Alert */}
                  {(selectedOrder.status === 'approved' || selectedOrder.status === 'payment_pending') && (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <CreditCard size={28} />
                        <h3 className="text-xl font-black">Payment Required</h3>
                      </div>
                      <p className="text-white/80 mb-4">
                        Your order has been approved by {selectedOrder.cafeteriaName}! 
                        Complete payment to confirm your order.
                      </p>
                      <button
                        onClick={() => openPaymentModal(selectedOrder)}
                        className="w-full py-4 bg-white text-blue-600 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                      >
                        <Wallet size={24} />
                        Pay ₹{selectedOrder.total.toFixed(2)} Now
                      </button>
                    </div>
                  )}

                  {/* Declined Message */}
                  {selectedOrder.status === 'declined' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <XCircle size={28} className="text-red-500" />
                        <h3 className="text-xl font-black text-red-700 dark:text-red-400">Order Declined</h3>
                      </div>
                      <p className="text-red-600 dark:text-red-400">
                        {selectedOrder.partnerNote || 'Your order was declined by the cafeteria. Please try again or contact support.'}
                      </p>
                      <button
                        onClick={() => router.push('/')}
                        className="mt-4 w-full py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 transition-colors"
                      >
                        Place New Order
                      </button>
                    </div>
                  )}

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Order ID</p>
                      <p className="font-black text-gray-900 dark:text-white">{selectedOrder.id}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Cafeteria</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.cafeteriaName}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Order Type</p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedOrder.deliveryType === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Est. Time</p>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedOrder.estimatedTime}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <span className="bg-orange-500 text-white font-bold text-sm px-2.5 py-1 rounded-lg">
                              {item.quantity}x
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">₹{item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className={`rounded-2xl p-4 ${
                    selectedOrder.paymentStatus === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-900'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={`text-sm ${selectedOrder.paymentStatus === 'completed' ? 'text-white/80' : 'text-gray-500'}`}>
                          {selectedOrder.paymentStatus === 'completed' ? 'Paid' : 'Total Amount'}
                        </p>
                        <p className={`text-2xl font-black ${selectedOrder.paymentStatus === 'completed' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          ₹{selectedOrder.total.toFixed(2)}
                        </p>
                      </div>
                      {selectedOrder.paymentStatus === 'completed' && (
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 size={18} />
                          <span className="font-bold">Payment Complete</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {selectedOrder.specialInstructions && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border-l-4 border-amber-500">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">Special Instructions</p>
                      <p className="text-gray-900 dark:text-white">{selectedOrder.specialInstructions}</p>
                    </div>
                  )}

                  {/* Partner Note */}
                  {selectedOrder.partnerNote && selectedOrder.status !== 'declined' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-l-4 border-blue-500">
                      <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-1">Note from Cafeteria</p>
                      <p className="text-gray-900 dark:text-white">{selectedOrder.partnerNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          onClose={() => { setShowPaymentModal(false); setPaymentOrder(null); }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
