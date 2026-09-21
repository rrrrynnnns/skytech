'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, CircleHelp, CreditCard, FileText, MessageSquare, PhilippinePeso, Wifi, Zap } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';
import { Badge } from '@/app/components/Badge';
import { formatPersonName } from '@/app/lib/name';

const actions = [
  { label: 'Pay Bills', href: '/subscriber/pay-bills', Icon: CreditCard },
  { label: 'Plan Details', href: '/subscriber/plan-details', Icon: FileText },
  { label: 'My Transaction', href: '/subscriber/my-transactions', Icon: FileText },
  { label: 'Get Help', href: '/shared/my-tasks', Icon: CircleHelp },
];

const requests = [
  { title: 'Billing Inquiry', date: 'June 20, 2026', status: 'Open' },
  { title: 'Technical Issue', date: 'June 18, 2026', status: 'In Progress' },
];

export default function SubscriberAccount() {
  const [account, setAccount] = useState<{ name: string; contact: string; planName: string; speedMbps: number; monthlyPrice: number } | null>(null);
  const [historyBills, setHistoryBills] = useState<Array<{ amount: number; dueDate: string; status: string }>>([]);
  const [billStatus, setBillStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch('/api/account'), fetch('/api/bills')]).then(async ([accountResponse, billsResponse]) => {
      const accountResult = await accountResponse.json();
      const billsResult = await billsResponse.json();
      if (accountResult.data) setAccount(accountResult.data);
      const currentBill = Array.isArray(billsResult.data) ? billsResult.data.find((bill: { status: string }) => bill.status !== 'Paid') || billsResult.data[0] : null;
      if (currentBill) {
        setBillStatus(currentBill.status);
      }
      if (Array.isArray(billsResult.data)) setHistoryBills(billsResult.data.slice(0, 3));
    }).catch(() => undefined);
  }, []);

  const name = formatPersonName(account?.name || 'Loading account...');
  const firstName = name.split(' ')[0] || 'Loading';
  const price = account?.monthlyPrice ? `₱${account.monthlyPrice.toLocaleString()}` : '';
  const isPaid = billStatus === 'Paid';

  return <PortalShell role="subscriber">
    <div className="w-full bg-[#2447b6] px-4 pb-7 pt-7 text-white sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-3"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#4770d6] text-lg font-bold">{firstName.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="text-sm text-blue-100">Good evening</p><h1 className="text-xl font-bold">{firstName}</h1></div></div><div className="flex shrink-0 items-center gap-2"><Link href="/shared/notifications" aria-label="Notifications" className="relative rounded-2xl bg-[#4770d6] p-3"><Bell size={20} /><span className="absolute right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff3b50] px-1 text-[9px] font-bold">1</span></Link><Link href="/shared/my-tasks" className="flex items-center gap-2 rounded-2xl bg-[#4770d6] px-4 py-3 text-sm font-semibold"><MessageSquare size={16} />Help</Link></div></div>
        <section className="overflow-hidden rounded-3xl bg-white text-slate-950 shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-5 sm:px-6"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2166f3] text-white"><Wifi size={22} /></span><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sky-Tech Fiber</p></div><Badge value={isPaid ? 'Paid' : 'Unpaid'} /></div><div className="flex items-end justify-between gap-4 px-4 py-6 sm:px-6"><div><h2 className="text-xl font-bold">{name}</h2><p className="mt-1 text-sm text-slate-400">{account?.contact || ''}</p></div><div className="text-right"><p className={`text-2xl font-bold ${isPaid ? 'text-emerald-700' : 'text-[#2447b6]'}`}>{isPaid ? 'All set!' : price}</p><p className="text-xs text-slate-400">{isPaid ? 'Amount paid' : 'Amount to pay'}</p></div></div><div className="grid grid-cols-3 border-t border-slate-100 bg-[#f8faff] py-5"><div className="flex flex-col items-center gap-2 border-r border-slate-200"><Wifi size={21} className="text-[#2166f3]" /><strong>{account ? 'Unli' : 'Loading'}</strong><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Data</span></div><div className="flex flex-col items-center gap-2 border-r border-slate-200"><Zap size={21} className="text-[#2166f3]" /><strong>{account?.speedMbps || ''} Mbps</strong><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Speed</span></div><div className="flex flex-col items-center gap-2"><PhilippinePeso size={21} className="text-[#2166f3]" /><strong>{price}</strong><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monthly</span></div></div></section>
      </div>
    </div>
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:px-10"><h2 className="text-lg font-bold">How Can We Help You?</h2><div className="mt-4 grid grid-cols-4 gap-2 sm:gap-4">{actions.map(({ label, href, Icon }) => <Link href={href} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-1 py-3 text-center shadow-sm sm:min-h-32 sm:gap-4 sm:p-5" key={label}><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#2166f3] sm:h-12 sm:w-12"><Icon size={20} /></span><span className="text-[10px] font-semibold sm:text-xs">{label}</span></Link>)}</div><h2 className="mt-7 text-lg font-bold">My Transaction History</h2><div className="mt-4 grid gap-3">{historyBills.map((historyBill, index) => <Link href="/subscriber/my-transactions" className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm" aria-label="View transaction history" key={`${historyBill.dueDate}-${index}`}><div className="flex items-center gap-4"><span className="relative text-[#2447b6]"><FileText size={34} /><span className={`absolute -bottom-1 -right-1 text-[11px] font-extrabold leading-none ${historyBill.status === 'Paid' ? 'text-emerald-600' : 'text-amber-500'}`}>₱</span></span><div><p className="text-xs text-slate-400">{historyBill.status === 'Paid' ? 'Amount paid' : 'Amount to Pay'}</p><p className="mt-1 text-2xl font-bold leading-none text-[#2447b6]">₱{historyBill.amount.toLocaleString()}</p></div></div><p className="text-sm text-slate-400">{new Date(historyBill.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</p></Link>)}</div><h2 className="mt-7 text-lg font-bold">My Request History</h2><div className="mt-4 grid gap-3">{requests.map((request) => <Link href="/subscriber/my-tickets" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={request.title}><div><p className="font-bold">{request.title}</p><p className="mt-1 text-sm text-slate-400">{request.date}</p></div><Badge value={request.status} /></Link>)}</div></div>
  </PortalShell>;
}
