// app/api/booking/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// ====================
// GET: List Booking
// ====================
export async function GET(request: NextRequest) {
  try {
    // 1. AUTH
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. PARAMS
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : null;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const status = searchParams.get('status');

    // 3. BUILD QUERY UTAMA
    let query = `
      SELECT 
        b.*,
        p.nama_lengkap AS nama_pelanggan
      FROM booking b
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
    `;
    const params: any[] = [];

    // 4. BUILD QUERY COUNT (UNTUK TOTAL SEMUA DATA)
    let countQuery = `
      SELECT COUNT(*) as total_count
      FROM booking b
      JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
    `;
    const countParams: any[] = [];

    // 5. FILTER BERDASARKAN ROLE
    let whereClause = '';
    if (decoded.role === 'pelanggan') {
      whereClause = ' WHERE p.username = $1';
      params.push(decoded.username);
      countParams.push(decoded.username);

      if (status) {
        whereClause += ` AND b.status = $${params.length + 1}`;
        params.push(status);
        countParams.push(status);
      }
    } else {
      // Owner / Pegawai
      if (status) {
        whereClause = ' WHERE b.status = $1';
        params.push(status);
        countParams.push(status);
      }
    }

    // 6. APPLY WHERE CLAUSE KE KEDUA QUERY
    if (whereClause) {
      query += whereClause;
      countQuery += whereClause;
    }

    // 7. SORTING HANYA UNTUK QUERY UTAMA
    query += ' ORDER BY b.tanggal_booking DESC, b.jam_mulai DESC';

    // 8. PAGINATION HANYA UNTUK QUERY UTAMA
    if (limit !== null) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    if (offset > 0) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    // 9. EXECUTE KEDUA QUERY SECARA PARALEL
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].total_count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        limit,
        offset,
        total: totalCount, // TOTAL SEMUA DATA (BUKAN PER HALAMAN)
        page: limit ? Math.floor(offset / limit) + 1 : 1,
        pageCount: limit ? Math.ceil(totalCount / limit) : 1
      },
    });
  } catch (error: any) {
    console.error('GET /api/booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

// POST, PUT, DELETE tetap sama seperti sebelumnya...
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const required = ['booking_id', 'pelanggan_id', 'tanggal_booking', 'jam_mulai', 'jam_selesai', 'total_biaya'];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ success: false, error: `Field ${field} wajib diisi` }, { status: 400 });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO booking 
        (booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai, 
         status, total_biaya, metode_pembayaran)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        data.booking_id,
        data.pelanggan_id,
        data.tanggal_booking,
        data.jam_mulai,
        data.jam_selesai,
        data.status || 'pending',
        data.total_biaya,
        data.metode_pembayaran || 'Cash',
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('POST /api/booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal simpan booking' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { booking_id } = data;

    if (!booking_id) {
      return NextResponse.json({ success: false, error: 'booking_id wajib' }, { status: 400 });
    }

    const result = await pool.query(
      `
      UPDATE booking 
      SET 
        tanggal_booking = $1,
        jam_mulai = $2,
        jam_selesai = $3,
        status = $4,
        total_biaya = $5,
        metode_pembayaran = $6,
        updated_at = NOW()
      WHERE booking_id = $7
      RETURNING *
      `,
      [
        data.tanggal_booking,
        data.jam_mulai,
        data.jam_selesai,
        data.status,
        data.total_biaya,
        data.metode_pembayaran,
        booking_id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('PUT /api/booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wajib' }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM booking WHERE booking_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Booking dihapus' });
  } catch (error: any) {
    console.error('DELETE /api/booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal hapus' },
      { status: 500 }
    );
  }
}