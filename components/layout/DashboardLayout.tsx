'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Desktop collapse
  const [collapsed, setCollapsed] = useState(false);

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (mobile + desktop) */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}   // ← kirim ke Sidebar
      />

      {/* Main area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <Header
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="flex-1 pb-8">
          <div className="px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}