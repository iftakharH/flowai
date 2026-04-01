import React from 'react';
import { cn } from '../../utils';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-400 shadow-[0_0_20px_rgba(34,197,94,0.2)] border-transparent",
    secondary: "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-md",
    danger: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20",
    ghost: "bg-transparent text-slate-500 hover:bg-white/5 border border-transparent"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    default: "px-6 py-3.5 text-sm",
    lg: "px-8 py-5 text-base"
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center font-black uppercase tracking-widest rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
