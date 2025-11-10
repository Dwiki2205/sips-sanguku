// app/api/booking/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // yyyy-MM-dd

    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }

    // Query bookings yang active untuk tanggal tersebut
    const result = await query(
      `
      SELECT jam_mulai, status 
      FROM booking 
      WHERE tanggal_booking = $1 
      AND status IN ('pending', 'confirmed')
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