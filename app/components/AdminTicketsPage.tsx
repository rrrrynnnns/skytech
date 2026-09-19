'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';

type Ticket = readonly [string, string, string, string, string, string, string];
const statusStyles: Record<string, string> = {
  Open: 'border-blue-200 bg-blue-50 text-blue-600',
  'In Progress': 'border-amber-200 bg-amber-50 text-amber-600',
  Resolved: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  Closed: 'border-slate-200 bg-slate-50 text-slate-600',
};
const priorityStyles: Record<string, string> = { Medium: 'text-amber-600', High: 'text-red-600', Low: 'text-emerald-600', Urgent: 'text-violet-600' };

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All Types');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState('Open');
  const [adminNote, setAdminNote] = useState('');
  const types = useMemo(() => ['All Types', ...Array.from(new Set(tickets.map((ticket) => ticket[2])))], [tickets]);
  const counts = { Open: tickets.filter((ticket) => ticket[5] === 'Open').length, 'In Progress': tickets.filter((ticket) => ticket[5] === 'In Progress').length, Resolved: tickets.filter((ticket) => ticket[5] === 'Resolved').length, Closed: tickets.filter((ticket) => ticket[5] === 'Closed').length };
  const visibleTickets = tickets.filter((ticket) => (type === 'All Types' || ticket[2] === type) && ticket.join(' ').toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    fetch('/api/tickets').then((response) => response.json()).then((result) => {
      if (Array.isArray(result.data)) setTickets(result.data.map((item: { id: string; subscriber?: { name: string }; type: string; subject: string; priority: string; status: string; createdAt: string }) => [item.id, item.subscriber?.name || '', item.type.replace(/_/g, ' '), item.subject, item.priority, item.status.replace('_', ' '), item.createdAt.slice(0, 10)]));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const table = document.querySelector('table[class*="min-w-[1200px]"]');
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
    counter.textContent = `${visibleTickets.length} records`;
  }, [visibleTickets.length]);

  function openManager(ticket: Ticket) {
    setSelectedTicket(ticket);
    setStatus(ticket[5]);
  }

  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('main:has(table[class*="1200px"]) select');
    if (!select) return;
    let tabs = select.previousElementSibling as HTMLDivElement | null;
    if (!tabs?.classList.contains('admin-filter-tabs')) {
      tabs = document.createElement('div');
      tabs.className = 'admin-filter-tabs';
      select.parentElement?.insertBefore(tabs, select);
      select.hidden = true;
    }
    tabs.replaceChildren(...types.map((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option;
      const isActive = option === type;
      button.style.cssText = `
        border-radius: 9999px;
        border: 1px solid ${isActive ? '#2447b6' : '#cbd5e1'};
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        background-color: ${isActive ? '#2447b6' : '#ffffff'};
        color: ${isActive ? '#ffffff' : '#64748b'};
        cursor: pointer;
        transition: all 150ms ease;
      `;
      button.onmouseover = () => {
        if (!isActive) button.style.backgroundColor = '#f1f5f9';
      };
      button.onmouseout = () => {
        if (!isActive) button.style.backgroundColor = '#ffffff';
      };
      button.onclick = () => {
        select.value = option;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };
      return button;
    }));
  }, [type, types]);

  async function saveTicket() {
    if (!selectedTicket) return;
    try {
      await fetch(`/api/tickets/${selectedTicket[0]}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminNote }) });
    } finally {
      setTickets((current) => current.map((ticket) => ticket[0] === selectedTicket[0] ? [ticket[0], ticket[1], ticket[2], ticket[3], ticket[4], status, ticket[6]] : ticket));
      setSelectedTicket(null);
    }
  }

  return <PortalShell role="admin"><div><h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1><p className="mt-1 text-sm text-slate-500">Manage subscriber support requests</p></div><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['OPEN', counts.Open], ['IN PROGRESS', counts['In Progress']], ['RESOLVED', counts.Resolved], ['CLOSED', counts.Closed]].map(([label, value]) => <article className="rounded-xl border border-slate-200 bg-white px-6 py-5" key={label}><p className="text-xs font-bold tracking-wide text-slate-400">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></article>)}</div><div className="mt-7 flex flex-wrap items-center gap-3"><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#3b4fd8]" /></div><select value={type} onChange={(event) => setType(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">{types.map((option) => <option key={option}>{option}</option>)}</select></div><div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-[1200px] w-full text-left"><thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400"><tr>{['Ticket ID', 'Subscriber', 'Type', 'Subject', 'Priority', 'Status', 'Date', 'Actions'].map((heading) => <th className="px-5 py-4" key={heading}>{heading}</th>)}</tr></thead><tbody className="text-sm">{visibleTickets.map((ticket) => <tr className="border-t border-slate-100" key={ticket[0]}><td className="px-5 py-4 font-mono text-[#3b6ff5]">{ticket[0]}</td><td className="px-5 py-4 font-semibold text-slate-900">{ticket[1]}</td><td className="px-5 py-4 text-slate-500">{ticket[2]}</td><td className="max-w-64 truncate px-5 py-4 font-semibold text-slate-900" title={ticket[3]}>{ticket[3]}</td><td className={`px-5 py-4 font-bold ${priorityStyles[ticket[4]]}`}>{ticket[4]}</td><td className="px-5 py-4"><span className={`rounded-lg border px-2 py-1 text-xs font-semibold ${statusStyles[ticket[5]]}`}>{ticket[5]}</span></td><td className="px-5 py-4 text-slate-500">{ticket[6]}</td><td className="px-5 py-4"><button onClick={() => openManager(ticket)} className="text-xs font-semibold text-[#2563eb]">Manage</button></td></tr>)}</tbody></table></div></div>{selectedTicket && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5" onMouseDown={() => setSelectedTicket(null)}><div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-bold">Manage Ticket</h2><button onClick={() => setSelectedTicket(null)} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div><div className="space-y-5 p-6"><div><p className="font-bold">{selectedTicket[3]}</p><p className="mt-1 text-sm text-slate-500">{selectedTicket[1]} · {selectedTicket[2]}</p></div><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none"><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></label><label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Admin note<textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} rows={3} placeholder="Add an internal note..." className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none" /></label></div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button onClick={() => setSelectedTicket(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button onClick={saveTicket} className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white">Save Changes</button></div></div></div>}</PortalShell>;
}
