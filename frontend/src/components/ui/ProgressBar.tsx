import React from 'react';
import { cn } from './Button';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, className, showLabel = false }) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-navy dark:text-soft-sand">{Math.round(percentage)}% Complete</span>
        </div>
      )}
      <div className="h-2 w-full bg-warm-slate/20 dark:bg-navy/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sage transition-all duration-300 ease-in-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
