// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken, verifyPassword, getAuthCookieHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi' },
        { status: 400 }
      );
    }

    let user: any = null;
    let userType = 'pengguna';

    // Cek pengguna (owner/pegawai)
    const res1 = await pool.query(
      `SELECT p.*, r.role_name, r.permissions 
       FROM pengguna p 
       JOIN role r ON p.role_id = r.role_id 
       WHERE p.username = $1`,
      [username]
    );
    user = res1.rows[0];

    // Cek pelanggan
    if (!user) {
      const res2 = await pool.query(
        `SELECT *, 'pelanggan' as role_name, 
         '["add_booking","view_booking","add_membership","view_membership"]' as permissions
         FROM pelanggan WHERE username = $1`,
        [username]
      );
      user = res2.rows[0];
      userType = 'pelanggan';
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: user.pengguna_id || user.pelanggan_id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions,
      user_type: userType,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        id: user.pengguna_id || user.pelanggan_id,
        nama: user.nama || user.nama_lengkap,
        username: user.username,
        email: user.email,
        telepon: user.telepon,
        role: user.role_name,
        permissions: typeof user.permissions === 'string'
          ? JSON.parse(user.permissions)
          : user.permissions,
        tanggal_bergabung: user.tanggal_bergabung || user.tanggal_registrasi,
      },
    });

    response.headers.set('Set-Cookie', getAuthCookieHeader(token));
    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}