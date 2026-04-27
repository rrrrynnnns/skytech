'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push('/login');
    }
  }, [authState.isAuthenticated, router]);

  if (!authState.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
