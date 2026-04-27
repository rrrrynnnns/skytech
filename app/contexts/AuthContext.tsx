'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '@/app/lib/types';

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('authState');
    if (storedAuth) {
      try {
        setAuthState(JSON.parse(storedAuth));
      } catch (error) {
        console.error('Failed to parse auth state:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'sarisaristore@gmail.com' && password === 'utangreminder') {
      const newAuthState: AuthState = {
        isAuthenticated: true,
        username,
      };
      setAuthState(newAuthState);
      localStorage.setItem('authState', JSON.stringify(newAuthState));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      username: null,
    });
    localStorage.removeItem('authState');
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
