// app/api/laporan/options/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Fetching filter options...');

    // PERBAIKAN: Gunakan query biasa, bukan callback
    // Get unique metode pembayaran dari booking
    const metodeResult = await query(`
      SELECT DISTINCT metode_pembayaran 
      FROM booking 
      WHERE metode_pembayaran IS NOT NULL 
      AND metode_pembayaran != ''
      AND status IN ('confirmed', 'completed', 'paid')
      ORDER BY metode_pembayaran
    `);

    // Get tanggal minimum dan maksimum untuk range filter
    const dateRangeResult = await query(`
      SELECT 
        MIN(tanggal_booking) as min_date,
        MAX(tanggal_booking) as max_date,
        COUNT(*) as total_transaksi,
        SUM(total_biaya) as total_pendapatan
      FROM booking 
      WHERE status IN ('confirmed', 'completed', 'paid')
      AND total_biaya > 0
    `);

    // PERBAIKAN: Type safety untuk mapping
    const metodePembayaran = metodeResult.rows.map((row: any) => row.metode_pembayaran);
    
    // Untuk unit bisnis, karena hanya Badminton
    const unitBisnis = ['Badminton'];

    // Format date range
    const dateRange = dateRangeResult.rows[0];
    const minDate = dateRange?.min_date 
      ? new Date(dateRange.min_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    const maxDate = dateRange?.max_date 
      ? new Date(dateRange.max_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const stats = {
      totalTransaksi: Number(dateRange?.total_transaksi) || 0,
      totalPendapatan: Number(dateRange?.total_pendapatan) || 0
    };

    console.log('Filter options fetched successfully:', {
      metodePembayaran,
      unitBisnis,
      dateRange: { minDate, maxDate },
      stats
    });

    return NextResponse.json({
      success: true,
      data: {
        metodePembayaran,
        unitBisnis,
        dateRange: {
          minDate,
          maxDate
        },
        stats
      }
    });

  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    
    // Return default options jika error
    return NextResponse.json({
      success: true,
      data: {
        metodePembayaran: ['QRIS', 'Tunai', 'Transfer'],
        unitBisnis: ['Badminton'],
        dateRange: {
          minDate: new Date().toISOString().split('T')[0],
          maxDate: new Date().toISOString().split('T')[0]
        },
        stats: {
          totalTransaksi: 0,
          totalPendapatan: 0
        }
      }
    });
  }
}