'use client';

import { Transaction, Category } from '@/types';
import TransactionItem from './TransactionItem';
import { formatDateHeader } from '@/lib/utils';

interface DayGroupProps {
  date: Date;
  transactions: Transaction[];
  categories: Category[];
  onEdit: (t: Transaction) => void;
}

export default function DayGroup({ date, transactions, categories, onEdit }: DayGroupProps) {
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="mb-4">
      {/* Day Header */}
      <div className="px-5 py-2">
        <span className="text-xs text-white/35 font-medium capitalize">
          {formatDateHeader(date)}
        </span>
      </div>

      {/* Transactions */}
      <div className="space-y-0">
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            category={catMap.get(t.category)}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}
