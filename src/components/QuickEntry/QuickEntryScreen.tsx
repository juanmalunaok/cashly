'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Category } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAllUnpaidCredit } from '@/hooks/useAllUnpaidCredit';
import { useScheduledTransactions } from '@/hooks/useScheduledTransactions';
import { useDolarBlue } from '@/hooks/useDolarBlue';
import { getMonthName } from '@/lib/utils';
import CategoryGrid from './CategoryGrid';
import AmountSheet from './AmountSheet';
import SpendingPanel from './SpendingPanel';
import UpcomingPanel from './UpcomingPanel';

export default function QuickEntryScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const now = new Date();
  const { categories, loading: catLoading } = useCategories();
  const { transactions } = useTransactions(now.getFullYear(), now.getMonth());
  const allUnpaidCredit = useAllUnpaidCredit();
  const scheduled = useScheduledTransactions();
  const { rate } = useDolarBlue();

  function handleCategorySelect(cat: Category) {
    setSelectedCategory(cat);
    setSheetOpen(true);
  }

  const monthLabel = `${getMonthName(now.getMonth())} ${now.getFullYear()}`;

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p className="text-xs text-white/40 font-medium">{monthLabel}</p>
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
      <SpendingPanel transactions={transactions} allUnpaidCredit={allUnpaidCredit} rate={rate} />

      {/* Upcoming scheduled transactions */}
      <UpcomingPanel scheduled={scheduled} categories={categories} />

      {/* Category Grid */}
      <div className="pb-4">
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
