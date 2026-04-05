'use client';

import { Zap, CreditCard, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabBarProps {
  activeTab: 'quick' | 'cards' | 'list';
  onTabChange: (tab: 'quick' | 'cards' | 'list') => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="glass-sheet border-t border-white/[0.06] safe-bottom">
      <div className="flex items-center justify-around px-6 pt-2 pb-2">
        <TabItem
          icon={<Zap size={22} />}
          label="Carga"
          active={activeTab === 'quick'}
          onClick={() => onTabChange('quick')}
        />
        <TabItem
          icon={<CreditCard size={22} />}
          label="Tarjetas"
          active={activeTab === 'cards'}
          onClick={() => onTabChange('cards')}
        />
        <TabItem
          icon={<List size={22} />}
          label="Listado"
          active={activeTab === 'list'}
          onClick={() => onTabChange('list')}
        />
      </div>
    </div>
  );
}

function TabItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200',
        'min-w-[80px]',
        active ? 'text-[#0A84FF]' : 'text-white/40'
      )}
    >
      <div className={cn(
        'transition-transform duration-200',
        active && 'scale-110'
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
