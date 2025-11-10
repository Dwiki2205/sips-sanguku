// lib/db.ts
import { Pool } from 'pg';

let pool: Pool;

/**
 * Helper: Cek apakah error memiliki properti 'code' (NodeJS.ErrnoException)
 */
function isPgError(err: unknown): err is { code: string; message: string } {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
}

try {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL tidak ditemukan di environment');
    process.exit(1);
  }

  // Parse URL untuk ekstrak host & port
  const url = new URL(connectionString);

  // Konfigurasi Pool dengan SSL wajib + IPv4 only
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Neon menggunakan self-signed cert
    },
    // Ekstrak host & port secara eksplisit
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    // Force IPv4 only (mencegah ENETUNREACH pada IPv6)
    // Catatan: 'family' tidak didukung di Pool config → kita gunakan host resolution
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000, // 8 detik timeout (lebih ketat)
  });

  // === EVENT LISTENERS ===
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err.message);

    if (isPgError(err)) {
      if (err.code === 'ETIMEDOUT') {
        console.error('ETIMEDOUT: Koneksi ke Neon timeout.');
        console.error('   → Cek jaringan, firewall, atau tambahkan ?sslmode=require');
      }
      if (err.code === 'ENETUNREACH') {
        console.error('ENETUNREACH: IPv6 tidak tersedia.');
        console.error('   → Pastikan jaringan mendukung IPv4 (Neon biasanya IPv4)');
      }
      if (err.code === 'ENOTFOUND') {
        console.error('ENOTFOUND: Host database tidak ditemukan.');
        console.error('   → Periksa host di DATABASE_URL (harus .pooler.neon.tech)');
      }
    }
  });

  // === TEST KONEKSI SAAT STARTUP ===
  (async () => {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() AS current_time');
      console.log('Database connection test: SUCCESS', res.rows[0]);
      client.release();
    } catch (err: unknown) {
      console.error('Database connection test: FAILED');

      if (err instanceof Error) {
        console.error('Error message:', err.message);
      }

      if (isPgError(err)) {
        if (err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
          console.error('Pastikan PostgreSQL berjalan di localhost atau gunakan DATABASE_URL yang benar');
          console.error('Untuk Neon: Pastikan format URL benar dan tambahkan ?sslmode=require');
          console.error('Contoh:');
          console.error('   postgresql://user:pass@ep-project-123456.pooler.us-east-2.aws.neon.tech/dbname?sslmode=require');
        }
        if (err.code === 'ENETUNREACH') {
          console.error('ENETUNREACH: IPv6 gagal. Coba gunakan jaringan yang mendukung IPv4.');
        }
      } else {
        console.error('Error tidak dikenali. Pastikan DATABASE_URL valid.');
      }
    }
  })();

} catch (error: any) {
  console.error('Failed to initialize database pool:', error.message);
  process.exit(1);
}

export default pool;
export const usingSQLite = false;