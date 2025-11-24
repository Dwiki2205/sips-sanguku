'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  DocumentChartBarIcon,
  XMarkIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SIDEBAR_COLORS = {
  background: 'bg-blue-900',
  text: 'text-white',
  textMuted: 'text-blue-200',
  hover: 'bg-blue-800',
  active: 'bg-blue-700',
  border: 'border-blue-800',
  logo: 'text-white',
  icon: 'text-blue-300',
  iconActive: 'text-white',
};

// Definisikan tipe untuk menu navigasi
interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  roles: string[]; // Role yang diizinkan mengakses menu ini
}

export default function Sidebar({
  open,
  setOpen,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Base path berdasarkan role (owner, admin, dll)
  const basePath = user?.role_name ? `/${user.role_name.toLowerCase()}` : '/';
  const dashboardPath = `${basePath}/dashboard`;

  // Definisikan semua navigasi dengan permission role
  const allNavigation: NavigationItem[] = [
    { 
      name: 'Membership', 
      href: `${basePath}/membership`, 
      icon: UserGroupIcon,
      roles: ['owner', 'pegawai', 'pelanggan'] // Owner, Pegawai, Pelanggan
    },
    { 
      name: 'Booking', 
      href: `${basePath}/booking`, 
      icon: CalendarIcon,
      roles: ['owner', 'pegawai', 'pelanggan'] // Owner, Pegawai, Pelanggan
    },
    { 
      name: 'Stok', 
      href: `${basePath}/stok`, 
      icon: ShoppingCartIcon,
      roles: ['manager', 'pegawai'] // Manager, Pegawai
    },
    { 
      name: 'Laporan', 
      href: `${basePath}/laporan`, 
      icon: DocumentChartBarIcon,
      roles: ['manager'] // Hanya Manager
    },
    // MENU BARU — HANYA UNTUK OWNER
    { 
      name: 'Upload SIPS', 
      href: `${basePath}/upload-sips`, 
      icon: CloudArrowUpIcon,
      roles: ['owner'] // Hanya owner yang boleh lihat!
    },
  ];

  // Filter navigasi berdasarkan role user
  const getFilteredNavigation = (): NavigationItem[] => {
    if (!user?.role_name) return [];
    
    const userRole = user.role_name.toLowerCase();
    
    return allNavigation.filter(item => 
      item.roles.includes(userRole)
    );
  };

  const navigation = getFilteredNavigation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* ========== MOBILE SIDEBAR ========== */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel
                className={`relative flex w-full max-w-xs flex-1 flex-col ${SIDEBAR_COLORS.background} pt-5 pb-4`}
              >
                {/* Close Button */}
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>

                {/* Logo SIPS → ke Dashboard */}
                <Link
                  href={dashboardPath}
                  onClick={() => setOpen(false)}
                  className="flex flex-shrink-0 items-center px-4"
                >
                  <h1 className={`text-xl font-bold ${SIDEBAR_COLORS.logo}`}>SIPS</h1>
                </Link>

                {/* Navigation */}
                <nav className="mt-5 flex-1 space-y-1 px-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? `${SIDEBAR_COLORS.active} ${SIDEBAR_COLORS.text}`
                            : `${SIDEBAR_COLORS.textMuted} hover:${SIDEBAR_COLORS.hover} hover:${SIDEBAR_COLORS.text}`
                        }`}
                      >
                        <item.icon
                          className={`mr-4 h-6 w-6 flex-shrink-0 ${
                            isActive ? SIDEBAR_COLORS.iconActive : SIDEBAR_COLORS.icon
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout & User Info */}
                <div className={`flex-shrink-0 border-t ${SIDEBAR_COLORS.border} p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-base font-medium ${SIDEBAR_COLORS.text}`}>
                        {user?.nama || 'User'}
                      </div>
                      <div className={`text-sm ${SIDEBAR_COLORS.textMuted} capitalize`}>
                        {user?.role_name || 'Role'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-300 hover:text-red-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* ========== DESKTOP SIDEBAR (Collapsible) ========== */}
      <div
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:transition-all lg:duration-300 ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        }`}
      >
        <div
          className={`flex flex-col flex-grow ${SIDEBAR_COLORS.background} border-r ${SIDEBAR_COLORS.border} overflow-y-auto`}
        >
          {/* Logo SIPS → ke Dashboard */}
          <div className="flex items-center justify-between px-4 pt-5">
            <Link
              href={dashboardPath}
              className={`font-bold text-white transition-all ${
                collapsed ? 'w-0 opacity-0' : 'text-xl'
              }`}
              title={collapsed ? 'SIPS - Dashboard' : undefined}
            >
              SIPS
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className={`flex-1 px-2 pb-4 mt-5 space-y-1 ${collapsed ? 'px-3' : ''}`}
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-md transition-all ${
                    collapsed ? 'justify-center py-3' : 'px-2 py-2'
                  } text-sm font-medium ${
                    isActive
                      ? `${SIDEBAR_COLORS.active} ${SIDEBAR_COLORS.text}`
                      : `${SIDEBAR_COLORS.textMuted} hover:${SIDEBAR_COLORS.hover} hover:${SIDEBAR_COLORS.text}`
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon
                    className={`h-6 w-6 flex-shrink-0 ${collapsed ? '' : 'mr-3'} ${
                      isActive ? SIDEBAR_COLORS.iconActive : SIDEBAR_COLORS.icon
                    }`}
                  />
                  <span className={`${collapsed ? 'sr-only' : ''}`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout & User Info (Desktop) */}
          <div
            className={`flex-shrink-0 border-t ${SIDEBAR_COLORS.border} p-4 ${collapsed ? 'px-2' : ''}`}
          >
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
              {!collapsed && (
                <div>
                  <div className={`text-sm font-medium ${SIDEBAR_COLORS.text}`}>
                    {user?.nama || 'User'}
                  </div>
                  <div className={`text-xs ${SIDEBAR_COLORS.textMuted} capitalize`}>
                    {user?.role_name || 'Role'}
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-red-300 hover:text-red-100"
                title={collapsed ? 'Logout' : undefined}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}