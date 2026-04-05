import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strong?: boolean;
}

export default function GlassCard({ children, className, onClick, strong }: GlassCardProps) {
  return (
    <div
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-glass',
        onClick && 'cursor-pointer ripple',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
