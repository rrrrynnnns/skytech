'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronRight, FileText, Plus, Router, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';
import { Badge } from '@/app/components/Badge';
import { Spinner } from '@/app/components/Spinner';

type Ticket = { id: string; type: string; subject: string; description: string; status: string; createdAt: string };
const requestTypes = [
  ['Billing_Inquiry', 'Billing Inquiry'],
  ['No_Internet_Connection', 'No Internet Connection'],
  ['Slow_Internet_Connection', 'Slow Internet Connection'],
] as const;

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [type, setType] = useState('Billing_Inquiry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetch('/api/tickets').then(async (response) => { if (!response.ok) return; const result = await response.json(); if (Array.isArray(result.data)) setTickets(result.data); }).catch(() => undefined); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, subject: values.subject, description: values.description }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to submit request.');
      setTickets((items) => [result.data, ...items]);
      setIsFormOpen(false);
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Unable to submit request.'); } finally { setIsSubmitting(false); }
  }

  const visibleTickets = tickets.filter((ticket) => tab === 'active' ? !['Resolved', 'Closed'].includes(ticket.status) : ['Resolved', 'Closed'].includes(ticket.status));

  return <PortalShell role="subscriber"><div className="min-h-screen bg-[#f7f9fc]"><header className="flex items-center justify-between gap-4 bg-[#2447b6] px-5 py-6 text-white sm:px-8 lg:px-10"><div className="flex items-center gap-3"><Link href="/subscriber/my-account" aria-label="Back to home" className="rounded-full bg-white/15 p-2 transition-colors duration-150 hover:bg-white/25"><ArrowLeft size={20} /></Link><h1 className="text-2xl font-bold">My Requests</h1></div><button onClick={() => setIsFormOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-white/25"><Plus size={17} /> New Request</button></header><div className="border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-10"><div className="flex gap-8"><button onClick={() => setTab('active')} className={`flex items-center gap-2 border-b-2 px-0 py-5 text-sm font-semibold transition-colors duration-150 ${tab === 'active' ? 'border-[#2166f3] text-[#2166f3]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>In Progress <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-[#2166f3]">{tickets.filter((ticket) => !['Resolved', 'Closed'].includes(ticket.status)).length}</span></button><button onClick={() => setTab('history')} className={`border-b-2 px-0 py-5 text-sm font-semibold transition-colors duration-150 ${tab === 'history' ? 'border-[#2166f3] text-[#2166f3]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>History</button></div></div><main className="mx-auto max-w-7xl px-4 py-5 sm:px-8 lg:px-10">{visibleTickets.length ? <div className="grid gap-3">{visibleTickets.map((ticket) => <Link href="/subscriber/my-tickets" className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-100 hover:bg-[#f8fafc]" key={ticket.id}><div className="min-w-0"><Badge value={ticket.status} /><h2 className="mt-2 text-xl font-bold">{ticket.id}</h2><p className="mt-1 text-sm text-slate-500">{ticket.subject}</p><p className="mt-1 truncate text-sm text-slate-400">{ticket.description}</p></div><ChevronRight className="shrink-0 text-slate-400" size={20} /></Link>)}</div> : <div className="flex min-h-96 flex-col items-center justify-center text-center"><FileText size={88} className="text-blue-100" /><p className="mt-5 text-2xl font-bold text-[#2447b6]">No request yet.</p></div>}</main>{isFormOpen && <div className="modal-overlay fixed inset-0 z-50 flex items-end bg-slate-950/45" onMouseDown={() => !isSubmitting && setIsFormOpen(false)}><section className="modal-panel max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 sm:p-6" onMouseDown={(event) => event.stopPropagation()}><div className="mx-auto mb-5 h-1 w-12 rounded-full bg-slate-200" /><div className="flex items-start justify-between border-b border-slate-100 pb-5"><div><h2 className="text-xl font-bold">New Support Request</h2><p className="mt-1 text-sm text-slate-400">Tell us about your concern</p></div><button aria-label="Close request form" onClick={() => setIsFormOpen(false)} className="rounded-lg p-2 text-slate-500 transition-colors duration-150 hover:bg-[#f1f5f9]"><X size={20} /></button></div><form onSubmit={submit} className="mt-5 space-y-5"><fieldset><legend className="text-xs font-bold uppercase tracking-wider text-slate-500">Request type</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{requestTypes.map(([value, label]) => <button type="button" key={value} onClick={() => setType(value)} className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left text-sm font-semibold transition-all duration-150 ${type === value ? 'border-[#6694ff] bg-blue-50 text-[#2166f3]' : 'border-slate-100 bg-slate-50 text-slate-500'}`}><Router size={18} />{label}</button>)}</div></fieldset><label className="block text-sm font-semibold">Subject *<input required name="subject" placeholder="Brief description of your concern" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none" /></label><label className="block text-sm font-semibold">Details *<textarea required name="description" rows={5} placeholder="Describe the issue in detail" className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none" /></label>{error && <p className="text-sm font-semibold text-red-600">{error}</p>}<button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2161f2] px-5 py-4 text-base font-bold text-white transition-colors duration-150 hover:bg-[#1652dc]">{isSubmitting && <Spinner />}{isSubmitting ? 'Submitting...' : 'Submit Request'}</button></form></section></div>}</div></PortalShell>;
}
