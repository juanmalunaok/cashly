'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Transaction, DolarBlueRate, AccountType, CREDIT_ACCOUNTS, ACCOUNT_LABELS } from '@/types';
import { markAllAccountCreditPaid } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const REAL_ACCOUNTS: AccountType[] = ['galicia', 'bbva', 'mercadopago', 'efectivo'];
const CREDIT_ACCOUNT_LIST: AccountType[] = ['galicia_credito', 'bbva_credito', 'mercadopago_credito'];

function fmt(n: number): string {
  return '$' + new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n);
}

interface SpendingPanelProps {
  transactions: Transaction[];       // current month only
  allUnpaidCredit: Transaction[];    // all months, unpaid credit
  rate: DolarBlueRate | null;
}

export default function SpendingPanel({ transactions, allUnpaidCredit, rate }: SpendingPanelProps) {
  const { user } = useAuth();
  const [paying, setPaying] = useState<AccountType | null>(null);

  function toARS(t: Transaction): number {
    return t.currency === 'USD' && rate ? t.amount * rate.venta : t.amount;
  }

  const today = new Date().toDateString();
  const expenses = transactions.filter((t) => t.type === 'expense');
  const paidCredit = expenses.filter((t) => CREDIT_ACCOUNTS.includes(t.account) && t.paid);

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

  // Este mes en crédito (todas las cuotas que vencen este mes, pagas o no)
  const thisMonthCredit = expenses
    .filter((t) => CREDIT_ACCOUNTS.includes(t.account))
    .reduce((sum, t) => sum + toARS(t), 0);

  // Total deuda pendiente en todos los meses
  const totalPending = allUnpaidCredit.reduce((sum, t) => sum + toARS(t), 0);
  const pendingCount = allUnpaidCredit.length;

  // Per-account breakdown from allUnpaidCredit
  const accountBreakdown = CREDIT_ACCOUNT_LIST.map((acc) => {
    const txs = allUnpaidCredit.filter((t) => t.account === acc);
    const total = txs.reduce((sum, t) => sum + toARS(t), 0);
    return { account: acc, total, cuotas: txs.length };
  }).filter((b) => b.total > 0);

  async function handlePayAccount(account: AccountType) {
    if (!user || paying) return;
    setPaying(account);
    try {
      await markAllAccountCreditPaid(user.uid, account);
    } finally {
      setPaying(null);
    }
  }

  return (
    <div className="px-4 mb-4 space-y-2.5">
      {/* Top row: Hoy + Este mes real */}
      <div className="flex gap-2.5">
        <StatCard label="Hoy" sublabel="dinero real" value={fmt(todayReal)} />
        <StatCard label="Este mes" sublabel="dinero real" value={fmt(monthReal)} />
      </div>

      {/* Este mes en crédito */}
      {thisMonthCredit > 0 && (
        <div className="rounded-2xl px-4 py-3 bg-[#1A1A1A] border border-white/[0.05] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">
              Este mes — crédito
            </p>
            <p className="text-[10px] text-white/25 mt-0.5">cuotas que vencen este mes</p>
          </div>
          <p className="text-lg font-bold mono text-[#FF453A]">{fmt(thisMonthCredit)}</p>
        </div>
      )}

      {/* Total pending all months */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3.5 border flex items-center justify-between',
          totalPending > 0
            ? 'bg-[#FF453A]/10 border-[#FF453A]/20'
            : 'bg-[#1A1A1A] border-white/[0.05]'
        )}
      >
        <div>
          <p className="text-[11px] text-white/40 font-semibold uppercase tracking-widest">
            Deuda total tarjetas
          </p>
          <p className="text-[10px] text-white/25 mt-0.5">
            {totalPending > 0
              ? `${pendingCount} cuota${pendingCount !== 1 ? 's' : ''} pendientes en todos los meses`
              : 'Sin deuda pendiente'}
          </p>
        </div>
        <p className={cn('text-xl font-bold mono', totalPending > 0 ? 'text-[#FF453A]' : 'text-white/25')}>
          {fmt(totalPending)}
        </p>
      </div>

      {/* Per-account breakdown with Pagar button */}
      {accountBreakdown.length > 0 && (
        <div className="rounded-2xl bg-[#1A1A1A] border border-white/[0.05] overflow-hidden">
          <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest px-4 pt-3 pb-1">
            Por tarjeta
          </p>
          {accountBreakdown.map((b, i) => (
            <div
              key={b.account}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                i < accountBreakdown.length - 1 ? 'border-b border-white/[0.04]' : ''
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80">{ACCOUNT_LABELS[b.account]}</p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {b.cuotas} cuota{b.cuotas !== 1 ? 's' : ''} pendiente{b.cuotas !== 1 ? 's' : ''}
                </p>
              </div>
              <p className="text-sm font-bold mono text-[#FF453A] mr-2">{fmt(b.total)}</p>
              <button
                onClick={() => handlePayAccount(b.account)}
                disabled={paying === b.account}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95',
                  paying === b.account
                    ? 'bg-[#F5E642]/10 text-[#F5E642]/50'
                    : 'bg-[#F5E642]/20 text-[#F5E642] border border-[#F5E642]/30'
                )}
              >
                <Check size={10} strokeWidth={3} />
                {paying === b.account ? '...' : 'Pagar'}
              </button>
            </div>
          ))}
        </div>
      )}
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
