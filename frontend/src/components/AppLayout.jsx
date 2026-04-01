import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Home, ArrowRightLeft, Activity, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const AppLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-500/30">
      
      {/* Desktop Premium Sidebar */}
      <div className="hidden md:flex w-28 flex-col items-center py-12 border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl z-50 sticky top-0 h-screen">
         <motion.div 
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="mb-14 p-4 bg-brand-600 rounded-[1.5rem] text-white shadow-[0_0_40px_rgba(147,51,234,0.3)] cursor-pointer"
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
                 <div className="absolute left-full ml-6 px-3 py-2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100]">
                    {navItem.label}
                 </div>
              </NavLink>
            ))}
         </nav>

         {/* Fixed Profile Section */}
         <div className="mt-auto flex flex-col items-center gap-6 pb-4 pt-10 border-t border-white/5 w-full">
            <div className="group relative flex flex-col items-center">
               <UserButton 
                afterSignOutUrl="/login" 
                appearance={{ 
                  elements: { 
                    userButtonAvatarBox: 'w-12 h-12 border-2 border-brand-500/20 hover:border-brand-500 transition-all duration-500 shadow-lg',
                    userButtonPopoverCard: 'bg-slate-900 border border-white/10 backdrop-blur-2xl'
                  } 
                }} 
               />
               <span className="mt-2 text-[8px] font-black text-slate-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Account</span>
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
         <div className="p-1 border-2 border-brand-500/20 rounded-full">
            <UserButton afterSignOutUrl="/login" />
         </div>
      </div>

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
            <div className="max-w-[1800px] mx-auto w-full h-full">
               {children}
            </div>
         </main>
      </div>
    </div>
  );
};

export default AppLayout;
