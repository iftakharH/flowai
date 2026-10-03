import React from 'react';
import { cn } from '../../utils';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'default',
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    danger: 'button-danger',
    ghost: 'button-quiet',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    default: 'px-4 py-3 text-sm',
    lg: 'px-5 py-3.5 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
