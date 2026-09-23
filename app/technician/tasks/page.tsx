'use client';

import { CalendarDays, FileText, Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';
import { formatPersonName } from '@/app/lib/name';
import { formatTicketStatus } from '@/app/lib/ticket-status';

type Task = readonly [string, string, string, string, string];

type InstallationApiItem = { date: string; time: string; type: string; status: string; subscriber?: { name: string } };
type Ticket = { id: string; type: string; subject: string; description: string; status: string; createdAt: string; visitDate?: string | null; visitTime?: string | null; details?: string | null; technician?: { name: string } | null; subscriber?: { name: string; address?: string | null } };

const filters = ['All', 'Installation Confirmed', 'Installation Closed', 'Repair Confirmed', 'Repair Closed'];
const technicianTicketStatuses = [
  ['In Progress', 'Repair Confirmed'],
  ['Resolved', 'Repair Closed'],
  ['Closed', 'Repair Rescheduled'],
] as const;

const statusStyles: Record<string, string> = {
  'Repair Confirmed': 'bg-blue-50 text-blue-700',
  'Installation Confirmed': 'bg-blue-50 text-blue-700',
  'Installation Closed': 'bg-blue-50 text-blue-700',
  'Repair Closed': 'bg-blue-50 text-blue-700',
};

function formatVisitDateTime(ticket: Ticket) {
  if (!ticket.visitDate && !ticket.visitTime) return 'Not scheduled yet';
  const date = ticket.visitDate
    ? new Date(`${ticket.visitDate.slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  return [date, ticket.visitTime].filter(Boolean).join(', ') || 'Not scheduled yet';
}

export default function TechnicianTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketStatus, setTicketStatus] = useState('Open');
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    fetch('/api/installations').then((response) => response.json()).then((result) => {
      if (Array.isArray(result.data)) {
        setTasks(result.data.map((item: InstallationApiItem) => [item.subscriber?.name || 'Subscriber', item.type.replace(/_/g, ' '), item.time, item.status.replace(/_/g, ' '), item.date.slice(0, 10)]));
      }
    }).catch(() => setTasks([]));
    fetch('/api/tickets').then((response) => response.json()).then((result) => {
      if (Array.isArray(result.data)) setTickets(result.data);
    }).catch(() => setTickets([]));
  }, []);
  const visibleTasks = tasks.filter((task) => filter === 'All' || task[3] === filter);
  const visibleTickets = tickets.filter((ticket) => {
    if (filter === 'All') return true;
    if (!filter.startsWith('Repair')) return false;
    return formatTicketStatus(ticket.status) === filter;
  });
  const today = new Date().toISOString().slice(0, 10);
  const counts = {
    total: tasks.length,
    today: tasks.filter((task) => task[4] === today).length,
    pending: tasks.filter((task) => task[3] !== 'Installation Closed' && task[3] !== 'Repair Closed').length,
    done: tasks.filter((task) => task[3].endsWith('Closed')).length,
  };

  function openTicket(ticket: Ticket) {
    setSelectedTicket(ticket);
    setTicketStatus(ticket.status === 'Open' ? 'In Progress' : ticket.status.replace(/_/g, ' '));
  }

  async function saveTicketStatus() {
    if (!selectedTicket) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: ticketStatus }),
      });
      if (!response.ok) return;
      setTickets((current) => current.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, status: ticketStatus } : ticket));
      setSelectedTicket((current) => current ? { ...current, status: ticketStatus } : current);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PortalShell role="technician">
      <div className="min-h-screen bg-[#eef4fb]">
        <header className="bg-[#2447b6] px-5 py-5 text-white sm:px-8 sm:py-7 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold">My Tasks</h1>
          </div>
        </header>

        <div className="px-4 py-4 sm:px-8 sm:py-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {[
                [counts.total, 'Total'],
                [counts.today, 'Today'],
                [counts.pending, 'Pending'],
                [counts.done, 'Done'],
              ].map(([value, label]) => (
                <article key={label} className="rounded-2xl border border-slate-100 bg-white px-2 py-4 text-center shadow-sm sm:p-4">
                  <p className="text-xl font-bold text-[#2447b6] sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">{label}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 scrollbar-hidden">
              <div className="flex min-w-max gap-2">
                {filters.map((option) => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${filter === option ? 'border-[#2447b6] bg-[#2447b6] text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {visibleTickets.map((ticket) => (
                <button type="button" key={ticket.id} onClick={() => openTicket(ticket)} className="flex min-h-[76px] w-full items-center justify-between gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-colors hover:bg-slate-50 sm:gap-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2166f3]"><FileText size={18} /></span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-slate-900">{formatPersonName(ticket.subscriber?.name || 'Subscriber')}</h2>
                      <p className="mt-1 truncate text-xs text-slate-500">{formatVisitDateTime(ticket)}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{formatTicketStatus(ticket.status)}</span>
                </button>
              ))}

              {visibleTasks.map(([name, type, detail, status, date], index) => (
                <article key={`${name}-${date}-${index}`} className="flex min-h-[76px] w-full items-center justify-between gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:gap-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2166f3]">
                      {type === 'Repair' ? <Wrench size={18} /> : <CalendarDays size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-bold text-slate-900">{name}</h2>
                      <p className="mt-1 truncate text-xs text-slate-400">{type} · {detail}</p>
                    </div>
                  </div>
                  <div className="w-[92px] shrink-0 text-right sm:w-auto">
                    <span className={`inline-flex max-w-full truncate rounded-full px-2 py-1 text-[9px] font-bold leading-tight ${statusStyles[status] || 'bg-blue-50 text-blue-700'}`}>{status}</span>
                    <p className="mt-1 truncate text-[9px] text-slate-400">{date}</p>
                  </div>
                </article>
              ))}
              {!visibleTasks.length && !visibleTickets.length && <p className="rounded-2xl bg-white p-4 text-sm text-slate-400 shadow-sm">No tasks found for this filter.</p>}
            </div>
          </div>
        </div>

        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-slate-950/40" onMouseDown={() => setSelectedTicket(null)}>
            <section className="absolute inset-y-0 right-0 w-full max-w-[980px] overflow-y-auto bg-[#eef4fb] shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <header className="flex items-center justify-between bg-[#2447b6] px-5 py-5 text-white sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><FileText size={21} /></span>
                  <div><p className="text-xs font-bold uppercase tracking-widest text-blue-100">Status</p><h2 className="text-xl font-bold">{formatTicketStatus(selectedTicket.status)}</h2></div>
                </div>
                <button aria-label="Close ticket details" onClick={() => setSelectedTicket(null)} className="rounded-full bg-white/15 p-2.5 transition-colors hover:bg-white/25"><X size={20} /></button>
              </header>
              <div className="space-y-5 p-5 sm:p-7">
                <div className="flex items-center justify-between rounded-xl bg-white/75 px-5 py-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Work order number</span>
                  <strong className="text-lg font-bold text-slate-900">{selectedTicket.id}</strong>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-2xl font-bold text-slate-900">Work order details</h3>
                  <div className="mt-5 space-y-5">
                    <div><p className="text-sm text-slate-500">Technician visit date and time</p><p className={`mt-1 text-lg font-semibold ${selectedTicket.visitDate || selectedTicket.visitTime ? 'text-slate-800' : 'text-slate-400'}`}>{formatVisitDateTime(selectedTicket)}</p></div>
                    <div><p className="text-sm text-slate-500">Technician</p><p className="mt-1 text-lg font-semibold text-slate-800">{selectedTicket.technician?.name || 'Not assigned yet'}</p></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-2xl font-bold text-slate-900">Request details</h3>
                  <div className="mt-5 space-y-5">
                    <div><p className="text-sm text-slate-500">Name</p><p className="mt-1 text-lg font-semibold text-slate-800">{formatPersonName(selectedTicket.subscriber?.name || 'Subscriber')}</p></div>
                    <div><p className="text-sm text-slate-500">Address</p><p className="mt-1 text-lg font-semibold text-slate-800">{selectedTicket.subscriber?.address || 'No address provided'}</p></div>
                    <div><p className="text-sm text-slate-500">Concern</p><p className="mt-1 text-lg font-semibold text-slate-800">{selectedTicket.type.replace(/_/g, ' ')}</p></div>
                    <div><p className="text-sm text-slate-500">Description</p><p className="mt-1 text-lg font-semibold text-slate-800">{selectedTicket.type.replace(/_/g, ' ')}</p></div>
                    <div><p className="text-sm text-slate-500">Details</p><p className="mt-1 whitespace-pre-line text-base leading-7 text-slate-700">{selectedTicket.details || selectedTicket.description || 'No additional details provided.'}</p></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h3 className="text-lg font-bold text-slate-900">Update Status</h3>
                  <div className="mt-4 grid gap-2">
                    {technicianTicketStatuses.map(([value, label]) => (
                      <button type="button" key={value} onClick={() => setTicketStatus(value)} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${ticketStatus === value ? 'border-blue-200 bg-blue-50 text-[#2166f3]' : 'border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                        {ticketStatus === value && <span className="mr-2">✓</span>}{label}
                      </button>
                    ))}
                  </div>
                  <button disabled={isSaving} onClick={saveTicketStatus} className="mt-4 w-full rounded-xl bg-[#2447b6] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{isSaving ? 'Saving...' : 'Save Status'}</button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
