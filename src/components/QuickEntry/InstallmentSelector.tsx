'use client';

import { cn } from '@/lib/utils';

interface InstallmentSelectorProps {
  value: number;
  onChange: (n: number) => void;
  totalAmount?: number;
}

const OPTIONS = [1, 2, 3, 6, 9, 12];

export default function InstallmentSelector({ value, onChange, totalAmount }: InstallmentSelectorProps) {
  return (
    <div className="px-6">
      <p className="text-[11px] text-white/35 font-semibold uppercase tracking-widest mb-2.5">
        Cuotas
      </p>
      <div className="grid grid-cols-6 gap-1.5">
        {OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={cn(
              'py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 text-center',
              value === n
                ? 'bg-[#F5E642]/20 text-[#F5E642] border border-[#F5E642]/40'
                : 'bg-[#222] border border-white/[0.05] text-white/40'
            )}
          >
            {n === 1 ? '1x' : `${n}x`}
          </button>
        ))}
      </div>
      {value > 1 && (
        <p className="text-[10px] text-white/25 mt-2 ml-0.5">
          {totalAmount && totalAmount > 0
            ? `${value} cuotas de $${Math.round((totalAmount / value) * 100) / 100} — se registra una por mes`
            : `${value} cuotas — se registra una por mes`}
        </p>
      )}
    </div>
  );
}
