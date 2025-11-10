// app/api/booking/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Tambahkan ini: Wajib agar route ini TIDAK diprerender secara statis
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // yyyy-MM-dd

    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    // Validasi format tanggal sederhana (opsional, tapi direkomendasikan)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Query bookings yang active untuk tanggal tersebut
    const result = await query(
      `
      SELECT jam_mulai, status 
      FROM booking 
      WHERE tanggal_booking = $1 
      AND status IN ('pending', 'confirmed')
      ORDER BY jam_mulai
      `,
      [date]
    );

    return NextResponse.json({
      success: true,
      date,
      bookings: result.rows,
      totalBooked: result.rows.length,
    });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}