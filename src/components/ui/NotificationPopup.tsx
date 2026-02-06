"use client";

import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Bell, 
  CreditCard, 
  Package,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

const NotificationPopup = () => {
  const { activePopup, dismissPopup } = useNotifications();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (activePopup) {
      setIsVisible(true);
      setIsExiting(false);
      
      // Auto-dismiss after 10 seconds for non-action-required notifications
      if (!activePopup.actionRequired) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [activePopup]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      dismissPopup();
    }, 300);
  };

  const handleAction = () => {
    if (activePopup?.actionUrl) {
      router.push(activePopup.actionUrl);
    }
    handleDismiss();
  };

  if (!activePopup || !isVisible) return null;

  const getIcon = () => {
    switch (activePopup.type) {
      case 'order_approved':
        return <CheckCircle size={24} className="text-white" />;
      case 'order_declined':
        return <XCircle size={24} className="text-white" />;
      case 'payment_required':
        return <CreditCard size={24} className="text-white" />;
      case 'order_ready':
        return <Package size={24} className="text-white" />;
      case 'order_update':
        return <Bell size={24} className="text-white" />;
      default:
        return <Bell size={24} className="text-white" />;
    }
  };

  const getBgColor = () => {
    switch (activePopup.type) {
      case 'order_approved':
        return 'from-green-500 to-emerald-600';
      case 'order_declined':
        return 'from-red-500 to-rose-600';
      case 'payment_required':
        return 'from-blue-500 to-indigo-600';
      case 'order_ready':
        return 'from-purple-500 to-violet-600';
      case 'order_update':
        return 'from-orange-500 to-amber-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getBorderColor = () => {
    switch (activePopup.type) {
      case 'order_approved':
        return 'border-green-400';
      case 'order_declined':
        return 'border-red-400';
      case 'payment_required':
        return 'border-blue-400';
      case 'order_ready':
        return 'border-purple-400';
      case 'order_update':
        return 'border-orange-400';
      default:
        return 'border-gray-400';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 flex items-center justify-center ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={!activePopup.actionRequired ? handleDismiss : undefined}
      >
        {/* Popup */}
        <div 
          className={`w-full max-w-sm mx-4 transition-all duration-300 ${
            isExiting ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border ${getBorderColor()} overflow-hidden`}>
          {/* Header - More Compact */}
          <div className={`bg-gradient-to-r ${getBgColor()} px-5 py-3.5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {activePopup.title}
                  </h3>
                  {activePopup.orderId && (
                    <p className="text-white/75 text-xs font-medium mt-0.5">
                      Order {activePopup.orderId}
                    </p>
                  )}
                </div>
              </div>
              {!activePopup.actionRequired && (
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-2"
                  aria-label="Close notification"
                >
                  <X size={18} className="text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Content - More Compact */}
          <div className="p-5 space-y-4">
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {activePopup.message}
            </p>

            {/* Action Required Warning - Slimmer */}
            {activePopup.actionRequired && (
              <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 dark:text-amber-400 text-xs font-medium leading-snug">
                  Action required to continue with your order
                </p>
              </div>
            )}

            {/* Action Buttons - Smaller */}
            <div className="flex gap-2.5 pt-1">
              {activePopup.actionRequired ? (
                <>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleAction}
                    className={`flex-1 py-2.5 px-4 bg-gradient-to-r ${getBgColor()} text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    {activePopup.actionLabel || 'Take Action'}
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:shadow-md transition-all active:scale-[0.98]"
                >
                  Got it!
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;