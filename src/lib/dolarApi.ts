import { DolarBlueRate } from '@/types';

const CACHE_KEY = 'cashly_dolar_blue';
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

interface CachedRate {
  rate: DolarBlueRate;
  cachedAt: number;
}

export async function getDolarBlueRate(): Promise<DolarBlueRate | null> {
  try {
    // Check cache
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRate = JSON.parse(cached);
        if (Date.now() - parsed.cachedAt < CACHE_TTL) {
          return parsed.rate;
        }
      }
    }

    const response = await fetch('https://dolarapi.com/v1/dolares/blue', {
      next: { revalidate: 3600 },
    });

    if (!response.ok) throw new Error('Failed to fetch dolar rate');

    const data = await response.json();
    const rate: DolarBlueRate = {
      compra: data.compra,
      venta: data.venta,
      fechaActualizacion: data.fechaActualizacion,
    };

    // Save to cache
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ rate, cachedAt: Date.now() })
      );
    }

    return rate;
  } catch (error) {
    console.error('Error fetching dolar blue rate:', error);
    return null;
  }
}

export function usdToArs(usd: number, rate: DolarBlueRate): number {
  return usd * rate.venta;
}

export function arsToUsd(ars: number, rate: DolarBlueRate): number {
  return ars / rate.venta;
}
