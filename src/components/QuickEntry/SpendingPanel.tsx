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
  const expenses = transactions.filter((t) => t.type === 'expense');

  // Crédito pagado = ya salió plata real
  const paidCredit = expenses.filter((t) => CREDIT_ACCOUNTS.includes(t.account) && t.paid);
  const pendingCredit = expenses.filter((t) => CREDIT_ACCOUNTS.includes(t.account) && !t.paid);

  // Dinero real = efectivo/débito/mp + crédito ya pagado
  const todayReal = expenses
    .filter((t) =>
      (REAL_ACCOUNTS.includes(t.account) || (CREDIT_ACCOUNTS.includes(t.account) && t.paid)) &&
      t.date.toDateString() === today
    )
    .reduce((sum, t) => sum + toARS(t), 0);

  const monthReal = [
    ...expenses.filter((t) => REAL_ACCOUNTS.includes(t.account)),
    ...paidCredit,
  ].reduce((sum, t) => sum + toARS(t), 0);

  const monthPending = pendingCredit.reduce((sum, t) => sum + toARS(t), 0);

  return (
    <div className="px-4 mb-4">
      {/* Top row: Hoy + Mes */}
      <div className="flex gap-2.5 mb-2.5">
        <StatCard label="Hoy" sublabel="dinero real" value={fmt(todayReal)} />
        <StatCard label="Este mes" sublabel="dinero real" value={fmt(monthReal)} />
      </div>

      {/* Credit card pending */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3.5 border flex items-center justify-between',
          monthPending > 0
            ? 'bg-[#FF453A]/10 border-[#FF453A]/20'
            : 'bg-[#1A1A1A] border-white/[0.05]'
        )}
      >
        <div>
          <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">
            Crédito pendiente
          </p>
          <p className="text-[10px] text-white/25 mt-0.5">
            {monthPending > 0
              ? 'Marcá como pagado cuando cierre la tarjeta'
              : 'Sin deuda pendiente de tarjeta'}
          </p>
        </div>
        <p className={cn('text-xl font-bold mono', monthPending > 0 ? 'text-[#FF453A]' : 'text-white/25')}>
          {fmt(monthPending)}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, sublabel, value }: { label: string; sublabel: string; value: string }) {
  return (
    <div className="flex-1 rounded-2xl px-4 py-3.5 bg-[#1A1A1A] border border-white/[0.05]">
      <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-bold mono text-white">{value}</p>
      <p className="text-[10px] text-white/25 mt-0.5">{sublabel}</p>
    </div>
  );
}
