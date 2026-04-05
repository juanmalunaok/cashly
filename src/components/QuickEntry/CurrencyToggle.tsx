'use client';

import { Currency } from '@/types';
import { cn } from '@/lib/utils';

interface CurrencyToggleProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export default function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div className="flex glass rounded-xl p-1 w-fit mx-auto">
      {(['ARS', 'USD'] as Currency[]).map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            value === c
              ? 'bg-white/20 text-white'
              : 'text-white/40'
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
