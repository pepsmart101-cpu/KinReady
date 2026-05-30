import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-navy dark:text-soft-sand">
            {label}
          </label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-lg border border-warm-slate/30 dark:border-warm-slate/20 bg-white dark:bg-navy px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-warm-slate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calamity focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-navy dark:text-soft-sand",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
