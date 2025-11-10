// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken, setAuthCookie, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    let user: any;
    let userType = 'pengguna';

    // Cari di pengguna
    const result = await pool.query(
      `SELECT p.*, r.role_name, r.permissions 
       FROM pengguna p 
       JOIN role r ON p.role_id = r.role_id 
       WHERE p.username = $1`,
      [username]
    );
    user = result.rows[0];

    // Jika tidak ada, cek pelanggan
    if (!user) {
      const res = await pool.query(
        `SELECT *, 'pelanggan' as role_name, '["add_booking","view_booking","add_membership","view_membership"]' as permissions
         FROM pelanggan WHERE username = $1`,
        [username]
      );
      user = res.rows[0];
      userType = 'pelanggan';
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      pengguna_id: user.pengguna_id || user.pelanggan_id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions,
      user_type: userType,
    };

    const token = generateToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: {
        pengguna_id: user.pengguna_id || user.pelanggan_id,
        nama: user.nama || user.nama_lengkap,
        username: user.username,
        email: user.email,
        telepon: user.telepon,
        role_id: user.role_id,
        role_name: user.role_name,  // KONSISTEN
        permissions: typeof user.permissions === 'string'
          ? JSON.parse(user.permissions)
          : user.permissions,
        tanggal_bergabung: user.tanggal_bergabung || user.tanggal_registrasi,
      },
    });

    await setAuthCookie(token);
    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}