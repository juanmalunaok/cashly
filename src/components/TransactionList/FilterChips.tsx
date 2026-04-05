'use client';

import { Category, AccountType, ACCOUNT_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface FilterChipsProps {
  categories: Category[];
  selectedCategory: string | null;
  selectedAccount: AccountType | null;
  onCategoryChange: (id: string | null) => void;
  onAccountChange: (account: AccountType | null) => void;
}

export default function FilterChips({
  categories,
  selectedCategory,
  selectedAccount,
  onCategoryChange,
  onAccountChange,
}: FilterChipsProps) {
  const accounts: AccountType[] = ['mercadopago', 'galicia', 'bbva', 'efectivo'];

  return (
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-1">
      {/* All */}
      <Chip
        label="Todos"
        active={!selectedCategory && !selectedAccount}
        onClick={() => {
          onCategoryChange(null);
          onAccountChange(null);
        }}
      />

      {/* Categories */}
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          label={`${cat.icon} ${cat.name}`}
          active={selectedCategory === cat.id}
          onClick={() => onCategoryChange(selectedCategory === cat.id ? null : cat.id)}
        />
      ))}

      {/* Divider */}
      <div className="w-px h-6 bg-white/10 self-center flex-shrink-0" />

      {/* Accounts */}
      {accounts.map((acc) => (
        <Chip
          key={acc}
          label={ACCOUNT_LABELS[acc]}
          active={selectedAccount === acc}
          onClick={() => onAccountChange(selectedAccount === acc ? null : acc)}
        />
      ))}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium',
        'transition-all duration-200',
        'btn-glass',
        active ? 'bg-white/20 text-white' : 'text-white/50'
      )}
    >
      {label}
    </button>
  );
}
