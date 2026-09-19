'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Check, FileText, Wrench } from 'lucide-react';
import Link from 'next/link';
import { PortalShell } from '@/app/components/PortalShell';

type NotificationItem = { id: string; type: string; title: string; body: string; timestamp: string; read: boolean };

function icon(type: string) {
  if (type === 'advisory') return <Wrench size={17} />;
  if (type === 'reminder') return <Bell size={17} />;
  return <FileText size={17} />;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    fetch('/api/notifications').then(async (response) => { if (!response.ok) return; const result = await response.json(); if (Array.isArray(result.data)) setItems(result.data); }).catch(() => undefined);
  }, []);

  async function markAllRead() {
    setIsMarking(true);
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'PUT' });
      if (response.ok) setItems((current) => current.map((item) => ({ ...item, read: true })));
    } finally {
      setIsMarking(false);
    }
  }

  const unread = items.filter((item) => !item.read).length;
  return <PortalShell role="admin"><div className="min-h-screen bg-[#f7f9fc]"><header className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-8 lg:px-10"><div className="flex items-center gap-3"><Link href="/admin/dashboard" aria-label="Back to dashboard" className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"><ArrowLeft size={19} /></Link><div><h1 className="text-2xl font-bold">Notifications</h1><p className="mt-1 text-sm text-slate-500">Keep track of important operations updates</p></div></div><button disabled={isMarking || unread === 0} onClick={markAllRead} className="inline-flex items-center gap-2 rounded-xl bg-[#2f68e6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2458c8]"><Check size={16} />{isMarking ? 'Marking...' : 'Mark all read'}</button></header><main className="mx-auto max-w-4xl px-5 py-6 sm:px-8 lg:px-10"><div className="mb-5 flex items-center justify-between"><h2 className="font-bold">Recent activity</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2f68e6]">{unread} unread</span></div><div className="grid gap-3">{items.map((item) => <article className={`flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${!item.read ? 'border-l-2 border-l-[#2f68e6]' : ''}`} key={item.id}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2f68e6]">{icon(item.type)}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h3 className="font-bold">{item.title}</h3>{!item.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2f68e6]" aria-label="Unread" />}</div><p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p><p className="mt-3 text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p></div></article>)}</div></main></div></PortalShell>;
}
