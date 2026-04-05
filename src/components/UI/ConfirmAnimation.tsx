'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ConfirmAnimationProps {
  show: boolean;
  onDone?: () => void;
  type?: 'income' | 'expense';
}

export default function ConfirmAnimation({ show, onDone, type = 'expense' }: ConfirmAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible) return null;

  const color = type === 'income' ? '#30D158' : '#FF453A';
  const bgColor = type === 'income' ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div
        className="flex items-center justify-center w-24 h-24 rounded-full animate-check"
        style={{ background: bgColor }}
      >
        <Check size={48} color={color} strokeWidth={3} />
      </div>
    </div>
  );
}
