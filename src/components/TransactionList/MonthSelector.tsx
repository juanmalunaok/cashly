'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '@/lib/utils';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  function prev() {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  }

  function next() {
    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button
        onClick={prev}
        className="btn-glass w-10 h-10 rounded-full flex items-center justify-center"
      >
        <ChevronLeft size={20} className="text-white/70" />
      </button>

      <h2 className="text-lg font-semibold text-white/90">
        {getMonthName(month)} {year}
      </h2>

      <button
        onClick={next}
        className="btn-glass w-10 h-10 rounded-full flex items-center justify-center"
      >
        <ChevronRight size={20} className="text-white/70" />
      </button>
    </div>
  );
}
