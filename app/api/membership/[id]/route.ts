import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Ambil detail membership berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT 
        m.*,
        p.nama_lengkap,
        p.email,
        p.telepon,
        p.alamat
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
      WHERE m.membership_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('GET /api/membership/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data membership' },
      { status: 500 }
    );
  }
}

// PUT: Update membership
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    const { 
      status_keaktifan, 
      tier_membership, 
      expired_date 
    } = data;

    // Validasi input
    if (!status_keaktifan || !tier_membership || !expired_date) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE membership 
       SET 
         status_keaktifan = $1, 
         tier_membership = $2, 
         expired_date = $3,
         updated_at = CURRENT_TIMESTAMP
       WHERE membership_id = $4
       RETURNING *`,
      [status_keaktifan, tier_membership, expired_date, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil diperbarui',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('PUT /api/membership/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate membership' },
      { status: 500 }
    );
  }
}

// DELETE: Hapus membership
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Cek apakah membership ada
    const check = await pool.query(
      'SELECT 1 FROM membership WHERE membership_id = $1',
      [id]
    );

    if (check.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hapus membership
    await pool.query(
      'DELETE FROM membership WHERE membership_id = $1',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil dihapus'
    });

  } catch (error) {
    console.error('DELETE /api/membership/[id] error:', error);
  
    // Cek tipe error dengan aman
    if (error instanceof Error) {
      // Untuk PostgreSQL error dengan code property
      const pgError = error as any;
      if (pgError.code === '23503') {
        return NextResponse.json(
          { success: false, error: 'Membership tidak dapat dihapus karena memiliki data terkait' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Gagal menghapus membership' },
      { status: 500 }
    );
  }
};