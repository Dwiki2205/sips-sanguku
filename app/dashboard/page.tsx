'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardRedirectPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const role = user.role_name.toLowerCase();
      router.push(`/${role}/dashboard`);
    } else {
      // Jika tidak ada user, redirect ke login
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
      <span className="ml-3 text-gray-600">Mengarahkan ke dashboard...</span>
    </div>
  );
}