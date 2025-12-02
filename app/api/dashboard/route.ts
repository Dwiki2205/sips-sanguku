// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Pastikan ini selalu di-render ulang (tidak di-cache oleh Vercel)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Recent Bookings (5 latest)
    const recentBookings = await sql`
      SELECT b.*, p.nama_lengkap
      FROM booking b
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

    // Expiring Memberships (within 30 days)
    const expiringMemberships = await sql`
      SELECT m.*, p.nama_lengkap
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
      WHERE m.expired_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      AND m.status_keaktifan = 'active'
      ORDER BY m.expired_date ASC
    `;

    // Booking Stats This Month
    const bookingStats = await sql`
      SELECT status, COUNT(*)::integer as count
      FROM booking
      WHERE DATE_TRUNC('month', tanggal_booking) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY status
    `;

    // Booking Trend 6 Months
    const bookingTrendRaw = await sql`
      SELECT 
        DATE_TRUNC('month', tanggal_booking) as month, 
        COUNT(*)::integer as count
      FROM booking
      WHERE tanggal_booking >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY month
      ORDER BY month
    `;

    // Membership Distribution (hanya yang aktif)
    const membershipDistribution = await sql`
      SELECT 
        COALESCE(tier_membership, 'Non-Member') as tier, 
        COUNT(*)::integer as count
      FROM membership
      WHERE status_keaktifan = 'active'
      GROUP BY tier_membership
    `;

    // Revenue Per Month (3 months terakhir, hanya confirmed/completed)
    const revenuePerMonthRaw = await sql`
      SELECT 
        DATE_TRUNC('month', tanggal_booking) as month, 
        COALESCE(SUM(total_biaya), 0)::float as revenue
      FROM booking
      WHERE tanggal_booking >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')
        AND status IN ('confirmed', 'completed')
      GROUP BY month
      ORDER BY month
    `;

    // Format data untuk chart (pastikan selalu ada 6 bulan untuk trend & 3 bulan revenue)
    const now = new Date();
    const bookingTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const found = bookingTrendRaw.find(r => r.month.toISOString().slice(0, 7) === monthStr);
      return { month: monthStr, count: found?.count || 0 };
    });

    const revenuePerMonth = Array.from({ length: 3 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 2 + i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const found = revenuePerMonthRaw.find(r => r.month.toISOString().slice(0, 7) === monthStr);
      return { month: monthStr, revenue: found?.revenue || 0 };
    });

    return NextResponse.json({
      success: true,
      data: {
        recentBookings,
        expiringMemberships,
        bookingStats,
        bookingTrend,
        membershipDistribution,
        revenuePerMonth,
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      }
    });
  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}