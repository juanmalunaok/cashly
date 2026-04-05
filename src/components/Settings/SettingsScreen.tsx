'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  LogOut,
  Download,
  Tag,
  CreditCard,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { signOut } from '@/lib/auth';
import { exportTransactionsCSV, createCategory, deleteCategory } from '@/lib/firestore';
import GlassCard from '@/components/UI/GlassCard';
import { cn } from '@/lib/utils';
import { DEFAULT_CATEGORIES } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories } = useCategories();
  const [showCategories, setShowCategories] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  async function handleExportCSV() {
    if (!user) return;
    setExporting(true);
    try {
      const csv = await exportTransactionsCSV(user.uid);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cashly-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!user) return;
    await deleteCategory(user.uid, id);
  }

  return (
    <div className="flex flex-col min-h-dvh safe-top">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-6">
        <button
          onClick={() => router.back()}
          className="btn-glass w-10 h-10 rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white/70" />
        </button>
        <h1 className="text-xl font-bold text-white/90">Configuración</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-4 pb-8">
        {/* User info */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl">
              {user?.displayName?.charAt(0)?.toUpperCase() ?? '👤'}
            </div>
            <div>
              <p className="font-semibold text-white/90">{user?.displayName ?? 'Usuario'}</p>
              <p className="text-xs text-white/40">{user?.email}</p>
            </div>
          </div>
        </GlassCard>

        {/* Categories */}
        <div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full"
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0A84FF]/20 flex items-center justify-center">
                    <Tag size={18} className="text-[#0A84FF]" />
                  </div>
                  <span className="text-sm font-medium text-white/80">Categorías</span>
                </div>
                <ChevronRight
                  size={16}
                  className={cn(
                    'text-white/30 transition-transform duration-200',
                    showCategories && 'rotate-90'
                  )}
                />
              </div>
            </GlassCard>
          </button>

          {showCategories && (
            <div className="mt-2 space-y-2 animate-fade-in">
              {categories.map((cat) => (
                <GlassCard key={cat.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm text-white/80">{cat.name}</p>
                      <p className="text-[10px] text-white/30">
                        {cat.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-[#FF453A]/70 text-xs px-3 py-1 rounded-lg glass"
                  >
                    Eliminar
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Export CSV */}
        <button onClick={handleExportCSV} className="w-full" disabled={exporting}>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#30D158]/20 flex items-center justify-center">
                  <Download size={18} className="text-[#30D158]" />
                </div>
                <span className="text-sm font-medium text-white/80">
                  {exporting ? 'Exportando...' : 'Exportar datos (CSV)'}
                </span>
              </div>
              <ChevronRight size={16} className="text-white/30" />
            </div>
          </GlassCard>
        </button>

        {/* Version */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Info size={18} className="text-white/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Versión</p>
              <p className="text-xs text-white/30">Cashly v0.1.0 — MVP</p>
            </div>
          </div>
        </GlassCard>

        {/* Sign Out */}
        <button onClick={handleSignOut} className="w-full">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF453A]/20 flex items-center justify-center">
                <LogOut size={18} className="text-[#FF453A]" />
              </div>
              <span className="text-sm font-medium text-[#FF453A]">Cerrar sesión</span>
            </div>
          </GlassCard>
        </button>
      </div>
    </div>
  );
}
