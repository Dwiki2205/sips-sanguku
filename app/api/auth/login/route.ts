import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';

// api/login - modifikasi
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cari di tabel pengguna (owner/pegawai)
    let result = await db.query(
      `SELECT p.*, r.role_name, r.permissions 
       FROM pengguna p 
       JOIN role r ON p.role_id = r.role_id 
       WHERE p.username = $1`,
      [username]
    );
    
    let user = result.rows[0];
    let userType = 'pengguna';

    // Jika tidak ditemukan di pengguna, cari di pelanggan
    if (!user) {
      result = await db.query(
        `SELECT *, 'pelanggan' as role_name, '["add_booking","view_booking","add_membership","view_membership"]' as permissions
         FROM pelanggan 
         WHERE username = $1`,
        [username]
      );
      
      user = result.rows[0];
      userType = 'pelanggan';
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Verifikasi password
    if (password !== user.password) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT token dengan data yang sesuai
    const tokenPayload = {
      pengguna_id: user.pengguna_id || user.pelanggan_id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions,
      user_type: userType
    };
    
    const token = generateToken(tokenPayload);

    // Response berdasarkan tipe user
    let userResponse;
    if (userType === 'pengguna') {
      userResponse = {
        pengguna_id: user.pengguna_id,
        nama: user.nama,
        username: user.username,
        email: user.email,
        telepon: user.telepon,
        role_id: user.role_id,
        role_name: user.role_name,
        permissions: user.permissions,
        tanggal_bergabung: user.tanggal_bergabung
      };
    } else {
      userResponse = {
        pelanggan_id: user.pelanggan_id,
        nama_lengkap: user.nama_lengkap,
        username: user.username,
        email: user.email,
        telepon: user.telepon,
        alamat: user.alamat,
        role_name: 'pelanggan',
        permissions: typeof user.permissions === 'string' 
          ? JSON.parse(user.permissions) 
          : user.permissions,
        tanggal_registrasi: user.tanggal_registrasi
      };
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: userResponse,
      token
    });

    await setAuthCookie(token);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}