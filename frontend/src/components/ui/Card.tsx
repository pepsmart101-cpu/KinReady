import React from 'react';
import { cn } from './Button';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div 
      className={cn("bg-white dark:bg-navy border border-warm-slate/20 rounded-xl shadow-sm overflow-hidden text-navy dark:text-soft-sand", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-4 border-b border-warm-slate/20", className)}>
      {children}
    </div>
  );
};

const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-6", className)}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn("px-6 py-4 border-t border-warm-slate/20 bg-soft-sand/30 dark:bg-white/5", className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };
