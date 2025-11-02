'use client';

import { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 justify-between px-4 lg:px-8">
        <div className="flex flex-1 items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Sistem Informasi Pengelolaan Sanguku
          </h1>
        </div>

        <div className="ml-4 flex items-center lg:ml-6">
          {/* Profile dropdown */}
          <div className="relative ml-3">
            <div>
              <button
                type="button"
                className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="ml-3 hidden text-sm font-medium text-gray-700 lg:block">
                  <span className="sr-only">Open user menu for </span>
                  {user?.nama}
                </span>
                <div className="ml-1 hidden lg:block">
                  <div className="text-xs font-medium text-gray-500 capitalize">
                    {user?.role_name}
                  </div>
                </div>
              </button>
            </div>

            {isDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}