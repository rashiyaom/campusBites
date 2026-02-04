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
        return <CheckCircle size={32} className="text-green-500" />;
      case 'order_declined':
        return <XCircle size={32} className="text-red-500" />;
      case 'payment_required':
        return <CreditCard size={32} className="text-blue-500" />;
      case 'order_ready':
        return <Package size={32} className="text-purple-500" />;
      case 'order_update':
        return <Bell size={32} className="text-orange-500" />;
      default:
        return <Bell size={32} className="text-gray-500" />;
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={!activePopup.actionRequired ? handleDismiss : undefined}
      />
      
      {/* Popup */}
      <div 
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4 transition-all duration-300 ${
          isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 ${getBorderColor()} overflow-hidden`}>
          {/* Header */}
          <div className={`bg-gradient-to-r ${getBgColor()} px-6 py-5`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  {getIcon()}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">
                    {activePopup.title}
                  </h3>
                  {activePopup.orderId && (
                    <p className="text-white/80 text-sm font-medium">
                      Order {activePopup.orderId}
                    </p>
                  )}
                </div>
              </div>
              {!activePopup.actionRequired && (
                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {activePopup.message}
            </p>

            {/* Action Required Warning */}
            {activePopup.actionRequired && (
              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <AlertTriangle size={24} className="text-amber-500 flex-shrink-0" />
                <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                  Action required to continue with your order
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {activePopup.actionRequired ? (
                <>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-4 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleAction}
                    className={`flex-1 py-4 px-6 bg-gradient-to-r ${getBgColor()} text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all transform hover:scale-[1.02]`}
                  >
                    {activePopup.actionLabel || 'Take Action'}
                    <ArrowRight size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="w-full py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:shadow-lg transition-all"
                >
                  Got it!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPopup;
