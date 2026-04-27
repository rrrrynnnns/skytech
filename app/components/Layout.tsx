'use client';

import { Sidebar } from '@/app/components/Sidebar';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="ml-72 flex-1 min-h-screen bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
