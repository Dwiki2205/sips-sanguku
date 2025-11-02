'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Link from 'next/link';

interface Booking {
  booking_id: string;
  nama_pelanggan: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  jenis_layanan: string;
  status: string;
  total_biaya: number;
}

interface Membership {
  membership_id: string;
  tier_membership: string;
  status_keaktifan: string;
  expired_date: string;
  tanggal_daftar?: string;
}

export default function PelangganDashboard() {
  const [user, setUser] = useState<any>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myMembership, setMyMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user data
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUser(userData);
        
        // === POIN 3: TAMBAHKAN AUTH HEADERS ===
        // Fungsi untuk get token dari cookies
        const getToken = () => {
          return document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];
        };

        const token = getToken();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        // === END POIN 3 ===

        // Get user's bookings DENGAN AUTH HEADER
        try {
          const bookingsResponse = await fetch('/api/booking?limit=5', {
            headers: headers  // ← INI YANG DITAMBAH
          });
          
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            if (bookingsData.success && bookingsData.data) {
              setMyBookings(bookingsData.data.slice(0, 3));
            }
          } else {
            console.warn('Failed to fetch bookings:', bookingsResponse.status);
          }
        } catch (bookingError) {
          console.error('Error fetching bookings:', bookingError);
        }

        // Get user's membership DENGAN AUTH HEADER
        try {
          const membershipResponse = await fetch('/api/membership', {
            headers: headers  // ← INI YANG DITAMBAH
          });
          
          if (membershipResponse.ok) {
            const membershipData = await membershipResponse.json();
            if (membershipData.success && membershipData.data && membershipData.data.length > 0) {
              setMyMembership(membershipData.data[0]);
            }
          } else {
            console.warn('Failed to fetch membership:', membershipResponse.status);
          }
        } catch (membershipError) {
          console.error('Error fetching membership:', membershipError);
        }

        } catch (error: any) {
          console.error('Error fetching dashboard data:', error);
          if (error.message?.includes('401') || error.message?.includes('Token')) {
            window.location.href = '/login';
          }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ... rest of the code tetap sama
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (loading || !user) {
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
    // <DashboardLayout> {/* HAPUS prop user di sini */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Pelanggan</h1>
          <p className="text-gray-600">Kelola booking dan membership Anda</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard
            title="Booking Aktif"
            value={myBookings.filter(b => b.status === 'Confirmed').length}
            icon="📅"
            description="Booking yang confirmed"
          />
          <StatsCard
            title="Total Booking"
            value={myBookings.length}
            icon="📊"
            description="Semua booking"
          />
          <StatsCard
            title="Status Membership"
            value={myMembership ? myMembership.tier_membership : 'Tidak Aktif'}
            icon="👥"
            description={myMembership ? `Berlaku hingga ${formatDate(myMembership.expired_date)}` : 'Belum memiliki membership'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Bookings */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Booking Saya</h2>
                <Link 
                  href="/pelanggan/booking/tambah"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Booking Baru
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {myBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBookings.map((booking) => (
                      <TableRow key={booking.booking_id}>
                        <TableCell>
                          {formatDate(booking.tanggal_booking)}
                        </TableCell>
                        <TableCell>
                          {formatTime(booking.jam_mulai)} - {formatTime(booking.jam_selesai)}
                        </TableCell>
                        <TableCell>{booking.jenis_layanan}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
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
                  <p className="text-gray-500 mb-4">Belum ada booking</p>
                  <Link 
                    href="/pelanggan/booking/tambah"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Buat Booking Pertama
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membership Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Membership Saya</h2>
                {!myMembership && (
                  <Link 
                    href="/pelanggan/membership/tambah"
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Daftar Membership
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {myMembership ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Tier Membership</h3>
                      <p className="text-2xl font-bold text-indigo-600">{myMembership.tier_membership}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        myMembership.status_keaktifan === 'Aktif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {myMembership.status_keaktifan}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Tanggal Daftar</p>
                      <p className="font-medium">
                        {myMembership.tanggal_daftar ? formatDate(myMembership.tanggal_daftar) : 'Tidak tersedia'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Berlaku Hingga</p>
                      <p className="font-medium">{formatDate(myMembership.expired_date)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Benefit {myMembership.tier_membership}:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Diskon 10% untuk semua layanan</li>
                      <li>• Prioritas booking</li>
                      <li>• Free minuman setiap kunjungan</li>
                      {myMembership.tier_membership === 'Gold' && (
                        <li>• Free 1 jam rental PS per minggu</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Punya Membership</h3>
                  <p className="text-gray-600 mb-4">Daftar sekarang untuk mendapatkan benefit khusus!</p>
                  <Link 
                    href="/pelanggan/membership/tambah"
                    className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                  >
                    Daftar Membership
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    // </DashboardLayout>
  );
}