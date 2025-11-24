// app/api/booking/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// ====================
// GET: Ambil detail satu booking berdasarkan booking_id
// ====================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const result = await pool.query(
      `SELECT 
          b.*,
          p.nama_lengkap AS nama_pelanggan,
          p.email,
          p.telepon
       FROM booking b
       JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
       WHERE b.booking_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('GET /api/booking/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data booking' },
      { status: 500 }
    );
  }
}

// ====================
// PUT: Update booking
// ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();

    const {
      tanggal_booking,
      jam_mulai,
      jam_selesai,
      status,
      total_biaya,
      metode_pembayaran,
    } = body;

    // Validasi minimal
    if (!tanggal_booking || !jam_mulai || !jam_selesai) {
      return NextResponse.json(
        { success: false, error: 'Tanggal, jam mulai, dan jam selesai wajib diisi' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE booking
       SET 
         tanggal_booking = $1,
         jam_mulai = $2,
         jam_selesai = $3,
         status = COALESCE($4, status),
         total_biaya = COALESCE($5, total_biaya),
         metode_pembayaran = COALESCE($6, metode_pembayaran),
         updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $7
       RETURNING *`,
      [
        tanggal_booking,
        jam_mulai,
        jam_selesai,
        status || null,
        total_biaya || null,
        metode_pembayaran || null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('PUT /api/booking/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate booking' },
      { status: 500 }
    );
  }
}

// ====================
// DELETE: Hapus booking
// ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Cek dulu apakah booking ada
    const check = await pool.query(
      'SELECT 1 FROM booking WHERE booking_id = $1',
      [id]
    );

    if (check.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    // Lakukan DELETE
    await pool.query('DELETE FROM booking WHERE booking_id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dihapus',
    });
  } catch (error: any) {
    console.error('DELETE /api/booking/[id] error:', error);

    // Tangkap error koneksi DB (timeout, dll)
    if (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
      return NextResponse.json(
        { success: false, error: 'Koneksi database timeout. Coba lagi dalam beberapa detik.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal menghapus booking' },
      { status: 500 }
    );
  }
}