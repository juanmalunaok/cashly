'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useDolarBlue } from '@/hooks/useDolarBlue';
import { getMonthName } from '@/lib/utils';
import CategoryGrid from './CategoryGrid';
import AmountSheet from './AmountSheet';
import SpendingPanel from './SpendingPanel';
import { cn } from '@/lib/utils';

function formatAmount2(amount: number, currency: 'ARS' | 'USD'): string {
  if (currency === 'ARS') {
    return '$' + new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return 'USD ' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function QuickEntryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const now = new Date();
  const { categories, loading: catLoading } = useCategories();
  const { transactions } = useTransactions(now.getFullYear(), now.getMonth());
  const { rate } = useDolarBlue();

  // Calculate balance for header
  const balanceARS = transactions.reduce((acc, t) => {
    const amountInARS = t.currency === 'USD' && rate
      ? t.amount * rate.venta
      : t.amount;
    return t.type === 'income' ? acc + amountInARS : acc - amountInARS;
  }, 0);

  function handleCategorySelect(cat: Category) {
    setSelectedCategory(cat);
    setSheetOpen(true);
  }

  const monthLabel = `${getMonthName(now.getMonth())} ${now.getFullYear()}`;
  const balanceSign = balanceARS >= 0 ? '+' : '';
  const balanceColor = balanceARS >= 0 ? 'text-[#F5E642]' : 'text-[#FF453A]';

  return (
    <div className="flex flex-col h-full safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div>
          <p className="text-xs text-white/40 font-medium">{monthLabel}</p>
          <p className={cn('text-xl font-bold tracking-tight mono', balanceColor)}>
            {balanceSign}{formatAmount2(Math.abs(balanceARS), 'ARS')}
          </p>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="btn-glass w-10 h-10 rounded-full flex items-center justify-center"
        >
          <Settings size={18} className="text-white/60" />
        </button>
      </div>

      {/* Dollar rate pill */}
      {rate && (
        <div className="px-5 pb-3">
          <span className="text-[10px] text-white/30">
            USD blue: ${rate.venta.toLocaleString('es-AR')}
          </span>
        </div>
      )}

      {/* Spending Panel */}
      <SpendingPanel transactions={transactions} rate={rate} />

      {/* Category Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">
        {catLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          </div>
        ) : (
          <CategoryGrid categories={categories} onSelect={handleCategorySelect} />
        )}
      </div>

      {/* Amount Sheet */}
      <AmountSheet
        category={selectedCategory}
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedCategory(null);
        }}
      />
    </div>
  );
}
