import React from 'react';
import { cn } from '../../utils';

export const Input = React.forwardRef(({ className, icon, ...props }, ref) => (
  <div className="relative w-full">
    {icon && (
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
        {icon}
      </div>
    )}
    <input
      ref={ref}
      className={cn('field-control', icon ? 'pl-10' : '', className)}
      {...props}
    />
  </div>
));

Input.displayName = 'Input';
