'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import QuickEntryScreen from '@/components/QuickEntry/QuickEntryScreen';
import TransactionListScreen from '@/components/TransactionList/TransactionListScreen';
import CardsScreen from '@/components/Cards/CardsScreen';
import TabBar from '@/components/UI/TabBar';
import { Suspense } from 'react';

function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'quick' | 'cards' | 'list'>('quick');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'quick') {
      setActiveTab('quick');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'quick' && <QuickEntryScreen />}
        {activeTab === 'cards' && <CardsScreen />}
        {activeTab === 'list' && <TransactionListScreen />}
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
