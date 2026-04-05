import { cn } from '@/lib/utils';

interface GlassButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'glass' | 'primary' | 'income' | 'expense';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}

export default function GlassButton({
  children,
  className,
  onClick,
  variant = 'glass',
  size = 'md',
  disabled,
  type = 'button',
  fullWidth,
}: GlassButtonProps) {
  const variantClass = {
    glass: 'btn-glass text-white/90',
    primary: 'btn-primary text-white',
    income: 'btn-income text-white',
    expense: 'btn-expense text-white',
  }[variant];

  const sizeClass = {
    sm: 'px-4 py-2 text-sm rounded-glass-sm',
    md: 'px-6 py-3 text-base rounded-glass-sm',
    lg: 'px-8 py-4 text-lg rounded-glass-sm font-semibold',
  }[size];

  return (
    <button
      type={type}
      className={cn(
        variantClass,
        sizeClass,
        'font-medium transition-all duration-200',
        fullWidth && 'w-full',
        disabled && 'opacity-40 pointer-events-none',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
