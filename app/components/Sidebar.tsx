'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { LayoutDashboard, Users, Receipt, Archive, LogOut, Store, Check } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const isActive = (path: string) => pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Archive', path: '/archive', icon: Archive },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col bg-linear-to-b from-[#071427] via-[#0c1c33] to-[#101f3a] text-slate-100">
      {/* Branding */}
      <div className="flex items-center gap-4 border-b border-white/10 px-6 py-6">
        <div className="relative">
          <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-linear-to-br from-[#2f67ff] to-[#1f4fe0] text-white shadow-[0_12px_26px_rgba(37,99,235,0.6)]">
            <Store className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-[#071427] bg-[#22c55e] text-white shadow-[0_6px_14px_rgba(34,197,94,0.5)]">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Sari-Sari Store</h1>
          <p className="text-xs text-slate-300">Utang Reminder</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#2563eb] text-white shadow-[0_12px_30px_rgba(37,99,235,0.55)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] ${
                      active
                        ? 'bg-white/15 text-white'
                        : 'bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 px-6 py-5">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-3 text-sm font-semibold text-[#fb6b6b] transition hover:text-[#ff8585]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#fb6b6b]/40 bg-[#2b1720] text-[#fb6b6b]">
            <LogOut className="h-4 w-4" />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}
