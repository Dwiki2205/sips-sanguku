
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT 
        b.*,
        p.nama_lengkap,
        p.email,
        p.telepon
      FROM booking b
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
      WHERE b.booking_id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const { 
      tanggal_booking, 
      jam_mulai, 
      jam_selesai, 
      status, 
      total_biaya, 
      metode_pembayaran 
    } = data;

    const result = await pool.query(
      `UPDATE booking 
       SET tanggal_booking = $1, jam_mulai = $2, jam_selesai = $3, 
           status = $4, total_biaya = $5, metode_pembayaran = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $7
       RETURNING *`,
      [tanggal_booking, jam_mulai, jam_selesai, status, total_biaya, metode_pembayaran, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil diupdate',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      'DELETE FROM booking WHERE booking_id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}