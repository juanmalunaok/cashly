'use client';

import { useState, useEffect } from 'react';
import { subscribeToMonthTransactions } from '@/lib/firestore';
import { Transaction } from '@/types';
import { useAuth } from './useAuth';

export function useTransactions(year: number, month: number) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribe = subscribeToMonthTransactions(user.uid, year, month, (data) => {
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, year, month]);

  return { transactions, loading };
}
