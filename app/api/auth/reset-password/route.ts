// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, validatePassword } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body as {
      token?: string;
      password?: string;
      confirmPassword?: string;
    };

    // 1. Validasi input dasar
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Password dan konfirmasi password tidak cocok' },
        { status: 400 }
      );
    }

    // 2. Validasi kekuatan password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(', ') },
        { status: 400 }
      );
    }

    // 3. Cek token reset password
    const tokenResult = await pool.query(
      `SELECT email, expires_at, used 
       FROM password_reset_tokens 
       WHERE token = $1 
         AND used = false 
         AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token tidak valid, sudah digunakan, atau kadaluarsa' },
        { status: 400 }
      );
    }

    const { email } = tokenResult.rows[0];

    // 4. Hash password baru
    const hashedPassword = await hashPassword(password);

    // 5. Update password user
    const updateResult = await pool.query(
      'UPDATE pengguna SET password = $1 WHERE email = $2 RETURNING id',
      [hashedPassword, email]
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // 6. Tandai token sebagai digunakan
    await pool.query(
      'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE token = $1',
      [token]
    );

    // 7. Success response
    return NextResponse.json({
      success: true,
      message: 'Password berhasil direset. Silakan login dengan password baru.',
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}