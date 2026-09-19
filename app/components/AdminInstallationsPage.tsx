'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock3, Plus, Search, X } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';

type Installation = readonly [string, string, string, string, string, string, string, string];
type Filter = 'All' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

const statusStyles: Record<string, string> = {
  Scheduled: 'border-blue-200 bg-blue-50 text-blue-600',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-600',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  Cancelled: 'border-red-200 bg-red-50 text-red-600',
};

export function AdminInstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);

  useEffect(() => {
    fetch('/api/installations').then((response) => response.json()).then((result) => {
      if (Array.isArray(result.data)) setInstallations(result.data.map((item: { id: string; subscriberId: string; technician?: { name: string }; address: string; date: string; time: string; type: string; status: string }) => [item.id, item.subscriberId, item.technician?.name || '', item.address, item.date.slice(0, 10), item.time, item.type, item.status.replace('_', ' ')]));
    }).catch(() => undefined);
  }, []);

  const visibleInstallations = installations.filter((item) => (filter === 'All' || item[7] === filter) && item.join(' ').toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const table = document.querySelector('table[class*="min-w-[1250px]"]');
    const toolbar = table?.closest('.mt-4')?.previousElementSibling;
    if (!toolbar) return;
    toolbar.querySelectorAll('.installation-record-counter').forEach((node) => node.remove());
    toolbar.querySelectorAll('.live-record-counter').forEach((node, index) => { if (index > 0) node.remove(); });
    let counter = toolbar.querySelector<HTMLSpanElement>('.live-record-counter');
    if (!counter) {
      counter = document.createElement('span');
      counter.className = 'live-record-counter ml-auto text-sm text-slate-400';
      toolbar.appendChild(counter);
    }
    counter.textContent = `${visibleInstallations.length} records`;
  }, [visibleInstallations.length]);

  async function addSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subscriber = String(form.get('subscriber') || 'Maria Santos');
    const technician = String(form.get('technician') || 'Marcus Chen');
    const date = String(form.get('date') || '2026-06-27');
    const time = String(form.get('time') || '09:00');
    const type = String(form.get('type') || 'Installation');
    if (editingInstallation) {
      const response = await fetch(`/api/installations/${editingInstallation[0]}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: String(form.get('address') || editingInstallation[3]), date, time, type }) });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        window.alert(result?.error || 'Unable to save installation changes.');
        return;
      }
      setInstallations((current) => current.map((item) => item[0] === editingInstallation[0] ? [item[0], subscriber, technician, String(form.get('address') || item[3]), date, time, type, item[7]] : item));
      setEditingInstallation(null);
      setIsAdding(false);
      return;
    }
    const response = await fetch('/api/installations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscriberName: subscriber, technicianName: technician, address: String(form.get('address') || ''), date, time, type, status: 'Scheduled' }) });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      window.alert(result?.error || 'Unable to save installation.');
      return;
    }
    const result = await response.json();
    const created = result.data;
    setInstallations((current) => [[created.id, subscriber, technician, created.address, created.date.slice(0, 10), created.time, created.type, created.status.replace('_', ' ')], ...current]);
    setIsAdding(false);
  }

  useEffect(() => {
    function handleTableAction(event: MouseEvent) {
      const button = (event.target as HTMLElement).closest('button');
      const row = button?.closest('tr');
      const id = row?.querySelector('td')?.textContent?.trim();
      if (!button) return;
      if (!row) {
        if (button.textContent?.trim() === 'Add Schedule') setEditingInstallation(null);
        return;
      }
      if (!id) return;
      const installation = installations.find((item) => item[0] === id);
      if (!installation) return;
      if (button.textContent?.trim() === 'Cancel' && window.confirm('Cancel this installation?')) {
        setInstallations((current) => current.map((item) => item[0] === id ? [item[0], item[1], item[2], item[3], item[4], item[5], item[6], 'Cancelled'] : item));
      }
      if (button.textContent?.trim() === 'Edit') {
        setEditingInstallation(installation);
        setIsAdding(true);
      }
    }
    document.addEventListener('click', handleTableAction);
    return () => document.removeEventListener('click', handleTableAction);
  }, [installations]);

  useEffect(() => {
    function clearEditOnModalClose(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('fixed') && target.classList.contains('inset-0')) setEditingInstallation(null);
    }
    document.addEventListener('mousedown', clearEditOnModalClose);
    return () => document.removeEventListener('mousedown', clearEditOnModalClose);
  }, []);

  useEffect(() => {
    if (!isAdding) return;
    const form = document.querySelector<HTMLFormElement>('form');
    if (!form) return;
    const title = form.querySelector('h2');
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!editingInstallation) {
      form.reset();
      if (title) title.textContent = 'Add Schedule';
      if (submitButton) submitButton.textContent = 'Add Schedule';
      return;
    }
    if (title) title.textContent = 'Edit Schedule';
    if (submitButton) submitButton.textContent = 'Save changes';
    (form.elements.namedItem('subscriber') as HTMLSelectElement).value = editingInstallation[1];
    (form.elements.namedItem('technician') as HTMLSelectElement).value = editingInstallation[2];
    (form.elements.namedItem('address') as HTMLInputElement).value = editingInstallation[3];
    (form.elements.namedItem('date') as HTMLInputElement).value = editingInstallation[4];
    (form.elements.namedItem('time') as HTMLInputElement).value = editingInstallation[5];
    (form.elements.namedItem('type') as HTMLSelectElement).value = editingInstallation[6];
  }, [editingInstallation, isAdding]);

  return <PortalShell role="admin"><div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-2xl font-bold tracking-tight">Installations</h1><p className="mt-1 text-sm text-slate-500">Manage installation schedules</p></div><button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-[#3b4fd8] px-5 py-3 text-sm font-bold text-white hover:bg-[#2d3fc7]"><Plus size={17} />Add Schedule</button></div><div className="mt-7 flex flex-wrap items-center gap-3"><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#3b4fd8]" /></div><div className="flex gap-2 overflow-x-auto">{(['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'] as Filter[]).map((option) => <button onClick={() => setFilter(option)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${filter === option ? 'border-[#2447b6] bg-[#2447b6] text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`} key={option}>{option}</button>)}</div></div><div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-[1250px] w-full text-left"><thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400"><tr>{['Ref', 'Subscriber', 'Technician', 'Address', 'Date', 'Time', 'Type', 'Status', 'Actions'].map((heading) => <th className="px-5 py-4" key={heading}>{heading}{heading !== 'Actions' && <span className="ml-1 text-[10px]">▴</span>}</th>)}</tr></thead><tbody className="text-sm">{visibleInstallations.map((item) => <tr className="border-t border-slate-100" key={item[0]}><td className="px-5 py-4 font-mono text-[#3b6ff5]">{item[0]}</td><td className="px-5 py-4 font-semibold text-slate-900">{item[1]}</td><td className="px-5 py-4 text-slate-500">{item[2]}</td><td className="max-w-44 truncate px-5 py-4 text-slate-500" title={item[3]}>{item[3]}</td><td className="px-5 py-4 text-slate-500">{item[4]}</td><td className="px-5 py-4 text-slate-500">{item[5]}</td><td className="px-5 py-4 text-slate-500">{item[6]}</td><td className="px-5 py-4"><span className={`rounded-lg border px-2 py-1 text-xs font-semibold ${statusStyles[item[7]]}`}>{item[7]}</span></td><td className="px-5 py-4"><div className="flex gap-3 text-xs font-semibold"><button className="text-[#2563eb]">Edit</button>{item[7] !== 'Completed' && item[7] !== 'Cancelled' && <button className="text-red-500">Cancel</button>}</div></td></tr>)}</tbody></table></div></div>{isAdding && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5" onMouseDown={() => setIsAdding(false)}><form onSubmit={addSchedule} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-bold">Add Schedule</h2><button type="button" onClick={() => setIsAdding(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div><div className="grid max-h-[65vh] gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Subscriber<select name="subscriber" defaultValue="" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none"><option value="" disabled>Select subscriber</option><option>Maria Santos</option><option>Omar Hassan</option><option>David Kim</option><option>Sofia Reyes</option></select></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Technician<select name="technician" defaultValue="" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none"><option value="" disabled>Select technician</option><option>Marcus Chen</option><option>Luis Dela Cruz</option></select></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Date<div className="relative"><input name="date" type="date" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none" /><CalendarDays className="pointer-events-none absolute right-3 top-5 text-slate-500" size={16} /></div></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Time<div className="relative"><input name="time" type="time" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none" /><Clock3 className="pointer-events-none absolute right-3 top-5 text-slate-500" size={16} /></div></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Type<select name="type" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none"><option>Installation</option><option>Repair</option><option>Maintenance</option></select></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Address<input name="address" placeholder="Full address" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none" /></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:col-span-2">Notes (optional)<textarea name="notes" rows={2} className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none" /></label></div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={() => setIsAdding(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white">Add Schedule</button></div></form></div>}</PortalShell>;
}
