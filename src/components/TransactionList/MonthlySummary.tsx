'use client';

import { Transaction, DolarBlueRate } from '@/types';
import GlassCard from '@/components/UI/GlassCard';
import { cn } from '@/lib/utils';

interface MonthlySummaryProps {
  transactions: Transaction[];
  rate: DolarBlueRate | null;
}

function fmt(n: number, currency: 'ARS' | 'USD') {
  if (currency === 'ARS') {
    return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
  }
  return 'USD ' + n.toFixed(2);
}

export default function MonthlySummary({ transactions, rate }: MonthlySummaryProps) {
  const totals = transactions.reduce(
    (acc, t) => {
      const arsAmount = t.currency === 'USD' && rate ? t.amount * rate.venta : t.currency === 'ARS' ? t.amount : 0;
      const usdAmount = t.currency === 'USD' ? t.amount : rate && rate.venta > 0 ? t.amount / rate.venta : 0;

      if (t.type === 'income') {
        acc.incomeARS += arsAmount;
        acc.incomeUSD += usdAmount;
      } else {
        acc.expenseARS += arsAmount;
        acc.expenseUSD += usdAmount;
      }
      return acc;
    },
    { incomeARS: 0, expenseARS: 0, incomeUSD: 0, expenseUSD: 0 }
  );

  const balanceARS = totals.incomeARS - totals.expenseARS;
  const balanceUSD = totals.incomeUSD - totals.expenseUSD;
  const isPositive = balanceARS >= 0;

  return (
    <GlassCard className="mx-4 p-5">
      <div className="space-y-3">
        {/* Income */}
        <SummaryRow
          label="Ingresos"
          amountARS={totals.incomeARS}
          amountUSD={totals.incomeUSD}
          color="text-[#F5E642]"
        />

        {/* Expense */}
        <SummaryRow
          label="Gastos"
          amountARS={totals.expenseARS}
          amountUSD={totals.expenseUSD}
          color="text-[#FF453A]"
        />

        <div className="h-px bg-white/[0.06] mx-0" />

        {/* Balance */}
        <SummaryRow
          label="Balance"
          amountARS={Math.abs(balanceARS)}
          amountUSD={Math.abs(balanceUSD)}
          color={isPositive ? 'text-[#F5E642]' : 'text-[#FF453A]'}
          prefix={isPositive ? '+' : '-'}
          bold
        />
      </div>
    </GlassCard>
  );
}

function SummaryRow({
  label,
  amountARS,
  amountUSD,
  color,
  prefix = '',
  bold,
}: {
  label: string;
  amountARS: number;
  amountUSD: number;
  color: string;
  prefix?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm', bold ? 'font-semibold text-white/90' : 'text-white/50')}>
        {label}
      </span>
      <div className="text-right">
        <p className={cn('mono', bold ? 'text-base font-bold' : 'text-sm font-semibold', color)}>
          {prefix}{fmt(amountARS, 'ARS')}
        </p>
        <p className="text-xs text-white/30 mono">
          {prefix}{fmt(amountUSD, 'USD')}
        </p>
      </div>
    </div>
  );
}
