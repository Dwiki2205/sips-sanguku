import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic' // Tambahkan ini

export async function GET(request: NextRequest) {
  try {
    // VERIFY AUTH FIRST
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
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

    // AUTO-FILTER berdasarkan user yang login
    if (decoded.role === 'pelanggan') {
      query += ' WHERE p.username = $1';
      params.push(decoded.username);
    } else {
      // Untuk owner/pegawai, bisa filter by pelanggan_id jika diberikan
      const pelanggan_id = searchParams.get('pelanggan_id');
      if (pelanggan_id) {
        query += ' WHERE m.pelanggan_id = $1';
        params.push(pelanggan_id);
      }
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