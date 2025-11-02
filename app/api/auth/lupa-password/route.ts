import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email }: { email: string } = await request.json();

    if (!email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email harus diisi' 
        },
        { status: 400 }
      );
    }

    // Cek apakah email terdaftar
    const userResult = await pool.query(
      'SELECT pengguna_id, nama, email FROM pengguna WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      // Return success even if email not found for security
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim'
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Simpan token ke database
    await pool.query(
      `INSERT INTO password_reset_tokens (email, token, expires_at) 
       VALUES ($1, $2, $3)`,
      [email, resetToken, expiresAt]
    );

    // Kirim email reset password
    const emailResult = await sendPasswordResetEmail(email, resetToken);

    if (!emailResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: emailResult.error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Link reset password telah dikirim ke email Anda'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    );
  }
}