'use client';

import { useState, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction, Category, ACCOUNT_LABELS } from '@/types';
import { deleteTransaction } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  onEdit: (t: Transaction) => void;
}

function fmt(n: number, currency: 'ARS' | 'USD') {
  if (currency === 'ARS') {
    return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
  }
  return 'USD ' + n.toFixed(2);
}

export default function TransactionItem({ transaction, category, onEdit }: TransactionItemProps) {
  const { user } = useAuth();
  const [swiped, setSwiped] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchMove(e: React.TouchEvent) {
    touchCurrentX.current = e.touches[0].clientX;
  }

  function onTouchEnd() {
    const delta = touchStartX.current - touchCurrentX.current;
    if (delta > 60) {
      setSwiped(true);
    } else if (delta < -20) {
      setSwiped(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteTransaction(user.uid, transaction.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  }

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-[#30D158]' : 'text-[#FF453A]';
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <div className="relative overflow-hidden">
      {/* Delete button behind */}
      <div className="absolute right-0 inset-y-0 flex items-center pr-4 z-0">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-14 h-14 rounded-2xl bg-[#FF453A] flex items-center justify-center"
        >
          <Trash2 size={20} className="text-white" />
        </button>
      </div>

      {/* Main row */}
      <div
        className={cn(
          'relative z-10 flex items-center gap-3 px-4 py-3',
          'glass rounded-2xl mx-4 mb-2',
          'transition-transform duration-200',
          swiped ? '-translate-x-16' : 'translate-x-0'
        )}
        style={{ cursor: 'pointer' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          if (swiped) {
            setSwiped(false);
          } else {
            onEdit(transaction);
          }
        }}
      >
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-white/08 flex items-center justify-center flex-shrink-0 text-xl">
          {category?.icon ?? '❓'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">
            {transaction.subcategory ?? category?.name ?? transaction.category}
          </p>
          {transaction.note && (
            <p className="text-xs text-white/40 truncate">{transaction.note}</p>
          )}
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className={cn('text-sm font-semibold mono', amountColor)}>
            {amountPrefix}{fmt(transaction.amount, transaction.currency)}
          </p>
          <p className="text-[10px] text-white/30">
            {ACCOUNT_LABELS[transaction.account]}
          </p>
        </div>
      </div>
    </div>
  );
}
