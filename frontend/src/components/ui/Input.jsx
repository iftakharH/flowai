import React from 'react';
import { cn } from '../../utils';

export const Input = React.forwardRef(({ className, icon, ...props }, ref) => {
  return (
    <div className="relative w-full group">
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-500 transition-colors">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 disabled:opacity-50",
          icon ? "pl-14" : "",
          className
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";
