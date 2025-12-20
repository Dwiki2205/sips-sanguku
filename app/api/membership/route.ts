// app/api/membership/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { transformMembershipData, calculateMembershipStatus } from '@/lib/membership'; // Import helper

export const dynamic = 'force-dynamic';

// === GET: Ambil daftar membership dengan pagination & search ===
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const search = (searchParams.get('search') || '').trim();
    const pelanggan_id = searchParams.get('pelanggan_id');
    const username = searchParams.get('username');

    // Base query
    let sql = `
      SELECT 
        m.membership_id,
        m.pelanggan_id,
        m.tanggal_daftar,
        m.tier_membership,
        m.expired_date,
        p.nama_lengkap,
        p.email,
        p.telepon,
        -- Hitung status secara real-time dalam query
        CASE 
          WHEN m.expired_date < CURRENT_DATE THEN 'expired'
          ELSE 'active'
        END as status_keaktifan
      FROM membership m
      JOIN pelanggan p ON m.pelanggan_id = p.pelanggan_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramIndex = 1;

    // Filter pelanggan_id
    if (pelanggan_id) {
      sql += ` AND m.pelanggan_id = $${paramIndex++}`;
      params.push(pelanggan_id);
    }

    // Filter username
    if (username) {
      sql += ` AND p.username ILIKE $${paramIndex++}`;
      params.push(`%${username}%`);
    }

    // Search global
    if (search) {
      const searchParam = `%${search}%`;
      sql += ` AND (
        p.nama_lengkap ILIKE $${paramIndex} OR
        p.email ILIKE $${paramIndex} OR
        p.telepon ILIKE $${paramIndex} OR
        m.membership_id ILIKE $${paramIndex} OR
        m.tier_membership ILIKE $${paramIndex}
      )`;
      params.push(searchParam);
    }

    // === HITUNG TOTAL untuk pagination ===
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) AS subquery`;
    const countParams = params.slice();
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // === Tambahkan ORDER, LIMIT, OFFSET ===
    sql += ` ORDER BY 
      CASE 
        WHEN expired_date < CURRENT_DATE THEN 2
        ELSE 1
      END,
      m.tanggal_daftar DESC`;
    
    const limitParam = params.length + 1;
    const offsetParam = params.length + 2;
    sql += ` LIMIT $${limitParam}::integer OFFSET $${offsetParam}::integer`;

    params.push(limit);
    params.push(offset);
    
    // === Eksekusi query utama ===
    const result = await query(sql, params);

    // Transform data untuk memastikan status konsisten
    const transformedData = result.rows.map(row => transformMembershipData(row));

    // === Response ===
    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit) || 1
      }
    });

  } catch (error) {
    console.error('GET /api/membership error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data membership' },
      { status: 500 }
    );
  }
}


// === POST: Daftar membership baru (Pelanggan & Admin) ===
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      membership_id,
      pelanggan_id,
      tanggal_daftar,
      tier_membership,
      expired_date,
    } = body;

    // Validasi wajib
    if (!membership_id || !pelanggan_id || !tanggal_daftar || !expired_date) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi!' },
        { status: 400 }
      );
    }

    if (!['Silver', 'Gold', 'Platinum'].includes(tier_membership)) {
      return NextResponse.json(
        { error: 'Tier membership tidak valid!' },
        { status: 400 }
      );
    }

    // Cek apakah pelanggan sudah punya membership aktif
    const existing = await query(
      `SELECT * FROM membership 
       WHERE pelanggan_id = $1 
       AND (status_keaktifan = 'active' OR expired_date >= CURRENT_DATE)`,
      [pelanggan_id]
    );

    if (existing.rows.length > 0) {
      const active = existing.rows[0];
      return NextResponse.json(
        {
          error: 'already_active',
          message: `Membership ${active.tier_membership} masih aktif hingga ${active.expired_date}`,
          data: active,
        },
        { status: 409 }
      );
    }

    // Insert membership baru
    const insertQuery = `
      INSERT INTO membership 
        (membership_id, pelanggan_id, tanggal_daftar, status_keaktifan, tier_membership, expired_date)
      VALUES ($1, $2, $3, 'active', $4, $5)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      membership_id,
      pelanggan_id,
      tanggal_daftar,
      tier_membership,
      expired_date,
    ]);

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('POST /api/membership error:', error);

    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan!' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Gagal menyimpan membership' },
      { status: 500 }
    );
  }
}

// Dalam app/api/membership/route.ts - PUT method
export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return unauthorized();

  const decoded = verifyToken(token);
  if (!decoded || !['owner', 'pegawai'].includes(decoded.role)) {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    const body = await request.json();
    const { 
      pelanggan_id,
      tanggal_daftar,
      tier_membership, 
      expired_date 
    } = body;

    // Validasi data yang diterima
    if (!pelanggan_id || !tanggal_daftar || !tier_membership || !expired_date) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Hitung status berdasarkan expired_date
    const today = new Date();
    const expiredDate = new Date(expired_date);
    today.setHours(0, 0, 0, 0);
    expiredDate.setHours(0, 0, 0, 0);
    
    const status_keaktifan = expiredDate < today ? 'expired' : 'active';

    const result = await query(
      `UPDATE membership SET 
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
      return NextResponse.json({ error: 'Membership tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error: any) {
    console.error('PUT /api/membership error:', error);
    
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Gagal mengupdate membership' },
      { status: 500 }
    );
  }
}

/// === DELETE: Hapus membership (Owner only) ===
export async function DELETE(request: NextRequest) {
  // // COMMENT SEMENTARA untuk testing
  // const token = request.headers.get('authorization')?.replace('Bearer ', '');
  // if (!token) return unauthorized();
  // const decoded = verifyToken(token);
  // if (!decoded || decoded.role !== 'owner') return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log('🗑️ Deleting membership ID:', id); // Debug
    
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    }

    // Hapus dari database
    const result = await query('DELETE FROM membership WHERE membership_id = $1', [id]);
    
    console.log('✅ Delete successful for ID:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Membership berhasil dihapus!' 
    });

  } catch (error) {
    console.error('❌ DELETE error:', error);
    return NextResponse.json({ 
      error: 'Terjadi kesalahan server saat menghapus membership' 
    }, { status: 500 });
  }
}

// === HELPER FUNCTIONS ===
function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function serverError() {
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}