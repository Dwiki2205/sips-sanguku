import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const pelanggan_id = searchParams.get('pelanggan_id');

    let query = `
      SELECT 
        m.*,
        p.nama_lengkap,
        p.email,
        p.telepon
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
    `;

    const params: any[] = [];

    if (role === 'pelanggan' && pelanggan_id) {
      query += ' WHERE m.pelanggan_id = $1';
      params.push(pelanggan_id);
    }

    query += ' ORDER BY m.tanggal_daftar DESC';

    const result = await pool.query(query, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get memberships error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const { 
      pelanggan_id, 
      tanggal_daftar, 
      tier_membership, 
      expired_date 
    } = data;

    // Check if pelanggan already has active membership
    const existingMembership = await pool.query(
      'SELECT * FROM membership WHERE pelanggan_id = $1 AND status_keaktifan = $2',
      [pelanggan_id, 'active']
    );

    if (existingMembership.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Pelanggan sudah memiliki membership aktif' },
        { status: 400 }
      );
    }

    // Generate membership ID
    const membership_id = 'MEM' + Date.now().toString().slice(-7);

    const result = await pool.query(
      `INSERT INTO membership (
        membership_id, pelanggan_id, tanggal_daftar, tier_membership, expired_date
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [membership_id, pelanggan_id, tanggal_daftar, tier_membership, expired_date]
    );

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil dibuat',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create membership error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}