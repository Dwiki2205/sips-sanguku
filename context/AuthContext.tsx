'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Auto-redirect jika sudah login dan di halaman root
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          const role = userData.role_name?.toLowerCase();
          if (role && ['owner', 'pegawai', 'pelanggan'].includes(role)) {
            router.push(`/${role}/dashboard`);
          } else {
            router.push('/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: User) => {
    setUser(userData);

    const role = userData.role_name?.toLowerCase();

    if (!role) {
      router.push('/');
      return;
    }

    const validRoles = ['owner', 'pegawai', 'pelanggan'];
    if (validRoles.includes(role)) {
      router.push(`/${role}/dashboard`);
    } else {
      router.push('/dashboard');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Starting logout process...');
      
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }

      console.log('✅ Logout API success');
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      // SELALU clear state
      setUser(null);
      
      // **FIX: Clear any pending navigation dan force redirect**
      if (typeof window !== 'undefined') {
        // Method 1: Force redirect dengan replace (recommended)
        window.location.replace('/');
        
        // Atau Method 2: Hard redirect
        // window.location.href = '/';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};