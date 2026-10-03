import React from 'react';
import { cn } from '../../utils';

export const Card = ({ className, children, ...props }) => (
  <div className={cn('panel', className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('border-b border-[var(--soft-line)] px-5 py-4', className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);
