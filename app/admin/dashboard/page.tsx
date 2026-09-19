import { Check, CircleDollarSign, FileText, MoreHorizontal, Users, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';
import { Badge } from '@/app/components/Badge';

const stats: { label: string; value: string; detail: string; Icon: LucideIcon; tone: 'positive' | 'neutral' | 'negative' }[] = [
  { label: 'Active subscribers', value: '9', detail: '+2 this month', Icon: Users, tone: 'positive' },
  { label: 'Active technicians', value: '4', detail: '', Icon: Wrench, tone: 'neutral' },
  { label: 'Revenue collected', value: '₱3k', detail: '+12% vs last month', Icon: CircleDollarSign, tone: 'positive' },
  { label: 'Pending bills', value: '7', detail: '7 need attention', Icon: FileText, tone: 'negative' },
];

const revenue = [9, 10, 10.5, 11.8, 12.7, 14];
const growth = [6, 7, 7, 8, 9, 10];
const installations = [
  ['INS-001', 'Maria Santos', 'Marcus Chen', '2026-06-13', 'Scheduled'],
  ['INS-002', 'Omar Hassan', 'Marcus Chen', '2026-06-13', 'In Progress'],
  ['INS-003', 'David Kim', 'Marcus Chen', '2026-06-15', 'Scheduled'],
  ['INS-004', 'Sofia Reyes', 'Marcus Chen', '2026-06-18', 'Completed'],
  ['INS-005', 'James Nguyen', 'Marcus Chen', '2026-06-20', 'Scheduled'],
] as const;
const activities: { Icon: LucideIcon; text: string; date: string; tone: 'green' | 'orange' | 'blue' }[] = [
  { Icon: Check, text: 'Installation INS-004 completed for Sofia Reyes', date: '2026-06-18', tone: 'green' },
  { Icon: CircleDollarSign, text: 'Overdue bill - Benjamin Cruz', date: '2026-06-15', tone: 'orange' },
  { Icon: CircleDollarSign, text: 'Overdue bill - Grace Tanaka', date: '2026-06-15', tone: 'orange' },
  { Icon: Users, text: 'Anika Cruz joined as subscriber', date: '2026-05-28', tone: 'blue' },
  { Icon: Users, text: 'Grace Tanaka joined as subscriber', date: '2026-05-10', tone: 'blue' },
  { Icon: Users, text: 'Benjamin Cruz joined as subscriber', date: '2026-04-22', tone: 'blue' },
];

function ChartGrid({ children, labels, yLabels }: { children: React.ReactNode; labels: string[]; yLabels: string[] }) {
  return <div className="relative mt-6 grid h-56 grid-cols-[2.75rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_1.75rem]"><div className="flex flex-col justify-between pr-2 text-right text-xs text-slate-400">{yLabels.map((label) => <span className="-translate-y-1/2 first:translate-y-0 last:translate-y-0" key={label}>{label}</span>)}</div><div className="relative"><div className="absolute inset-0 flex flex-col justify-between">{yLabels.map((label) => <div className="border-t border-dashed border-slate-100" key={label} />)}</div><div className="absolute inset-0">{children}</div></div><div className="col-start-2 flex justify-between pr-1 text-xs text-slate-400">{labels.map((label) => <span key={label}>{label}</span>)}</div></div>;
}

function LineChart() {
  const points = growth.map((value, index) => `${index * 20},${100 - (value / 12) * 100}`).join(' ');
  return <ChartGrid labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} yLabels={['12', '9', '6', '3', '0']}><svg className="h-[calc(100%-28px)] w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="growth-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3b71ed" stopOpacity="0.18" /><stop offset="1" stopColor="#3b71ed" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${points} 100,100`} fill="url(#growth-fill)" /><polyline points={points} fill="none" stroke="#2f6bed" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />{growth.map((value, index) => <circle key={value + index} cx={index * 20} cy={100 - (value / 12) * 100} r="1.25" fill="#6d9af5" vectorEffect="non-scaling-stroke" />)}</svg></ChartGrid>;
}

function RevenueChart() {
  return <ChartGrid labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} yLabels={['₱14k', '₱11k', '₱7k', '₱4k', '₱0k']}><div className="flex h-[calc(100%-28px)] items-end justify-between gap-4 px-2">{revenue.map((value, index) => <div className="flex h-full flex-1 items-end justify-center" key={index}><div className="w-7 rounded-t bg-[#2f68e6]" style={{ height: `${(value / 14) * 100}%` }} /></div>)}</div></ChartGrid>;
}

export default function AdminDashboard() {
  return <PortalShell role="admin"><div className="space-y-7">
    <div className="flex items-start justify-between gap-6"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">Dashboard</h1><p className="mt-1 text-base text-slate-500">Welcome back, Alex Rivera</p></div><div className="hidden text-right sm:block"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today</p><p className="mt-1 text-sm font-semibold text-slate-600">Friday, September 4, 2026</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, detail, Icon, tone }) => <article key={label} className="rounded-xl border border-slate-200 bg-white px-6 py-5"><div className="flex items-start justify-between"><Icon size={19} className="text-slate-400" />{detail && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone === 'negative' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>{detail}</span>}</div><p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></article>)}</div>
    <div className="grid gap-5 xl:grid-cols-2"><section className="rounded-xl border border-slate-200 bg-white p-6"><div><h2 className="font-bold text-slate-950">Monthly Revenue</h2><p className="mt-1 text-sm text-slate-400">Jan - Jun 2026</p></div><RevenueChart /></section><section className="rounded-xl border border-slate-200 bg-white p-6"><div><h2 className="font-bold text-slate-950">Subscriber Growth</h2><p className="mt-1 text-sm text-slate-400">Jan - Jun 2026</p></div><LineChart /></section></div>
    <div className="grid gap-5 xl:grid-cols-[1.65fr_.85fr]"><section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 className="font-bold">Recent Installations</h2><button className="text-sm font-semibold text-[#3b6ff0] transition-colors duration-150 hover:text-[#2d3fc7]">View all</button></div><div className="overflow-x-auto"><table className="w-full min-w-175 text-left"><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-4 font-semibold">Reference</th><th className="px-6 py-4 font-semibold">Subscriber</th><th className="px-6 py-4 font-semibold">Technician</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Status</th></tr></thead><tbody>{installations.map(([reference, subscriber, technician, date, status]) => <tr className="border-b border-slate-100 last:border-0" key={reference}><td className="px-6 py-4 text-sm font-semibold text-[#3b6ff0]">{reference}</td><td className="px-6 py-4 text-sm font-semibold">{subscriber}</td><td className="px-6 py-4 text-sm text-slate-500">{technician}</td><td className="px-6 py-4 text-sm text-slate-500">{date}</td><td className="px-6 py-4"><Badge value={status} /></td></tr>)}</tbody></table></div></section><section className="rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 className="font-bold">Recent Activity</h2><button aria-label="More activity" className="rounded-lg p-2 text-slate-400 transition-colors duration-150 hover:bg-[#f1f5f9]"><MoreHorizontal size={18} /></button></div><div className="space-y-1 p-4">{activities.map(({ Icon, text, date, tone }) => <div className="flex gap-3 rounded-lg px-1 py-2" key={text}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone === 'green' ? 'bg-emerald-50 text-emerald-500' : tone === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}><Icon size={16} /></span><div className="min-w-0"><p className="text-sm text-slate-600">{text}</p><p className="mt-0.5 text-xs text-slate-400">{date}</p></div></div>)}</div></section></div>
  </div></PortalShell>;
}
