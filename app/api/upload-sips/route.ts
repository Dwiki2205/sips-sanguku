// app/api/upload-sips/route.ts
import { NextRequest } from 'next/server';
import pool from '@/lib/db';
import { parse } from 'csv-parse';

// Fungsi bikin 3 digit acak
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

    // Validasi nama file (opsional, tetap bagus)
    const validName = /^sips_pelanggan_\d{8}_\d{4}\.csv$/.test(file.name);
    if (!validName) {
      return Response.json(
        { error: 'Nama file tidak valid. Harus: sips_pelanggan_YYYYMMDD_HHMM.csv' },
        { status: 400 }
      );
    }

    // Langsung baca isi CSV tanpa simpan ke disk
    const buffer = Buffer.from(await file.arrayBuffer());
    const csvText = buffer.toString('utf-8');

    // LANGSUNG IMPORT KE DATABASE NEON
    await importCsvToNeonDatabase(csvText, file.name);

    return Response.json({
      success: true,
      message: `File ${file.name} berhasil di-upload & data langsung masuk ke database Neon!`,
      info: 'File tidak disimpan di server (sesuai permintaan). Cron SFTP akan ambil dari database.',
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
// IMPORT LANGSUNG TANPA SIMPAN FILE
// ==================================================
async function importCsvToNeonDatabase(csvContent: string, filename: string) {
  const records: any[] = [];

  // Parse CSV dari memory
  await new Promise<void>((resolve, reject) => {
    const parser = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // support UTF-8 BOM
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

  if (records.length === 0) {
    throw new Error('File CSV kosong atau format salah');
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    console.log(`Memproses ${records.length} baris dari ${filename}...`);

    for (const r of records) {
      const pelangganId = (r.pelanggan_id || '').trim();
      if (!pelangganId) continue;

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
          r.nama_lengkap || null,
          r.username || `user_${pelangganId}`,
          r.email || null,
          r.telepon || null,
          r.alamat || null,
          r.created_at ? new Date(r.created_at) : new Date(),
        ]
      );

      // 2. UPSERT BOOKING (jika ada)
      if (r.total_biaya && parseFloat(r.total_biaya) > 0 && r.tanggal_booking) {
        const bookingId = `BKG${generateRandomId()}`;
        const tanggal = r.tanggal_booking.split('T')[0];
        const jamMulai = (r.tanggal_booking.split('T')[1] || '').replace('Z', '').substring(0, 5);

        if (jamMulai.length === 5) {
          await client.query(
            `INSERT INTO booking (
              booking_id, pelanggan_id, tanggal_booking, jam_mulai, jam_selesai,
              status, total_biaya, metode_pembayaran, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $4::time + interval '1 hour', 'confirmed', $5, 'cash', NOW(), NOW())
            ON CONFLICT (booking_id) DO NOTHING`,
            [bookingId, pelangganId, tanggal, jamMulai, r.total_biaya]
          );
        }
      }

      // 3. UPSERT MEMBERSHIP
      if (r.tier_membership && r.expired_date) {
        const membershipId = `MEM${generateRandomId()}`;

        await client.query(
          `INSERT INTO membership (
            membership_id, pelanggan_id, tanggal_daftar, status_keaktifan,
            tier_membership, expired_date
          ) VALUES ($1, $2, COALESCE($3, NOW()::date), $4, $5, $6)
          ON CONFLICT (membership_id) DO NOTHING`,
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
    console.log(`Import ${records.length} data selesai dari ${filename}`);
  } catch (err: any) {
    if (client) await client.query('ROLLBACK');
    console.error('Import gagal:', err.message);
    throw new Error(`Import gagal: ${err.message}`);
  } finally {
    if (client) client.release();
  }
}