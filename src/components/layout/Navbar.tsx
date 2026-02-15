"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Utensils, Menu, X, ChevronRight, Moon, Sun, User, LogIn, Package, ShoppingBag, MapPin } from 'lucide-react';
import { useStudentAuth } from '@/contexts/StudentAuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { student, isAuthenticated } = useStudentAuth();
  const { orders } = useOrders();
  const { getTotalCartsCount } = useCart();
  
  // Get total cart count across all cafes
  const totalCartItems = getTotalCartsCount();
  
  // Count active orders for this student (including pending approval and payment required)
  const activeOrdersCount = student ? orders.filter(
    order => (order.studentEmail === student.email || order.studentId === student.studentId) &&
    ['pending', 'approved', 'payment_pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  ).length : 0;
  
  // Count orders requiring action (payment required)
  const actionRequiredCount = student ? orders.filter(
    order => (order.studentEmail === student.email || order.studentId === student.studentId) &&
    ['approved', 'payment_pending'].includes(order.status)
  ).length : 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-500 p-2 rounded-xl text-white shadow-lg shadow-red-500/30">
              <Utensils size={24} strokeWidth={2.5} />
            </div>
            <span className={`text-2xl font-black tracking-tighter transition-colors ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white lg:text-gray-900 lg:dark:text-white'}`}>
              Campus<span className="text-red-500">Bite</span>
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6 font-medium text-gray-700 dark:text-gray-300">
          <Link href="/order" className="hover:text-red-500 transition-colors">Store</Link>
          <a href="#" className="hover:text-red-500 transition-colors">Delivery Map</a>
          
          {isAuthenticated && student && (
            <Link 
              href="/student/orders"
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all transform hover:scale-105 font-bold border-2 ${
                actionRequiredCount > 0 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-900/50'
              }`}
            >
              <MapPin size={18} />
              {actionRequiredCount > 0 ? 'Pay Now' : 'Track Order'}
              {activeOrdersCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse ${
                  actionRequiredCount > 0 ? 'bg-blue-500' : 'bg-red-500'
                }`}>
                  {activeOrdersCount}
                </span>
              )}
            </Link>
          )}
          
          {/* Cart Icon */}
          <Link
            href="/order"
            className="relative p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 border-2 border-transparent hover:border-red-300 dark:hover:border-red-700 transition-all transform hover:scale-110"
          >
            <ShoppingBag size={20} className="text-gray-700 dark:text-gray-300" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {totalCartItems}
              </span>
            )}
          </Link>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated && student ? (
            <Link 
              href="/student/profile"
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-full hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 shadow-xl font-bold"
            >
              <User size={18} />
              {student.name.split(' ')[0]}
            </Link>
          ) : (
            <Link 
              href="/student/login"
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2.5 rounded-full hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 shadow-xl font-bold"
            >
              <LogIn size={18} />
              Login
            </Link>
          )}

          <Link 
            href="/order"
            className="bg-red-600 text-white px-6 py-2.5 rounded-full hover:bg-red-700 transition-all transform hover:scale-105 shadow-xl font-bold flex items-center gap-2"
          >
            Order Now <ChevronRight size={18} />
          </Link>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${isScrolled ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400' : 'bg-white/15 backdrop-blur-sm text-yellow-400 lg:bg-gray-100 lg:dark:bg-gray-800 lg:text-gray-800 lg:dark:text-yellow-400'}`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`transition-colors ${isScrolled ? 'text-gray-800 dark:text-white' : 'text-white lg:text-gray-800 lg:dark:text-white'}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-xl border-t border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-4">
          <Link href="/order" className="text-lg font-medium text-gray-800 dark:text-gray-200">Store</Link>
          <a href="#" className="text-lg font-medium text-gray-800 dark:text-gray-200">Delivery Map</a>
          
          {/* Cart Button for Mobile */}
          <Link 
            href="/order"
            className="relative bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} />
            Cart
            {totalCartItems > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {totalCartItems}
              </span>
            )}
          </Link>
          
          {isAuthenticated && student && (
            <Link 
              href="/student/orders"
              className="relative bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-3 rounded-xl font-bold border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              Track Order
              {activeOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </Link>
          )}
          
          {isAuthenticated && student ? (
            <Link 
              href="/student/profile"
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-full py-3 rounded-xl font-bold shadow-lg text-center flex items-center justify-center gap-2"
            >
              <User size={18} />
              {student.name.split(' ')[0]}'s Profile
            </Link>
          ) : (
            <Link 
              href="/student/login"
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 w-full py-3 rounded-xl font-bold shadow-lg text-center flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Student Login
            </Link>
          )}
          
          <Link 
            href="/order"
            className="bg-red-500 text-white w-full py-3 rounded-xl font-bold shadow-lg shadow-red-500/30 text-center"
          >
            Order Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
