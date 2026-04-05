'use client';

import { useState, useEffect } from 'react';
import { subscribeToAllUnpaidCredit } from '@/lib/firestore';
import { Transaction } from '@/types';
import { useAuth } from './useAuth';

export function useAllUnpaidCredit() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAllUnpaidCredit(user.uid, setTransactions);
    return () => unsubscribe();
  }, [user]);

  return transactions;
}
