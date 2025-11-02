import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { generateUserId, validateEmail, validatePhone } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { 
      nama, 
      username, 
      email, 
      telepon, 
      password, 
      confirmPassword 
    } = await request.json();

    // Validasi input
    if (!nama || !username || !email || !telepon || !password || !confirmPassword) {
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

    // Validasi email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format email tidak valid' 
        },
        { status: 400 }
      );
    }

    // Validasi telepon
    if (!validatePhone(telepon)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format nomor telepon tidak valid' 
        },
        { status: 400 }
      );
    }

    // Validasi password - MINIMAL 8 KARAKTER
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password harus minimal 8 karakter' 
        },
        { status: 400 }
      );
    }

    // Cek apakah username sudah digunakan
    const existingUser = await pool.query(
      'SELECT username FROM pengguna WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username sudah digunakan' 
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await pool.query(
      'SELECT email FROM pengguna WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email sudah terdaftar' 
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate user ID
    const pengguna_id = generateUserId();

    // Insert user baru dengan role Pelanggan (R003)
    const result = await pool.query(
      `INSERT INTO pengguna (pengguna_id, nama, username, password, email, telepon, role_id) 
       VALUES ($1, $2, $3, $4, $5, $6, 'R003') 
       RETURNING pengguna_id, nama, username, email, telepon, role_id, tanggal_bergabung`,
      [pengguna_id, nama, username, hashedPassword, email, telepon]
    );

    const newUser = result.rows[0];

    // Get role info
    const roleResult = await pool.query(
      'SELECT role_name, permissions FROM role WHERE role_id = $1',
      ['R003']
    );

    const role = roleResult.rows[0];

    const userResponse = {
      ...newUser,
      role_name: role.role_name,
      permissions: role.permissions
    };

    // Return success tanpa token
    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan akun Anda.',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    );
  }
}