"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CreditCard, 
  GraduationCap, 
  ChevronRight,
  Eye,
  EyeOff,
  Utensils,
  CheckCircle,
  Loader2,
  Ticket,
  Moon,
  Sun,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/* --- Custom CSS for 3D Flip & Animations --- */
const AuthStyles = () => (
  <style>{`
    .perspective-2000 {
      perspective: 2000px;
    }
    
    .preserve-3d {
      transform-style: preserve-3d;
      -webkit-transform-style: preserve-3d;
    }
    
    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    /* Stamp Animation */
    @keyframes stamp {
      0% { opacity: 0; transform: scale(2) rotate(-15deg); }
      50% { opacity: 1; transform: scale(0.8) rotate(-15deg); }
      70% { transform: scale(1.1) rotate(-15deg); }
      100% { transform: scale(1) rotate(-15deg); }
    }
    
    .animate-stamp {
      animation: stamp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .food-pattern {
      background-image: radial-gradient(#fbbf24 15%, transparent 16%), radial-gradient(#ef4444 15%, transparent 16%);
      background-size: 60px 60px;
      background-position: 0 0, 30px 30px;
    }
    
    .ticket-rip {
      background: radial-gradient(circle at center, transparent 10px, #ffffff 11px);
      background-size: 30px 40px;
      background-position: center bottom;
      background-repeat: repeat-x;
    }

    /* Shimmer effect for the gold card */
    .shimmer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
      transform: skewX(-20deg) translateX(-150%);
      transition: transform 0.5s;
      pointer-events: none;
    }
    
    .group:hover .shimmer {
      transform: skewX(-20deg) translateX(150%);
      transition: transform 1s;
    }

    /* Hide Scrollbar but allow scrolling */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
);

// --- COMPONENT: INTERACTIVE PARALLAX BACKGROUND ---
const FoodBackground = ({ mousePos }: { mousePos: { x: number; y: number } }) => {
  const getOffset = (factor: number) => ({
    transform: `translate(${mousePos.x * factor}px, ${mousePos.y * factor}px)`
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[10%] left-[10%] text-9xl opacity-20 select-none transition-transform duration-100 ease-out" style={getOffset(-20)}>🍔</div>
      <div className="absolute bottom-[15%] right-[10%] text-9xl opacity-20 select-none transition-transform duration-100 ease-out" style={getOffset(-30)}>🍕</div>
      <div className="absolute top-[40%] right-[20%] text-8xl opacity-10 select-none transition-transform duration-100 ease-out" style={getOffset(-15)}>🍩</div>
      <div className="absolute bottom-[20%] left-[15%] text-8xl opacity-10 select-none transition-transform duration-100 ease-out" style={getOffset(-25)}>🍟</div>
      <div className="absolute top-[15%] right-[40%] text-7xl opacity-10 select-none transition-transform duration-100 ease-out" style={getOffset(-10)}>🌮</div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 mix-blend-overlay"></div>
    </div>
  );
};

// --- COMPONENT: INPUT FIELD WRAPPER ---
interface FoodieInputProps {
  label: string;
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const FoodieInput = ({ label, icon: Icon, type = "text", placeholder, value, onChange, required = true }: FoodieInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const inputType = type === 'password' ? (showPass ? 'text' : 'password') : type;

  return (
    <div className={`relative transition-all duration-300 transform ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}>
      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ml-1 transition-colors ${isFocused ? 'text-orange-500' : 'text-gray-400'}`}>
        {label}
      </label>
      <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-colors bg-white
        ${isFocused ? 'border-orange-500 shadow-md shadow-orange-500/10' : 'border-gray-100 hover:border-gray-200'}
      `}>
        <div className={`p-1.5 rounded-lg transition-colors ${isFocused ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
          <Icon size={16} />
        </div>
        <input 
          type={inputType}
          className="flex-1 bg-transparent outline-none text-gray-800 text-sm font-medium placeholder:text-gray-300 w-full"
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChange={onChange}
          required={required}
        />
        {type === 'password' && (
          <button 
            type="button" 
            onClick={() => setShowPass(!showPass)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: MAIN AUTH PAGE ---
export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError } = useAuth();
  
  const [isDark, setIsDark] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [localError, setLocalError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institute: '',
    dept: '',
    id: '',
    password: ''
  });

  // Dark mode setup
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

  const totalFields = 7;
  const filledFields = Object.values(formData).filter(val => val.length > 0).length;
  const progressPercent = (filledFields / totalFields) * 100;

  // Use auth error or local error
  const displayError = authError || localError;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    
    setMousePos({ x: x * 20, y: y * 20 });
    
    if (!isFlipped && submitStatus !== 'success') {
       setTilt({ x: -y * 5, y: x * 5 }); 
    } else {
       setTilt({ x: 0, y: 0 });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
    setLocalError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setLocalError('');
    
    try {
      await login({ email: formData.email, password: formData.password });
      setSubmitStatus('success');
      setTimeout(() => {
        // Check if admin login — redirect to admin dashboard
        if (formData.email === 'superadmin@campusbite.com') {
          router.push('/admin');
        } else {
          router.push('/partner/dashboard');
        }
      }, 1500);
    } catch (err) {
      setSubmitStatus('idle');
      setLocalError('Invalid email or password. Try demo accounts.');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setTimeout(() => {
      setSubmitStatus('success');
      // In real app, would create account and redirect
      setTimeout(() => {
        setIsFlipped(false);
        setSubmitStatus('idle');
        setFormData({
          name: '',
          email: '',
          phone: '',
          institute: '',
          dept: '',
          id: '',
          password: ''
        });
      }, 2500);
    }, 2000);
  };

  return (
    <div className={`${isDark ? 'dark' : ''} transition-colors duration-500`}>
      <div 
        className="min-h-screen bg-orange-50 dark:bg-gray-900 flex flex-col relative overflow-hidden font-sans"
        onMouseMove={handleMouseMove}
      >
        <AuthStyles />
        <FoodBackground mousePos={mousePos} />

        {/* Top Navigation Bar */}
        <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-red-500 p-2 rounded-xl text-white">
              <Utensils size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Campus<span className="text-red-500">Bite</span>
            </span>
          </Link>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg hover:scale-110 transition-transform"
              title="Home"
            >
              <Home size={20} />
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-yellow-400 shadow-lg hover:scale-110 transition-transform"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          {/* Main Perspective Container */}
          <div className="perspective-2000 w-full max-w-[420px] h-[700px] relative z-10 transition-all duration-300">
        
        {/* The 3D Flipping Card Container */}
        <div 
           className={`w-full h-full relative preserve-3d transition-transform duration-1000`}
           style={{ 
             transform: isFlipped 
               ? 'rotateY(180deg)' 
               : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
             transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
           }}
        >
          
          {/* --- FRONT SIDE: LOGIN --- */}
          <div 
            className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white ring-1 ring-gray-100 group"
            style={{ zIndex: isFlipped ? 0 : 1 }}
          >
            <div className="shimmer z-20"></div>

            <div className="h-44 bg-gray-900 relative flex items-center justify-center overflow-hidden flex-shrink-0">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
               <div className="relative z-10 text-center transform group-hover:scale-105 transition-transform duration-500">
                 <div className="inline-flex bg-white/20 backdrop-blur-md p-3 rounded-full mb-3 border border-white/30 shadow-xl">
                   <Utensils className="text-white" size={28} />
                 </div>
                 <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
                 <p className="text-orange-200 text-sm font-medium">Partner Portal</p>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-8 bg-white dark:bg-gray-800 rounded-t-[2rem]"></div>
            </div>

            {submitStatus === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                    <CheckCircle size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 mb-2">Welcome Back!</h3>
                 <p className="text-gray-500 mb-8">Redirecting to dashboard...</p>
                 <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full animate-pulse"></div>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex-1 px-8 py-6 flex flex-col gap-5">
                {displayError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {displayError}
                  </div>
                )}
                
                <FoodieInput 
                  label="Partner Email" 
                  icon={Mail} 
                  type="email" 
                  placeholder="admin@thegrill.com" 
                  value={formData.email}
                  onChange={(e) => handleChange(e, 'email')}
                />
                <FoodieInput 
                  label="Secret Sauce (Password)" 
                  icon={Lock} 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => handleChange(e, 'password')}
                />
                
                <div className="flex justify-end -mt-2">
                  <a href="#" className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline">Forgot password?</a>
                </div>

                {/* Demo Accounts Info */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 -mt-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Demo Accounts - Click to Login</p>
                  <div className="space-y-1 text-xs max-h-40 overflow-y-auto hide-scrollbar">
                    {/* Super Admin */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'superadmin@campusbite.com', password: 'admin@123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors group border border-red-100 bg-red-50/50 mb-1"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 group-hover:scale-150 transition-transform animate-pulse"></span>
                        <span className="group-hover:text-red-600 group-hover:font-semibold font-semibold text-red-700">⭐ superadmin@campusbite.com</span>
                      </span>
                      <span className="font-mono text-red-400 group-hover:text-red-500">admin@123</span>
                    </button>
                    {/* Food */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@thegrill.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-orange-600 group-hover:font-semibold">admin@thegrill.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-orange-500">demo123</span>
                    </button>
                    {/* Groceries */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@campusmart.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-green-600 group-hover:font-semibold">admin@campusmart.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-green-500">demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@freshbazaar.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-green-600 group-hover:font-semibold">admin@freshbazaar.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-green-500">demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@quickstop.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-green-600 group-hover:font-semibold">admin@quickstop.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-green-500">demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@organiccorner.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-green-600 group-hover:font-semibold">admin@organiccorner.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-green-500">demo123</span>
                    </button>
                    {/* Stationery */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@penparadise.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-blue-600 group-hover:font-semibold">admin@penparadise.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-blue-500">demo123</span>
                    </button>
                    {/* Essentials */}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@dailyneeds.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-purple-600 group-hover:font-semibold">admin@dailyneeds.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-purple-500">demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@campuscare.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-purple-600 group-hover:font-semibold">admin@campuscare.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-purple-500">demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@hygieneplus.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-purple-600 group-hover:font-semibold">admin@hygieneplus.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-purple-500">demo123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, email: 'admin@studentstore.com', password: 'demo123' });
                        setTimeout(() => document.querySelector('form')?.requestSubmit(), 100);
                      }}
                      className="w-full flex justify-between items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></span>
                        <span className="group-hover:text-purple-600 group-hover:font-semibold">admin@studentstore.com</span>
                      </span>
                      <span className="font-mono text-gray-400 group-hover:text-purple-500">demo123</span>
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-3 gap-1 text-[9px] text-gray-400">
                    <span>⭐ 1 Admin</span>
                    <span>🍔 1 Food</span>
                    <span>🛒 4 Grocery</span>
                    <span>✏️ 1 Stationery</span>
                    <span>🧴 4 Essentials</span>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button 
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'loading' ? (
                      <><Loader2 className="animate-spin" size={20} /> Checking...</>
                    ) : (
                      <>Enter Dashboard <ChevronRight className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                  
                  <p className="text-center text-gray-400 text-xs mt-6 font-medium">
                    Partners only. Students login{' '}
                    <Link href="/student/login" className="text-orange-500 font-bold hover:underline">
                      here
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* --- BACK SIDE: SIGN UP --- */}
          <div 
            className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white ring-1 ring-gray-100"
            style={{ transform: 'rotateY(180deg)' }}
          >
             {/* Header */}
             <div className="bg-orange-500 p-5 relative overflow-hidden flex-shrink-0">
                <div className="food-pattern absolute inset-0 opacity-10"></div>
                <div className="relative z-10 text-center text-white">
                   <h2 className="text-xl font-black uppercase tracking-widest border-2 border-white/30 inline-block px-4 py-1 rounded-lg bg-orange-600/20 backdrop-blur-sm">Meal Pass</h2>
                   <p className="mt-1 text-orange-100 text-[10px] font-bold tracking-widest uppercase">Official Student Registration</p>
                </div>
                <div className="absolute -bottom-1 left-0 w-full h-4 ticket-rip"></div>
             </div>

             {/* Form Area */}
             <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/50">
               {submitStatus === 'success' ? (
                 <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                    <div className="border-4 border-orange-500 p-8 rounded-xl animate-stamp transform rotate-[-15deg]">
                       <div className="text-orange-600 font-black text-3xl uppercase tracking-widest mb-1">APPROVED</div>
                       <div className="text-orange-500 font-bold text-xs tracking-widest border-t-2 border-orange-200 pt-2">MEAL TICKET ISSUED</div>
                    </div>
                 </div>
               ) : (
                 <form onSubmit={handleSignup} className="flex-1 px-5 pt-4 pb-2 overflow-y-auto hide-scrollbar flex flex-col gap-3">
                    
                    {/* Progress Bar inside Form */}
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                         <span>Completing Ticket</span>
                         <span className="text-orange-500">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Compact Inputs */}
                    <FoodieInput 
                       label="Full Name" 
                       icon={User} 
                       placeholder="John Dough" 
                       value={formData.name}
                       onChange={(e) => handleChange(e, 'name')}
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <FoodieInput 
                        label="Email" 
                        icon={Mail} 
                        type="email"
                        placeholder="id@edu" 
                        value={formData.email}
                        onChange={(e) => handleChange(e, 'email')}
                      />
                      <FoodieInput 
                        label="Phone" 
                        icon={Phone} 
                        type="tel"
                        placeholder="(555)..." 
                        value={formData.phone}
                        onChange={(e) => handleChange(e, 'phone')}
                      />
                    </div>

                    {/* Academic Section */}
                    <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-3 shadow-sm">
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                         <GraduationCap size={10} /> Institute Details
                       </p>
                       <FoodieInput 
                         label="Institute Name" 
                         icon={MapPin} 
                         placeholder="West Campus" 
                         value={formData.institute}
                         onChange={(e) => handleChange(e, 'institute')}
                       />
                       <div className="grid grid-cols-2 gap-3">
                         <FoodieInput 
                           label="Dept" 
                           icon={GraduationCap} 
                           placeholder="Eng." 
                           value={formData.dept}
                           onChange={(e) => handleChange(e, 'dept')}
                         />
                         <FoodieInput 
                           label="ID No" 
                           icon={CreditCard} 
                           placeholder="2024-X" 
                           value={formData.id}
                           onChange={(e) => handleChange(e, 'id')}
                         />
                       </div>
                    </div>

                    <FoodieInput 
                       label="Set Password" 
                       icon={Lock} 
                       type="password"
                       placeholder="8+ chars" 
                       value={formData.password}
                       onChange={(e) => handleChange(e, 'password')}
                    />

                    <div className="pt-4 pb-6 mt-auto">
                      <button 
                        type="submit"
                        disabled={submitStatus === 'loading'}
                        className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-black text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                      >
                         {submitStatus === 'loading' ? (
                          <><Loader2 className="animate-spin" size={20} /> Printing...</>
                        ) : (
                          <>Print Meal Ticket <Ticket size={20} /></>
                        )}
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={() => { 
                          setIsFlipped(false); 
                          setSubmitStatus('idle');
                          setLocalError('');
                        }}
                        className="w-full text-center text-gray-400 text-xs font-bold hover:text-gray-600 mt-3 py-2"
                      >
                        Cancel & Return to Login
                      </button>
                    </div>
                 </form>
               )}
             </div>
          </div>

        </div>
          </div>
        </div>
        
        {/* Footer Branding */}
        <div className="absolute bottom-6 left-0 w-full text-center text-red-900/20 dark:text-red-100/10 font-black text-6xl pointer-events-none opacity-10 tracking-widest uppercase select-none">
          CampusBite
        </div>
      </div>
    </div>
  );
}
