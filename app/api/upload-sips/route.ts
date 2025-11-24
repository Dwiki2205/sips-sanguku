// app/api/upload-sips/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import pool from '@/lib/db'; // pastikan ini koneksi ke Neon
import { parse } from 'csv-parse';

// Fungsi bikin 3 digit acak (001-999)
const generateRandomId = () => {
  return String(Math.floor(Math.random() * 1000)).padStart(3, '0');
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return Response.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const csvText = buffer.toString('utf-8');

    // 1. Simpan file untuk cron SFTP (wajib tetap ada)
    const uploadDir = path.join(process.cwd(), 'uploads', 'sips');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, file.name);
    fs.writeFileSync(filePath, buffer);

    // 2. Import langsung ke database Neon
    await importCsvToNeonDatabase(csvText);

    return Response.json({
      success: true,
      message: `File ${file.name} berhasil di-upload & data sudah masuk ke database!`,
    });
  } catch (error: any) {
    console.error('Upload & import error:', error);
    return Response.json(
      { error: error.message || 'Gagal upload & import' },
      { status: 500 }
    );
  }
}

// ==================================================
// FUNGSI IMPORT KE DATABASE NEON (SUDAH SESUAI STRUKTUR TABEL KAMU)
// ==================================================
async function importCsvToNeonDatabase(csvContent: string) {
  const records: any[] = [];

  // Parse CSV
  await new Promise<void>((resolve, reject) => {
    const parser = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read())) {
        records.push(record);
      }
    });

    parser.on('end', () => resolve());
    parser.on('error', (err) => reject(err));
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const r of records) {
      const pelangganId = r.pelanggan_id.trim();

      // 1. UPSERT PELANGGAN
      await client.query(
        `INSERT INTO pelanggan (
          pelanggan_id, nama_lengkap, username, email, telepon, alamat, tanggal_registrasi
        ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()))
        ON CONFLICT (pelanggan_id) DO UPDATE SET
          nama_lengkap = EXCLUDED.nama_lengkap,
          email = EXCLUDED.email,
          telepon = EXCLUDED.telepon,
          alamat = EXCLUDED.alamat,
          username = EXCLUDED.username,
          tanggal_registrasi = EXCLUDED.tanggal_registrasi`,
        [
          pelangganId,
          r.nama_lengkap,
          r.username || `user_${pelangganId}`,
          r.email || null,
          r.telepon || null,
          r.alamat || null,
          r.created_at ? new Date(r.created_at) : new Date(),
        ]
      );

      // 2. UPSERT BOOKING TERAKHIR (jika ada total_biaya)
      if (r.total_biaya && parseFloat(r.total_biaya) > 0 && r.tanggal_booking) {
        const bookingId = `BKG${generateRandomId()}`;
        const tanggal = r.tanggal_booking.split('T')[0];
        const jamMulai = r.tanggal_booking.split('T')[1].replace('Z', '').substring(0, 5);

        await client.query(
          `INSERT INTO booking (
            booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai,
            status, total_biaya, metode_pembayaran, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $4::time + interval '1 hour', 'confirmed', $5, 'cash', NOW(), NOW())
          ON CONFLICT (booking_id) DO UPDATE SET
            tanggal_booking = EXCLUDED.tanggal_booking,
            jam_mulai = EXCLUDED.jam_mulai,
            total_biaya = EXCLUDED.total_biaya,
            updated_at = NOW()`,
          [bookingId, pelangganId, tanggal, jamMulai, r.total_biaya]
        );
      }

      // 3. UPSERT MEMBERSHIP (jika ada tier & expired_date)
      if (r.tier_membership && r.expired_date) {
        const membershipId = `MEM${generateRandomId()}`;

        await client.query(
          `INSERT INTO membership (
            membership_id, pelanggan_id, tanggal_daftar, status_keaktifan,
            tier_membership, expired_date
          ) VALUES ($1, $2, COALESCE($3, NOW()::date), $4, $5, $6)
          ON CONFLICT (membership_id) DO UPDATE SET
            tier_membership = EXCLUDED.tier_membership,
            expired_date = EXCLUDED.expired_date,
            status_keaktifan = EXCLUDED.status_keaktifan`,
          [
            membershipId,
            pelangganId,
            r.created_at ? new Date(r.created_at.split('T')[0]) : new Date(),
            r.status_keaktifan && r.status_keaktifan !== '' ? r.status_keaktifan : 'active',
            r.tier_membership,
            r.expired_date,
          ]
        );
      }
    }

    await client.query('COMMIT');
  } catch (err: any) {
    await client.query('ROLLBACK');
    throw new Error(`Import gagal: ${err.message}`);
  } finally {
    client.release();
  }
}