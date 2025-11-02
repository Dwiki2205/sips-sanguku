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
    const limit = searchParams.get('limit');
    const status = searchParams.get('status');

    let query = `
      SELECT b.*, p.nama_lengkap as nama_pelanggan 
      FROM booking b 
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id 
    `;
    const params: any[] = [];

    // AUTO-FILTER berdasarkan user role
    if (decoded.role === 'pelanggan') {
      query += ' WHERE p.username = $1';
      params.push(decoded.username);
      
      if (status) {
        query += ' AND b.status = $2';
        params.push(status);
      }
    } else {
      // Untuk owner/pegawai, bisa filter semua
      if (status) {
        query += ' WHERE b.status = $1';
        params.push(status);
      }
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