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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportToPDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Judul Dashboard
    doc.setFontSize(18);
    doc.text('Dashboard Report', 14, 22);

    let yPos = 30;

    // Tabel 1: Statistik Booking
    doc.setFontSize(14);
    doc.text('Statistik Booking Bulan Ini', 14, yPos);
    yPos += 10;

    const bookingStatsHeaders = [['Status', 'Jumlah']];
    const bookingStatsData = data.bookingStats.map(s => [s.status.charAt(0).toUpperCase() + s.status.slice(1), s.count.toString()]);

    autoTable(doc, {
      head: bookingStatsHeaders,
      body: bookingStatsData,
      startY: yPos,
      margin: { left: 14 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Tabel 2: Membership Akan Expired
    doc.setFontSize(14);
    doc.text('Membership Akan Expired', 14, yPos);
    yPos += 10;

    const membershipsHeaders = [['ID', 'Nama', 'Tier', 'Expired', 'Status']];
    const membershipsData = data.expiringMemberships.map(m => [
      `#${m.membership_id}`,
      m.nama_lengkap,
      m.tier_membership,
      new Date(m.expired_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      m.status_keaktifan ? m.status_keaktifan.charAt(0).toUpperCase() + m.status_keaktifan.slice(1) : 'Unknown'
    ]);

    autoTable(doc, {
      head: membershipsHeaders,
      body: membershipsData,
      startY: yPos,
      margin: { left: 14 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Tabel 3: Booking Terbaru
    doc.setFontSize(14);
    doc.text('Booking Terbaru', 14, yPos);
    yPos += 10;

    const bookingsHeaders = [['ID', 'Nama', 'Tanggal', 'Status', 'Biaya']];
    const bookingsData = data.recentBookings.map(b => [
      `#${b.booking_id}`,
      b.nama_lengkap,
      new Date(b.tanggal_booking).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      b.status.charAt(0).toUpperCase() + b.status.slice(1),
      `Rp ${b.total_biaya.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      head: bookingsHeaders,
      body: bookingsData,
      startY: yPos,
      margin: { left: 14 },
    });

    doc.save('dashboard-report.pdf');
  };

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
      <div className="bg-white shadow-sm rounded-lg p-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang, {user?.nama}!</h2>
          <p className="text-gray-600">
            Anda login sebagai <strong>Owner</strong>. Dashboard ini menampilkan overview operasional.
          </p>
        </div>
        <button 
          onClick={exportToPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
        >
          Export PDF
        </button>
      </div>
      {/* Charts Section - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BookingTrendChart data={data?.bookingTrend || []} />
        <MembershipPieChart data={data?.membershipDistribution || []} />
        <RevenueBarChart data={data?.revenuePerMonth || []} />
      </div>
      {/* Tables Section - each in its own row */}
      <div className="grid grid-cols-1 gap-6">
        <RecentBookingsTable/>
        <ExpiringMembershipsTable memberships={data?.expiringMemberships || []} />
        <BookingStatsTable stats={data?.bookingStats || []} />
      </div>
    </div>
  );
}