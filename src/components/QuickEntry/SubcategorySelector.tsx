'use client';

import { cn } from '@/lib/utils';

interface SubcategorySelectorProps {
  subcategories: string[];
  value: string | null;
  onChange: (sub: string | null) => void;
}

export default function SubcategorySelector({ subcategories, value, onChange }: SubcategorySelectorProps) {
  return (
    <div className="px-6">
      <p className="text-xs text-white/40 mb-2 ml-1">Subcategoría</p>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((sub) => (
          <button
            key={sub}
            onClick={() => onChange(value === sub ? null : sub)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              'btn-glass',
              value === sub
                ? 'bg-white/20 text-white border-white/20'
                : 'text-white/50'
            )}
          >
            {sub}
          </button>
        ))}
      </div>
    </div>
  );
}
