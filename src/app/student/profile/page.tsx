"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Edit3, 
  Camera, 
  Save, 
  X, 
  Award, 
  TrendingUp, 
  Clock, 
  Utensils, 
  Pizza, 
  Coffee,
  Zap,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  GraduationCap,
  Lock,
  RefreshCw,
  Home
} from 'lucide-react';
import { useStudentAuth } from '@/contexts/StudentAuthContext';

/* --- CUSTOM CSS --- */
const ProfileStyles = () => (
  <style>{`
    /* Holographic Card Effect */
    .holo-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.18);
      box-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
      transition: transform 0.1s;
      transform-style: preserve-3d;
    }
    
    .holo-shine {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        115deg, 
        transparent 0%, 
        rgba(255,255,255,0.4) 30%, 
        rgba(255,255,255,0) 30%, 
        transparent 100%
      );
      transform: translateX(-100%);
      transition: transform 0.5s;
      pointer-events: none;
    }
    
    .holo-card:hover .holo-shine {
      transform: translateX(100%);
      transition: transform 1.5s;
    }

    /* Floating Background Icons */
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    .animate-float { animation: float-slow 6s ease-in-out infinite; }
    
    /* Progress Bar Strip */
    .progress-strip {
      background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
      background-size: 1rem 1rem;
      animation: progress-strip 1s linear infinite;
    }
    @keyframes progress-strip {
      0% { background-position: 1rem 0; }
      100% { background-position: 0 0; }
    }
  `}</style>
);

// --- COMPONENT: STATS CARD ---
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:transform hover:-translate-y-1 transition-all duration-300 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider">{label}</p>
  </div>
);

// --- COMPONENT: MAIN PROFILE ---
const CampusBiteProfile = () => {
  const router = useRouter();
  const { student, isAuthenticated, logout } = useStudentAuth();
  const [isDark, setIsDark] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  // User Data from context - Initialize with safe defaults
  const [userData, setUserData] = useState({
    name: student?.name || "Guest User",
    email: student?.email || "guest@campus.edu",
    phone: student?.phone || "+1 (555) 000-0000",
    dorm: "Not specified",
    institute: student?.institute || "West State University",
    dept: student?.department || "Not specified",
    id: student?.studentId || "GUEST-000",
    bio: "Caffeine dependent life form. Engineering major. Will code for pizza.",
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${student?.name || 'Guest'}`,
    level: "Gold Foodie",
    points: 2450,
    orders: 42
  });

  // Update userData when student data loads
  useEffect(() => {
    if (student) {
      setUserData({
        name: student.name,
        email: student.email,
        phone: student.phone || "+1 (555) 000-0000",
        dorm: "Not specified",
        institute: student.institute || "West State University",
        dept: student.department || "Not specified",
        id: student.studentId,
        bio: "Caffeine dependent life form. Engineering major. Will code for pizza.",
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`,
        level: "Gold Foodie",
        points: 2450,
        orders: 42
      });
    }
  }, [student]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !student) {
      router.push('/student/login');
    }
  }, [isAuthenticated, student, router]);

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

  if (!isAuthenticated || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Calculate Ticket Completion
  const requiredFields: (keyof typeof userData)[] = ['name', 'email', 'phone', 'institute', 'dept', 'id', 'dorm'];
  const completedCount = requiredFields.filter(field => {
    const value = userData[field];
    return value && typeof value === 'string' && value !== 'Not specified' && value.length > 0;
  }).length;
  const completionPercentage = Math.round((completedCount / requiredFields.length) * 100);


  // Handle Card Tilt
  const handleMouseMove = (e: React.MouseEvent) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <ProfileStyles />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white relative overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-9xl opacity-5 dark:opacity-[0.02] animate-float">🍔</div>
          <div className="absolute bottom-20 right-10 text-9xl opacity-5 dark:opacity-[0.02] animate-float" style={{ animationDelay: '2s' }}>🍕</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-orange-500/10 to-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {/* Top Navigation Bar */}
        <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Utensils size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">Campus<span className="text-orange-500">Bite</span></span>
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
             <button 
               onClick={handleLogout}
               className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full font-bold shadow-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
             >
               <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
             </button>
          </div>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-12 gap-12 items-start">
          
          {/* --- LEFT COLUMN: HOLOGRAPHIC ID CARD --- */}
          <div className="lg:col-span-5 perspective-1000">
             <div 
               className="holo-card relative w-full aspect-[3/4] rounded-[2.5rem] p-8 flex flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl"
               onMouseMove={handleMouseMove}
               onMouseLeave={handleMouseLeave}
               style={{ 
                 transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
               }}
             >
                {/* Shine Effect */}
                <div className="holo-shine z-20"></div>

                {/* Card Header */}
                <div className="w-full flex justify-between items-start z-10">
                   <div className="flex items-center gap-2 opacity-80">
                      <ShieldCheck size={20} className="text-green-400" />
                      <span className="text-xs font-bold tracking-[0.2em]">VERIFIED STUDENT</span>
                   </div>
                   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Barcode_EAN8.svg/1200px-Barcode_EAN8.svg.png" alt="barcode" className="h-8 opacity-50 mix-blend-screen" />
                </div>

                {/* Avatar Section */}
                <div className="relative z-10 group">
                   <div className="w-48 h-48 rounded-full border-4 border-white/20 p-2 relative">
                      <div className="w-full h-full rounded-full overflow-hidden bg-orange-500 relative">
                         <img src={userData.avatar} alt="Profile" className="w-full h-full object-cover" />
                         {isEditing && (
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={32} />
                           </div>
                         )}
                      </div>
                      <div className="absolute bottom-2 right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold border-4 border-gray-800 shadow-lg" title="Foodie Level">
                         <Award size={18} />
                      </div>
                   </div>
                </div>

                {/* User Details */}
                <div className="text-center z-10 w-full space-y-2">
                   <h1 className="text-4xl font-black tracking-tight">{userData.name}</h1>
                   <div className="bg-white/10 backdrop-blur-md py-2 px-4 rounded-xl inline-block">
                      <p className="font-mono text-orange-400 font-bold tracking-widest">{userData.id}</p>
                   </div>
                   <p className="text-gray-400 text-sm mt-4 line-clamp-2 px-4">{userData.bio}</p>
                </div>

                {/* Footer Stats on Card */}
                <div className="w-full grid grid-cols-2 gap-4 mt-6 z-10">
                   <div className="bg-white/5 p-3 rounded-2xl text-center backdrop-blur-sm border border-white/5">
                      <div className="text-2xl font-black text-orange-400">{userData.orders}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400">Total Orders</div>
                   </div>
                   <div className="bg-white/5 p-3 rounded-2xl text-center backdrop-blur-sm border border-white/5">
                      <div className="text-2xl font-black text-green-400">{userData.points}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-400">Bite Points</div>
                   </div>
                </div>
             </div>
             
             {/* Edit Toggle */}
             <button 
               onClick={() => setIsEditing(!isEditing)}
               className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
             >
               {isEditing ? <><Save size={20} /> Save Changes</> : <><Edit3 size={20} /> Edit Profile</>}
             </button>
          </div>

          {/* --- RIGHT COLUMN: DETAILS & STATS --- */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* TICKET COMPLETION BAR */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
               <div className="flex justify-between items-end mb-2 relative z-10">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider">Meal Ticket Status</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fill all details to complete your profile!</p>
                  </div>
                  <span className="text-4xl font-black text-orange-500">{completionPercentage}%</span>
               </div>
               <div className="w-full h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative z-10 shadow-inner">
                  <div 
                    className="h-full bg-orange-500 progress-strip rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
               </div>
               {/* Decorative background blob */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
               <StatCard icon={Pizza} label="Fav Food" value="Burgers" color="bg-orange-500 text-orange-500" />
               <StatCard icon={Clock} label="Avg Wait" value="12m" color="bg-blue-500 text-blue-500" />
               <StatCard icon={TrendingUp} label="This Month" value="₹11,786" color="bg-green-500 text-green-500" />
            </div>

            {/* DETAILS FORM */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 space-y-8">
               
               {/* SECTION 1: PERSONAL CONTACT */}
               <div>
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl text-orange-600">
                        <User size={20} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-wide">Personal Contact</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Full Name</label>
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <User size={18} className="text-gray-400" />
                            <input type="text" value={userData.name} disabled={!isEditing} onChange={(e) => setUserData({...userData, name: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Email</label>
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <Mail size={18} className="text-gray-400" />
                            <input type="email" value={userData.email} disabled={!isEditing} onChange={(e) => setUserData({...userData, email: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Phone</label>
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <Phone size={18} className="text-gray-400" />
                            <input type="text" value={userData.phone} disabled={!isEditing} onChange={(e) => setUserData({...userData, phone: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Dorm / Location</label>
                         <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <MapPin size={18} className="text-gray-400" />
                            <input type="text" value={userData.dorm} disabled={!isEditing} onChange={(e) => setUserData({...userData, dorm: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                         </div>
                      </div>
                  </div>
               </div>

               {/* SECTION 2: INSTITUTE DETAILS */}
               <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600">
                        <GraduationCap size={20} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-wide">Institute Details</h2>
                  </div>

                  <div className="space-y-5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Institute Name</label>
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <GraduationCap size={18} className="text-gray-400" />
                            <input type="text" value={userData.institute} disabled={!isEditing} onChange={(e) => setUserData({...userData, institute: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Department</label>
                            <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                                <CreditCard size={18} className="text-gray-400" />
                                <input type="text" value={userData.dept} disabled={!isEditing} onChange={(e) => setUserData({...userData, dept: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">ID No</label>
                            <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                                <ShieldCheck size={18} className="text-gray-400" />
                                <input type="text" value={userData.id} disabled={!isEditing} onChange={(e) => setUserData({...userData, id: e.target.value})} className="bg-transparent outline-none w-full font-bold" />
                            </div>
                          </div>
                      </div>
                  </div>
               </div>

               {/* SECTION 3: SECURITY */}
               <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-xl text-red-600">
                        <Lock size={20} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-wide">Security</h2>
                  </div>

                  <div className="flex items-end gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider ml-1">Password</label>
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${isEditing ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'}`}>
                            <Lock size={18} className="text-gray-400" />
                            <input 
                              type="password" 
                              value="••••••••••" 
                              disabled={!isEditing} 
                              className="bg-transparent outline-none w-full font-bold tracking-widest" 
                            />
                        </div>
                      </div>
                      <button 
                        disabled={!isEditing}
                        className="h-[52px] px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center gap-2 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                      >
                         <RefreshCw size={18} /> Reset
                      </button>
                  </div>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CampusBiteProfile;
