'use client';

import Link from 'next/link';
import { Bell, CalendarDays, CheckSquare, Clock3, ChevronLeft, ChevronRight, FileText, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';
import { formatPersonName } from '@/app/lib/name';

type ScheduledTask = {
  name: string;
  type: string;
  time: string;
  date: string;
  status: 'Scheduled' | 'In Progress' | 'Done';
};

type Technician = { id: string; name: string; status: string };
type InstallationApiItem = { date: string; time: string; type: string; status: string; subscriber?: { name: string } };
type TicketApiItem = { visitDate?: string | null; visitTime?: string | null; type: string; status: string; subscriber?: { name: string } };

const statusStyles = {
  Scheduled: 'bg-blue-50 text-blue-700',
  'In Progress': 'bg-orange-50 text-orange-600',
  Done: 'bg-emerald-50 text-emerald-700',
};

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTaskDateTime(task: ScheduledTask) {
  const date = new Date(`${task.date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return [date, task.time].filter(Boolean).join(', ');
}

export default function TechnicianTasks() {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const [monthDate, setMonthDate] = useState(() => new Date());
  useEffect(() => {
    Promise.all([fetch('/api/technician/account').then((response) => response.json()), fetch('/api/installations').then((response) => response.json()), fetch('/api/tickets').then((response) => response.json())]).then(([accountResult, installationResult, ticketResult]) => {
      if (accountResult.data) setTechnician(accountResult.data);
      const installationTasks = Array.isArray(installationResult.data) ? installationResult.data.map((item: InstallationApiItem) => ({ name: item.subscriber?.name || 'Subscriber', type: item.type.replace(/_/g, ' '), time: item.time, date: item.date.slice(0, 10), status: item.status.replace(/_/g, ' ') === 'In Progress' ? 'In Progress' : item.status.replace(/_/g, ' ') === 'Completed' || item.status.replace(/_/g, ' ') === 'Closed' ? 'Done' : 'Scheduled' } as ScheduledTask)) : [];
      const ticketTasks = Array.isArray(ticketResult.data) ? ticketResult.data.filter((item: TicketApiItem) => item.visitDate).map((item: TicketApiItem) => ({ name: item.subscriber?.name || 'Subscriber', type: item.type.replace(/_/g, ' '), time: item.visitTime || '', date: item.visitDate!.slice(0, 10), status: item.status.replace(/_/g, ' ') === 'In Progress' ? 'In Progress' : ['Resolved', 'Closed'].includes(item.status.replace(/_/g, ' ')) ? 'Done' : 'Scheduled' } as ScheduledTask)) : [];
      const tasks = [...installationTasks, ...ticketTasks];
      if (tasks.length) {
        setScheduledTasks(tasks);
      }
    }).catch(() => undefined);
  }, []);
  const selectedTasks = useMemo(() => scheduledTasks.filter((task) => task.date === selectedDate), [selectedDate]);
  const taskDates = new Set(scheduledTasks.map((task) => task.date));
  const pendingCount = scheduledTasks.filter((task) => task.status !== 'Done').length;
  const doneCount = scheduledTasks.filter((task) => task.status === 'Done').length;
  const today = localDateKey(new Date());
  const todaysTasks = scheduledTasks.filter((task) => task.date === today);
  const calendarDays = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousDays = new Date(year, month, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const dayOffset = index - firstDay + 1;
      const date = new Date(year, month, dayOffset);
      return { day: dayOffset <= 0 ? previousDays + dayOffset : dayOffset > daysInMonth ? dayOffset - daysInMonth : dayOffset, muted: dayOffset <= 0 || dayOffset > daysInMonth, date: localDateKey(date) };
    });
  }, [monthDate]);
  const displayName = formatPersonName(technician?.name || 'Technician');
  const initials = displayName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <PortalShell role="technician">
      <div className="bg-[#2447b6] px-5 pb-7 pt-7 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#4770d6] text-lg font-bold">{initials}</span>
              <div><p className="text-sm text-blue-100">Good morning,</p><h1 className="text-xl font-bold">{displayName.split(' ')[0]}</h1></div>
            </div>
            <Link href="/technician/notifications" aria-label="Notifications" className="relative rounded-2xl bg-[#4770d6] p-3"><Bell size={20} /><span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff3b50] px-1 text-[9px] font-bold">2</span></Link>
          </div>
          <section className="overflow-hidden rounded-3xl bg-white text-slate-950 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-5 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2166f3] text-white"><Wrench size={22} /></span><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sky-Tech Technician</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{technician?.status?.replace(/_/g, ' ') || 'Active'}</span></div>
            <div className="flex items-end justify-between gap-4 px-4 py-6 sm:px-6"><div><h2 className="text-xl font-bold">{displayName}</h2><p className="mt-1 text-sm text-slate-400">{technician?.id || 'Technician account'}</p></div><div className="text-right"><p className="text-2xl font-bold text-[#2447b6]">{todaysTasks.length}</p><p className="text-xs text-slate-400">Tasks today</p></div></div>
            <div className="grid grid-cols-3 border-t border-slate-100 bg-[#f8faff] py-5">{[{ Icon: CheckSquare, value: String(doneCount), label: 'Done' }, { Icon: Clock3, value: String(pendingCount), label: 'Pending' }, { Icon: CalendarDays, value: String(scheduledTasks.length), label: 'All time' }].map(({ Icon, value, label }) => <div className="flex flex-col items-center gap-2 border-r border-slate-200 last:border-0" key={label}><Icon size={21} className="text-[#2166f3]" /><strong>{value}</strong><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span></div>)}</div>
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-7xl bg-[#eef4fb] px-4 py-6 sm:px-8 lg:px-10">
        <h2 className="text-lg font-bold">My Task Today</h2>
        <div className="mt-4 grid gap-3">
          {todaysTasks.map((task) => <article key={`${task.name}-${task.time}-${task.date}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2166f3]"><CalendarDays size={20} /></span><div className="min-w-0"><h3 className="truncate font-bold">{task.name}</h3><p className="mt-1 text-sm text-slate-400">{task.type} · {task.time}</p></div></div><div className="shrink-0 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${task.status === 'In Progress' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-700'}`}>{task.status}</span><p className="mt-1 text-xs text-slate-400">{task.date}</p></div></article>)}
          {!todaysTasks.length && <p className="rounded-2xl bg-white p-4 text-sm text-slate-400 shadow-sm">No tasks scheduled today.</p>}
        </div>
        <h2 className="mt-6 text-lg font-bold">View Scheduled Task</h2>
        <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between"><button aria-label="Previous month" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-lg p-2 text-slate-500"><ChevronLeft size={18} /></button><h3 className="text-sm font-bold sm:text-base">{monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3><button aria-label="Next month" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-lg p-2 text-slate-500"><ChevronRight size={18} /></button></div>
          <div className="mt-5 grid grid-cols-7 gap-y-2 text-center text-xs sm:gap-y-3 sm:text-sm"><div className="col-span-7 grid grid-cols-7 text-[10px] font-semibold text-slate-400 sm:text-xs">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>{calendarDays.map(({ day, muted, date }) => { const active = selectedDate === date; const hasTasks = taskDates.has(date); return <button key={date} disabled={muted} onClick={() => setSelectedDate(date)} className={`relative grid min-h-8 place-items-center rounded-xl font-semibold ${muted ? 'text-slate-300' : active ? 'bg-slate-100 text-slate-900' : 'text-slate-800 hover:bg-slate-50'}`}>{day}{hasTasks && <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />}</button>; })}</div>
        </section>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm"><h3 className="font-bold">Task Overview</h3><p className="mt-2 text-sm text-slate-400">{selectedDate}</p><p className={`mt-1 text-sm font-semibold ${selectedTasks.length ? 'text-emerald-600' : 'text-slate-400'}`}>{selectedTasks.length ? `${selectedTasks.length} task${selectedTasks.length === 1 ? '' : 's'} scheduled` : 'No tasks scheduled'}</p></section>

        {selectedTasks.length > 0 && <div className="mt-4 grid gap-3">{selectedTasks.map((task) => <article key={`${task.name}-${task.time}`} className="flex min-h-[76px] w-full items-center justify-between gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm sm:gap-3 sm:px-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2166f3]"><FileText size={18} /></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-slate-900">{formatPersonName(task.name)}</h3><p className="mt-1 truncate text-xs text-slate-500">{formatTaskDateTime(task)}</p></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${task.status === 'Done' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{task.status === 'Done' ? 'Repair Closed' : task.status === 'In Progress' ? 'Repair Confirmed' : 'Submitted'}</span></article>)}</div>}
      </div>
    </PortalShell>
  );
}
