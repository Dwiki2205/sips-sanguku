// app/api/laporan/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    // Query untuk data lengkap
    let query = `
      SELECT 
        b.booking_id,
        b.tanggal_booking,
        b.jam_mulai,
        b.jam_selesai,
        b.total_biaya,
        b.metode_pembayaran,
        b.status,
        b.created_at,
        p.nama_lengkap as nama_pelanggan,
        p.email,
        p.telepon
      FROM booking b
      LEFT JOIN pelanggan p ON b.pelanggan_id = p.pelanggan_id
      WHERE b.status IN ('confirmed', 'completed', 'paid')
      AND b.total_biaya > 0
    `;

    const params: any[] = [];

    if (startDate) {
      query += ` AND b.tanggal_booking >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND b.tanggal_booking <= $${params.length + 1}`;
      params.push(endDate + ' 23:59:59');
    }

    query += ` ORDER BY b.tanggal_booking DESC, b.jam_mulai DESC`;

    const result = await pool.query(query, params);

    // Process data
    const exportData = result.rows.map(row => ({
      booking_id: row.booking_id,
      tanggal_booking: new Date(row.tanggal_booking).toLocaleDateString('id-ID'),
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
      total_biaya: Number(row.total_biaya) || 0,
      metode_pembayaran: row.metode_pembayaran,
      status: row.status,
      created_at: new Date(row.created_at).toLocaleDateString('id-ID'),
      nama_pelanggan: row.nama_pelanggan || 'Tidak diketahui',
      email: row.email || '-',
      telepon: row.telepon || '-'
    }));

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        meta: {
          total: exportData.length,
          startDate,
          endDate,
          exportedAt: new Date().toISOString()
        }
      });
    }

    // Default CSV export
    return generateFullCSV(exportData, startDate, endDate);

  } catch (error: any) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Terjadi kesalahan saat mengekspor data' 
      },
      { status: 500 }
    );
  }
}

function generateFullCSV(data: any[], startDate: string | null, endDate: string | null) {
  try {
    const headers = [
      'ID Booking',
      'Tanggal Booking',
      'Jam Mulai',
      'Jam Selesai',
      'Total Biaya',
      'Metode Pembayaran',
      'Status',
      'Tanggal Dibuat',
      'Nama Pelanggan',
      'Email',
      'Telepon'
    ];
    
    const csvRows = data.map(row => [
      row.booking_id,
      row.tanggal_booking,
      row.jam_mulai,
      row.jam_selesai,
      `Rp ${row.total_biaya.toLocaleString('id-ID')}`,
      row.metode_pembayaran,
      row.status,
      row.created_at,
      `"${row.nama_pelanggan}"`, // Quote untuk handle koma dalam nama
      row.email,
      row.telepon
    ]);

    // Add summary
    const totalPendapatan = data.reduce((sum, row) => sum + row.total_biaya, 0);
    
    csvRows.push([]);
    csvRows.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '']);
    csvRows.push(['Total Transaksi', '', '', '', data.length, '', '', '', '', '', '']);
    csvRows.push(['Total Pendapatan', '', '', '', `Rp ${totalPendapatan.toLocaleString('id-ID')}`, '', '', '', '', '', '']);

    const csvContent = [
      ['LAPORAN LENGKAP TRANSAKSI BADMINTON SANGUKU'],
      ['Periode:', startDate || 'Semua', 's/d', endDate || 'Semua'],
      ['Tanggal Ekspor:', new Date().toLocaleDateString('id-ID')],
      ['Jumlah Data:', data.length],
      [],
      headers,
      ...csvRows
    ].map(row => row.join(',')).join('\n');

    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    return new Response(csvWithBOM, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="laporan-lengkap-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error generating full CSV:', error);
    throw new Error('Gagal membuat file CSV lengkap');
  }
}