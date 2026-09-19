'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Zap } from 'lucide-react';
import { Spinner } from '@/app/components/Spinner';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();

  async function loginAs(email: string, password: string) {
    setError('');
    setIsSigningIn(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Demo accounts are not seeded yet. Run npm run db:push and npm run db:seed.');
      setIsSigningIn(false);
      return;
    }
    const role = email.startsWith('admin') ? 'admin' : email.startsWith('tech') ? 'technician' : 'subscriber';
    router.push(role === 'admin' ? '/dashboard' : role === 'technician' ? '/my-tasks' : '/my-account');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await loginAs(String(values.email), String(values.password));
  }

  return <main className="grid min-h-screen bg-[#f8fafc] lg:grid-cols-2">
    <div className="hidden bg-[#0f172a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <Link href="/" className="flex items-center gap-3 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#3b4fd8]"><Zap size={18} fill="currentColor" /></span>Sky-Tech ISP</Link>
      <div><p className="max-w-md text-5xl font-bold leading-tight">Your connection, under your control.</p><p className="mt-5 max-w-md leading-7 text-slate-400">Track service, bills, support, and installations from one calm workspace.</p></div>
      <p className="text-sm text-slate-500">Reliable by design.</p>
    </div>
    <div className="flex items-center justify-center p-6"><div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">Welcome back.</h1><p className="mt-2 text-slate-500">Sign in to your Sky-Tech workspace.</p>
      <div className="mt-8 grid grid-cols-3 gap-2">
        {[['admin@skytech.net', 'admin123', 'Admin demo'], ['tech@skytech.net', 'tech123', 'Technician demo'], ['user1@skytech.net', 'user123', 'Subscriber demo']].map(([email, password, label]) => <button key={email} type="button" disabled={isSigningIn} onClick={() => loginAs(email, password)} className="rounded-xl bg-blue-50 px-2 py-3 text-xs font-bold text-[#3b4fd8]">{label}</button>)}
      </div>
      <div className="my-7 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or sign in manually<span className="h-px flex-1 bg-slate-200" /></div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-semibold">Email<input name="email" type="email" required placeholder="you@skytech.net" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none" /></label>
        <label className="block text-sm font-semibold">Password<input name="password" type="password" required placeholder="Password" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none" /></label>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button disabled={isSigningIn} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3b4fd8] px-5 py-3.5 font-bold text-white"><LockKeyhole size={17} />{isSigningIn ? <><Spinner />Signing in...</> : 'Sign in'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-400">Demo accounts: admin123, tech123, user123</p>
    </div></div>
  </main>;
}
