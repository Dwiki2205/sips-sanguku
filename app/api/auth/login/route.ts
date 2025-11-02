import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password }: { username: string; password: string } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username dan password harus diisi' 
        },
        { status: 400 }
      );
    }

    // PostgreSQL query only
    const result = await db.query(
      `SELECT p.*, r.role_name, r.permissions 
       FROM pengguna p 
       JOIN role r ON p.role_id = r.role_id 
       WHERE p.username = $1`,
      [username]
    );
    
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username atau password salah' 
        },
        { status: 401 }
      );
    }

    // Verifikasi password
    if (password !== user.password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username atau password salah' 
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      pengguna_id: user.pengguna_id,
      username: user.username,
      role: user.role_name,
      permissions: user.permissions
    };
    
    const token = generateToken(tokenPayload);

    // Response tanpa password
    const userResponse = {
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
      { 
        success: false,
        error: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    );
  }
}