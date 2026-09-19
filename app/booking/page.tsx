'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/app/components/Spinner';

export default function BookingPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) setSent(true);
      else setError('We could not submit your request. Please try again.');
    } catch {
      setError('We could not submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className="min-h-screen bg-[#f8fafc] px-6 py-8"><div className="mx-auto max-w-3xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><ArrowLeft size={16} /> Back to Sky-Tech</Link>
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><p className="text-sm font-bold uppercase tracking-widest text-[#3b4fd8]">New connection</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Tell us where to connect you.</h1>
      {sent ? <div className="py-16 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={48} /><h2 className="mt-5 text-xl font-bold">Request received</h2><p className="mt-2 text-slate-500">Our team will review your booking and get in touch shortly.</p><Link href="/" className="mt-7 inline-block rounded-full bg-[#3b4fd8] px-5 py-3 text-sm font-bold text-white">Return home</Link></div> : <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
        {[['name', 'Full name'], ['email', 'Email'], ['contact', 'Contact number'], ['address', 'Installation address'], ['preferredDate', 'Preferred date'], ['preferredTime', 'Preferred time']].map(([name, label]) => <label key={name} className="text-sm font-semibold text-slate-700">{label}<input required name={name} type={name.includes('Date') ? 'date' : name.includes('Time') ? 'time' : 'text'} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none" /></label>)}
        <label className="text-sm font-semibold text-slate-700">Plan<select name="plan" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option>Stream</option><option>Velocity</option><option>Hyperlink</option></select></label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Message<textarea name="message" rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none" /></label>
        {error && <p className="sm:col-span-2 text-sm font-semibold text-red-600">{error}</p>}
        <button disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b4fd8] px-5 py-3 font-bold text-white sm:col-span-2">{isSubmitting && <Spinner />}{isSubmitting ? 'Submitting...' : 'Submit booking request'}</button>
      </form>}
    </div>
  </div></main>;
}
