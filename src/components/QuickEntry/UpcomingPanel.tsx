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

function fmtMoney(n: number): string {
  return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}

interface UpcomingPanelProps {
  scheduled: Transaction[];
  categories: Category[];
}

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

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

  // Group by year-month
  const grouped = new Map<string, Transaction[]>();
  for (const t of scheduled) {
    const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(t);
  }
  const sortedKeys = Array.from(grouped.keys()).sort();

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  return (
    <div className="px-4 mb-4">
      <p className="text-[11px] text-white/30 font-semibold uppercase tracking-widest mb-2 px-1">
        Próximos
      </p>

      <div className="flex flex-col gap-3">
        {sortedKeys.map((key) => {
          const [y, m] = key.split('-').map(Number);
          const txs = grouped.get(key)!;
          const income = txs.filter((t) => t.type === 'income');
          const expenses = txs.filter((t) => t.type === 'expense');
          const totalIncome = income.reduce((s, t) => s + t.amount, 0);
          const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
          const net = totalIncome - totalExpenses;

          const isThisMonth = y === thisYear && m === thisMonth;
          const label = isThisMonth
            ? 'Este mes'
            : `${MONTH_NAMES[m]} ${y !== thisYear ? y : ''}`.trim();

          return (
            <div key={key} className="rounded-2xl bg-[#1A1A1A] border border-white/[0.05] overflow-hidden">
              {/* Month header + totals */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/[0.05]">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
                <div className="flex items-center gap-3">
                  {totalIncome > 0 && (
                    <span className="text-[11px] font-bold text-[#F5E642]">+{fmtMoney(totalIncome)}</span>
                  )}
                  {totalExpenses > 0 && (
                    <span className="text-[11px] font-bold text-[#FF453A]">-{fmtMoney(totalExpenses)}</span>
                  )}
                  <span className={cn('text-[11px] font-bold', net >= 0 ? 'text-white/50' : 'text-[#FF453A]/70')}>
                    {net >= 0 ? '+' : ''}{fmtMoney(net)}
                  </span>
                </div>
              </div>

              {/* Income rows */}
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

              {income.length > 0 && expenses.length > 0 && (
                <div className="mx-4 border-t border-white/[0.06]" />
              )}

              {/* Expense rows */}
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
            </div>
          );
        })}
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
      <div className="w-9 flex-shrink-0 text-center">
        <p className="text-sm font-bold text-white/70 leading-none">{dayNum}</p>
        <p className="text-[9px] text-white/30 uppercase mt-0.5">{monthShort}</p>
      </div>

      <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg flex-shrink-0">
        {category?.icon ?? '❓'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate">
          {t.subcategory ?? category?.name ?? t.category}
        </p>
        <p className="text-[10px] text-white/30">{ACCOUNT_LABELS[t.account]}</p>
      </div>

      <p className={cn('text-sm font-bold mono mr-1', amountColor)}>{fmtAmount(t)}</p>

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
