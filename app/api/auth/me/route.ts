// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    let user;
    if (decoded.user_type === 'pelanggan') {
      const res = await pool.query(
        `SELECT 
           pelanggan_id as pengguna_id,
           nama_lengkap as nama,
           username,
           email,
           telepon,
           alamat,
           tanggal_registrasi as tanggal_bergabung,
           'pelanggan' as role_name,
           '["add_booking","view_booking","add_membership","view_membership"]' as permissions
         FROM pelanggan 
         WHERE username = $1`,
        [decoded.username]
      );
      user = res.rows[0];
    } else {
      const res = await pool.query(
        `SELECT 
           p.pengguna_id,
           p.nama,
           p.username,
           p.email,
           p.telepon,
           p.role_id,
           r.role_name,
           r.permissions,
           p.tanggal_bergabung
         FROM pengguna p 
         JOIN role r ON p.role_id = r.role_id 
         WHERE p.username = $1`,
        [decoded.username]
      );
      user = res.rows[0];
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      pengguna_id: user.pengguna_id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      telepon: user.telepon,
      role_id: user.role_id || null,
      role_name: user.role_name,
      permissions: typeof user.permissions === 'string'
        ? JSON.parse(user.permissions) || []
        : user.permissions || [],
      tanggal_bergabung: user.tanggal_bergabung,
    });

  } catch (error) {
    console.error('ME error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}