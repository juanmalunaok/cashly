'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, RefreshCw } from 'lucide-react';
import { Transaction, Category, AccountType } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useDolarBlue } from '@/hooks/useDolarBlue';
import MonthSelector from './MonthSelector';
import MonthlySummary from './MonthlySummary';
import FilterChips from './FilterChips';
import DayGroup from './DayGroup';
import MonthlyCategoryBreakdown from './MonthlyCategoryBreakdown';
import CardSpendingSummary from './CardSpendingSummary';
import EditTransactionSheet from './EditTransactionSheet';

export default function TransactionListScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { transactions, loading } = useTransactions(year, month);
  const { categories } = useCategories();
  const { rate } = useDolarBlue();

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedCategory && t.category !== selectedCategory) return false;
      if (selectedAccount && t.account !== selectedAccount) return false;
      return true;
    });
  }, [transactions, selectedCategory, selectedAccount]);

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const key = t.date.toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries()).map(([key, txs]) => ({
      date: new Date(key),
      transactions: txs,
    }));
  }, [filtered]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const editingCategory = editingTransaction ? catMap.get(editingTransaction.category) : undefined;

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold text-white/90">Listado</h1>
        <button
          onClick={() => router.push('/settings')}
          className="btn-glass w-10 h-10 rounded-full flex items-center justify-center"
        >
          <Settings size={18} className="text-white/60" />
        </button>
      </div>

      {/* Month Selector */}
      <MonthSelector
        year={year}
        month={month}
        onChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
      />

      {/* Content */}
      <div className="pb-4">
        {/* Summary Card */}
        <div className="mb-4">
          <MonthlySummary transactions={transactions} rate={rate} />
        </div>

        {/* Card Spending Summary */}
        {!loading && transactions.length > 0 && (
          <CardSpendingSummary transactions={transactions} rate={rate} />
        )}

        {/* Filter Chips */}
        <div className="mb-4">
          <FilterChips
            categories={categories}
            selectedCategory={selectedCategory}
            selectedAccount={selectedAccount}
            onCategoryChange={setSelectedCategory}
            onAccountChange={setSelectedAccount}
          />
        </div>

        {/* Transactions */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw size={24} className="text-white/30 animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-3xl">📭</span>
            <p className="text-white/30 text-sm">Sin movimientos este mes</p>
          </div>
        ) : (
          <div>
            {grouped.map(({ date, transactions: dayTxs }) => (
              <DayGroup
                key={date.toDateString()}
                date={date}
                transactions={dayTxs}
                categories={categories}
                onEdit={setEditingTransaction}
              />
            ))}
          </div>
        )}

        {/* Category Breakdown */}
        {!loading && transactions.length > 0 && (
          <MonthlyCategoryBreakdown transactions={transactions} categories={categories} />
        )}
      </div>

      {/* Edit Sheet */}
      <EditTransactionSheet
        transaction={editingTransaction}
        category={editingCategory}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  );
}
