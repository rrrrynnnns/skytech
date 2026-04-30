'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/app/components/Sidebar';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { Menu } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-20 md:hidden bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between h-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <h1 className="text-sm font-semibold text-slate-900">Sari-Sari Store</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Main Content */}
        <main className="w-full md:ml-72 pt-16 md:pt-0 md:min-h-screen bg-gray-50 md:p-8 p-4">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
