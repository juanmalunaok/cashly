'use client';

import { useState, useRef } from 'react';
import { Trash2, Check } from 'lucide-react';
import { Transaction, Category, ACCOUNT_LABELS, CREDIT_ACCOUNTS } from '@/types';
import { deleteTransaction, toggleCreditPaid } from '@/lib/firestore';
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
  const [toggling, setToggling] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  const isCredit = CREDIT_ACCOUNTS.includes(transaction.account);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchMove(e: React.TouchEvent) {
    touchCurrentX.current = e.touches[0].clientX;
  }

  function onTouchEnd() {
    const delta = touchStartX.current - touchCurrentX.current;
    if (delta > 60) setSwiped(true);
    else if (delta < -20) setSwiped(false);
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

  async function handleTogglePaid(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user || toggling) return;
    setToggling(true);
    try {
      await toggleCreditPaid(user.uid, transaction.id, !transaction.paid);
    } finally {
      setToggling(false);
    }
  }

  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-[#F5E642]' : 'text-[#FF453A]';
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
          'rounded-2xl mx-4 mb-2 border border-white/[0.05]',
          isCredit && transaction.paid ? 'bg-[#1A1A1A]' : 'bg-[#191919]',
          'transition-transform duration-200',
          swiped ? '-translate-x-16' : 'translate-x-0'
        )}
        style={{ cursor: 'pointer' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          if (swiped) setSwiped(false);
          else onEdit(transaction);
        }}
      >
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-xl">
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

        {/* Amount + badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <p className={cn('text-sm font-semibold mono', amountColor)}>
            {amountPrefix}{fmt(transaction.amount, transaction.currency)}
          </p>

          <div className="flex items-center gap-1.5">
            <p className="text-[10px] text-white/30">
              {ACCOUNT_LABELS[transaction.account]}
            </p>
            {transaction.installments && transaction.installments > 1 && (
              <span className="text-[9px] font-bold bg-[#FF453A]/20 text-[#FF453A] px-1.5 py-0.5 rounded-full">
                {transaction.installments}x
              </span>
            )}
          </div>

          {/* Paid toggle — solo tarjeta de crédito, solo gastos */}
          {isCredit && !isIncome && (
            <button
              onClick={handleTogglePaid}
              disabled={toggling}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all duration-200 active:scale-95',
                transaction.paid
                  ? 'bg-[#F5E642]/20 text-[#F5E642] border border-[#F5E642]/30'
                  : 'bg-white/[0.07] text-white/35 border border-white/10'
              )}
            >
              {transaction.paid && <Check size={9} strokeWidth={3} />}
              {transaction.paid ? 'Pagado' : 'Pendiente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
