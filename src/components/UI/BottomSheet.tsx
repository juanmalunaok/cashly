'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title, className }: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="sheet-overlay"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'glass-sheet rounded-t-[28px]',
          'animate-slide-up',
          'max-h-[92dvh] overflow-y-auto scrollbar-hide',
          'safe-bottom',
          className
        )}
      >
        {/* Handle + close button */}
        <div className="relative flex justify-center items-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
          <button
            onClick={onClose}
            className="absolute right-4 w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={15} className="text-white/50" />
          </button>
        </div>

        {title && (
          <div className="px-6 py-3 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white/90 text-center">{title}</h2>
          </div>
        )}

        <div className="pb-6">{children}</div>
      </div>
    </>
  );
}
