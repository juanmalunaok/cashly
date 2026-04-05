'use client';

import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericKeypadProps {
  onKey: (key: string) => void;
  display: string;
  currency: string;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '⌫'],
];

export default function NumericKeypad({ onKey, display, currency }: NumericKeypadProps) {
  function formatDisplay(val: string): string {
    if (!val || val === '0') return '0';
    const parts = val.split('.');
    const intPart = parseInt(parts[0]).toLocaleString('es-AR');
    if (parts.length > 1) {
      return `${intPart},${parts[1]}`;
    }
    return intPart;
  }

  return (
    <div className="px-4">
      {/* Amount Display */}
      <div className="text-center py-4 mb-2">
        <span className="text-white/40 text-2xl font-light mr-1">
          {currency === 'ARS' ? '$' : 'USD'}
        </span>
        <span className="text-white text-5xl font-bold tracking-tight amount-display mono">
          {formatDisplay(display)}
        </span>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.flat().map((key) => (
          <KeyButton key={key} value={key} onPress={() => onKey(key)} />
        ))}
      </div>
    </div>
  );
}

function KeyButton({ value, onPress }: { value: string; onPress: () => void }) {
  const isDelete = value === '⌫';
  const isDot = value === '.';

  return (
    <button
      onClick={onPress}
      className={cn(
        'btn-glass h-[62px] rounded-[14px]',
        'flex items-center justify-center',
        'text-white font-medium',
        isDelete ? 'text-white/60' : 'text-2xl',
        'active:bg-white/15 transition-all duration-100',
        'active:scale-95'
      )}
    >
      {isDelete ? (
        <Delete size={22} strokeWidth={1.5} className="text-white/70" />
      ) : isDot ? (
        <span className="text-3xl leading-none">.</span>
      ) : (
        value
      )}
    </button>
  );
}
