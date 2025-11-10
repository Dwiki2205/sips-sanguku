// src/app/api/auth/registrasi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { 
  generatePelangganId, 
  validateEmail, 
  validatePhone,
  validateUsername,
  validateMaxLength,
  validateNamaLengkap,
  validatePassword
} from '@/lib/utils/pelanggan-utils';

export async function POST(request: NextRequest) {
  let client;
  try {
    const { 
      nama_lengkap, 
      username,
      email, 
      telepon, 
      password, 
      confirmPassword,
      alamat 
    } = await request.json();

    console.log('Data registrasi pelanggan diterima:', { 
      nama_lengkap, 
      username,
      email, 
      telepon 
    });

    // === VALIDASI INPUT DASAR ===
    if (!nama_lengkap || !username || !email || !telepon || !password || !confirmPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Semua field harus diisi' 
        },
        { status: 400 }
      );
    }

    // === VALIDASI PANJANG FIELD ===
    if (!validateMaxLength(nama_lengkap, 100)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nama lengkap maksimal 100 karakter' 
        },
        { status: 400 }
      );
    }

    if (!validateMaxLength(username, 20)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username maksimal 20 karakter' 
        },
        { status: 400 }
      );
    }

    if (!validateMaxLength(email, 100)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email maksimal 100 karakter' 
        },
        { status: 400 }
      );
    }

    if (!validateMaxLength(telepon, 15)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nomor telepon maksimal 15 digit' 
        },
        { status: 400 }
      );
    }

    if (alamat && !validateMaxLength(alamat, 200)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Alamat maksimal 200 karakter' 
        },
        { status: 400 }
      );
    }

    // === VALIDASI FORMAT ===
    if (!validateNamaLengkap(nama_lengkap)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format nama lengkap tidak valid. Gunakan huruf dan spasi saja (2-100 karakter).' 
        },
        { status: 400 }
      );
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format username tidak valid. Gunakan huruf, angka, dan underscore saja (3-20 karakter).' 
        },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format email tidak valid' 
        },
        { status: 400 }
      );
    }

    if (!validatePhone(telepon)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format nomor telepon tidak valid. Gunakan 10-15 digit angka.' 
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

    // Validasi kekuatan password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: `Password tidak memenuhi kriteria: ${passwordValidation.errors.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // === GENERATE PELANGGAN ID ===
    const pelanggan_id = await generatePelangganId();
    
    console.log('Generated Pelanggan ID:', pelanggan_id);

    // === CEK DUPLIKASI DATABASE ===
    client = await pool.connect();

    // Cek apakah username sudah digunakan
    const existingUsername = await client.query(
      'SELECT username FROM pelanggan WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Username sudah digunakan' 
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan
    const existingEmail = await client.query(
      'SELECT email FROM pelanggan WHERE email = $1',
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

    // Cek apakah telepon sudah digunakan
    const existingTelepon = await client.query(
      'SELECT telepon FROM pelanggan WHERE telepon = $1',
      [telepon]
    );

    if (existingTelepon.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nomor telepon sudah terdaftar' 
        },
        { status: 400 }
      );
    }

    // === INSERT PELANGGAN BARU - PASSWORD PLAIN TEXT ===
    const result = await client.query(
      `INSERT INTO pelanggan (
        pelanggan_id, 
        nama_lengkap, 
        username,
        email, 
        telepon, 
        password, 
        alamat,
        tanggal_registrasi
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING 
         pelanggan_id, 
         nama_lengkap, 
         username,
         email, 
         telepon, 
         alamat, 
         tanggal_registrasi`,
      [
        pelanggan_id, 
        nama_lengkap.trim(), 
        username.trim(),
        email.trim(), 
        telepon, 
        password,  // Password disimpan sebagai plain text
        alamat?.trim() || null
      ]
    );

    const newPelanggan = result.rows[0];

    console.log('Registrasi pelanggan berhasil:', {
      id: newPelanggan.pelanggan_id,
      username: newPelanggan.username,
      nama: newPelanggan.nama_lengkap,
      email: newPelanggan.email
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registrasi pelanggan berhasil! Silakan login dengan akun Anda.',
      data: {
        pelanggan_id: newPelanggan.pelanggan_id,
        nama_lengkap: newPelanggan.nama_lengkap,
        username: newPelanggan.username,
        email: newPelanggan.email,
        telepon: newPelanggan.telepon,
        alamat: newPelanggan.alamat,
        tanggal_registrasi: newPelanggan.tanggal_registrasi
      }
    });

  } catch (error: any) {
    console.error('Pelanggan registration error:', error);
    
    // Handle specific database errors
    if (error.code === '22001') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Data yang dimasukkan terlalu panjang. Silakan periksa kembali.' 
        },
        { status: 400 }
      );
    }
    
    if (error.code === '23505') {
      const constraint = error.constraint;
      
      if (constraint?.includes('username')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Username sudah terdaftar' 
          },
          { status: 400 }
        );
      } else if (constraint?.includes('email')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Email sudah terdaftar' 
          },
          { status: 400 }
        );
      } else if (constraint?.includes('telepon')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Nomor telepon sudah terdaftar' 
          },
          { status: 400 }
        );
      }
    }

    if (error.code === '23502') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Data yang diperlukan tidak lengkap' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server. Silakan coba lagi.' 
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

// GET method untuk testing dan info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkUsername = searchParams.get('check_username');
    const checkEmail = searchParams.get('check_email');
    
    const client = await pool.connect();

    if (checkUsername) {
      const result = await client.query(
        'SELECT username FROM pelanggan WHERE username = $1',
        [checkUsername]
      );
      
      return NextResponse.json({
        success: true,
        available: result.rows.length === 0,
        message: result.rows.length === 0 
          ? 'Username tersedia' 
          : 'Username sudah digunakan'
      });
    }

    if (checkEmail) {
      const result = await client.query(
        'SELECT email FROM pelanggan WHERE email = $1',
        [checkEmail]
      );
      
      return NextResponse.json({
        success: true,
        available: result.rows.length === 0,
        message: result.rows.length === 0 
          ? 'Email tersedia' 
          : 'Email sudah terdaftar'
      });
    }

    const countResult = await client.query('SELECT COUNT(*) as total FROM pelanggan');
    const totalPelanggan = parseInt(countResult.rows[0].total);
    
    const lastPelanggan = await client.query(
      'SELECT pelanggan_id, nama_lengkap FROM pelanggan ORDER BY tanggal_registrasi DESC LIMIT 1'
    );
    
    client.release();
    
    return NextResponse.json({
      success: true,
      data: {
        total_pelanggan: totalPelanggan,
        next_pelanggan_id: await generatePelangganId(),
        last_registered: lastPelanggan.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Error in GET auth/registrasi:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get registration data' },
      { status: 500 }
    );
  }
}