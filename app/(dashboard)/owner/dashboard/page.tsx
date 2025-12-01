// app/(dashboard)/owner/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import RecentBookingsTable from '@/components/dashboard/RecentBookingsTable';
import ExpiringMembershipsTable from '@/components/dashboard/ExpiringMembershipsTable';
import BookingStatsTable from '@/components/dashboard/BookingStatsTable';
import BookingTrendChart from '@/components/dashboard/BookingTrendChart';
import MembershipPieChart from '@/components/dashboard/MembershipPieChart';
import RevenueBarChart from '@/components/dashboard/RevenueBarChart';

interface DashboardData {
  recentBookings: any[];
  expiringMemberships: any[];
  bookingStats: { status: string; count: number }[];
  bookingTrend: { month: string; count: number }[];
  membershipDistribution: { tier: string; count: number }[];
  revenuePerMonth: { month: string; revenue: number }[];
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}. <button onClick={fetchDashboardData} className="text-blue-600 underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Welcome Message */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang, {user?.nama}!</h2>
        <p className="text-gray-600">
          Anda login sebagai <strong>Owner</strong>. Dashboard ini menampilkan overview operasional.
        </p>
      </div>

      {/* Charts Section - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BookingTrendChart data={data?.bookingTrend || []} />
        <MembershipPieChart data={data?.membershipDistribution || []} />
        <RevenueBarChart data={data?.revenuePerMonth || []} />
      </div>

      {/* Tables Section - each in its own row */}
      <div className="grid grid-cols-1 gap-6">
        <RecentBookingsTable bookings={data?.recentBookings || []} />
        <ExpiringMembershipsTable memberships={data?.expiringMemberships || []} />
        <BookingStatsTable stats={data?.bookingStats || []} />
      </div>
    </div>
  );
}