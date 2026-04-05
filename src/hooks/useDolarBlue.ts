'use client';

import { useState, useEffect } from 'react';
import { getDolarBlueRate } from '@/lib/dolarApi';
import { DolarBlueRate } from '@/types';

export function useDolarBlue() {
  const [rate, setRate] = useState<DolarBlueRate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDolarBlueRate().then((data) => {
      setRate(data);
      setLoading(false);
    });
  }, []);

  return { rate, loading };
}
