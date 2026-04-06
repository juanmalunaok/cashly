'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useDolarBlue } from '@/hooks/useDolarBlue';
import { CREDIT_ACCOUNTS, ACCOUNT_LABELS, AccountType, Transaction } from '@/types';
import { getMonthName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import MonthSelector from '@/components/TransactionList/MonthSelector';

function fmt(n: number): string {
  return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}

const CARD_STYLES: Record<string, { text: string; bar: string; badge: string }> = {
  galicia_credito: {
    text: 'text-[#FF453A]',
    bar: 'bg-[#FF453A]',
    badge: 'bg-[#FF453A]/15 text-[#FF453A]',
  },
  bbva_credito: {
    text: 'text-[#0A84FF]',
    bar: 'bg-[#0A84FF]',
    badge: 'bg-[#0A84FF]/15 text-[#0A84FF]',
  },
  mercadopago_credito: {
    text: 'text-[#30D158]',
    bar: 'bg-[#30D158]',
    badge: 'bg-[#30D158]/15 text-[#30D158]',
  },
};

export default function CardsScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const { transactions, loading } = useTransactions(year, month);
  const { rate } = useDolarBlue();

  function toARS(t: Transaction): number {
    return t.currency === 'USD' && rate ? t.amount * rate.venta : t.amount;
  }

  const creditExpenses = transactions.filter(
    (t) => t.type === 'expense' && CREDIT_ACCOUNTS.includes(t.account)
  );

  const totalCredit = creditExpenses.reduce((sum, t) => sum + toARS(t), 0);
  const totalPaid = creditExpenses.filter((t) => t.paid).reduce((sum, t) => sum + toARS(t), 0);
  const totalPending = totalCredit - totalPaid;
  const paidPct = totalCredit > 0 ? (totalPaid / totalCredit) * 100 : 0;

  const perCard = CREDIT_ACCOUNTS.map((acc) => {
    const txs = creditExpenses.filter((t) => t.account === acc);
    const total = txs.reduce((sum, t) => sum + toARS(t), 0);
    const paid = txs.filter((t) => t.paid).reduce((sum, t) => sum + toARS(t), 0);
    return {
      account: acc as AccountType,
      total,
      paid,
      pending: total - paid,
      count: txs.length,
      paidPct: total > 0 ? (paid / total) * 100 : 0,
    };
  }).filter((c) => c.total > 0);

  return (
    <div className="safe-top">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="text-xl font-bold text-white/90">Tarjetas</h1>
        <p className="text-xs text-white/40 mt-0.5">Gastos de crédito por mes</p>
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
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw size={24} className="text-white/30 animate-spin" />
          </div>
        ) : totalCredit === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="text-4xl">💳</span>
            <p className="text-white/30 text-sm">Sin gastos en tarjetas este mes</p>
          </div>
        ) : (
          <>
            {/* Total resumen */}
            <div className="mx-4 mb-4 rounded-2xl bg-[#1A1A1A] border border-white/[0.05] p-4">
              <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-2">
                Total tarjetas — {getMonthName(month)}
              </p>
              <p className="text-3xl font-bold mono text-white mb-3">{fmt(totalCredit)}</p>

              <div className="flex gap-5 mb-3">
                <div>
                  <p className="text-[10px] text-white/30 mb-0.5">Pagado</p>
                  <p className="text-sm font-bold mono text-[#F5E642]">{fmt(totalPaid)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 mb-0.5">Pendiente</p>
                  <p className="text-sm font-bold mono text-[#FF453A]">{fmt(totalPending)}</p>
                </div>
              </div>

              {/* Progress bar: paid portion */}
              <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5E642] rounded-full transition-all duration-500"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-white/25">Pagado {Math.round(paidPct)}%</span>
                <span className="text-[10px] text-white/25">Pendiente {Math.round(100 - paidPct)}%</span>
              </div>
            </div>

            {/* Por tarjeta */}
            <p className="text-[11px] text-white/30 font-semibold uppercase tracking-widest px-4 mb-2">
              Por tarjeta
            </p>
            <div className="mx-4 space-y-2">
              {perCard.map((card) => {
                const s = CARD_STYLES[card.account] ?? {
                  text: 'text-white/60',
                  bar: 'bg-white/40',
                  badge: 'bg-white/10 text-white/50',
                };
                return (
                  <div
                    key={card.account}
                    className="rounded-2xl bg-[#1A1A1A] border border-white/[0.05] p-4"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-white/90">
                          {ACCOUNT_LABELS[card.account]}
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {card.count} movimiento{card.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className={cn('text-lg font-bold mono', s.text)}>{fmt(card.total)}</p>
                    </div>

                    {/* Paid / Pending */}
                    <div className="flex gap-4 mb-3">
                      <div className={cn('flex-1 rounded-xl px-3 py-2', 'bg-[#F5E642]/10')}>
                        <p className="text-[10px] text-white/30 mb-0.5">Pagado</p>
                        <p className="text-sm font-bold mono text-[#F5E642]">{fmt(card.paid)}</p>
                      </div>
                      <div className={cn('flex-1 rounded-xl px-3 py-2', 'bg-[#FF453A]/10')}>
                        <p className="text-[10px] text-white/30 mb-0.5">Pendiente</p>
                        <p className="text-sm font-bold mono text-[#FF453A]">{fmt(card.pending)}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-500', s.bar)}
                        style={{ width: `${card.paidPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
