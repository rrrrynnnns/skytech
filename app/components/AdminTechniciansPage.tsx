'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { PortalShell } from '@/app/components/PortalShell';

type Technician = readonly [string, string, string, string, string];
type Status = 'All' | 'Active' | 'Off Duty' | 'On Leave';

const statusStyles: Record<string, string> = {
  Active: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  'Off Duty': 'border-slate-200 bg-slate-50 text-slate-600',
  'On Leave': 'border-amber-200 bg-amber-50 text-amber-600',
};

export function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Status>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);

  useEffect(() => {
    fetch('/api/technicians').then((response) => response.json()).then((result) => {
      if (Array.isArray(result.data)) setTechnicians(result.data.map((item: { id: string; name: string; email: string; status: string }) => [item.id, item.name, item.email, '', item.status.replace('_', ' ')]));
    }).catch(() => undefined);
  }, []);

  const visibleTechnicians = technicians.filter((technician) => (filter === 'All' || technician[4] === filter) && technician.join(' ').toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const table = document.querySelector('table[class*="min-w-[900px]"]');
    const toolbar = table?.closest('.mt-4')?.previousElementSibling;
    if (!toolbar) return;
    toolbar.querySelectorAll('.installation-record-counter').forEach((node) => node.remove());
    toolbar.querySelectorAll('.live-record-counter').forEach((node, index) => { if (index > 0) node.remove(); });
    let counter = toolbar.querySelector<HTMLSpanElement>('.live-record-counter');
    if (!counter) {
      counter = document.createElement('span');
      counter.className = 'live-record-counter ml-auto text-sm text-slate-400';
      toolbar.appendChild(counter);
    }
    counter.textContent = `${visibleTechnicians.length} records`;
  }, [visibleTechnicians.length]);

  async function addTechnician(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get('firstName') || 'Juan');
    const lastName = String(form.get('lastName') || 'dela Cruz');
    const email = String(form.get('email') || 'email@skytech.net');
    const contact = String(form.get('contact') || '09XXXXXXXXX');
    const status = String(form.get('status') || 'Active') as Exclude<Status, 'All'>;
    if (editingTechnician) {
      const response = await fetch(`/api/technicians/${editingTechnician[0]}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${firstName} ${lastName}`, email, status: status.replace(/\s+/g, '_') }) });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        window.alert(result?.error || 'Unable to save technician changes.');
        return;
      }
      setTechnicians((current) => current.map((item) => item[0] === editingTechnician[0] ? [item[0], `${firstName} ${lastName}`, email, contact, status] : item));
      setEditingTechnician(null);
      setIsAdding(false);
      return;
    }
    const response = await fetch('/api/technicians', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${firstName} ${lastName}`, email, status: status.replace(/\s+/g, '_') }) });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      window.alert(result?.error || 'Unable to add technician.');
      return;
    }
    const result = await response.json();
    const created = result.data;
    setTechnicians((current) => [[created.id, created.name, created.email, contact, created.status.replace('_', ' ')], ...current]);
    setIsAdding(false);
  }

  useEffect(() => {
    function handleTableAction(event: MouseEvent) {
      const button = (event.target as HTMLElement).closest('button');
      const row = button?.closest('tr');
      const id = row?.querySelector('td')?.textContent?.trim();
      if (!button) return;
      if (!row) {
        if (button.textContent?.trim() === 'Add Technician') setEditingTechnician(null);
        return;
      }
      if (!id) return;
      const technician = technicians.find((item) => item[0] === id);
      if (!technician) return;
      if (button.textContent?.trim() === 'Delete') {
        if (window.confirm('Delete this technician?')) {
          fetch(`/api/technicians/${id}`, { method: 'DELETE' }).then((response) => {
            if (response.ok) setTechnicians((current) => current.filter((item) => item[0] !== id));
          }).catch(() => undefined);
        }
      }
      if (button.textContent?.trim() === 'Edit') {
        setEditingTechnician(technician);
        setIsAdding(true);
      }
    }
    document.addEventListener('click', handleTableAction);
    return () => document.removeEventListener('click', handleTableAction);
  }, [technicians]);

  useEffect(() => {
    const select = document.querySelector<HTMLSelectElement>('main:has(table[class*="900px"]) select');
    if (!select) return;
    let tabs = select.previousElementSibling as HTMLDivElement | null;
    if (!tabs?.classList.contains('admin-filter-tabs')) {
      tabs = document.createElement('div');
      tabs.className = 'admin-filter-tabs';
      select.parentElement?.insertBefore(tabs, select);
      select.hidden = true;
    }
    tabs.replaceChildren(...Array.from(select.options).map((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.value;
      const isActive = option.value === filter;
      button.style.cssText = `
        border-radius: 9999px;
        border: 1px solid ${isActive ? '#2447b6' : '#cbd5e1'};
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        background-color: ${isActive ? '#2447b6' : '#ffffff'};
        color: ${isActive ? '#ffffff' : '#64748b'};
        cursor: pointer;
        transition: all 150ms ease;
      `;
      button.onmouseover = () => {
        if (!isActive) button.style.backgroundColor = '#f1f5f9';
      };
      button.onmouseout = () => {
        if (!isActive) button.style.backgroundColor = '#ffffff';
      };
      button.onclick = () => {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      };
      return button;
    }));
  }, [filter]);

  useEffect(() => {
    function clearEditOnModalClose(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('fixed') && target.classList.contains('inset-0')) setEditingTechnician(null);
    }
    document.addEventListener('mousedown', clearEditOnModalClose);
    return () => document.removeEventListener('mousedown', clearEditOnModalClose);
  }, []);

  useEffect(() => {
    if (!isAdding) return;
    const form = document.querySelector<HTMLFormElement>('form');
    if (!form) return;
    const title = form.querySelector('h2');
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!editingTechnician) {
      form.reset();
      if (title) title.textContent = 'Add Technician';
      if (submitButton) submitButton.textContent = 'Add Technician';
      return;
    }
    if (title) title.textContent = 'Edit Technician';
    if (submitButton) submitButton.textContent = 'Save changes';
    const [firstName, ...lastNameParts] = editingTechnician[1].split(' ');
    (form.elements.namedItem('firstName') as HTMLInputElement).value = firstName;
    (form.elements.namedItem('lastName') as HTMLInputElement).value = lastNameParts.join(' ');
    (form.elements.namedItem('email') as HTMLInputElement).value = editingTechnician[2];
    (form.elements.namedItem('contact') as HTMLInputElement).value = editingTechnician[3];
    (form.elements.namedItem('status') as HTMLSelectElement).value = editingTechnician[4];
  }, [editingTechnician, isAdding]);

  return <PortalShell role="admin"><div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-2xl font-bold tracking-tight">Technicians</h1><p className="mt-1 text-sm text-slate-500">Manage field technicians</p></div><button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-full bg-[#3b4fd8] px-5 py-3 text-sm font-bold text-white hover:bg-[#2d3fc7]"><Plus size={17} />Add Technician</button></div><div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['TOTAL', '5'], ['ACTIVE', '4'], ['OFF DUTY', '1'], ['ON LEAVE', '0']].map(([label, value]) => <article className="rounded-xl border border-slate-200 bg-white px-6 py-5" key={label}><p className="text-xs font-bold tracking-wide text-slate-400">{label}</p><p className="mt-3 text-2xl font-bold text-slate-900">{value}</p></article>)}</div><div className="mt-7 flex flex-wrap items-center gap-3"><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#3b4fd8]" /></div><select value={filter} onChange={(event) => setFilter(event.target.value as Status)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"><option>All</option><option>Active</option><option>Off Duty</option><option>On Leave</option></select></div><div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400"><tr>{['Employee ID', 'Name', 'Email', 'Contact', 'Status', 'Actions'].map((heading) => <th className="px-5 py-4" key={heading}>{heading}</th>)}</tr></thead><tbody className="text-sm">{visibleTechnicians.map(([id, name, email, contact, status]) => <tr className="border-t border-slate-100" key={id}><td className="px-5 py-4 font-mono text-[#3b6ff5]">{id}</td><td className="px-5 py-4 font-semibold text-slate-900">{name}</td><td className="px-5 py-4 text-slate-500">{email}</td><td className="px-5 py-4 text-slate-500">{contact}</td><td className="px-5 py-4"><span className={`rounded-lg border px-2 py-1 text-xs font-semibold ${statusStyles[status]}`}>{status}</span></td><td className="px-5 py-4"><div className="flex gap-3 text-xs font-semibold"><button className="text-[#2563eb]">Edit</button><button className="text-red-500">Delete</button></div></td></tr>)}</tbody></table></div></div>{isAdding && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5" onMouseDown={() => setIsAdding(false)}><form onSubmit={addTechnician} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-bold">Add Technician</h2><button type="button" onClick={() => setIsAdding(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div><div className="space-y-5 px-6 py-6">{[['firstName', 'First name *', 'Juan'], ['middleName', 'Middle name (optional)', 'Santos'], ['lastName', 'Last name *', 'dela Cruz'], ['email', 'Email *', 'email@skytech.net'], ['contact', 'Contact *', '09XXXXXXXXX']].map(([name, label, placeholder]) => <label className="block text-xs font-bold uppercase tracking-wide text-slate-500" key={name}>{label}<input name={name} type={name === 'email' ? 'email' : 'text'} placeholder={placeholder} required={!name.includes('middle')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#3b4fd8]" /></label>)}<label className="block text-xs font-bold uppercase tracking-wide text-slate-500">Status<select name="status" defaultValue="Active" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none"><option>Active</option><option>Off Duty</option><option>On Leave</option></select></label></div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={() => setIsAdding(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white">Add Technician</button></div></form></div>}</PortalShell>;
}
