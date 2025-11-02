// components/layout/Sidebar.tsx
'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  XMarkIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Warna custom - sesuaikan dengan kebutuhan Anda
const SIDEBAR_COLORS = {
  background: 'bg-blue-900', // Warna background sidebar
  text: 'text-white', // Warna teks utama
  textMuted: 'text-blue-200', // Warna teks secondary
  hover: 'bg-blue-800', // Warna hover
  active: 'bg-blue-700', // Warna item active
  border: 'border-blue-800', // Warna border
  logo: 'text-white', // Warna logo
  icon: 'text-blue-300', // Warna icon default
  iconActive: 'text-white', // Warna icon active
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const getNavigation = () => {
    const basePath = `/${user?.role_name.toLowerCase()}`;
    
    return [
      { 
        name: 'Dashboard', 
        href: `${basePath}/dashboard`, 
        icon: HomeIcon 
      },
      { 
        name: 'Membership', 
        href: `${basePath}/membership`, 
        icon: UserGroupIcon 
      },
      { 
        name: 'Booking', 
        href: `${basePath}/booking`, 
        icon: CalendarIcon 
      },
    ];
  };

  const navigation = getNavigation();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile sidebar */}
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
              <Dialog.Panel className={`relative flex w-full max-w-xs flex-1 flex-col ${SIDEBAR_COLORS.background}`}>
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex flex-shrink-0 items-center px-4 pt-5">
                  <h1 className={`text-xl font-bold ${SIDEBAR_COLORS.logo}`}>SIPS</h1>
                </div>

                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="px-2 space-y-1">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                            isActive
                              ? `${SIDEBAR_COLORS.active} ${SIDEBAR_COLORS.text}`
                              : `${SIDEBAR_COLORS.textMuted} hover:${SIDEBAR_COLORS.hover} hover:${SIDEBAR_COLORS.text}`
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          <item.icon
                            className={`mr-4 h-6 w-6 flex-shrink-0 ${
                              isActive ? SIDEBAR_COLORS.iconActive : SIDEBAR_COLORS.icon
                            }`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className={`flex flex-shrink-0 border-t ${SIDEBAR_COLORS.border} p-4`}>
                  <div className="group block flex-shrink-0">
                    <div className="flex items-center">
                      <div>
                        <div className={`text-base font-medium ${SIDEBAR_COLORS.text}`}>
                          {user?.nama}
                        </div>
                        <div className={`text-sm font-medium ${SIDEBAR_COLORS.textMuted} capitalize`}>
                          {user?.role_name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-2 text-sm text-red-300 hover:text-red-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0" aria-hidden="true">
              {/* Dummy element */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-grow flex-col overflow-y-auto border-r ${SIDEBAR_COLORS.border} ${SIDEBAR_COLORS.background} pt-5`}>
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className={`text-xl font-bold ${SIDEBAR_COLORS.logo}`}>SIPS</h1>
          </div>

          <div className="mt-5 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-2 pb-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? `${SIDEBAR_COLORS.active} ${SIDEBAR_COLORS.text}`
                        : `${SIDEBAR_COLORS.textMuted} hover:${SIDEBAR_COLORS.hover} hover:${SIDEBAR_COLORS.text}`
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 flex-shrink-0 ${
                        isActive ? SIDEBAR_COLORS.iconActive : SIDEBAR_COLORS.icon
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className={`flex flex-shrink-0 border-t ${SIDEBAR_COLORS.border} p-4`}>
              <div className="group block w-full flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm font-medium ${SIDEBAR_COLORS.text}`}>
                      {user?.nama}
                    </div>
                    <div className={`text-xs font-medium ${SIDEBAR_COLORS.textMuted} capitalize`}>
                      {user?.role_name}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-300 hover:text-red-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}