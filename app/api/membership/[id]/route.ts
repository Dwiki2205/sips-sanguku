import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await pool.query(
      `SELECT 
        m.*,
        p.nama_lengkap,
        p.email,
        p.telepon
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
      WHERE m.membership_id = $1`,
      [params.id]
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
    console.error('Get membership error:', error);
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
      status_keaktifan, 
      tier_membership, 
      expired_date 
    } = data;

    const result = await pool.query(
      `UPDATE membership 
       SET status_keaktifan = $1, tier_membership = $2, expired_date = $3
       WHERE membership_id = $4
       RETURNING *`,
      [status_keaktifan, tier_membership, expired_date, params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil diupdate',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update membership error:', error);
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
      'DELETE FROM membership WHERE membership_id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete membership error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}