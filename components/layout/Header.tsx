'use client';

import { Bars3Icon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Header({
  setSidebarOpen,
  collapsed,
  setCollapsed,
}: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sticky top-0 z-10 flex h-20 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      {/* Hamburger (mobile) + Collapse (desktop) */}
      <div className="flex items-center border-r border-gray-200">
        {/* Mobile */}
        <button
          type="button"
          className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Desktop collapse */}
        <button
          type="button"
          className="hidden lg:flex px-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="sr-only">Toggle sidebar</span>
          <ChevronLeftIcon
            className={`h-6 w-6 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Logo */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
            <Image
              src="/images/LOGO-SANGUKU.png"
              alt="Sanguku Logo"
              width={48}
              height={48}
              className="drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* User profile */}
      <div className="flex items-center pr-4 lg:pr-8">
        <div className="relative">
          <button
            type="button"
            className="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 px-4 py-2 border border-gray-200"
            onClick={() => {/* toggle dropdown */}}
          >
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{user?.nama}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role_name}</div>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.nama?.charAt(0)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}