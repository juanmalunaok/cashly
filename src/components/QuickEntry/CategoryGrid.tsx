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
          <p className="text-xs text-white/35 font-medium uppercase tracking-widest mb-3 ml-1">
            Gastos
          </p>
          <div className="grid grid-cols-4 gap-3">
            {expenses.map((cat) => (
              <CategoryButton key={cat.id} category={cat} onSelect={onSelect} />
            ))}
          </div>
        </section>
      )}

      {incomes.length > 0 && (
        <section>
          <p className="text-xs text-white/35 font-medium uppercase tracking-widest mb-3 ml-1">
            Ingresos
          </p>
          <div className="grid grid-cols-4 gap-3">
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
  return (
    <button
      onClick={() => onSelect(category)}
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-[18px]',
        'btn-glass ripple',
        'transition-all duration-200 active:scale-95'
      )}
    >
      <span className="text-3xl leading-none select-none">{category.icon}</span>
      <span className="text-[10px] text-white/65 font-medium text-center leading-tight line-clamp-2">
        {category.name}
      </span>
    </button>
  );
}
