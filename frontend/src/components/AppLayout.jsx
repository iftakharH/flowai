import React, { useState } from 'react';
import { Home, ArrowRightLeft, Activity, ShieldCheck, Zap, BarChart3, LogOut, CircleUser } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthContext from '../context/useAuthContext';

const AppLayout = ({ children }) => {
   const { user, logout } = useAuthContext();
   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
   const avatarLabel = (user?.displayName || user?.email || 'U').trim().charAt(0).toUpperCase();
   const profileName = user?.displayName || 'Profile';
   const profileEmail = user?.email || 'Signed in with Firebase';

   const handleLogout = async () => {
      setProfileMenuOpen(false);
      await logout();
   };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-500/30">
      
      {/* Desktop Premium Sidebar */}
      <div className="hidden md:flex w-28 flex-col items-center py-12 border-r border-white/5 bg-white/1 backdrop-blur-3xl z-50 sticky top-0 h-screen">
         <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="mb-14 p-4 bg-brand-600 rounded-3xl text-white shadow-[0_0_40px_rgba(147,51,234,0.3)] cursor-pointer"
         >
            <Activity size={28} />
         </motion.div>
         
         <nav className="flex flex-col gap-10 items-center flex-1">
            {[
              { path: '/', icon: Home, label: 'Core' },
              { path: '/transactions', icon: ArrowRightLeft, label: 'Ledger' },
              { path: '/budget', icon: BarChart3, label: 'Strategy' }
            ].map((navItem) => (
              <NavLink 
                key={navItem.path} 
                to={navItem.path}
                className={({ isActive }) => `
                  relative p-4 rounded-2xl transition-all duration-500 group
                  ${isActive ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20 shadow-[0_0_20px_rgba(147,51,234,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}
                `}
              >
                 <navItem.icon size={26} />
                 <div className="absolute left-full ml-6 px-3 py-2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-100">
                    {navItem.label}
                 </div>
              </NavLink>
            ))}
         </nav>

         {/* Fixed Profile Section */}
         <div className="mt-auto flex flex-col items-center gap-6 pb-4 pt-10 border-t border-white/5 w-full">
                  <div className="group relative flex flex-col items-center">
                                 <button
                                    type="button"
                                    onClick={() => setProfileMenuOpen((value) => !value)}
                                    className="w-12 h-12 border-2 border-brand-500/20 hover:border-brand-500 transition-all duration-500 shadow-lg rounded-full bg-white/5 text-white font-black flex items-center justify-center"
                                    title="Open profile menu"
                                 >
                                    {avatarLabel}
                                 </button>
                      <span className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Profile</span>
                      {profileMenuOpen && (
                         <div className="absolute left-full top-0 ml-4 w-60 rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-4 z-50">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</p>
                            <p className="mt-2 text-sm font-bold text-white truncate">{profileName}</p>
                            <p className="text-xs text-slate-400 truncate">{profileEmail}</p>
                            <button
                               type="button"
                               onClick={handleLogout}
                               className="mt-4 w-full h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2"
                            >
                               <LogOut size={16} />
                               Logout
                            </button>
                         </div>
                      )}
            </div>
            <div className="p-3 text-brand-500 hover:text-brand-400 cursor-pointer transition-colors">
              <Zap size={20} className="animate-pulse" />
            </div>
         </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-3xl border-t border-white/10 px-10 py-4 flex items-center justify-between z-50 rounded-t-[2.5rem]">
         <NavLink to="/" className={({ isActive }) => `p-3 rounded-2xl ${isActive ? 'text-brand-400 bg-brand-500/10' : 'text-slate-500'}`}>
            <Home size={26} />
         </NavLink>
         <NavLink to="/transactions" className={({ isActive }) => `p-3 rounded-2xl ${isActive ? 'text-brand-400 bg-brand-500/10' : 'text-slate-500'}`}>
            <ArrowRightLeft size={26} />
         </NavLink>
             <button
                type="button"
                onClick={() => setProfileMenuOpen((value) => !value)}
                className="p-3 border-2 border-brand-500/20 rounded-full text-brand-400"
                title="Open profile menu"
             >
               <CircleUser size={22} />
             </button>
      </div>

         {profileMenuOpen && (
            <div className="md:hidden fixed inset-x-4 bottom-24 z-60 rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</p>
               <p className="mt-2 text-sm font-bold text-white truncate">{profileName}</p>
               <p className="text-xs text-slate-400 truncate">{profileEmail}</p>
               <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 w-full h-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold flex items-center justify-center gap-2"
               >
                  <LogOut size={16} />
                  Logout
               </button>
            </div>
         )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         <header className="md:hidden py-6 px-8 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40">
            <div className="flex items-center gap-3">
               <Activity className="text-brand-500" size={24} />
               <span className="text-2xl font-black tracking-tighter text-white uppercase italic">FlowAI</span>
            </div>
            <ShieldCheck className="text-slate-600" size={20} />
         </header>

         <main className="flex-1 overflow-x-hidden pt-8 pb-32 md:pb-12 px-6 md:px-16">
            <div className="max-w-450 mx-auto w-full h-full">
               {children}
            </div>
         </main>
      </div>
    </div>
  );
};

export default AppLayout;
