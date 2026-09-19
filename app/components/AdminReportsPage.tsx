'use client';

import { Download } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const revenue = [68, 72, 76, 84, 91, 100];
const growth = [6, 7, 7, 8, 9, 10];
const plans = [
  ['Fiber 100Mbps', 5, 50, 'bg-[#2f67e8]'],
  ['Fiber 50Mbps', 2, 20, 'bg-[#119bb5]'],
  ['Fiber 25Mbps', 3, 30, 'bg-[#7b3fe4]'],
] as const;

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold">{title}</h2><p className="mt-1 text-sm text-slate-400">{subtitle}</p>{children}</section>;
}

export function AdminReportsPage() {
  return <PortalShell role="admin"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3b4fd8]">Performance</p><h1 className="mt-2 text-2xl font-bold tracking-tight">Reports &amp; Analytics</h1><p className="mt-1 text-sm text-slate-500">H1 2026 performance overview</p></div><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Download size={16} />Export Report</button></div><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['TOTAL REVENUE', '₱66,740', '+12.4% vs last period'], ['AVG PER SUBSCRIBER', '₱1,236', '+4.8% average value'], ['COLLECTION RATE', '30%', '+6.2% this quarter'], ['ACTIVE SUBSCRIBERS', '9', '+2 subscribers']].map(([label, value, trend]) => <article className="rounded-xl border border-slate-200 bg-white px-6 py-5" key={label}><p className="text-xs font-bold tracking-wide text-slate-400">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p><p className="mt-2 text-xs font-semibold text-emerald-600">{trend}</p></article>)}</div><div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><ChartCard title="Monthly Revenue" subtitle="Jan - Jun 2026"><div className="mt-7 flex h-56 items-end gap-3 border-b border-slate-100 px-3 sm:gap-6">{revenue.map((value, index) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={months[index]}><div className="w-full max-w-10 rounded-t bg-[#2f67e8] transition-all hover:bg-[#1f54ca]" style={{ height: `${value}%` }} title={`Revenue ${value}%`} /><span className="text-xs text-slate-400">{months[index]}</span></div>)}</div></ChartCard><ChartCard title="Plan Distribution" subtitle="Subscribers by plan"><div className="mt-8 space-y-7">{plans.map(([name, count, percentage, color]) => <div key={name}><div className="flex justify-between text-sm"><span className="font-semibold">{name}</span><span className="text-slate-400">{count} · {percentage}%</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>)}</div></ChartCard></div><ChartCard title="Subscriber Growth" subtitle="Monthly active subscribers Jan - Jun 2026"><div className="mt-8 flex h-48 items-end gap-3 border-b border-slate-100 px-2 sm:gap-8">{growth.map((value, index) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={months[index]}><div className="relative flex h-full w-full items-end"><div className="absolute bottom-0 left-0 right-0 h-px bg-[#2f67e8]/20" /><div className="mx-auto h-1.5 w-1.5 rounded-full bg-[#2f67e8]" style={{ marginBottom: `${value * 14}px` }} title={`${value} active subscribers`} /></div><span className="text-xs text-slate-400">{months[index]}</span></div>)}</div></ChartCard></PortalShell>;
}
