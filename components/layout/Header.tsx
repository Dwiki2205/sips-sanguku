// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
    <div className="sticky top-0 z-10 flex h-20 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      {/* Hamburger Menu Button */}
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Logo di Tengah */}
      <div className="flex flex-1 justify-center items-center">
        <div className="flex items-center space-x-3">
          {/* Logo Sanguku - ganti dengan path logo Anda */}
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
            {/* Jika ada gambar logo: */}
            <Image 
              src="/images/LOGO-SANGUKU.png" 
              alt="Sanguku Logo" 
              width={48} 
              height={48}
              className=""
            />
          </div>
          {/* <h1 className="text-xl font-bold text-gray-900">
            Sanguku
          </h1> */}
        </div>
      </div>

      {/* User Profile di Kanan */}
      <div className="flex items-center pr-4 lg:pr-8">
        <div className="relative ml-3">
          <button
            type="button"
            className="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 px-4 py-2 border border-gray-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">
                {user?.nama}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role_name}
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.nama?.charAt(0)}
              </span>
            </div>
          </button>

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
  );
}