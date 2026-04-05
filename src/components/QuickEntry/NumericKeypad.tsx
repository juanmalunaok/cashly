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
      <div className="text-center py-5 mb-1">
        <span className="text-white/40 text-2xl font-light mr-1">
          {currency === 'ARS' ? '$' : 'USD'}
        </span>
        <span className="text-white text-5xl font-bold tracking-tight amount-display mono">
          {formatDisplay(display)}
        </span>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-2.5">
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
      className="key-btn"
    >
      {isDelete ? (
        <Delete size={22} strokeWidth={1.5} className="text-white/60" />
      ) : isDot ? (
        <span className="text-3xl font-bold leading-none text-white/70">.</span>
      ) : (
        <span className={cn('text-white/90', 'text-[1.4rem] font-medium')}>{value}</span>
      )}
    </button>
  );
}
