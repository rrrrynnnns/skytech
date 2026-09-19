import Link from 'next/link';
import { Bell, CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Clock3, Wrench } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';
import { Badge } from '@/app/components/Badge';

const days = [
  ['30', true], ['31', true], ['1', false], ['2', false], ['3', false], ['4', false], ['5', false],
  ['6', false], ['7', false], ['8', false], ['9', false], ['10', false], ['11', false], ['12', false],
  ['13', false], ['14', false], ['15', false], ['16', false], ['17', false], ['18', false], ['19', false],
  ['20', false], ['21', false], ['22', false], ['23', false], ['24', false], ['25', false], ['26', false],
  ['27', false], ['28', false], ['29', false], ['30', false], ['1', true], ['2', true], ['3', true],
  ['4', true], ['5', true], ['6', true], ['7', true], ['8', true], ['9', true], ['10', true],
] as const;

const summary = [
  { Icon: CheckSquare, value: '0', label: 'Done' },
  { Icon: Clock3, value: '2', label: 'Pending' },
  { Icon: CalendarDays, value: '9', label: 'All time' },
];
const tasks = [
  { name: 'Maria Santos', type: 'Installation', time: '09:00', date: '2026-06-13', status: 'Scheduled' },
  { name: 'Omar Hassan', type: 'Installation', time: '11:00', date: '2026-06-13', status: 'In Progress' },
];

export default function TechnicianTasks() {
  return <PortalShell role="technician"><div className="bg-[#2447b6] px-5 pb-7 pt-7 text-white sm:px-8 lg:px-10">
    <div className="mx-auto max-w-7xl"><div className="mb-6 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#4770d6] text-lg font-bold">MC</span><div><p className="text-sm text-blue-100">Good morning,</p><h1 className="text-xl font-bold">Marcus</h1></div></div><Link href="/shared/notifications" aria-label="Notifications" className="relative rounded-2xl bg-[#4770d6] p-3 transition-colors duration-150 hover:bg-[#5b82df]"><Bell size={20} /><span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff3b50] px-1 text-[9px] font-bold">2</span></Link></div>
      <section className="overflow-hidden rounded-3xl bg-white text-slate-950 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-5 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#2166f3] text-white"><Wrench size={22} /></span><p className="truncate text-xs font-bold uppercase tracking-widest text-slate-400">Sky-Tech Technician</p></div><Badge value="Active" /></div><div className="flex items-end justify-between gap-4 px-4 py-6 sm:px-6"><div className="min-w-0"><h2 className="truncate text-xl font-bold">Marcus Chen</h2><p className="mt-1 text-sm text-slate-400">EMP-001</p></div><div className="shrink-0 text-right"><p className="text-2xl font-bold text-[#2447b6]">2</p><p className="text-xs text-slate-400">Tasks today</p></div></div><div className="grid grid-cols-3 border-t border-slate-100 bg-[#f8faff] py-5">{summary.map(({ Icon, value, label }) => <div className="flex min-w-0 flex-col items-center gap-2 border-r border-slate-200 last:border-0" key={label}><Icon size={21} className="text-[#2166f3]" /><strong>{value}</strong><span className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span></div>)}</div></section>
    </div>
  </div><div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10"><h2 className="text-lg font-bold">My Task Today</h2><div className="mt-4 grid gap-4">{tasks.map((task) => <article className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-100 hover:bg-[#f8fafc]" key={task.name}><div className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#2166f3]"><CalendarDays size={20} /></span><div><h3 className="font-bold">{task.name}</h3><p className="mt-1 text-sm text-slate-400">{task.type} · {task.time}</p></div></div><div className="text-right"><Badge value={task.status} /><p className="mt-1 text-xs text-slate-400">{task.date}</p></div></article>)}</div>
    <h2 className="mt-6 text-lg font-bold">View Scheduled Task</h2><section className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"><div className="flex items-center justify-between"><button aria-label="Previous month" className="rounded-lg p-2 text-[#2166f3] transition-colors duration-150 hover:bg-[#f1f5f9]"><ChevronLeft size={18} /></button><h3 className="text-sm font-bold sm:text-base">September 2026</h3><button aria-label="Next month" className="rounded-lg p-2 text-[#2166f3] transition-colors duration-150 hover:bg-[#f1f5f9]"><ChevronRight size={18} /></button></div><div className="mt-5 grid grid-cols-7 gap-y-3 text-center text-xs sm:text-sm"><div className="col-span-7 grid grid-cols-7 text-[10px] font-semibold text-slate-400 sm:text-xs">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>{days.map(([day, muted], index) => <span className={`grid min-h-7 place-items-center font-semibold ${muted ? 'text-slate-300' : day === '4' && index === 12 ? 'rounded-full bg-[#2447b6] text-white' : 'text-slate-700'}`} key={`${day}-${index}`}>{day}</span>)}</div></section><section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold">Task Overview</h3><p className="mt-2 text-sm text-slate-400">2026-09-04</p><p className="mt-1 text-sm font-semibold text-slate-400">No tasks scheduled</p></section>
  </div></PortalShell>;
}
