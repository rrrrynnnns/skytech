'use client';

import { ChevronRight, UserRound } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { PortalShell } from '@/app/components/PortalShell';

export default function TechnicianProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' });
  }

  if (isEditing) return <PortalShell role="technician"><div className="min-h-screen bg-white px-5 py-7 sm:px-8 lg:px-10"><button onClick={() => setIsEditing(false)} className="mb-7 text-sm font-semibold text-[#2161e8]">&lt; Back to Profile</button><h1 className="text-3xl font-bold text-[#24417e]">Profile details</h1><p className="mt-4 text-sm text-slate-500">Update your technician account details.</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-sm text-slate-600">Full name<input defaultValue="Marcus Chen" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></label><label className="text-sm text-slate-600">Employee ID<input defaultValue="EMP-001" disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" /></label><label className="text-sm text-slate-600">Email address<input defaultValue="marcus@skytech.net" type="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></label><label className="text-sm text-slate-600">Contact number<input defaultValue="09171234567" type="tel" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none" /></label></div><button className="mt-8 w-full rounded-2xl bg-[#2161f2] px-5 py-4 font-bold text-white">Save changes</button></div></PortalShell>;

  return <PortalShell role="technician"><div className="min-h-screen bg-white"><section className="border-b border-slate-100 px-5 pb-9 pt-11 text-center sm:px-8"><span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#2161e8] text-3xl font-bold text-white">MC</span><h1 className="mt-5 text-2xl font-bold text-[#24417e]">Marcus Chen</h1><p className="mt-1 text-lg font-bold text-[#2161e8]">EMP-001</p></section><main className="mx-auto max-w-7xl"><section><h2 className="px-5 pb-4 pt-7 text-xl font-bold text-[#24417e] sm:px-8 lg:px-10">Account Settings</h2><button onClick={() => setIsEditing(true)} className="flex w-full items-center gap-4 border-b border-slate-100 px-5 py-5 text-left text-base text-slate-600 transition-colors duration-150 hover:bg-slate-50 sm:px-8 lg:px-10"><UserRound size={21} className="text-slate-500" /><span className="flex-1">Profile details</span><ChevronRight size={18} className="text-slate-400" /></button></section><div className="px-5 pb-32 pt-7 sm:px-8 lg:px-10"><button onClick={handleSignOut} className="w-full rounded-2xl border border-red-200 bg-red-50 py-4 text-base font-bold text-red-600 transition-colors duration-150 hover:bg-red-100">Sign Out</button></div></main></div></PortalShell>;
}
