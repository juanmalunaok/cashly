'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction, Category } from '@/types';
import GlassCard from '@/components/UI/GlassCard';
import { cn } from '@/lib/utils';

interface MonthlyCategoryBreakdownProps {
  transactions: Transaction[];
  categories: Category[];
}

function fmt(n: number) {
  return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}

export default function MonthlyCategoryBreakdown({
  transactions,
  categories,
}: MonthlyCategoryBreakdownProps) {
  const [open, setOpen] = useState(false);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Group expense transactions by category
  const breakdown = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, { total: number; cat: Category | undefined }>>((acc, t) => {
      const key = t.category;
      if (!acc[key]) acc[key] = { total: 0, cat: catMap.get(key) };
      acc[key].total += t.currency === 'ARS' ? t.amount : t.amount * 1; // simplified
      return acc;
    }, {});

  const sorted = Object.entries(breakdown).sort((a, b) => b[1].total - a[1].total);

  if (sorted.length === 0) return null;

  return (
    <div className="mx-4 mb-4">
      <GlassCard>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-sm font-semibold text-white/80">Resumen del mes</span>
          {open ? (
            <ChevronUp size={18} className="text-white/40" />
          ) : (
            <ChevronDown size={18} className="text-white/40" />
          )}
        </button>

        {open && (
          <div className="px-5 pb-4 space-y-3 border-t border-white/[0.06] pt-3 animate-fade-in">
            {sorted.map(([catId, { total, cat }]) => (
              <div key={catId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat?.icon ?? '❓'}</span>
                  <span className="text-sm text-white/70">{cat?.name ?? catId}</span>
                </div>
                <span className="text-sm font-semibold text-[#FF453A] mono">
                  {fmt(total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
