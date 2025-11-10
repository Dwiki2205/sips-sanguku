import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await query(
      `INSERT INTO booking (booking_id, tanggal_booking, jam_mulai, jam_selesai, total_biaya, metode_pembayaran, status, membership, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING booking_id`,
      [
        body.booking_id,
        body.tanggal_booking,
        body.jam_mulai,
        body.jam_selesai,
        body.total_biaya,
        body.metode_pembayaran,
        body.status,
        body.membership,
      ]
    );
    return NextResponse.json({ success: true, id: result.rows[0].booking_id });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal simpan' }, { status: 500 });
  }
}