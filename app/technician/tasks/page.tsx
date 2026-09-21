'use client';

import { CalendarDays, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';

type Task = readonly [string, string, string, string, string];

type InstallationApiItem = { date: string; time: string; type: string; status: string; subscriber?: { name: string } };

const filters = ['All', 'Installation Confirmed', 'Installation Closed', 'Repair Confirmed', 'Repair Closed'];

const statusStyles: Record<string, string> = {
  'Repair Confirmed': 'bg-blue-50 text-blue-700',
  'Installation Confirmed': 'bg-blue-50 text-blue-700',
  'Installation Closed': 'bg-blue-50 text-blue-700',
  'Repair Closed': 'bg-blue-50 text-blue-700',
};

export default function TechnicianTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('All');
  useEffect(() => {
    fetch('/api/installations').then((response) => response.json()).then((result) => {
      if (Array.isArray(result.data)) {
        setTasks(result.data.map((item: InstallationApiItem) => [item.subscriber?.name || 'Subscriber', item.type.replace(/_/g, ' '), item.time, item.status.replace(/_/g, ' '), item.date.slice(0, 10)]));
      }
    }).catch(() => setTasks([]));
  }, []);
  const visibleTasks = tasks.filter((task) => filter === 'All' || task[3] === filter);
  const today = new Date().toISOString().slice(0, 10);
  const counts = {
    total: tasks.length,
    today: tasks.filter((task) => task[4] === today).length,
    pending: tasks.filter((task) => task[3] !== 'Installation Closed' && task[3] !== 'Repair Closed').length,
    done: tasks.filter((task) => task[3].endsWith('Closed')).length,
  };

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
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
