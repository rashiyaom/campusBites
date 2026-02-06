"use client";

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Truck,
  User,
  CreditCard,
  X,
  Check,
  ChefHat,
  XCircle,
  Bell,
  Zap,
  Timer,
  BadgeCheck,
  Trash2,
  Eye,
  MapPin,
  Utensils,
  MessageSquare
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { useOrders } from '@/contexts/OrderContext';
import { triggerSync } from '@/hooks/useRealtimeSync';

// Status configuration
const statusConfig: Record<OrderStatus, { 
  color: string; 
  bgColor: string; 
  icon: React.ReactNode; 
  label: string;
  gradient: string;
}> = {
  pending: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: <Clock size={18} />,
    label: 'Pending',
    gradient: 'from-amber-500 to-orange-500'
  },
  approved: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <CreditCard size={18} />,
    label: 'Awaiting Payment',
    gradient: 'from-blue-500 to-indigo-500'
  },
  payment_pending: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: <CreditCard size={18} />,
    label: 'Awaiting Payment',
    gradient: 'from-blue-500 to-indigo-500'
  },
  declined: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: <XCircle size={18} />,
    label: 'Declined',
    gradient: 'from-red-500 to-rose-500'
  },
  confirmed: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: <CheckCircle2 size={18} />,
    label: 'Confirmed',
    gradient: 'from-green-500 to-emerald-500'
  },
  preparing: {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    icon: <ChefHat size={18} />,
    label: 'Preparing',
    gradient: 'from-purple-500 to-violet-500'
  },
  ready: {
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    icon: <Package size={18} />,
    label: 'Ready',
    gradient: 'from-teal-500 to-cyan-500'
  },
  completed: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    icon: <Truck size={18} />,
    label: 'Completed',
    gradient: 'from-gray-500 to-slate-500'
  },
  cancelled: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: <AlertCircle size={18} />,
    label: 'Cancelled',
    gradient: 'from-red-500 to-rose-500'
  }
};

// Quick decline reasons
const DECLINE_REASONS = [
  "Items unavailable",
  "Kitchen closing",
  "Too busy",
  "Out of stock"
];

// Helper function
function getTimeAgo(date: Date): string {
  const diffMins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

// =====================================================
// NEW ORDER POPUP - Simple Accept/Decline prompt
// =====================================================
interface NewOrderPopupProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string, reason: string) => void;
  onClose: () => void;
}

const NewOrderPopup = ({ order, onAccept, onDecline, onClose }: NewOrderPopupProps) => {
  const [showDeclineReasons, setShowDeclineReasons] = useState(false);
  const [customReason, setCustomReason] = useState('');

  const handleDecline = (reason: string) => {
    onDecline(order.id, reason);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Popup - Compact and Professional */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
        {/* Header - Compact */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">New Order #{order.id}</h2>
                <p className="text-white/75 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content - Compact */}
        <div className="p-5 space-y-4">
          {/* Customer & Total Row */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {(order.studentName || order.customerName || 'C').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  {order.studentName || order.customerName || 'Customer'}
                </p>
                <p className="text-xs text-gray-500">
                  {order.items.length} items • {order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-500">₹{order.total.toFixed(0)}</p>
            </div>
          </div>

          {/* Items List - Compact */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5">
              <Utensils size={12} />
              Order Items
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-orange-600 dark:text-orange-500">{item.quantity}×</span> {item.name}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{item.subtotal.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions - Compact */}
          {order.specialInstructions && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <MessageSquare size={12} />
                Special Instructions
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{order.specialInstructions}</p>
            </div>
          )}

          {/* Actions - Compact and Professional */}
          {!showDeclineReasons ? (
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowDeclineReasons(true)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-gray-200 dark:border-gray-700"
              >
                <XCircle size={16} />
                Decline
              </button>
              <button
                onClick={() => onAccept(order.id)}
                className="flex-[2] py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <Check size={16} />
                Accept Order
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select decline reason:</p>
              <div className="grid grid-cols-2 gap-2">
                {DECLINE_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleDecline(reason)}
                    className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-800"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Or type custom reason..."
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => customReason && handleDecline(customReason)}
                  disabled={!customReason}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                >
                  Send
                </button>
              </div>
              <button
                onClick={() => setShowDeclineReasons(false)}
                className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-xs transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

// =====================================================
// COMPACT PENDING ORDER CARD - Shows in grid, click to expand
// =====================================================
interface PendingOrderCardProps {
  order: Order;
  onClick: () => void;
}

const PendingOrderCard = ({ order, onClick }: PendingOrderCardProps) => {
  const orderDate = new Date(order.createdAt);
  const timeAgo = getTimeAgo(orderDate);

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl border-2 border-orange-400 dark:border-orange-600 hover:border-orange-500 transition-all shadow-md hover:shadow-lg group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse">
            <Bell size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white text-sm">#{order.id}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="font-bold text-green-600 dark:text-green-500 text-lg">₹{order.total.toFixed(0)}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {(order.studentName || order.customerName || 'C').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
            {order.studentName || order.customerName || 'Customer'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
          </p>
        </div>
      </div>

      {/* Quick Items Preview */}
      <div className="text-left space-y-1 mb-3">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-orange-600 dark:text-orange-500">{item.quantity}×</span>
            <span className="text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-gray-500 italic">+{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Click to view indicator */}
      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-orange-600 dark:text-orange-500 font-semibold group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
          Click to view details →
        </p>
      </div>
    </button>
  );
};

// =====================================================
// PENDING ORDER APPROVAL CARD - Shows full order details for approval
// =====================================================
interface PendingOrderApprovalCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string, reason: string) => void;
  onClose?: () => void;
}

const PendingOrderApprovalCard = ({ order, onAccept, onDecline, onClose }: PendingOrderApprovalCardProps) => {
  const [showDeclineReasons, setShowDeclineReasons] = useState(false);
  const [customReason, setCustomReason] = useState('');
  const orderDate = new Date(order.createdAt);
  const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = orderDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const handleDecline = (reason: string) => {
    onDecline(order.id, reason);
    setShowDeclineReasons(false);
    setCustomReason('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl mx-auto">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Bell size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Order #{order.id}</h3>
              <p className="text-white/75 text-xs">{dateStr} at {timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/75 text-xs">Total</p>
              <p className="text-white font-bold text-lg">₹{order.total.toFixed(0)}</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                title="Close"
              >
                <X size={18} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Customer & Delivery Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {(order.studentName || order.customerName || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Customer</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                  {order.studentName || order.customerName || 'Customer'}
                </p>
              </div>
            </div>
            {(order.studentPhone || order.customerPhone) && (
              <a 
                href={`tel:${order.studentPhone || order.customerPhone}`}
                className="flex items-center gap-1.5 p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-semibold"
              >
                <Phone size={14} />
                {order.studentPhone || order.customerPhone}
              </a>
            )}
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-2">Delivery</p>
            <div className="flex items-center gap-2 mb-2">
              {order.deliveryType === 'pickup' ? (
                <>
                  <Package size={16} className="text-purple-600" />
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Pickup</span>
                </>
              ) : (
                <>
                  <Truck size={16} className="text-purple-600" />
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Delivery</span>
                </>
              )}
            </div>
            {order.deliveryAddress && (
              <div className="flex items-start gap-1.5">
                <MapPin size={12} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{order.deliveryAddress}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <Utensils size={12} />
            Order Items
          </p>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-orange-600 dark:text-orange-500">{item.quantity}×</span> {item.name}
                  <span className="text-gray-500 ml-1">(₹{(item.subtotal / item.quantity).toFixed(0)} each)</span>
                </span>
                <span className="font-bold text-gray-900 dark:text-white">₹{item.subtotal.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1 flex items-center gap-1.5">
              <MessageSquare size={12} />
              Special Instructions
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">{order.specialInstructions}</p>
          </div>
        )}        {/* Order Summary */}
        <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-300 dark:border-green-700">
          <div className="flex justify-between items-center">
            <span className="font-bold text-green-800 dark:text-green-300 text-sm">Order Total</span>
            <span className="font-bold text-green-800 dark:text-green-300 text-lg">₹{order.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Actions - Compact */}
        {!showDeclineReasons ? (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeclineReasons(true)}
              className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-gray-200 dark:border-gray-700"
            >
              <XCircle size={16} />
              Decline
            </button>
            <button
              onClick={() => onAccept(order.id)}
              className="flex-[2] py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <Check size={16} />
              Accept Order
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select decline reason:</p>
            <div className="grid grid-cols-2 gap-2">
              {DECLINE_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleDecline(reason)}
                  className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-200 dark:border-red-800"
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Or type custom reason..."
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={() => customReason && handleDecline(customReason)}
                disabled={!customReason}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
              >
                Send
              </button>
            </div>
            <button
              onClick={() => setShowDeclineReasons(false)}
              className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium text-xs transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// ORDER CARD - For accepted/active orders only
// =====================================================
interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  onViewDetails: (order: Order) => void;
}

const OrderCard = ({ order, onStatusChange, onDelete, onViewDetails }: OrderCardProps) => {
  const config = statusConfig[order.status] || statusConfig.confirmed;
  const orderDate = new Date(order.createdAt);
  const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      pending: null,
      approved: null,
      payment_pending: null,
      declined: null,
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
      completed: null,
      cancelled: null
    };
    return flow[currentStatus];
  };

  const nextStatus = getNextStatus(order.status);
  const nextConfig = nextStatus ? statusConfig[nextStatus] : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all group">
      {/* Status bar */}
      <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-black text-gray-900 dark:text-white">{order.id}</h3>
              <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails(order)}
              className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
              title="View Details"
            >
              <Eye size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => onDelete(order.id)}
              className="p-2.5 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg transition-all border border-red-200 dark:border-red-800"
              title="Delete Order"
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {(order.studentName || order.customerName || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate">
              {order.studentName || order.customerName || 'Customer'}
            </p>
            <p className="text-xs text-gray-500">{timeStr} • {order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}</p>
          </div>
          {(order.studentPhone || order.customerPhone) && (
            <a 
              href={`tel:${order.studentPhone || order.customerPhone}`}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Phone size={16} />
            </a>
          )}
        </div>

        {/* Items */}
        <div className="space-y-1 mb-3 max-h-24 overflow-y-auto">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                <span className="font-bold text-indigo-600">{item.quantity}×</span> {item.name}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{item.subtotal.toFixed(0)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-3 bg-green-500 text-white rounded-xl mb-3">
          <span className="font-bold">Total</span>
          <span className="text-xl font-black">₹{order.total.toFixed(0)}</span>
        </div>

        {/* Next Status Button */}
        {nextStatus && nextConfig && (
          <button
            onClick={() => onStatusChange(order.id, nextStatus)}
            className={`w-full py-3 bg-gradient-to-r ${nextConfig.gradient} text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all`}
          >
            {nextConfig.icon}
            Mark as {nextConfig.label}
          </button>
        )}

        {/* Cancel option */}
        {['confirmed', 'preparing'].includes(order.status) && (
          <button
            onClick={() => onStatusChange(order.id, 'cancelled')}
            className="w-full mt-2 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-semibold text-sm transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

// =====================================================
// VIEW ORDER MODAL
// =====================================================
interface ViewOrderModalProps {
  order: Order;
  onClose: () => void;
}

const ViewOrderModal = ({ order, onClose }: ViewOrderModalProps) => {
  const config = statusConfig[order.status] || statusConfig.confirmed;
  const orderDate = new Date(order.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Elegant Header */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-lg`}>
                  {React.cloneElement(config.icon as React.ReactElement, { size: 24, className: 'text-white' })}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.color} border border-current/20`}>
                      {config.label}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {orderDate.toLocaleString('en-US', { 
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
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all group"
            >
              <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Customer Details</span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {(order.studentName || order.customerName || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {order.studentName || order.customerName || 'Customer'}
                  </p>
                  {(order.studentPhone || order.customerPhone) && (
                    <a 
                      href={`tel:${order.studentPhone || order.customerPhone}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Phone size={12} />
                      {order.studentPhone || order.customerPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Info Card */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-5 border border-purple-100 dark:border-purple-900/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MapPin size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Delivery Method</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${order.deliveryType === 'pickup' ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
                  <Package size={24} className={order.deliveryType === 'pickup' ? 'text-green-600' : 'text-blue-600'} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {order.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.deliveryAddress}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Utensils size={18} className="text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Order Items</span>
            </div>
            
            <div className="space-y-3 mb-5">
              {order.items.map((item, idx) => (
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
                  <span className="font-bold text-gray-900 dark:text-white text-lg">₹{item.subtotal.toFixed(0)}</span>
                </div>
              ))}
            </div>
            
            {/* Total */}
            <div className="pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <span className="text-white font-bold text-lg">Total Amount</span>
                <span className="text-white text-3xl font-black">₹{order.total.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-2xl p-5 border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <MessageSquare size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Special Instructions</span>
              </div>
              <p className="text-gray-900 dark:text-white font-medium leading-relaxed">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-6">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]"
          >
            Close
          </button>
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

// =====================================================
// DELETE CONFIRMATION MODAL
// =====================================================
interface DeleteConfirmModalProps {
  orderId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({ orderId, onConfirm, onCancel }: DeleteConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Order?</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Remove order <span className="font-bold">{orderId}</span> from this view?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================
const LiveOrderStream = ({ cafeteriaId }: { cafeteriaId: string }) => {
  const { getOrdersByCafeteria, updateOrderStatus, deleteOrder, orders: contextOrders } = useOrders();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingPopup, setPendingPopup] = useState<Order | null>(null);
  const [selectedPendingOrder, setSelectedPendingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [processedOrderIds, setProcessedOrderIds] = useState<Set<string>>(new Set());
  const lastOrderCountRef = React.useRef<number>(0);

  // Play notification sound
  const playNotificationSound = React.useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      // Play a second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.3);
      }, 200);
    } catch (e) {
      console.log('Audio notification not available');
    }
  }, []);

  // Sync orders from context
  useEffect(() => {
    const cafeteriaOrders = getOrdersByCafeteria(cafeteriaId);
    setOrders(cafeteriaOrders);
    
    // Check for new pending orders that haven't been processed
    const newPendingOrder = cafeteriaOrders.find(
      o => o.status === 'pending' && !processedOrderIds.has(o.id)
    );
    
    if (newPendingOrder && !pendingPopup) {
      setPendingPopup(newPendingOrder);
      playNotificationSound();
    }
  }, [cafeteriaId, getOrdersByCafeteria, contextOrders, processedOrderIds, pendingPopup, playNotificationSound]);

  // Real-time polling for new orders
  useEffect(() => {
    const interval = setInterval(() => {
      const cafeteriaOrders = getOrdersByCafeteria(cafeteriaId);
      
      // Detect new pending orders
      const pendingOrders = cafeteriaOrders.filter(o => o.status === 'pending');
      const newPendingCount = pendingOrders.filter(o => !processedOrderIds.has(o.id)).length;
      
      // Play sound if new pending orders detected
      if (newPendingCount > 0 && newPendingCount > lastOrderCountRef.current) {
        playNotificationSound();
      }
      lastOrderCountRef.current = newPendingCount;
      
      setOrders(cafeteriaOrders);
      
      // Check for new pending orders
      const newPendingOrder = cafeteriaOrders.find(
        o => o.status === 'pending' && !processedOrderIds.has(o.id)
      );
      
      if (newPendingOrder && !pendingPopup) {
        setPendingPopup(newPendingOrder);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [cafeteriaId, getOrdersByCafeteria, processedOrderIds, pendingPopup, playNotificationSound]);

  // Handle ACCEPT order
  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'approved');
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'approved' as OrderStatus, approvedAt: new Date(), updatedAt: new Date() }
        : order
    ));

    // Mark as processed
    setProcessedOrderIds(prev => new Set(prev).add(orderId));

    // Notify student
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const notification = {
        type: 'order_approved',
        title: 'Order Accepted! 🎉',
        message: `Your order ${orderId} has been accepted. Please complete payment.`,
        orderId,
        timestamp: new Date(),
        actionRequired: true,
        actionLabel: 'Pay Now',
        actionUrl: '/student/orders'
      };
      
      localStorage.setItem('newNotificationPopup', JSON.stringify(notification));
      const existingNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifs.unshift({ ...notification, id: `notif-${Date.now()}`, read: false });
      localStorage.setItem('notifications', JSON.stringify(existingNotifs));
      triggerSync('notifications');
    }

    setPendingPopup(null);
  };

  // Handle DECLINE order
  const handleDeclineOrder = (orderId: string, reason: string) => {
    updateOrderStatus(orderId, 'declined');
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'declined' as OrderStatus, partnerNote: reason, declinedAt: new Date(), updatedAt: new Date() }
        : order
    ));

    // Mark as processed
    setProcessedOrderIds(prev => new Set(prev).add(orderId));

    // Notify student
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const notification = {
        type: 'order_declined',
        title: 'Order Declined',
        message: `Sorry, your order ${orderId} was declined. Reason: ${reason}`,
        orderId,
        timestamp: new Date(),
        actionRequired: false
      };
      
      localStorage.setItem('newNotificationPopup', JSON.stringify(notification));
      const existingNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifs.unshift({ ...notification, id: `notif-${Date.now()}`, read: false });
      localStorage.setItem('notifications', JSON.stringify(existingNotifs));
      triggerSync('notifications');
    }

    setPendingPopup(null);
  };

  // Handle status change for active orders
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order
    ));

    // Notify student
    const order = orders.find(o => o.id === orderId);
    if (order) {
      let notification: Record<string, unknown> | null = null;
      
      if (newStatus === 'preparing') {
        notification = {
          type: 'order_update',
          title: 'Preparation Started! 👨‍🍳',
          message: `Your order ${orderId} is now being prepared.`,
          orderId,
          timestamp: new Date()
        };
      } else if (newStatus === 'ready') {
        notification = {
          type: 'order_ready',
          title: 'Order Ready! 🎉',
          message: `Your order ${orderId} is ready for pickup!`,
          orderId,
          timestamp: new Date(),
          actionRequired: true
        };
      } else if (newStatus === 'completed') {
        notification = {
          type: 'order_update',
          title: 'Order Completed ✅',
          message: `Your order ${orderId} has been completed. Thank you!`,
          orderId,
          timestamp: new Date()
        };
      }
      
      if (notification) {
        localStorage.setItem('newNotificationPopup', JSON.stringify(notification));
        const existingNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
        existingNotifs.unshift({ ...notification, id: `notif-${Date.now()}`, read: false });
        localStorage.setItem('notifications', JSON.stringify(existingNotifs));
        triggerSync('notifications');
      }
    }
  };

  // Handle delete order
  const handleDeleteOrder = (orderId: string) => {
    setDeleteConfirm(orderId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      // Remove from local state
      setOrders(prev => prev.filter(o => o.id !== deleteConfirm));
      // Try to delete from context if available
      if (deleteOrder) {
        deleteOrder(deleteConfirm);
      }
      setDeleteConfirm(null);
    }
  };  // Filter orders - Only show orders that are CONFIRMED or later
  // Pending orders → Show in popup + approval section at top
  // Approved/Payment pending → Don't show in main section (waiting for student payment)
  // Confirmed onwards → Show in Active Orders section as cards
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const awaitingPayment = orders.filter(o => o.status === 'approved' || o.status === 'payment_pending');
  const activeOrders = orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter(o => ['completed', 'cancelled', 'declined'].includes(o.status));
  const awaitingPaymentCount = awaitingPayment.length;

  return (
    <div className="mt-6">
      {/* PENDING ORDERS APPROVAL SECTION - AT TOP */}
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl animate-pulse">
                <Bell size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black">
                  {pendingOrders.length} Order{pendingOrders.length > 1 ? 's' : ''} Awaiting Approval
                </h2>
                <p className="text-white/90 font-medium">
                  Review and approve or decline orders below
                </p>
              </div>
            </div>
          </div>

          {/* Pending Orders Grid - Compact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {pendingOrders.map(order => (
              <PendingOrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedPendingOrder(order)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Pending Order Modal */}
      {selectedPendingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setSelectedPendingOrder(null)} 
          />
          
          {/* Modal Content */}
          <div className="relative z-10 max-h-[90vh] overflow-y-auto">
            <PendingOrderApprovalCard
              order={selectedPendingOrder}
              onAccept={(orderId) => {
                handleAcceptOrder(orderId);
                setSelectedPendingOrder(null);
              }}
              onDecline={(orderId, reason) => {
                handleDeclineOrder(orderId, reason);
                setSelectedPendingOrder(null);
              }}
              onClose={() => setSelectedPendingOrder(null)}
            />
          </div>
        </div>
      )}

      {/* Awaiting Payment Indicator (not shown as cards) */}
      {awaitingPaymentCount > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-xl">
              <CreditCard size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-800 dark:text-blue-200">
                {awaitingPaymentCount} order{awaitingPaymentCount > 1 ? 's' : ''} awaiting student payment
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Orders will appear below once payment is confirmed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-3 mb-6">        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <ChefHat size={18} />
          Active Orders
          {activeOrders.length > 0 && (
            <span className={`px-2.5 py-0.5 rounded-full text-sm font-black ${
              activeTab === 'active' ? 'bg-white text-green-600' : 'bg-green-500 text-white'
            }`}>
              {activeOrders.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <CheckCircle2 size={18} />
          Completed
          {completedOrders.length > 0 && (
            <span className="px-2.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full text-sm font-bold">
              {completedOrders.length}
            </span>
          )}
        </button>
      </div>      {/* Active Orders Tab */}
      {activeTab === 'active' && (
        <>
          {/* Active/Confirmed Orders - Only show confirmed and later */}
          {activeOrders.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase mb-3 flex items-center gap-2">
                <ChefHat size={16} />
                Confirmed Orders ({activeOrders.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {activeOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteOrder}
                    onViewDetails={setViewingOrder}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Confirmed Orders</h3>
                <p className="text-gray-500 mb-2">Orders will appear here once students complete payment</p>
                {awaitingPaymentCount > 0 && (
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold mt-3">
                    {awaitingPaymentCount} order{awaitingPaymentCount > 1 ? 's are' : ' is'} waiting for payment
                  </p>
                )}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">Listening for orders...</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Completed Orders Tab */}
      {activeTab === 'completed' && (
        <>
          {completedOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {completedOrders.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteOrder}
                  onViewDetails={setViewingOrder}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Completed Orders</h3>
                <p className="text-gray-500">Completed orders will appear here</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* NEW ORDER POPUP - Shows when new pending order arrives */}
      {pendingPopup && (
        <NewOrderPopup
          order={pendingPopup}
          onAccept={handleAcceptOrder}
          onDecline={handleDeclineOrder}
          onClose={() => {
            // Mark as processed so it doesn't popup again
            setProcessedOrderIds(prev => new Set(prev).add(pendingPopup.id));
            setPendingPopup(null);
          }}
        />
      )}

      {/* View Order Modal */}
      {viewingOrder && (
        <ViewOrderModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          orderId={deleteConfirm}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default LiveOrderStream;
