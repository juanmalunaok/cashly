'use client';

import { AccountType, ACCOUNT_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

interface AccountSelectorProps {
  value: AccountType;
  onChange: (account: AccountType) => void;
}

export default function AccountSelector({ value, onChange }: AccountSelectorProps) {
  return (
    <div className="px-6">
      <p className="text-xs text-white/40 mb-2 ml-1">Cuenta</p>
      <div className="grid grid-cols-4 gap-2">
        {ACCOUNT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'py-2 px-1 rounded-xl text-xs font-medium transition-all duration-200 text-center',
              'btn-glass',
              value === opt.value
                ? 'bg-white/20 text-white border-white/20'
                : 'text-white/50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
