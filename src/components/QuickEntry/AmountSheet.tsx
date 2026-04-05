'use client';

import { useState, useCallback } from 'react';
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
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    onClose();
  }

  async function handleConfirm() {
    if (!user || !category || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      const isCredit = CREDIT_ACCOUNTS.includes(account);
      await createTransaction(user.uid, {
        type: category.type,
        amount: parseFloat(amount),
        currency,
        category: category.id,
        subcategory: subcategory,
        account,
        note: note.trim() || null,
        installments: isCredit ? installments : null,
        date: new Date(),
      });
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
            <InstallmentSelector value={installments} onChange={setInstallments} />
          </div>
        )}

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
