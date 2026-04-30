'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Store, Check } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch {
      setError('Invalid username or password');
      setPassword('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#021233] via-[#06276a] to-[#0b2f75] px-4 py-8">
      <div className="w-full max-w-md rounded-4xl bg-white px-10 py-8 shadow-[0_32px_80px_rgba(15,23,42,0.55)]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-linear-to-br from-[#2f67ff] to-[#1f4fe0] text-white shadow-[0_18px_40px_rgba(37,99,235,0.65)]">
              <Store className="h-11 w-11" strokeWidth={2.2} />
            </div>
            <div className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-[#16a34a] text-white shadow-[0_0_0_3px_white]">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
          </div>

          <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            Sari-Sari Store
          </h1>
          <p className="mt-1 text-center text-sm font-medium text-slate-500">
            Utang Reminder
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Username
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <User className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-10 py-3 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/70 min-h-11"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-10 py-3 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/70 min-h-11"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-4 flex w-full min-h-11 items-center justify-center rounded-xl bg-[#2563ff] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.65)] transition hover:bg-[#1d4fd8]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
