// app/api/membership/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';
import { query } from '@/lib/database'; // Gunakan wrapper database

export const dynamic = 'force-dynamic';

// === GET: Ambil daftar membership dengan pagination & search ===
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // batasi max 100
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const search = (searchParams.get('search') || '').trim();
    const pelanggan_id = searchParams.get('pelanggan_id');
    const username = searchParams.get('username');

    // Base query
    let sql = `
      SELECT m.*, p.nama_lengkap, p.email, p.telepon
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

    // Search global (nama, email, telepon, id, tier)
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
    const countParams = params.slice(); // copy params
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // === Tambahkan ORDER, LIMIT, OFFSET ===
    sql += ` ORDER BY m.tanggal_daftar DESC`;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    // === Eksekusi query utama ===
    const result = await query(sql, params);

    // === Response sesuai ekspektasi frontend ===
    return NextResponse.json({
      success: true,
      data: result.rows,
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

// === PUT: Edit membership (Admin only) ===
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
    const { tanggal_daftar, tier_membership, expired_date } = body;

    const status_keaktifan = new Date(expired_date) < new Date() ? 'expired' : 'active';

    const result = await query(
      `UPDATE membership SET 
         tanggal_daftar = $1, tier_membership = $2, expired_date = $3, status_keaktifan = $4
       WHERE membership_id = $5
       RETURNING *`,
      [tanggal_daftar, tier_membership, expired_date, status_keaktifan, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Membership tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });

  } catch (error) {
    return serverError();
  }
}

// === DELETE: Hapus membership (Owner only) ===
export async function DELETE(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return unauthorized();

  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'owner') return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    await query('DELETE FROM membership WHERE membership_id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Membership dihapus!' });

  } catch (error) {
    return serverError();
  }
}

// === HELPER FUNCTIONS ===
function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function serverError() {
  return NextResponse.json({ error: 'Server error' }, { status: 500 });
}