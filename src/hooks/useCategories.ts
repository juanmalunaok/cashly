'use client';

import { useState, useEffect } from 'react';
import { subscribeToCategories } from '@/lib/firestore';
import { Category } from '@/types';
import { useAuth } from './useAuth';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribe = subscribeToCategories(user.uid, (data) => {
      setCategories(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { categories, loading };
}
