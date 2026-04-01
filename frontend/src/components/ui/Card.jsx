import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';

export const Card = ({ className, children, ...props }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card overflow-hidden", className)} 
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("px-8 py-6 border-b border-white/10 bg-white/5 backdrop-blur-md", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-8", className)} {...props}>
    {children}
  </div>
);
