'use client';

import { useState, useEffect } from 'react';
import { subscribeToScheduledTransactions } from '@/lib/firestore';
import { Transaction } from '@/types';
import { useAuth } from './useAuth';

export function useScheduledTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToScheduledTransactions(user.uid, setTransactions);
    return () => unsubscribe();
  }, [user]);

  return transactions;
}
