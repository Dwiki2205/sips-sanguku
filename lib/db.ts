// lib/db.ts
import { Pool } from 'pg';

let pool: Pool;

/**
 * Helper: Cek apakah error memiliki properti 'code' (NodeJS.ErrnoException)
 */
function isPgError(err: unknown): err is { code: string; message: string } {
  return typeof err === 'object' && err !== null && 'code' in err && 'message' in err;
}

// Inisialisasi Pool
try {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL tidak ditemukan di environment');
    process.exit(1);
  }

  const url = new URL(connectionString);

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Neon menggunakan self-signed cert
    },
    host: url.hostname,
    port: parseInt(url.port || '5432', 10),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  });

  // === EVENT LISTENERS ===
  pool.on('connect', () => {
    console.log('Connected to Neon PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err.message);

    if (isPgError(err)) {
      switch (err.code) {
        case 'ETIMEDOUT':
          console.error('ETIMEDOUT: Koneksi timeout. Cek jaringan atau tambahkan ?sslmode=require');
          break;
        case 'ENETUNREACH':
          console.error('ENETUNREACH: IPv6 tidak tersedia. Pastikan jaringan mendukung IPv4.');
          break;
        case 'ENOTFOUND':
          console.error('ENOTFOUND: Host tidak ditemukan. Periksa host di DATABASE_URL.');
          break;
        default:
          console.error(`Kode error: ${err.code}`);
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
        console.error('Pastikan DATABASE_URL benar dan Neon aktif.');
        console.error('Contoh: postgresql://user:pass@ep-nama-project.pooler.us-east-2.aws.neon.tech/dbname?sslmode=require');
      }
      process.exit(1);
    }
  })();

} catch (error: any) {
  console.error('Failed to initialize database pool:', error.message);
  process.exit(1);
}

// Export pool langsung
export default pool;