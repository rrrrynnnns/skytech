'use client';

import React from 'react';
import { AuthProvider } from '@/app/contexts/AuthContext';
import { StoreProvider } from '@/app/contexts/StoreContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
  );
}
