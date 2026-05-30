import React from 'react';
import { X } from 'lucide-react';
import { cn } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/50 backdrop-blur-sm">
      <div 
        className={cn(
          "bg-white dark:bg-navy rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 text-navy dark:text-soft-sand",
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-slate/20">
          {title && <h3 className="text-xl font-bold">{title}</h3>}
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-soft-sand/50 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-warm-slate" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
