'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function PegawaiDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalMemberships: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [bookingsRes, membershipsRes] = await Promise.all([
        fetch('/api/booking'),
        fetch('/api/membership')
      ]);

      const bookingsData = await bookingsRes.json();
      const membershipsData = await membershipsRes.json();

      if (bookingsData.success && membershipsData.success) {
        const bookings = bookingsData.data || [];
        const memberships = membershipsData.data || [];
        
        const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
        
        setStats({
          totalBookings: bookings.length,
          totalMemberships: memberships.length,
          pendingBookings
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Pegawai</h1>
      </div>

      {/* Welcome Message */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Selamat Datang, {user?.nama}!
        </h2>
        <p className="text-gray-600 mb-4">
          Anda login sebagai <strong>Pegawai</strong>. Anda memiliki akses untuk melihat data booking dan membership.
        </p>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Link 
            href="/pegawai/booking"
            className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 hover:bg-indigo-100 transition-colors"
          >
            <h3 className="font-semibold text-indigo-900">📋 Lihat Booking</h3>
            <p className="text-sm text-indigo-700 mt-2">
              Kelola dan lihat semua data booking pelanggan
            </p>
          </Link>
          
          <Link 
            href="/pegawai/membership" 
            className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
          >
            <h3 className="font-semibold text-green-900">👥 Lihat Membership</h3>
            <p className="text-sm text-green-700 mt-2">
              Lihat data membership pelanggan
            </p>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Booking</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Membership</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalMemberships}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Booking</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingBookings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/pegawai/booking"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Kelola Booking</h4>
              <p className="text-sm text-gray-500">Lihat dan kelola semua booking</p>
            </div>
          </Link>

          <Link 
            href="/pegawai/membership"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900">Kelola Membership</h4>
              <p className="text-sm text-gray-500">Lihat data membership pelanggan</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}