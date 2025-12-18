// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt for:', username);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    let user: any;
    let userType = 'pengguna';

    // Cari di tabel pengguna
    const result = await pool.query(
      `SELECT p.*, r.role_name, r.permissions 
       FROM pengguna p 
       JOIN role r ON p.role_id = r.role_id 
       WHERE p.username = $1`,
      [username]
    );
    user = result.rows[0];

    // Jika tidak ada, cek di tabel pelanggan
    if (!user) {
      console.log('User not found in pengguna, checking pelanggan...');
      const res = await pool.query(
        `SELECT *, 'pelanggan' as role_name, 
         '["add_booking","view_booking","add_membership","view_membership"]' as permissions
         FROM pelanggan WHERE username = $1`,
        [username]
      );
      user = res.rows[0];
      userType = 'pelanggan';
    }

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // PERBAIKAN: Gunakan perbandingan plain text
    const isValid = password === user.password;
    
    console.log('Password validation:', isValid ? 'Valid' : 'Invalid');

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
        role_name: user.role_name,
        permissions: typeof user.permissions === 'string'
          ? JSON.parse(user.permissions)
          : user.permissions,
        tanggal_bergabung: user.tanggal_bergabung || user.tanggal_registrasi,
      },
    });

    // Set cookie secara manual
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error: unknown) {
    // PERBAIKAN: Handle error dengan type safety
    console.error('Login error:', error);
    
    let errorMessage = 'Terjadi kesalahan server';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}