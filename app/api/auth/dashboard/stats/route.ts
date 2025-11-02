import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Total bookings
    const bookingsResult = await pool.query('SELECT COUNT(*) as total FROM booking');
    const totalBooking = parseInt(bookingsResult.rows[0].total);

    // Total active memberships
    const membershipsResult = await pool.query(
      'SELECT COUNT(*) as total FROM membership WHERE status_keaktifan = $1',
      ['Aktif']
    );
    const totalMembership = parseInt(membershipsResult.rows[0].total);

    // Today's revenue
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(total_biaya), 0) as total 
       FROM booking 
       WHERE tanggal_booking = CURRENT_DATE AND status IN ('Confirmed', 'Completed')`
    );
    const pendapatanHariIni = parseFloat(revenueResult.rows[0].total);

    // Today's bookings
    const todayBookingsResult = await pool.query(
      'SELECT COUNT(*) as total FROM booking WHERE tanggal_booking = CURRENT_DATE'
    );
    const bookingHariIni = parseInt(todayBookingsResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: {
        totalBooking,
        totalMembership,
        pendapatanHariIni,
        bookingHariIni
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}