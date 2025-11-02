import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');

    let query = `
      SELECT b.*, p.nama_lengkap as nama_pelanggan 
      FROM booking b 
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id 
    `;
    const params: any[] = [];

    if (status) {
      query += ' WHERE b.status = $1';
      params.push(status);
    }

    query += ' ORDER BY b.tanggal_booking DESC, b.jam_mulai DESC';

    if (limit) {
      query += ' LIMIT $' + (params.length + 1);
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      pelanggan_id, 
      tanggal_booking, 
      jam_mulai, 
      jam_selesai, 
      jenis_layanan, 
      total_biaya, 
      metode_pembayaran 
    } = await request.json();

    // Generate booking ID
    const booking_id = 'BKG' + Date.now().toString().slice(-7);

    const result = await pool.query(
      `INSERT INTO booking (
        booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, 
        jenis_layanan, total_biaya, metode_pembayaran
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, 
       jenis_layanan, total_biaya, metode_pembayaran]
    );

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibuat',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}