'use client';

import { useState, useRef } from 'react';
import { Check, Trash2 } from 'lucide-react';
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
  const [translateX, setTranslateX] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const didSwipe = useRef(false);

  const isCredit = CREDIT_ACCOUNTS.includes(transaction.account);
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? 'text-[#F5E642]' : 'text-[#FF453A]';
  const amountPrefix = isIncome ? '+' : '-';

  function isTouchOnPaidBtn(e: React.TouchEvent) {
    const target = e.target as HTMLElement;
    return !!target.closest('[data-paid-btn]');
  }

  function onTouchStart(e: React.TouchEvent) {
    if (isTouchOnPaidBtn(e)) return;
    didSwipe.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setTranslateX(0);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (isTouchOnPaidBtn(e)) return;
    touchCurrentX.current = e.touches[0].clientX;
    const delta = touchStartX.current - touchCurrentX.current;
    if (delta > 0) {
      setTranslateX(-Math.min(delta, 120));
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (isTouchOnPaidBtn(e)) return;
    const delta = touchStartX.current - touchCurrentX.current;
    if (delta > 80) {
      // Full swipe — animate off screen then show confirm
      didSwipe.current = true;
      setTranslateX(-window.innerWidth);
      setTimeout(() => {
        setTranslateX(0);
        setShowConfirm(true);
      }, 220);
    } else {
      // Snap back
      setTranslateX(0);
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
      setShowConfirm(false);
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

  return (
    <>
      {/* Confirmation overlay */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          style={{ background: 'rgba(0,0,0,0.70)' }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-[#1C1C1E] border border-white/[0.08] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Transaction preview */}
            <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-xl flex-shrink-0">
                {category?.icon ?? '❓'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/90 truncate">
                  {transaction.subcategory ?? category?.name ?? transaction.category}
                </p>
                <p className="text-xs text-white/40">{ACCOUNT_LABELS[transaction.account]}</p>
              </div>
              <p className={cn('text-sm font-bold mono', amountColor)}>
                {amountPrefix}{fmt(transaction.amount, transaction.currency)}
              </p>
            </div>

            <div className="px-5 py-4 text-center">
              <p className="text-white/80 text-sm font-medium">¿Eliminar este movimiento?</p>
              <p className="text-white/35 text-xs mt-1">Esta acción no se puede deshacer</p>
            </div>

            <div className="flex gap-2 px-4 pb-5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl bg-white/[0.07] border border-white/[0.08] text-white/70 text-sm font-semibold active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3.5 rounded-2xl bg-[#FF453A] text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
              >
                <Trash2 size={14} />
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3',
          'rounded-2xl mx-4 mb-2 border border-white/[0.05]',
          isCredit && transaction.paid ? 'bg-[#1A1A1A]' : 'bg-[#191919]',
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: translateX === 0 || translateX === -window.innerWidth
            ? 'transform 220ms ease-in'
            : 'none',
          cursor: 'pointer',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          if (!didSwipe.current) onEdit(transaction);
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
                {transaction.installmentNumber
                  ? `${transaction.installmentNumber}/${transaction.installments}`
                  : `${transaction.installments}x`}
              </span>
            )}
          </div>

          {/* Paid toggle — solo tarjeta de crédito, solo gastos */}
          {isCredit && !isIncome && (
            <button
              data-paid-btn="true"
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
    </>
  );
}
