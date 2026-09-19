'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, MessageSquare, Paperclip, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { PortalShell } from '@/app/components/PortalShell';

const suggestions = ['Check my bill', 'My installation schedule', 'Slow internet', 'File a ticket'];

type Message = { id: number; content: string; from: 'assistant' | 'user'; time: string };

export default function SupportPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;
    setMessages((items) => [...items, { id: Date.now(), content, from: 'user', time: 'Now' }, { id: Date.now() + 1, content: 'Thanks for reaching out. I can help you with that. You can also file a support request for our team to review.', from: 'assistant', time: 'Now' }]);
    setMessage('');
  }

  return <PortalShell role="subscriber"><div className="flex min-h-screen flex-col bg-[#eef2ff]"><header className="flex items-center justify-between gap-4 bg-[#2447b6] px-5 py-6 text-white sm:px-8 lg:px-10"><div className="flex items-center gap-3"><Link href="/subscriber/my-account" aria-label="Back to home" className="rounded-full bg-white/15 p-2 transition-colors duration-150 hover:bg-white/25"><ArrowLeft size={20} /></Link><h1 className="text-2xl font-bold">Help Center</h1></div><Link href="/subscriber/my-tickets" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:bg-white/25"><FileText size={16} /> My Requests</Link></header><main className="flex flex-1 flex-col px-4 py-6 sm:px-8 lg:px-10"><div className="mx-auto flex w-full max-w-7xl flex-1 flex-col"><div className="flex items-center gap-3 text-sm text-slate-500"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#2166f3] text-white"><MessageSquare size={15} /></span><span>Sky-Tech Assistant</span></div><div className="mt-2 max-w-6xl rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm leading-6 text-slate-700 shadow-sm sm:text-base">Hello Maria! <span aria-hidden="true">👋</span> I&apos;m your Sky-Tech virtual assistant. I can help you with billing, installation schedules, connection issues, plan upgrades, and filing support tickets. How can I help you today?</div><div className="mt-3 flex flex-wrap gap-2">{suggestions.map((item) => <button type="button" onClick={() => setMessage(item)} key={item} className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-[#2166f3] transition-all duration-150 hover:bg-blue-50 active:scale-[0.98]">{item}</button>)}</div><p className="mt-2 text-xs text-slate-400">12:50 AM</p><div className="mt-4 space-y-3">{messages.map((item) => <div className={`flex ${item.from === 'user' ? 'justify-end' : 'justify-start'}`} key={item.id}><div className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${item.from === 'user' ? 'bg-[#2166f3] text-white' : 'bg-white text-slate-700 shadow-sm'}`}>{item.content}<p className={`mt-1 text-[10px] ${item.from === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>{item.time}</p></div></div>)}</div><div className="mt-auto pt-8"><form onSubmit={sendMessage} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><button type="button" aria-label="Attach file" className="rounded-lg p-2 text-slate-400 transition-colors duration-150 hover:bg-[#f1f5f9]"><Paperclip size={18} /></button><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask me anything about your account..." className="min-w-0 flex-1 border-0 px-2 py-3 text-sm outline-none focus:shadow-none" /><button type="submit" aria-label="Send message" disabled={!message.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#cbd5e1] text-white transition-colors duration-150 enabled:bg-[#2161f2] enabled:hover:bg-[#1652dc]"><Send size={18} /></button></form></div></div></main></div></PortalShell>;
}
