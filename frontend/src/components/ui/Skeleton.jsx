import React from 'react';
import { cn } from '../../utils';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-white/5 border border-white/5", className)}
      {...props}
    />
  );
};
