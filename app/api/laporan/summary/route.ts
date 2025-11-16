// app/api/laporan/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // PERBAIKAN: Definisikan period di scope terluar
  let period = 'today';
  
  try {
    const { searchParams } = new URL(request.url);
    period = searchParams.get('period') || 'today';

    console.log('Fetching summary for period:', period);

    let dateFilter = '';
    const params: any[] = [];
    
    // Set date filter berdasarkan period
    const now = new Date();
    switch (period) {
      case 'today':
        dateFilter = `AND DATE(tanggal_booking) = $1`;
        params.push(now.toISOString().split('T')[0]);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        dateFilter = `AND tanggal_booking >= $1`;
        params.push(startOfWeek.toISOString().split('T')[0]);
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = `AND tanggal_booking >= $1`;
        params.push(startOfMonth.toISOString().split('T')[0]);
        break;
      case 'year':
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        dateFilter = `AND tanggal_booking >= $1`;
        params.push(startOfYear.toISOString().split('T')[0]);
        break;
      default:
        break;
    }

    // Query utama untuk summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_transaksi,
        SUM(total_biaya) as total_pendapatan,
        AVG(total_biaya) as rata_rata_transaksi,
        COUNT(DISTINCT DATE(tanggal_booking)) as total_hari
      FROM booking 
      WHERE status IN ('confirmed', 'completed', 'paid')
      AND total_biaya > 0
      ${dateFilter}
    `;

    const summaryResult = await query(summaryQuery, params);
    const summary = summaryResult.rows[0];

    // Query untuk metode pembayaran
    const metodeQuery = `
      SELECT 
        metode_pembayaran,
        COUNT(*) as jumlah_transaksi,
        SUM(total_biaya) as total_pendapatan
      FROM booking 
      WHERE status IN ('confirmed', 'completed', 'paid')
      AND total_biaya > 0
      ${dateFilter}
      GROUP BY metode_pembayaran
      ORDER BY total_pendapatan DESC
    `;

    const metodeResult = await query(metodeQuery, params);

    // Process data
    const processedSummary = {
      totalTransaksi: Number(summary?.total_transaksi) || 0,
      totalPendapatan: Number(summary?.total_pendapatan) || 0,
      rataRataTransaksi: Number(summary?.rata_rata_transaksi) || 0,
      totalHari: Number(summary?.total_hari) || 0
    };

    const processedMetode = metodeResult.rows.map((item: any) => ({
      metode: item.metode_pembayaran,
      jumlahTransaksi: Number(item.jumlah_transaksi) || 0,
      totalPendapatan: Number(item.total_pendapatan) || 0,
      persentase: processedSummary.totalPendapatan > 0 
        ? Math.round((Number(item.total_pendapatan) / processedSummary.totalPendapatan) * 100) 
        : 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        period: period,
        summary: processedSummary,
        metodeBreakdown: processedMetode,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error fetching laporan summary:', {
      message: error.message,
      code: error.code,
      period: period // PERBAIKAN: Gunakan variable period yang sudah didefinisikan
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Terjadi kesalahan saat mengambil data summary',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}