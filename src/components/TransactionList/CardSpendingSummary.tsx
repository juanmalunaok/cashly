'use client';

import { Transaction, DolarBlueRate, DEBIT_ACCOUNTS, CREDIT_ACCOUNTS } from '@/types';
import { cn } from '@/lib/utils';

interface CardSpendingSummaryProps {
  transactions: Transaction[];
  rate: DolarBlueRate | null;
}

function fmt(n: number): string {
  return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}

export default function CardSpendingSummary({ transactions, rate }: CardSpendingSummaryProps) {
  function toARS(t: Transaction): number {
    return t.currency === 'USD' && rate ? t.amount * rate.venta : t.amount;
  }

  const expenses = transactions.filter((t) => t.type === 'expense');

  const debitTotal = expenses
    .filter((t) => DEBIT_ACCOUNTS.includes(t.account))
    .reduce((sum, t) => sum + toARS(t), 0);

  const creditTotal = expenses
    .filter((t) => CREDIT_ACCOUNTS.includes(t.account))
    .reduce((sum, t) => sum + toARS(t), 0);

  if (debitTotal === 0 && creditTotal === 0) return null;

  const total = debitTotal + creditTotal;
  const debitPct = total > 0 ? (debitTotal / total) * 100 : 50;

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-[#191919] border border-white/[0.06] p-4">
      <p className="text-[11px] text-white/35 font-semibold uppercase tracking-widest mb-3">
        Gastos con tarjeta
      </p>

      <div className="flex gap-2.5 mb-3">
        <CardItem
          label="Débito"
          amount={debitTotal}
          color="text-[#F5E642]"
          accentBg="bg-[#F5E642]/10"
          icon="💳"
        />
        <CardItem
          label="Crédito"
          amount={creditTotal}
          color="text-[#FF453A]"
          accentBg="bg-[#FF453A]/10"
          icon="💳"
        />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="h-1.5 bg-[#FF453A]/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F5E642] rounded-full transition-all duration-500"
            style={{ width: `${debitPct}%` }}
          />
        </div>
      )}
      {total > 0 && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-white/25">Débito {Math.round(debitPct)}%</span>
          <span className="text-[10px] text-white/25">Crédito {Math.round(100 - debitPct)}%</span>
        </div>
      )}
    </div>
  );
}

function CardItem({
  label,
  amount,
  color,
  accentBg,
  icon,
}: {
  label: string;
  amount: number;
  color: string;
  accentBg: string;
  icon: string;
}) {
  return (
    <div className={cn('flex-1 rounded-xl p-3', accentBg)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] text-white/45 font-medium">{label}</span>
      </div>
      <p className={cn('font-bold text-[15px] mono', color)}>{fmt(amount)}</p>
    </div>
  );
}
