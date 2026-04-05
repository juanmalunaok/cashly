'use client';

import { Transaction, DolarBlueRate, AccountType, CREDIT_ACCOUNTS } from '@/types';
import { cn } from '@/lib/utils';

const REAL_ACCOUNTS: AccountType[] = ['galicia', 'bbva', 'mercadopago', 'efectivo'];

function fmt(n: number): string {
  return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}

interface SpendingPanelProps {
  transactions: Transaction[];
  rate: DolarBlueRate | null;
}

export default function SpendingPanel({ transactions, rate }: SpendingPanelProps) {
  function toARS(t: Transaction): number {
    return t.currency === 'USD' && rate ? t.amount * rate.venta : t.amount;
  }

  const today = new Date().toDateString();

  const todayReal = transactions
    .filter((t) => t.type === 'expense' && REAL_ACCOUNTS.includes(t.account) && t.date.toDateString() === today)
    .reduce((sum, t) => sum + toARS(t), 0);

  const monthReal = transactions
    .filter((t) => t.type === 'expense' && REAL_ACCOUNTS.includes(t.account))
    .reduce((sum, t) => sum + toARS(t), 0);

  const monthCredit = transactions
    .filter((t) => t.type === 'expense' && CREDIT_ACCOUNTS.includes(t.account))
    .reduce((sum, t) => sum + toARS(t), 0);

  return (
    <div className="px-4 mb-4">
      {/* Top row: Hoy + Mes */}
      <div className="flex gap-2.5 mb-2.5">
        <StatCard
          label="Hoy"
          sublabel="dinero real"
          value={fmt(todayReal)}
          color="text-white"
          bg="bg-[#1A1A1A]"
          accent={false}
        />
        <StatCard
          label="Este mes"
          sublabel="dinero real"
          value={fmt(monthReal)}
          color="text-white"
          bg="bg-[#1A1A1A]"
          accent={false}
        />
      </div>

      {/* Credit card debt */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3.5 border flex items-center justify-between',
          monthCredit > 0
            ? 'bg-[#FF453A]/10 border-[#FF453A]/20'
            : 'bg-[#1A1A1A] border-white/[0.05]'
        )}
      >
        <div>
          <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">
            Crédito — a pagar
          </p>
          <p className="text-[10px] text-white/25 mt-0.5">
            {monthCredit > 0 ? 'Se debita cuando cierra la tarjeta' : 'Sin gastos en tarjeta de crédito'}
          </p>
        </div>
        <p className={cn(
          'text-xl font-bold mono',
          monthCredit > 0 ? 'text-[#FF453A]' : 'text-white/25'
        )}>
          {fmt(monthCredit)}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  sublabel,
  value,
  color,
  bg,
  accent,
}: {
  label: string;
  sublabel: string;
  value: string;
  color: string;
  bg: string;
  accent: boolean;
}) {
  return (
    <div className={cn('flex-1 rounded-2xl px-4 py-3.5 border border-white/[0.05]', bg)}>
      <div className="flex items-center gap-1.5 mb-1">
        {accent && <div className="w-1.5 h-1.5 rounded-full bg-[#F5E642]" />}
        <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">{label}</p>
      </div>
      <p className={cn('text-xl font-bold mono', color)}>{value}</p>
      <p className="text-[10px] text-white/25 mt-0.5">{sublabel}</p>
    </div>
  );
}
