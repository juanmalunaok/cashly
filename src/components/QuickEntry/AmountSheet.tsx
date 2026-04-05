'use client';

import { useState, useCallback, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Category, Currency, AccountType, CREDIT_ACCOUNTS } from '@/types';
import { createTransaction } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import BottomSheet from '@/components/UI/BottomSheet';
import NumericKeypad from './NumericKeypad';
import CurrencyToggle from './CurrencyToggle';
import AccountSelector from './AccountSelector';
import SubcategorySelector from './SubcategorySelector';
import InstallmentSelector from './InstallmentSelector';
import ConfirmAnimation from '@/components/UI/ConfirmAnimation';
import { cn } from '@/lib/utils';

interface AmountSheetProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AmountSheet({ category, isOpen, onClose }: AmountSheetProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [account, setAccount] = useState<AccountType>('efectivo');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [installments, setInstallments] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const isScheduled = selectedDate > todayStr;

  const handleKey = useCallback((key: string) => {
    setAmount((prev) => {
      if (key === '⌫') {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      }
      if (key === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }
      if (prev === '0' && key !== '.') return key;
      if (prev.length >= 12) return prev;
      // Limit decimal places to 2
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1];
        if (decimals && decimals.length >= 2) return prev;
      }
      return prev + key;
    });
  }, []);

  function handleClose() {
    setAmount('0');
    setCurrency('ARS');
    setSubcategory(null);
    setNote('');
    setInstallments(1);
    setSelectedDate(todayStr);
    onClose();
  }

  async function handleConfirm() {
    if (!user || !category || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      const isCredit = CREDIT_ACCOUNTS.includes(account);
      const total = parseFloat(amount);
      const cuotas = isCredit ? installments : 1;

      // Parse selected date at noon local time to avoid timezone shifts
      const baseDate = new Date(selectedDate + 'T12:00:00');

      if (cuotas > 1) {
        // Create one transaction per installment, each dated 1 month apart
        const perCuota = Math.round((total / cuotas) * 100) / 100;
        const seriesId = crypto.randomUUID();
        for (let i = 0; i < cuotas; i++) {
          const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, baseDate.getDate(), 12, 0, 0);
          await createTransaction(user.uid, {
            type: category.type,
            amount: perCuota,
            currency,
            category: category.id,
            subcategory: subcategory,
            account,
            note: note.trim() || null,
            installments: cuotas,
            installmentNumber: i + 1,
            seriesId,
            scheduled: isScheduled,
            date,
          });
        }
      } else {
        await createTransaction(user.uid, {
          type: category.type,
          amount: total,
          currency,
          category: category.id,
          subcategory: subcategory,
          account,
          note: note.trim() || null,
          installments: isCredit ? 1 : null,
          installmentNumber: null,
          scheduled: isScheduled,
          date: baseDate,
        });
      }
      setShowConfirm(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!category) return null;

  const isIncome = category.type === 'income';
  const confirmColor = isIncome ? 'btn-income' : 'btn-expense';
  const hasAmount = parseFloat(amount) > 0;

  return (
    <>
      <ConfirmAnimation
        show={showConfirm}
        type={category.type}
        onDone={() => {
          setShowConfirm(false);
          handleClose();
        }}
      />

      <BottomSheet isOpen={isOpen} onClose={handleClose}>
        {/* Category Header */}
        <div className="flex flex-col items-center gap-1 pt-2 pb-4">
          <span className="text-4xl">{category.icon}</span>
          <span className="text-base font-semibold text-white/90">{category.name}</span>
          <span className={cn(
            'text-xs font-medium px-3 py-0.5 rounded-full',
            isIncome ? 'text-[#F5E642] bg-[#F5E642]/15' : 'text-[#FF453A] bg-[#FF453A]/15'
          )}>
            {isIncome ? 'Ingreso' : 'Gasto'}
          </span>
        </div>

        {/* Currency Toggle */}
        <div className="mb-4">
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>

        {/* Numeric Keypad */}
        <NumericKeypad onKey={handleKey} display={amount} currency={currency} />

        {/* Subcategory (only for Casa) */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-4">
            <SubcategorySelector
              subcategories={category.subcategories}
              value={subcategory}
              onChange={setSubcategory}
            />
          </div>
        )}

        {/* Account Selector */}
        <div className="mt-4">
          <AccountSelector value={account} onChange={(a) => { setAccount(a); setInstallments(1); }} />
        </div>

        {/* Installments — solo tarjeta de crédito */}
        {CREDIT_ACCOUNTS.includes(account) && category?.type === 'expense' && (
          <div className="mt-4">
            <InstallmentSelector value={installments} onChange={setInstallments} totalAmount={parseFloat(amount) || 0} />
          </div>
        )}

        {/* Date picker */}
        <div className="px-6 mt-4">
          <label className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer',
            isScheduled
              ? 'bg-[#F5E642]/10 border-[#F5E642]/30'
              : 'glass border-white/[0.08]'
          )}>
            <CalendarDays size={16} className={isScheduled ? 'text-[#F5E642]' : 'text-white/40'} />
            <span className={cn('text-sm flex-1', isScheduled ? 'text-[#F5E642]' : 'text-white/50')}>
              {isScheduled
                ? `Programado para ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`
                : 'Hoy'}
            </span>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value || todayStr)}
              className="opacity-0 absolute w-0 h-0"
            />
          </label>
        </div>

        {/* Note */}
        <div className="px-6 mt-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Agregar nota..."
            maxLength={80}
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'glass border-0',
              'text-white/80 placeholder-white/25 text-sm',
              'focus:outline-none focus:ring-1 focus:ring-white/20'
            )}
          />
        </div>

        {/* Confirm Button */}
        <div className="px-6 mt-5">
          <button
            onClick={handleConfirm}
            disabled={!hasAmount || saving}
            className={cn(
              confirmColor,
              'w-full py-4 rounded-[18px]',
              isIncome ? 'text-black text-lg font-semibold' : 'text-white text-lg font-semibold',
              'transition-all duration-200',
              (!hasAmount || saving) && 'opacity-40 pointer-events-none'
            )}
          >
            {saving ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
