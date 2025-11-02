import { NextRequest, NextResponse } from 'next/server';
import query from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic' // Tambahkan ini

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      );
    }

    let user;

    // CARI BERDASARKAN USER TYPE
    if (decoded.user_type === 'pelanggan') {
      // Cari di tabel pelanggan
      const result = await query(
        `SELECT 
           pelanggan_id as pengguna_id,
           nama_lengkap as nama,
           username,
           email,
           telepon,
           alamat,
           tanggal_registrasi as tanggal_bergabung,
           'pelanggan' as role_name,
           '["view_booking","add_booking","view_membership","add_membership"]' as permissions
         FROM pelanggan 
         WHERE username = $1 OR pelanggan_id = $2`,
        [decoded.username, decoded.pengguna_id]
      );
      user = result.rows[0];
    } else {
      // Cari di tabel pengguna
      const result = await query(
        `SELECT p.*, r.role_name, r.permissions 
         FROM pengguna p 
         JOIN role r ON p.role_id = r.role_id 
         WHERE p.pengguna_id = $1 OR p.username = $2`,
        [decoded.pengguna_id, decoded.username]
      );
      user = result.rows[0];
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Response tanpa password
    const userResponse = {
      pengguna_id: user.pengguna_id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      telepon: user.telepon,
      alamat: user.alamat, // khusus pelanggan
      role_name: user.role_name,
      permissions: typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions,
      tanggal_bergabung: user.tanggal_bergabung,
      user_type: decoded.user_type || 'pengguna'
    };

    return NextResponse.json(userResponse);

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}