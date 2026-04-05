'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Transaction, Category, ACCOUNT_LABELS } from '@/types';
import { deleteTransaction } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function fmtAmount(t: Transaction): string {
  const prefix = t.type === 'income' ? '+' : '-';
  if (t.currency === 'USD') return prefix + 'USD ' + t.amount.toFixed(2);
  return prefix + '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(t.amount);
}

interface UpcomingPanelProps {
  scheduled: Transaction[];
  categories: Category[];
}

export default function UpcomingPanel({ scheduled, categories }: UpcomingPanelProps) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (scheduled.length === 0) return null;

  const catMap = new Map(categories.map((c) => [c.id, c]));

  async function handleDelete(id: string) {
    if (!user || deleting) return;
    setDeleting(id);
    try {
      await deleteTransaction(user.uid, id);
    } finally {
      setDeleting(null);
    }
  }

  const income = scheduled.filter((t) => t.type === 'income');
  const expenses = scheduled.filter((t) => t.type === 'expense');

  return (
    <div className="px-4 mb-4">
      <p className="text-[11px] text-white/30 font-semibold uppercase tracking-widest mb-2 px-1">
        Próximos
      </p>

      <div className="rounded-2xl bg-[#1A1A1A] border border-white/[0.05] overflow-hidden">
        {/* Income section */}
        {income.length > 0 && (
          <>
            <p className="text-[10px] text-[#F5E642]/50 font-semibold uppercase tracking-widest px-4 pt-3 pb-1">
              Ingresos
            </p>
            {income.map((t, i) => (
              <ScheduledRow
                key={t.id}
                transaction={t}
                category={catMap.get(t.category)}
                isLast={i === income.length - 1 && expenses.length === 0}
                deleting={deleting === t.id}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </>
        )}

        {/* Separator between sections */}
        {income.length > 0 && expenses.length > 0 && (
          <div className="mx-4 border-t border-white/[0.06]" />
        )}

        {/* Expense section */}
        {expenses.length > 0 && (
          <>
            <p className="text-[10px] text-[#FF453A]/50 font-semibold uppercase tracking-widest px-4 pt-3 pb-1">
              Gastos
            </p>
            {expenses.map((t, i) => (
              <ScheduledRow
                key={t.id}
                transaction={t}
                category={catMap.get(t.category)}
                isLast={i === expenses.length - 1}
                deleting={deleting === t.id}
                onDelete={() => handleDelete(t.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function ScheduledRow({
  transaction: t,
  category,
  isLast,
  deleting,
  onDelete,
}: {
  transaction: Transaction;
  category: Category | undefined;
  isLast: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const isIncome = t.type === 'income';
  const amountColor = isIncome ? 'text-[#F5E642]' : 'text-[#FF453A]';

  const dayNum = t.date.getDate();
  const monthShort = t.date.toLocaleDateString('es-AR', { month: 'short' });

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3', !isLast && 'border-b border-white/[0.04]')}>
      {/* Date badge */}
      <div className="w-9 flex-shrink-0 text-center">
        <p className="text-sm font-bold text-white/70 leading-none">{dayNum}</p>
        <p className="text-[9px] text-white/30 uppercase mt-0.5">{monthShort}</p>
      </div>

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">
        {category?.icon ?? '❓'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate">
          {t.subcategory ?? category?.name ?? t.category}
        </p>
        <p className="text-[10px] text-white/30">{ACCOUNT_LABELS[t.account]}</p>
      </div>

      {/* Amount */}
      <p className={cn('text-sm font-bold mono mr-1', amountColor)}>{fmtAmount(t)}</p>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40"
      >
        <Trash2 size={12} className="text-white/35" />
      </button>
    </div>
  );
}
