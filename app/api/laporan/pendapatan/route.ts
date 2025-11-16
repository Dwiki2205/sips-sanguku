// app/api/laporan/pendapatan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const metodePembayaran = searchParams.get('metodePembayaran');
    const unitBisnis = searchParams.get('unitBisnis');
    const download = searchParams.get('download');

    console.log('Laporan Pendapatan Request:', {
      startDate,
      endDate,
      metodePembayaran,
      unitBisnis,
      download
    });

    // Build query dengan parameterized queries untuk keamanan
    let queryText = `
      SELECT 
        DATE(b.tanggal_booking) as tanggal,
        'Badminton' as unit_bisnis,
        b.metode_pembayaran,
        COUNT(*) as jumlah_transaksi,
        SUM(b.total_biaya) as sub_total
      FROM booking b
      WHERE b.status IN ('confirmed', 'completed', 'paid')
        AND b.total_biaya > 0
    `;

    const params: any[] = [];
    let paramCount = 0;

    // Add filters dengan parameter binding
    if (startDate) {
      paramCount++;
      queryText += ` AND b.tanggal_booking >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND b.tanggal_booking <= $${paramCount}`;
      params.push(`${endDate} 23:59:59`);
    }

    if (metodePembayaran && metodePembayaran !== 'all') {
      paramCount++;
      queryText += ` AND b.metode_pembayaran = $${paramCount}`;
      params.push(metodePembayaran);
    }

    // Untuk unit bisnis, karena hanya Badminton, kita bisa abaikan filter ini
    if (unitBisnis && unitBisnis !== 'all') {
      // Tetap tambahkan parameter untuk konsistensi
      paramCount++;
      queryText += ` AND $${paramCount} = $${paramCount}`; // Dummy condition
      params.push(unitBisnis);
    }

    // Group by dan order by
    queryText += `
      GROUP BY DATE(b.tanggal_booking), b.metode_pembayaran
      ORDER BY tanggal DESC, metode_pembayaran
    `;

    // Execute query menggunakan connection pool yang sudah dioptimalkan
    const result = await query(queryText, params);

    // Process data untuk memastikan tipe number
    const processedData = result.rows.map(row => ({
      tanggal: row.tanggal,
      unit_bisnis: row.unit_bisnis,
      metode_pembayaran: row.metode_pembayaran,
      jumlah_transaksi: Number(row.jumlah_transaksi) || 0,
      sub_total: Number(row.sub_total) || 0
    }));

    console.log(`Data processed: ${processedData.length} records`);

    // Jika download CSV
    if (download === 'true') {
      return generateCSV(processedData, startDate, endDate);
    }

    // Calculate summary
    const totalPendapatan = processedData.reduce((sum, item) => sum + item.sub_total, 0);
    const totalTransaksi = processedData.reduce((sum, item) => sum + item.jumlah_transaksi, 0);
    const totalHari = new Set(processedData.map(item => item.tanggal)).size;

    return NextResponse.json({
      success: true,
      data: processedData,
      summary: {
        totalPendapatan,
        totalTransaksi,
        totalHari,
        rataRataPerHari: totalHari > 0 ? totalPendapatan / totalHari : 0
      },
      meta: {
        recordCount: processedData.length,
        filteredBy: {
          startDate,
          endDate,
          metodePembayaran: metodePembayaran !== 'all' ? metodePembayaran : 'all',
          unitBisnis: unitBisnis !== 'all' ? unitBisnis : 'all'
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error fetching laporan pendapatan:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Terjadi kesalahan saat mengambil data laporan',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Fungsi untuk generate CSV
function generateCSV(data: any[], startDate: string | null, endDate: string | null) {
  try {
    const headers = ['Tanggal', 'Unit Bisnis', 'Metode Pembayaran', 'Jumlah Transaksi', 'Total Pendapatan'];
    
    const csvRows = data.map(row => [
      formatDateForCSV(row.tanggal),
      row.unit_bisnis,
      row.metode_pembayaran,
      row.jumlah_transaksi,
      formatCurrencyForCSV(row.sub_total)
    ]);

    // Calculate totals
    const totalPendapatan = data.reduce((sum, row) => sum + row.sub_total, 0);
    const totalTransaksi = data.reduce((sum, row) => sum + row.jumlah_transaksi, 0);
    const totalHari = new Set(data.map(item => item.tanggal)).size;

    // Add summary rows
    csvRows.push([]);
    csvRows.push(['SUMMARY', '', '', '', '']);
    csvRows.push(['Total Hari', '', '', '', totalHari]);
    csvRows.push(['Total Transaksi', '', '', '', totalTransaksi]);
    csvRows.push(['Total Pendapatan', '', '', '', formatCurrencyForCSV(totalPendapatan)]);
    csvRows.push(['Rata-rata per Hari', '', '', '', formatCurrencyForCSV(totalHari > 0 ? totalPendapatan / totalHari : 0)]);

    const csvContent = [
      ['LAPORAN PENDAPATAN BADMINTON SANGUKU'],
      ['Periode:', startDate ? formatDateForCSV(startDate) : 'Semua', 's/d', endDate ? formatDateForCSV(endDate) : 'Semua'],
      ['Tanggal Cetak:', new Date().toLocaleDateString('id-ID')],
      ['Generated by: Sistem SIPS'],
      [],
      headers,
      ...csvRows
    ].map(row => row.join(',')).join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    return new Response(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="laporan-pendapatan-badminton-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw new Error('Gagal membuat file CSV');
  }
}

// Helper functions untuk CSV
function formatDateForCSV(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function formatCurrencyForCSV(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}