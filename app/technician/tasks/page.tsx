'use client';

import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';
import { Badge } from '@/app/components/Badge';

const tasks = [
  ['Maria Santos', 'Installation', '09:00', 'Installation Confirmed', '2026-06-13'],
  ['Omar Hassan', 'Installation', '11:00', 'Repair Confirmed', '2026-06-13'],
  ['David Kim', 'Installation', '10:00', 'Installation Confirmed', '2026-06-15'],
  ['Sofia Reyes', 'Installation', '14:00', 'Installation Closed', '2026-06-18'],
  ['James Nguyen', 'Installation', '09:00', 'Installation Confirmed', '2026-06-20'],
  ['Rachel Lee', 'Repair', '13:00', 'Repair Closed', '2026-06-22'],
];
const filters = ['All', 'Installation Confirmed', 'Installation Closed', 'Repair Confirmed', 'Repair Closed'];

export default function TechnicianTaskList() {
  const [filter, setFilter] = useState('All');
  const visibleTasks = tasks.filter((task) => filter === 'All' || task[3] === filter);

  return <PortalShell role="technician"><div className="min-h-screen bg-[#eef4fb]"><header className="bg-[#2447b6] px-5 py-7 text-white sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><h1 className="text-2xl font-bold">My Tasks</h1></div></header><div className="px-5 py-5 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['8', 'Total'], ['0', 'Today'], ['7', 'Pending'], ['1', 'Done']].map(([value, label]) => <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm" key={label}><p className="text-2xl font-bold text-[#2447b6]">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></article>)}</div><div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">{filters.map((option) => <button onClick={() => setFilter(option)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-150 ${filter === option ? 'border-[#2447b6] bg-[#2447b6] text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`} key={option}>{option}</button>)}</div><div className="mt-5 grid gap-3">{visibleTasks.map(([name, type, time, status, date]) => <article className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-100 hover:bg-[#f8fafc]" key={name}><div className="flex min-w-0 items-center gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2166f3]"><CalendarDays size={20} /></span><div className="min-w-0"><h2 className="truncate font-bold">{name}</h2><p className="mt-1 text-sm text-slate-400">{type} · {time}</p></div></div><div className="shrink-0 text-right"><Badge value={status} /><p className="mt-1 text-xs text-slate-400">{date}</p></div></article>)}</div></div></div></div></PortalShell>;
}
