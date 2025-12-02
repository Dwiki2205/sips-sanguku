// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Recent Bookings — ambil semua, sorting terbaru
    const recentBookings = await pool.query(`
      SELECT b.*, p.nama_lengkap
      FROM booking b
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
      ORDER BY b.tanggal_booking DESC
    `);

    // Expiring Memberships (within 30 days)
    const expiringMemberships = await pool.query(`
      SELECT m.*, p.nama_lengkap
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
      WHERE m.expired_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      ORDER BY m.expired_date ASC
    `);

    // Booking Stats (month)
    const bookingStats = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM booking
      WHERE DATE_TRUNC('month', tanggal_booking) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY status
    `);

    // Booking Trend 6 months
    const bookingTrend = await pool.query(`
      SELECT DATE_TRUNC('month', tanggal_booking) as month, COUNT(*) as count
      FROM booking
      WHERE tanggal_booking >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY month
      ORDER BY month
    `);

    // Membership Distribution (ACTIVE ONLY)
    const membershipDistribution = await pool.query(`
      SELECT tier_membership AS tier, COUNT(*) AS count
      FROM membership
      WHERE status_keaktifan = 'active'
      GROUP BY tier_membership
    `);

    // Revenue Per Month (3 months)
    const revenuePerMonth = await pool.query(`
      SELECT DATE_TRUNC('month', tanggal_booking) AS month, SUM(total_biaya) AS revenue
      FROM booking
      WHERE tanggal_booking >= CURRENT_DATE - INTERVAL '3 months'
      AND status IN ('confirmed', 'completed')
      GROUP BY month
      ORDER BY month
    `);

    return NextResponse.json({
      success: true,
      data: {
        recentBookings: recentBookings.rows,
        expiringMemberships: expiringMemberships.rows,
        bookingStats: bookingStats.rows,
        bookingTrend: bookingTrend.rows.map(r => ({
          month: r.month.toISOString().slice(0, 7),
          count: parseInt(r.count)
        })),
        membershipDistribution: membershipDistribution.rows.map(r => ({
          tier: r.tier,
          count: parseInt(r.count)
        })),
        revenuePerMonth: revenuePerMonth.rows.map(r => ({
          month: r.month.toISOString().slice(0, 7),
          revenue: parseFloat(r.revenue)
        })),
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
