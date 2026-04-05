'use client';

import { AccountType, ACCOUNT_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

interface AccountSelectorProps {
  value: AccountType;
  onChange: (account: AccountType) => void;
}

export default function AccountSelector({ value, onChange }: AccountSelectorProps) {
  const debit = ACCOUNT_OPTIONS.filter((o) => o.group === 'debit');
  const credit = ACCOUNT_OPTIONS.filter((o) => o.group === 'credit');
  const other = ACCOUNT_OPTIONS.filter((o) => o.group === 'cash' || o.group === 'digital');

  return (
    <div className="px-6">
      <p className="text-[11px] text-white/35 font-semibold uppercase tracking-widest mb-2.5 ml-0.5">Cuenta</p>

      <div className="space-y-2">
        {/* Débito */}
        <div className="grid grid-cols-2 gap-2">
          {debit.map((opt) => (
            <AccountBtn key={opt.value} opt={opt} selected={value === opt.value} onChange={onChange} />
          ))}
        </div>

        {/* Crédito (3 opciones) */}
        <div className="grid grid-cols-3 gap-2">
          {credit.map((opt) => (
            <AccountBtn key={opt.value} opt={opt} selected={value === opt.value} onChange={onChange} />
          ))}
        </div>

        {/* Efectivo + MercadoPago */}
        <div className="grid grid-cols-2 gap-2">
          {other.map((opt) => (
            <AccountBtn key={opt.value} opt={opt} selected={value === opt.value} onChange={onChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountBtn({
  opt,
  selected,
  onChange,
}: {
  opt: { value: AccountType; label: string; group: string };
  selected: boolean;
  onChange: (a: AccountType) => void;
}) {
  const isCredit = opt.group === 'credit';
  return (
    <button
      onClick={() => onChange(opt.value)}
      className={cn(
        'py-2.5 px-2 rounded-xl text-xs font-medium transition-all duration-150 text-center',
        selected
          ? isCredit
            ? 'bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30'
            : 'bg-[#F5E642]/20 text-[#F5E642] border border-[#F5E642]/30'
          : 'bg-[#222] border border-white/[0.05] text-white/45',
        'active:scale-95'
      )}
    >
      {opt.label}
    </button>
  );
}
