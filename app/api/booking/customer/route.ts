// app/api/booking/customer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('Received booking data:', data);

    // Validasi data yang diperlukan
    const required = ['booking_id', 'pelanggan_id', 'tanggal_booking', 'jam_mulai', 'jam_selesai', 'total_biaya'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ 
          success: false, 
          error: `Field ${field} wajib diisi` 
        }, { status: 400 });
      }
    }

    // Format waktu jika perlu
    let jam_mulai = data.jam_mulai;
    let jam_selesai = data.jam_selesai;
    
    // Jika format 08.00, konversi ke 08:00:00
    if (jam_mulai.includes('.')) {
      jam_mulai = jam_mulai.replace('.', ':') + ':00';
    }
    if (jam_selesai.includes('.')) {
      jam_selesai = jam_selesai.replace('.', ':') + ':00';
    }

    // Insert ke database
    const result = await pool.query(
      `
      INSERT INTO booking 
        (booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, 
         status, total_biaya, metode_pembayaran, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
      `,
      [
        data.booking_id,
        data.pelanggan_id,
        data.tanggal_booking,
        jam_mulai,
        jam_selesai,
        'confirmed', // Langsung confirmed untuk customer booking
        data.total_biaya,
        data.metode_pembayaran || 'QRIS',
      ]
    );

    console.log('Booking created successfully:', result.rows[0]);

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0],
      message: 'Booking berhasil dibuat'
    });

  } catch (error: any) {
    console.error('POST /api/booking/customer error:', error);
    
    // Cek jika duplicate booking_id
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { success: false, error: 'Booking ID sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Gagal membuat booking' },
      { status: 500 }
    );
  }
}