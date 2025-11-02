import { NextRequest, NextResponse } from 'next/server';
import query from '@/lib/database';
import { verifyToken } from '@/lib/auth';

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

    // Get user data from database
    const result = await query(
      `SELECT p.*, r.role_name, r.permissions 
       FROM pengguna p 
       JOIN role r ON p.role_id = r.role_id 
       WHERE p.pengguna_id = $1 OR p.username = $2`,
      [decoded.pengguna_id, decoded.username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Response tanpa password
    const userResponse = {
      pengguna_id: user.pengguna_id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      telepon: user.telepon,
      role_id: user.role_id,
      role_name: user.role_name,
      permissions: typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions,
      tanggal_bergabung: user.tanggal_bergabung
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