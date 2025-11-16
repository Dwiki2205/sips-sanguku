// app/api/laporan/daily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Validasi format tanggal
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Query untuk data harian
    const query = `
      SELECT 
        b.booking_id,
        b.tanggal_booking,
        b.jam_mulai,
        b.jam_selesai,
        b.total_biaya,
        b.metode_pembayaran,
        b.status,
        p.nama_lengkap as nama_pelanggan,
        p.telepon
      FROM booking b
      LEFT JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
      WHERE DATE(b.tanggal_booking) = $1
      AND b.status IN ('confirmed', 'completed', 'paid')
      ORDER BY b.jam_mulai ASC
    `;

    const result = await pool.query(query, [date]);

    // Process data
    const dailyData = result.rows.map(row => ({
      bookingId: row.booking_id,
      tanggal: row.tanggal_booking,
      jamMulai: row.jam_mulai,
      jamSelesai: row.jam_selesai,
      totalBiaya: Number(row.total_biaya) || 0,
      metodePembayaran: row.metode_pembayaran,
      status: row.status,
      namaPelanggan: row.nama_pelanggan || 'Tidak diketahui',
      telepon: row.telepon || '-'
    }));

    // Calculate summary
    const summary = {
      totalTransaksi: dailyData.length,
      totalPendapatan: dailyData.reduce((sum, item) => sum + item.totalBiaya, 0),
      metodePembayaran: dailyData.reduce((acc: any, item) => {
        acc[item.metodePembayaran] = (acc[item.metodePembayaran] || 0) + 1;
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      data: {
        date,
        summary,
        transactions: dailyData,
        total: dailyData.length
      }
    });

  } catch (error: any) {
    console.error('Error fetching daily report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat mengambil data harian' 
      },
      { status: 500 }
    );
  }
}