'use client';

import Link from 'next/link';
import { ArrowLeft, Bell, Check, FileText, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';

type NotificationItem = { id: string; type: string; title: string; body: string; timestamp: string; read: boolean };
type Filter = 'All' | 'Advisories' | 'Transaction' | 'Reminders';

const filters: { label: Filter; type?: string }[] = [
  { label: 'All' },
  { label: 'Advisories', type: 'advisory' },
  { label: 'Transaction', type: 'transaction' },
  { label: 'Reminders', type: 'reminder' },
];

function notificationIcon(type: string) {
  if (type === 'advisory') return <Wrench size={16} />;
  if (type === 'reminder') return <Bell size={16} />;
  return <FileText size={16} />;
}

function notificationTone(type: string) {
  if (type === 'advisory') return 'bg-emerald-50 text-emerald-500';
  if (type === 'reminder') return 'bg-blue-50 text-blue-500';
  return 'bg-orange-50 text-orange-500';
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {
    fetch('/api/notifications').then(async (response) => { if (!response.ok) return; const result = await response.json(); if (Array.isArray(result.data)) setNotifications(result.data); }).catch(() => undefined);
  }, []);

  async function markAllRead() {
    setIsMarkingRead(true);
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'PUT' });
      if (response.ok) setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } finally {
      setIsMarkingRead(false);
    }
  }

  const filtered = notifications.filter((item) => activeFilter === 'All' || item.type === filters.find((filter) => filter.label === activeFilter)?.type);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return <PortalShell role="subscriber"><div className="min-h-screen bg-[#f7f9fc]"><header className="flex items-center justify-between gap-4 bg-[#2447b6] px-5 py-6 text-white sm:px-8 lg:px-10"><div className="flex items-center gap-3"><Link href="/subscriber/my-account" aria-label="Back to home" className="rounded-full bg-white/15 p-2 transition-colors duration-150 hover:bg-white/25"><ArrowLeft size={20} /></Link><h1 className="text-2xl font-bold">Notifications</h1></div><button disabled={isMarkingRead || unreadCount === 0} onClick={markAllRead} className="rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-white/25">{isMarkingRead ? 'Marking...' : 'Mark all read'}</button></header><div className="border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-10"><div className="flex gap-7 overflow-x-auto scrollbar-hidden">{filters.map(({ label }) => <button key={label} onClick={() => setActiveFilter(label)} className={`flex shrink-0 items-center gap-2 border-b-2 px-0 py-5 text-sm font-semibold transition-colors duration-150 ${activeFilter === label ? 'border-[#2166f3] text-[#2166f3]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{label}{label === 'All' && unreadCount > 0 && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-[#2166f3]">{unreadCount}</span>}{label === 'Transaction' && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-400">{notifications.filter((item) => item.type === 'transaction' && !item.read).length}</span>}</button>)}</div></div><main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10"><div className="grid gap-3">{filtered.map((item) => <article className={`flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-100 hover:bg-[#f8fafc] sm:p-5 ${!item.read ? 'border-l-2 border-l-[#2166f3]' : ''}`} key={item.id}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${notificationTone(item.type)}`}>{notificationIcon(item.type)}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{item.body}</p></div><time className="shrink-0 text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time></div></div>{!item.read && <span className="mt-7 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2f68e6]" aria-label="Unread" />}</article>)}</div>{filtered.length === 0 && <div className="py-20 text-center text-slate-400"><Check className="mx-auto text-emerald-400" size={32} /><p className="mt-3 font-semibold">No notifications in this category.</p></div>}</main></div></PortalShell>;
}
