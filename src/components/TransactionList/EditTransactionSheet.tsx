'use client';

import { useState, useCallback, useEffect } from 'react';
import { Transaction, Category, Currency, AccountType } from '@/types';
import { updateTransaction } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import BottomSheet from '@/components/UI/BottomSheet';
import NumericKeypad from '@/components/QuickEntry/NumericKeypad';
import CurrencyToggle from '@/components/QuickEntry/CurrencyToggle';
import AccountSelector from '@/components/QuickEntry/AccountSelector';
import SubcategorySelector from '@/components/QuickEntry/SubcategorySelector';
import ConfirmAnimation from '@/components/UI/ConfirmAnimation';
import { cn } from '@/lib/utils';

interface EditTransactionSheetProps {
  transaction: Transaction | null;
  category: Category | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTransactionSheet({
  transaction,
  category,
  isOpen,
  onClose,
}: EditTransactionSheetProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('0');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [account, setAccount] = useState<AccountType>('efectivo');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount));
      setCurrency(transaction.currency);
      setAccount(transaction.account);
      setSubcategory(transaction.subcategory);
      setNote(transaction.note ?? '');
    }
  }, [transaction]);

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
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1];
        if (decimals && decimals.length >= 2) return prev;
      }
      return prev + key;
    });
  }, []);

  async function handleSave() {
    if (!user || !transaction || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      await updateTransaction(user.uid, transaction.id, {
        amount: parseFloat(amount),
        currency,
        account,
        subcategory,
        note: note.trim() || null,
      });
      setShowConfirm(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!transaction || !category) return null;

  const isIncome = transaction.type === 'income';
  const confirmColor = isIncome ? 'btn-income' : 'btn-expense';
  const hasAmount = parseFloat(amount) > 0;

  return (
    <>
      <ConfirmAnimation
        show={showConfirm}
        type={transaction.type}
        onDone={() => {
          setShowConfirm(false);
          onClose();
        }}
      />

      <BottomSheet isOpen={isOpen} onClose={onClose} title="Editar movimiento">
        {/* Category Header */}
        <div className="flex flex-col items-center gap-1 pt-2 pb-4">
          <span className="text-4xl">{category.icon}</span>
          <span className="text-base font-semibold text-white/90">{category.name}</span>
        </div>

        <div className="mb-4">
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>

        <NumericKeypad onKey={handleKey} display={amount} currency={currency} />

        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-4">
            <SubcategorySelector
              subcategories={category.subcategories}
              value={subcategory}
              onChange={setSubcategory}
            />
          </div>
        )}

        <div className="mt-4">
          <AccountSelector value={account} onChange={setAccount} />
        </div>

        <div className="px-6 mt-4">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Agregar nota..."
            maxLength={80}
            className={cn(
              'w-full px-4 py-3 rounded-xl glass border-0',
              'text-white/80 placeholder-white/25 text-sm',
              'focus:outline-none focus:ring-1 focus:ring-white/20'
            )}
          />
        </div>

        <div className="px-6 mt-5">
          <button
            onClick={handleSave}
            disabled={!hasAmount || saving}
            className={cn(
              confirmColor,
              'w-full py-4 rounded-[18px]',
              'text-white text-lg font-semibold',
              'transition-all duration-200',
              (!hasAmount || saving) && 'opacity-40 pointer-events-none'
            )}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
