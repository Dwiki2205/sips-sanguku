import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, validatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword }: { 
      token: string; 
      password: string; 
      confirmPassword: string; 
    } = await request.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Semua field harus diisi' 
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password dan konfirmasi password tidak cocok' 
        },
        { status: 400 }
      );
    }

    // Validasi password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: passwordValidation.errors.join(', ') 
        },
        { status: 400 }
      );
    }

    // Cek token validity
    const tokenResult = await pool.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token tidak valid atau sudah kadaluarsa' 
        },
        { status: 400 }
      );
    }

    const resetToken = tokenResult.rows[0];

    // Hash password baru
    const hashedPassword = await hashPassword(password);

    // Update password user
    await pool.query(
      'UPDATE pengguna SET password = $1 WHERE email = $2',
      [hashedPassword, resetToken.email]
    );

    // Mark token as used
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );

    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    );
  }
}