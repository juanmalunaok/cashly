'use client';

import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  categories: Category[];
  onSelect: (category: Category) => void;
  type?: 'expense' | 'income' | 'all';
}

export default function CategoryGrid({ categories, onSelect, type = 'all' }: CategoryGridProps) {
  const filtered = type === 'all'
    ? categories
    : categories.filter((c) => c.type === type);

  const expenses = filtered.filter((c) => c.type === 'expense');
  const incomes = filtered.filter((c) => c.type === 'income');

  return (
    <div className="px-4 space-y-5">
      {expenses.length > 0 && (
        <section>
          <p className="text-[11px] text-white/30 font-semibold uppercase tracking-widest mb-3 ml-1">
            Gastos
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {expenses.map((cat) => (
              <CategoryButton key={cat.id} category={cat} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      {incomes.length > 0 && (
        <section>
          <p className="text-[11px] text-white/30 font-semibold uppercase tracking-widest mb-3 ml-1">
            Ingresos
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {incomes.map((cat) => (
              <CategoryButton key={cat.id} category={cat} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CategoryButton({
  category,
  onSelect,
}: {
  category: Category;
  onSelect: (c: Category) => void;
}) {
  const isIncome = category.type === 'income';

  return (
    <button
      onClick={() => onSelect(category)}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-[16px]',
        'bg-[#1E1E1E] border border-white/[0.05]',
        'transition-all duration-150 active:scale-93 active:bg-[#272727]',
        'relative overflow-hidden'
      )}
    >
      {isIncome && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F5E642] opacity-60" />
      )}
      <span className="text-[28px] leading-none select-none">{category.icon}</span>
      <span className="text-[10px] text-white/60 font-medium text-center leading-tight line-clamp-2">
        {category.name}
      </span>
    </button>
  );
}
