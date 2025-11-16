// app/api/stok/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, checkDatabaseConnection } from '@/lib/db';

// Cache
let cache = {
  data: null as any[] | null,
  timestamp: 0,
  ttl: 30_000 // 30 detik
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const search = (searchParams.get('search') || '').trim();
    const offset = (page - 1) * limit;

    console.log('GET Query:', { page, limit, search, offset });

    const isHealthy = await checkDatabaseConnection();
    if (!isHealthy && cache.data) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        pagination: { page, limit, total: cache.data.length, totalPages: 1 },
        cached: true,
        message: 'Database sementara tidak tersedia, menggunakan cache'
      });
    }

    let sql = `
      SELECT 
        id_stok, nama_stok, satuan_stok, supplier_stok,
        tanggal_stok, jumlah_stok, harga_stok
      FROM stok
    `;
    const params: any[] = [];
    let where = '';

    if (search) {
      where = ` WHERE nama_stok ILIKE $1 OR supplier_stok ILIKE $1 OR satuan_stok ILIKE $1`;
      params.push(`%${search}%`);
    }

    sql += where;
    sql += ` ORDER BY id_stok DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    const rows = result.rows;

    // Hitung total
    let countSql = 'SELECT COUNT(*) as total FROM stok';
    const countParams = search ? [`%${search}%`] : [];
    if (search) countSql += ' WHERE nama_stok ILIKE $1 OR supplier_stok ILIKE $1 OR satuan_stok ILIKE $1';

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Update cache
    cache = { data: rows, timestamp: Date.now(), ttl: 30_000 };

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages }
    });

  } catch (error: any) {
    console.error('GET Error:', error.message);

    if (cache.data) {
      return NextResponse.json({
        success: true,
        data: cache.data,
        pagination: { page: 1, limit: cache.data.length, total: cache.data.length, totalPages: 1 },
        cached: true,
        message: 'Menggunakan cache karena error database'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Gagal memuat data', message: 'Database error' },
      { status: 503 }
    );
  }
}

// POST, PUT, DELETE → sama, tapi pakai harga_stok
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama_stok, satuan_stok, supplier_stok, tanggal_stok, jumlah_stok, Harga_stok } = body;

    if (!nama_stok?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama stok wajib' }, { status: 400 });
    }

    const jumlah = parseInt(jumlah_stok) || 0;
    const harga = parseFloat(Harga_stok) || 0;

    if (jumlah < 0 || harga < 0) {
      return NextResponse.json({ success: false, error: 'Nilai harus ≥ 0' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO stok 
       (nama_stok, satuan_stok, supplier_stok, tanggal_stok, jumlah_stok, harga_stok)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        nama_stok.trim(),
        (satuan_stok || 'pcs').trim(),
        (supplier_stok || 'Tidak ada').trim(),
        tanggal_stok || new Date().toISOString().split('T')[0],
        jumlah,
        harga
      ]
    );

    cache.data = null; // invalidate

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Stok ditambahkan'
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal tambah stok' },
      { status: 500 }
    );
  }
}