// app/api/dashboard/recent-bookings/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const offset = (page - 1) * limit;

    // Total booking untuk pagination
    const totalResult = await pool.query(`SELECT COUNT(*) FROM booking`);
    const totalData = parseInt(totalResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    // Query booking terbaru sesuai pagination
    const bookings = await pool.query(
      `
      SELECT b.*, p.nama_lengkap
      FROM booking b
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
      ORDER BY b.tanggal_booking DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        totalData,
        totalPages,
      },
      data: bookings.rows,
    });

  } catch (error) {
    console.error('GET /api/dashboard/recent-bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent bookings' },
      { status: 500 }
    );
  }
}
