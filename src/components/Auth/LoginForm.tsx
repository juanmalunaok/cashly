'use client';

import { useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '@/lib/auth';
import GlassButton from '@/components/UI/GlassButton';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">💰</div>
        <h1 className="text-4xl font-bold text-white/90 tracking-tight">Cashly</h1>
        <p className="text-white/50 text-sm mt-2">Control de gastos personal</p>
      </div>

      {/* Card */}
      <div className="glass rounded-glass p-6">
        {/* Mode Toggle */}
        <div className="flex glass rounded-xl p-1 mb-6">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                mode === m
                  ? 'bg-white/15 text-white'
                  : 'text-white/50'
              )}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-white/50 mb-1 ml-1">Nombre</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                required
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'glass border-0',
                  'text-white/90 placeholder-white/30 text-sm',
                  'focus:outline-none focus:ring-1 focus:ring-white/20'
                )}
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-white/50 mb-1 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className={cn(
                'w-full px-4 py-3 rounded-xl',
                'glass border-0',
                'text-white/90 placeholder-white/30 text-sm',
                'focus:outline-none focus:ring-1 focus:ring-white/20'
              )}
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={cn(
                'w-full px-4 py-3 rounded-xl',
                'glass border-0',
                'text-white/90 placeholder-white/30 text-sm',
                'focus:outline-none focus:ring-1 focus:ring-white/20'
              )}
            />
          </div>

          {error && (
            <p className="text-[#FF453A] text-sm text-center animate-fade-in">{error}</p>
          )}

          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </GlassButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">o</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className={cn(
            'btn-glass w-full py-3 rounded-xl',
            'flex items-center justify-center gap-3',
            'text-white/80 text-sm font-medium',
            loading && 'opacity-40 pointer-events-none'
          )}
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function friendlyError(msg: string): string {
  if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
    return 'Email o contraseña incorrectos';
  }
  if (msg.includes('email-already-in-use')) {
    return 'Este email ya está en uso';
  }
  if (msg.includes('weak-password')) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (msg.includes('popup-closed')) {
    return 'Se cerró la ventana de Google';
  }
  return 'Ocurrió un error. Intentá de nuevo.';
}
