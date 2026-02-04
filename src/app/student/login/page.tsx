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
import { useStudentAuth } from '@/contexts/StudentAuthContext';

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
      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ml-1 transition-colors ${isFocused ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
        {label}
      </label>
      <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-colors bg-white dark:bg-gray-700
        ${isFocused ? 'border-orange-500 shadow-md shadow-orange-500/10' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'}
      `}>
        <div className={`p-1.5 rounded-lg transition-colors ${isFocused ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 dark:bg-gray-600 text-gray-400 dark:text-gray-300'}`}>
          <Icon size={16} />
        </div>
        <input 
          type={inputType}
          className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white text-sm font-medium placeholder:text-gray-300 dark:placeholder:text-gray-500 w-full"
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
export default function StudentLoginPage() {
  const router = useRouter();
  const { login, signup } = useStudentAuth();
  
  const [isDark, setIsDark] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institute: '',
    dept: '',
    studentId: '',
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
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setError('');
    
    try {
      await login({ email: formData.email, password: formData.password });
      setSubmitStatus('success');
      setTimeout(() => {
        router.push('/order');
      }, 1500);
    } catch (err) {
      setSubmitStatus('idle');
      setError('Invalid email or password.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setError('');
    
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        institute: formData.institute,
        department: formData.dept,
        studentId: formData.studentId
      });
      
      setSubmitStatus('success');
      setTimeout(() => {
        // Auto-login after signup
        login({ email: formData.email, password: formData.password }).then(() => {
          router.push('/order');
        });
      }, 2500);
    } catch (err) {
      setSubmitStatus('idle');
      setError('Signup failed. Email might already be registered.');
    }
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
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Utensils size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              Campus<span className="text-orange-500">Bite</span>
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
            className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white dark:border-gray-700 ring-1 ring-gray-100 dark:ring-gray-600 group"
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
                 <p className="text-orange-200 text-sm font-medium">Hungry again?</p>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-8 bg-white rounded-t-[2rem]"></div>
            </div>

            {submitStatus === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                    <CheckCircle size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 mb-2">Welcome Back!</h3>
                 <p className="text-gray-500 mb-8">Redirecting you to the cafeteria...</p>
                 <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full animate-pulse"></div>
                 </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex-1 px-8 py-6 flex flex-col gap-5">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <FoodieInput 
                  label="Student Email" 
                  icon={Mail} 
                  type="email" 
                  placeholder="your.name@university.edu" 
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

                <div className="mt-auto pt-4 space-y-4">
                  <button 
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="w-full bg-gray-900 dark:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitStatus === 'loading' ? (
                      <><Loader2 className="animate-spin" size={20} /> Checking...</>
                    ) : (
                      <>Enter Cafeteria <ChevronRight className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                  
                  {/* Make "Get a Meal Ticket" more prominent */}
                  <button 
                    type="button" 
                    onClick={() => setIsFlipped(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-black text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 group border-2 border-orange-400 dark:border-orange-300"
                  >
                    <Ticket size={20} className="group-hover:rotate-12 transition-transform" />
                    Get a Meal Ticket
                    <Ticket size={20} className="group-hover:-rotate-12 transition-transform" />
                  </button>
                  
                  <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-6 font-medium">
                    New on campus? Click above to register!
                  </p>
                  
                  <p className="text-center text-gray-400 dark:text-gray-500 text-xs mt-4 font-medium">
                    Are you a cafe partner? 
                    <button 
                      type="button" 
                      onClick={() => router.push('/login')}
                      className="text-red-500 font-bold ml-1 hover:underline focus:outline-none"
                    >
                      Partner Login
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* --- BACK SIDE: SIGNUP --- */}
          <div 
            className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-8 border-white dark:border-gray-700 ring-1 ring-gray-100 dark:ring-gray-600"
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
             <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/50 dark:bg-gray-700/50">
               {submitStatus === 'success' && isFlipped ? (
                 <div className="absolute inset-0 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                    <div className="border-4 border-orange-500 p-8 rounded-xl animate-stamp transform rotate-[-15deg]">
                       <div className="text-orange-600 font-black text-3xl uppercase tracking-widest mb-1">APPROVED</div>
                       <div className="text-orange-500 font-bold text-xs tracking-widest border-t-2 border-orange-200 pt-2">MEAL TICKET ISSUED</div>
                    </div>
                 </div>
               ) : (
                 <form onSubmit={handleSignup} className="flex-1 px-5 pt-4 pb-2 overflow-y-auto hide-scrollbar flex flex-col gap-3">
                    
                    {error && isFlipped && (
                      <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-medium">
                        {error}
                      </div>
                    )}

                    {/* Progress Bar inside Form */}
                    <div className="bg-white dark:bg-gray-700 p-3 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm mb-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-300 mb-1 uppercase tracking-wider">
                         <span>Completing Ticket</span>
                         <span className="text-orange-500">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
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
                           value={formData.studentId}
                           onChange={(e) => handleChange(e, 'studentId')}
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
                          setError('');
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
        <div className="absolute bottom-6 left-0 w-full text-center text-orange-900/20 dark:text-orange-100/10 font-black text-6xl pointer-events-none opacity-10 tracking-widest uppercase select-none">
          CampusBite
        </div>
      </div>
    </div>
  );
}
