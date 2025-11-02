'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  totalBooking: number;
  totalMembership: number;
  pendapatanHariIni: number;
  bookingHariIni: number;
}

interface Booking {
  booking_id: string;
  nama_lengkap: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  total_biaya: number;
  metode_pembayaran: string;
}

export default function PegawaiDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Get dashboard stats
        const statsResponse = await fetch('/api/dashboard/stats?role=pegawai');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          setStats(statsData.data);
        }

        // Get today's bookings
        const today = new Date().toISOString().split('T')[0];
        const bookingsResponse = await fetch(`/api/booking?tanggal=${today}&limit=10`);
        const bookingsData = await bookingsResponse.json();
        
        if (bookingsData.success) {
          setTodayBookings(bookingsData.data);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'pending':
        return 'Menunggu';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Pegawai</h1>
          <p className="text-gray-600">Monitor booking dan aktivitas hari ini</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Booking"
              value={stats.totalBooking}
              icon="📅"
              description="Semua waktu"
            />
            <StatsCard
              title="Membership Aktif"
              value={stats.totalMembership}
              icon="👥"
              description="Pelanggan aktif"
            />
            <StatsCard
              title="Pendapatan Hari Ini"
              value={formatCurrency(stats.pendapatanHariIni)}
              icon="💰"
              description="Dari booking confirmed"
            />
            <StatsCard
              title="Booking Hari Ini"
              value={stats.bookingHariIni}
              icon="🔄"
              description="Total booking hari ini"
            />
          </div>
        )}

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Jadwal Hari Ini</h2>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </CardHeader>
          <CardContent>
            {todayBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayBookings.map((booking) => (
                    <TableRow key={booking.booking_id}>
                      <TableCell className="font-medium">
                        {formatTime(booking.jam_mulai)} - {formatTime(booking.jam_selesai)}
                      </TableCell>
                      <TableCell>{booking.nama_lengkap}</TableCell>
                      <TableCell>
                        {(() => {
                          const start = new Date(`2000-01-01T${booking.jam_mulai}`);
                          const end = new Date(`2000-01-01T${booking.jam_selesai}`);
                          const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                          return `${diff} jam`;
                        })()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {booking.metode_pembayaran || 'Belum bayar'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(booking.total_biaya)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada booking untuk hari ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}