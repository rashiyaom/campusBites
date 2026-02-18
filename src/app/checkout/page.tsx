"use client";

import React, { useState, useEffect, Suspense } from 'react';
import {
  MapPin,
  ShoppingBag,
  Truck,
  Utensils,
  Clock,
  Plus,
  Minus,
  Ticket,
  CheckCircle,
  Smartphone,
  Wallet,
  ArrowRight,
  ChefHat,
  Home,
  Moon,
  Sun,
  Receipt,
  Check,
  Search,
  Package,
  X
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCafeterias } from '@/contexts/CafeteriaContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useBusinesses } from '@/contexts/BusinessContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Order } from '@/types';

// Try to import StudentAuthContext, fallback to regular Auth
let useStudentAuth: any = null;
try {
  const StudentAuthModule = require('@/contexts/StudentAuthContext');
  useStudentAuth = StudentAuthModule.useStudentAuth;
} catch (e) {
  // StudentAuth not available, will use regular auth
}

// Food Confetti Component
const FoodConfetti = () => {
  const emojis = ['🍕', '🍔', '🍟', '🌮', '🍩', '🍪', '🧁', '🍰'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2.5 + Math.random() * 2,
    size: 1 + Math.random() * 1.5,
  }));

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute confetti-particle"
            style={{
              left: `${p.left}%`,
              top: '-50px',
              fontSize: `${p.size}rem`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .confetti-particle {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </>
  );
};

// Floating Background Component
const FloatingBackground = () => {
  const floaters = [
    { emoji: '🍔', delay: 0, duration: 6 },
    { emoji: '🍕', delay: 1, duration: 7 },
    { emoji: '🍩', delay: 2, duration: 6.5 },
    { emoji: '🍟', delay: 1.5, duration: 7.5 },
  ];

  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10 z-0">
        {floaters.map((f, idx) => (
          <div
            key={idx}
            className="absolute text-8xl float-particle"
            style={{
              left: `${20 + idx * 25}%`,
              top: `${20 + (idx % 2) * 40}%`,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .float-particle {
          animation: float-slow ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

// Order Tracking View Component
const OrderTrackingView = ({
  orderId,
  cart,
  total,
  estTime,
  onReset,
  isFood = true,
}: {
  orderId: string;
  cart: any[];
  total: number;
  estTime: number;
  onReset: () => void;
  isFood?: boolean;
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(estTime * 60);

  const stages = isFood ? [
    {
      title: 'Order Confirmed',
      desc: 'Your order has been received',
      icon: Receipt,
      bg: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    },
    {
      title: 'Preparing',
      desc: 'Chef is cooking your meal',
      icon: ChefHat,
      bg: 'https://images.unsplash.com/photo-1556910102-9a0a7879aa32?w=800&q=80',
    },
    {
      title: 'Quality Check',
      desc: 'Ensuring everything is perfect',
      icon: Search,
      bg: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80',
    },
    {
      title: 'Ready for Pickup',
      desc: 'Come grab your order!',
      icon: ShoppingBag,
      bg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    },
  ] : [
    {
      title: 'Order Received',
      desc: 'Your order has been received',
      icon: Receipt,
      bg: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    },
    {
      title: 'Packing Your Order',
      desc: 'Items are being packed',
      icon: Package,
      bg: 'https://images.unsplash.com/photo-1556910102-9a0a7879aa32?w=800&q=80',
    },
    {
      title: 'Quality Check',
      desc: 'Ensuring everything is correct',
      icon: Search,
      bg: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80',
    },
    {
      title: 'Ready for Dispatch',
      desc: 'Your order is ready!',
      icon: ShoppingBag,
      bg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    },
  ];

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 8000);

    return () => clearInterval(stageTimer);
  }, []);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const StageIcon = stages[currentStage].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 border-b border-orange-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">Order Tracking</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Order #{orderId}</p>
            </div>
          </div>
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm">
            {orderId}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Cinematic Status Card */}
        <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <Image
            src={stages[currentStage].bg}
            alt={stages[currentStage].title}
            fill
            className="object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="bg-orange-500 p-5 rounded-3xl mb-4 animate-bounce">
              <StageIcon size={40} className="text-white" />
            </div>
            
            <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-400 px-4 py-2 rounded-full mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 font-semibold text-sm">Live Update</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
              {stages[currentStage].title}
            </h2>
            <p className="text-xl text-gray-200 font-medium">
              {stages[currentStage].desc}
            </p>
          </div>

          {/* Live Timer */}
          <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-lg border border-orange-400 px-6 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-orange-400" />
              <span className="text-white font-bold text-xl">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Timeline Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Order Progress</h3>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700">
              <div
                className="bg-gradient-to-b from-green-500 to-orange-500 transition-all duration-1000"
                style={{ height: `${(currentStage / (stages.length - 1)) * 100}%` }}
              />
            </div>

            <div className="space-y-8 relative">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isCompleted = idx < currentStage;
                const isActive = idx === currentStage;

                return (
                  <div key={idx} className="flex items-center gap-6 relative">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all z-10 ${
                        isCompleted
                          ? 'bg-green-500 scale-100'
                          : isActive
                          ? 'bg-orange-500 scale-110 animate-pulse'
                          : 'bg-gray-300 dark:bg-gray-700 scale-90'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={28} className="text-white" />
                      ) : (
                        <Icon size={28} className="text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h4
                        className={`text-lg font-bold ${
                          isActive
                            ? 'text-orange-600 dark:text-orange-400'
                            : isCompleted
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {stage.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">{stage.desc}</p>
                    </div>

                    {isCompleted && (
                      <div className="text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full">
                        Completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details Receipt */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Receipt size={24} className="text-orange-500" />
            Your Order
          </h3>

          <div className="space-y-4">
            {cart.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                {item.menuItem.image && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-white">{item.menuItem.name}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-orange-600">₹{item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-300 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black text-gray-800 dark:text-white">Total</span>
              <span className="text-3xl font-black text-orange-600">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 rounded-3xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <Home size={24} />
          Back to Home
        </button>
      </div>
    </div>
  );
};

// Main Checkout Page Component
function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth(); // Partner auth (kept for backward compatibility)
  const { cafeCarts, getCafeCartTotal, getCafeCartCount, appliedPromo, applyPromoCode, removePromoCode, clearCafeCart } = useCart();
  const { cafeterias } = useCafeterias();
  const { addOrder } = useOrders();
  const { businesses } = useBusinesses();
  
  // Get the cafe ID from query params
  const cafeIdFromQuery = searchParams.get('cafe');
  
  // Get the specific cafe's cart or use first available
  const activeCafeId = cafeIdFromQuery || Object.keys(cafeCarts)[0] || '';
  const currentCart = cafeCarts[activeCafeId];
  const cartItems = currentCart?.items || [];
  
  // Determine if this is a food order
  const activeBusiness = businesses.find(b => b.id === activeCafeId);
  const isFood = !activeBusiness || activeBusiness.businessType === 'food';
    // Get student authentication (primary for checkout)
  const studentAuth = useStudentAuth ? useStudentAuth() : null;
  const student = studentAuth?.student || null;
  const isStudentAuthenticated = studentAuth?.isAuthenticated || false;
  const isStudentAuthLoading = studentAuth?.isLoading || false;

  const [currentView, setCurrentView] = useState<'checkout' | 'success' | 'tracking'>('checkout');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup' | 'dineIn'>('pickup');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [displayOrderNumber, setDisplayOrderNumber] = useState(''); // For UI display only

  // Redirect to student login if not authenticated (wait for auth to finish loading first)
  useEffect(() => {
    // Don't redirect while still loading auth state
    if (isStudentAuthLoading) return;
    
    // Only redirect if neither student nor partner is authenticated
    if (!isStudentAuthenticated && !user) {
      router.push('/student/login');
    }
  }, [isStudentAuthenticated, isStudentAuthLoading, user, router]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    // Generate a display order number for the checkout UI
    setDisplayOrderNumber(`#${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };
  const handleApplyPromo = () => {
    const success = applyPromoCode(promoCode);
    if (success) {
      alert('Promo code applied successfully! 🎉');
      setPromoCode('');
    } else {
      alert('Invalid promo code or minimum order not met');
    }
  };

  // Consistent pricing system across the app
  const subtotal = getCafeCartTotal(activeCafeId);
  
  // Platform fee: per-store fee set by admin (stored in localStorage)
  const getPlatformFee = (cafeId: string): number => {
    try {
      const saved = localStorage.getItem('platformFees');
      if (saved) {
        const fees = JSON.parse(saved);
        if (fees[cafeId] !== undefined) return fees[cafeId];
      }
    } catch {}
    return 0; // Default: no platform fee until admin sets one
  };
  const platformFee = getPlatformFee(activeCafeId);
  
  const freeDeliveryThreshold = 2075; // ₹2075 for free delivery
  const deliveryFee = deliveryMethod === 'dineIn' 
    ? 0 
    : (subtotal >= freeDeliveryThreshold ? 0 : 207); // ₹207 or FREE
  
  // Get discount from applied promo on this specific cafe's cart
  const discount = currentCart?.appliedPromo
    ? currentCart.appliedPromo.type === 'fixed'
      ? currentCart.appliedPromo.discount
      : Math.min(
          (subtotal * currentCart.appliedPromo.discount) / 100,
          currentCart.appliedPromo.maxDiscount || Infinity
        )
    : 0;
  
  const total = subtotal + platformFee + deliveryFee - discount;

  const handlePlaceOrder = async () => {
    if (deliveryMethod === 'delivery' && !address.trim()) {
      alert('Please enter your delivery address');
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    setTimeout(() => {
      // Generate a unique random order ID
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
      const orderId = `CB-${randomNum}`;
      setOrderNumber(orderId);

      // Debug: Log student data
      console.log('[Checkout] Student data:', student);
      console.log('[Checkout] User data:', user);

      // Create order object - This is now just a REQUEST, not a confirmed order
      const newOrder: Order = {
        id: orderId,
        orderNumber: orderId,
        // Complete Student Information - prioritize student context over regular auth
        studentId: student?.studentId || student?.id || user?.id || '',
        studentName: student?.name || user?.name || 'Guest',
        studentEmail: student?.email || user?.email || '',
        studentPhone: student?.phone || '',
        studentInstitute: student?.institute || '',
        studentDepartment: student?.department || '',
        // Legacy fields
        customerName: student?.name || user?.name || 'Guest',
        customerPhone: student?.phone || '',
        deliveryAddress: address || '',
        cafeteriaId: cartItems[0]?.menuItem.cafeteriaId || '',
        cafeteriaName: cafeterias.find(c => c.id === cartItems[0]?.menuItem.cafeteriaId)?.name || '',
        items: cartItems.map(item => ({
          menuItem: item.menuItem,
          name: item.menuItem.name,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          subtotal: item.subtotal,
        })),
        total: total,
        status: 'pending', // Order awaits partner approval
        paymentStatus: 'unpaid', // Payment will be done after approval
        platformFee: platformFee,
        deliveryFee: deliveryFee,
        deliveryType: deliveryMethod === 'dineIn' ? 'pickup' : deliveryMethod as 'delivery' | 'pickup',
        specialInstructions: instructions,
        estimatedTime: '15-20 mins',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('[Checkout] Creating order with data:', newOrder);

      // Add order to context
      addOrder(newOrder);

      // Clear cart
      clearCafeCart(activeCafeId);

      setIsProcessing(false);
      setCurrentView('success');    }, 2000);
  };
  // Show loading while checking auth state
  if (isStudentAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Success View
  if (currentView === 'success') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <FoodConfetti />
          
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl p-12 text-center space-y-6 success-card">
            <div className="mx-auto w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center bounce-once">
              <Clock size={64} className="text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white">
                Order Request Sent!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Request <span className="font-bold text-amber-600">#{orderNumber}</span> submitted
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-800">
              <p className="text-amber-700 dark:text-amber-400 font-medium">
                ⏳ Waiting for {isFood ? 'cafeteria' : 'store'} approval
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
                Once approved, you'll be notified to complete payment
              </p>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isFood ? 'The cafeteria' : 'The store'} will review your order shortly. Payment is required only after approval.
            </p>

            <button
              onClick={() => router.push('/student/orders')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 pulse-slow"
            >
              <Package size={24} />
              View Order Status
            </button>

            <button
              onClick={() => router.push('/')}
              className="text-gray-600 dark:text-gray-400 hover:text-orange-600 font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes bounce-once-anim {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
          }
          @keyframes pulse-slow-anim {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
          .success-card {
            animation: scale-in 0.5s ease-out;
          }
          .bounce-once {
            animation: bounce-once-anim 0.6s ease-out;
          }
          .pulse-slow {
            animation: pulse-slow-anim 2s ease-in-out infinite;
          }
        `}</style>
      </>
    );
  }

  // Tracking View
  if (currentView === 'tracking') {
    // Redirect to new orders page
    router.push('/student/orders');
    return null;
  }

  // Checkout View (Main Form)
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
        <FloatingBackground />

        {/* Navbar */}
        <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 dark:bg-gray-800/70 border-b border-orange-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-2xl">
                <ShoppingBag className="text-white" size={28} />
              </div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white">Checkout</h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-600" />}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Dining Method */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Truck size={24} className="text-orange-500" />
                  Dining Method
                </h2>                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { id: 'delivery', icon: Truck, label: 'Delivery', fee: subtotal >= freeDeliveryThreshold ? 'Free' : '₹207', color: 'orange' },
                    { id: 'pickup', icon: ShoppingBag, label: 'Pickup', fee: 'Free', color: 'green' },
                    { id: 'dineIn', icon: Utensils, label: 'Dine In', fee: 'Free', color: 'blue' },
                  ].map(({ id, icon: Icon, label, fee, color }) => (
                    <button
                      key={id}
                      onClick={() => setDeliveryMethod(id as any)}
                      className={`relative p-6 rounded-2xl border-2 transition-all ${
                        deliveryMethod === id
                          ? `border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-105`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {deliveryMethod === id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                      <Icon size={32} className={`mx-auto mb-2 ${deliveryMethod === id ? `text-orange-500` : 'text-gray-400'}`} />
                      <p className="font-bold text-gray-800 dark:text-white">{label}</p>
                      <p className="text-sm text-gray-500">{fee}</p>
                    </button>
                  ))}
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="mt-6 slide-down">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin size={16} className="inline mr-1" />
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Kitchen Notes */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <ChefHat size={24} className="text-orange-500" />
                  Kitchen Notes
                </h2>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. No onions, extra spicy, allergy info..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Wallet size={24} className="text-orange-500" />
                  Payment Method
                </h2>

                <div className="space-y-4">
                  <div className="p-6 rounded-2xl border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center gap-4">
                      <Smartphone size={32} className="text-orange-500" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 dark:text-white">UPI / Online Pay</p>
                        <p className="text-sm text-gray-500">Recommended</p>
                      </div>
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <Wallet size={32} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-400">Cash on Delivery</p>
                        <p className="text-sm text-gray-400">Coming soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                {/* Receipt Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative receipt-header">
                  <h2 className="text-2xl font-bold mt-2">Order Summary</h2>
                  <p className="text-orange-100 text-sm">Preview: {displayOrderNumber}</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Cart Items */}
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {cartItems.map((item, idx) => {
                      const cafe = cafeterias.find(c => c.id === item.menuItem.cafeteriaId);
                      return (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          {item.menuItem.image && (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                              <Image
                                src={item.menuItem.image}
                                alt={item.menuItem.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {item.quantity}x
                              </span>
                              <p className="font-bold text-gray-800 dark:text-white truncate">
                                {item.menuItem.name}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{cafe?.name || 'Unknown Cafe'}</p>
                          </div>
                          <p className="font-bold text-orange-600 whitespace-nowrap">
                            ₹{item.subtotal.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code */}
                  <div className="space-y-3">
                    {appliedPromo ? (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
                        <div className="flex items-center gap-2">
                          <Ticket size={20} className="text-green-500" />
                          <div>
                            <p className="font-bold text-green-700 dark:text-green-400">{appliedPromo.code}</p>
                            <p className="text-xs text-green-600 dark:text-green-500">
                              -₹{discount.toFixed(2)} off
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removePromoCode}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <X size={20} className="text-red-500" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter promo code"
                          className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-orange-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          onClick={handleApplyPromo}
                          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>                  {/* Price Breakdown */}
                  <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
                    </div>
                    
                    {platformFee > 0 && (
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Platform Fee</span>
                        <span className="font-semibold">₹{platformFee.toFixed(0)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Delivery Fee</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(0)}`}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{discount.toFixed(0)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 dark:border-gray-700">
                      <span className="text-xl font-black text-gray-800 dark:text-white">Total</span>
                      <span className="text-3xl font-black text-orange-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                    <Clock size={20} className="text-orange-500" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Estimated prep time: <span className="text-orange-600">15-20 mins</span>
                    </p>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <ChefHat size={24} className="animate-bounce" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowRight size={24} />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .receipt-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 12px;
          background: linear-gradient(135deg, transparent 50%, var(--bg-color) 50%), linear-gradient(-135deg, transparent 50%, var(--bg-color) 50%);
          background-size: 20px 20px;
          background-repeat: repeat-x;
          --bg-color: white;
        }
        :global(.dark) .receipt-header::before {
          --bg-color: #1f2937;
        }
      `}</style>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}