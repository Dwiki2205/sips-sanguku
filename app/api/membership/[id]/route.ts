// app/api/membership/[id]/route.ts - TAMBAHKAN LOGGING
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { transformMembershipData } from '@/lib/membership';

// GET: Ambil detail membership berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('🔍 GET /api/membership/[id] called with params:', params);
  
  try {
    const { id } = params;
    
    if (!id) {
      console.error('❌ ID is missing');
      return NextResponse.json(
        { success: false, error: 'ID membership diperlukan' },
        { status: 400 }
      );
    }

    console.log('📋 Fetching membership for ID:', id);

    // Debug koneksi database
    console.log('🔧 Testing database connection...');
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Koneksi database gagal' },
        { status: 500 }
      );
    }

    const result = await pool.query(
      `SELECT 
        m.membership_id,
        m.pelanggan_id,
        m.tanggal_daftar,
        m.tier_membership,
        m.expired_date,
        m.status_keaktifan,
        p.nama_lengkap,
        p.email,
        p.telepon,
        p.alamat
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
      WHERE m.membership_id = $1`,
      [id]
    );

    console.log('📊 Query result:', {
      rowCount: result.rowCount,
      rows: result.rows
    });

    if (result.rows.length === 0) {
      console.log('⚠️ Membership not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    // Transform data untuk konsistensi status
    const transformedData = transformMembershipData(result.rows[0]);
    console.log('✨ Transformed data:', transformedData);

    return NextResponse.json({
      success: true,
      data: transformedData
    });

  } catch (error) {
    console.error('❌ GET /api/membership/[id] error:', error);
    
    // Berikan error yang lebih informatif
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengambil data membership',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    );
  }
}

// PUT: Update membership - PERBAIKAN UTAMA
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    console.log('📥 PUT /api/membership/[id] received:', {
      id,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Validasi: Data yang diterima dari frontend
    const { 
      pelanggan_id,
      tanggal_daftar,
      tier_membership,
      expired_date
    } = data;

    // Validasi field wajib SESUAI FRONTEND
    if (!pelanggan_id || !tanggal_daftar || !tier_membership || !expired_date) {
      console.error('❌ Validation failed:', {
        pelanggan_id: !!pelanggan_id,
        tanggal_daftar: !!tanggal_daftar,
        tier_membership: !!tier_membership,
        expired_date: !!expired_date
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Semua field wajib diisi',
          received: data 
        },
        { status: 400 }
      );
    }

    // Validasi tier_membership
    const validTiers = ['Silver', 'Gold', 'Platinum'];
    if (!validTiers.includes(tier_membership)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tier membership tidak valid. Harus salah satu dari: ${validTiers.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Hitung status berdasarkan expired_date yang baru
    const today = new Date();
    const expiredDate = new Date(expired_date);
    today.setHours(0, 0, 0, 0);
    expiredDate.setHours(0, 0, 0, 0);
    
    const status_keaktifan = expiredDate < today ? 'expired' : 'active';

    console.log('🔄 Updating membership with:', {
      pelanggan_id,
      tanggal_daftar,
      tier_membership,
      expired_date,
      status_keaktifan
    });

    // PERBAIKAN DISINI: Hapus updated_at dari query karena kolom tidak ada
    const result = await pool.query(
      `UPDATE membership 
       SET 
         pelanggan_id = $1,
         tanggal_daftar = $2,
         tier_membership = $3,
         expired_date = $4,
         status_keaktifan = $5
       WHERE membership_id = $6
       RETURNING *`,
      [
        pelanggan_id,
        tanggal_daftar,
        tier_membership,
        expired_date,
        status_keaktifan,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('✅ Update successful:', result.rows[0].membership_id);

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil diperbarui',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ PUT /api/membership/[id] error:', error);
    
    // Berikan error yang lebih informatif
    if (error instanceof Error) {
      const pgError = error as any;
      
      // Foreign key constraint error (pelanggan tidak ditemukan)
      if (pgError.code === '23503') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Pelanggan tidak ditemukan. Pastikan ID pelanggan valid.' 
          },
          { status: 400 }
        );
      }
      
      // Column tidak ditemukan error
      if (pgError.code === '42703') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Kolom tidak ditemukan di database. Silakan periksa struktur tabel membership.' 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Gagal mengupdate membership',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Hapus membership
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Cek apakah membership ada
    const check = await pool.query(
      'SELECT 1 FROM membership WHERE membership_id = $1',
      [id]
    );

    if (check.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Membership tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hapus membership
    await pool.query(
      'DELETE FROM membership WHERE membership_id = $1',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Membership berhasil dihapus'
    });

  } catch (error) {
    console.error('DELETE /api/membership/[id] error:', error);
  
    if (error instanceof Error) {
      const pgError = error as any;
      if (pgError.code === '23503') {
        return NextResponse.json(
          { success: false, error: 'Membership tidak dapat dihapus karena memiliki data terkait' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Gagal menghapus membership' },
      { status: 500 }
    );
  }
};