// lib/db.ts
// Gabungan ADUH + Yareuu + Auto-Migration + Production Ready
// Kelompok: YADUH (Yareuu + ADUH)

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// === SINGLETON POOL ===
let pool: Pool | null = null;
let connectionTested = false;

// === GET POOL (Singleton) ===
export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL tidak ditemukan di environment');
    process.exit(1);
  }

  console.log('Creating Neon PostgreSQL pool...');

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 7500,
  });

  // === EVENT LISTENERS ===
  pool.on('connect', () => console.log('New client connected'));
  pool.on('acquire', () => {});
  pool.on('remove', () => console.log('Client removed from pool'));
  pool.on('error', (err) => console.error('Pool error:', err.message));

  // === TEST KONEKSI (Hanya di dev) ===
  if (!connectionTested && process.env.NODE_ENV === 'development') {
    testConnectionOnce();
  }

  // === AUTO MIGRATION ===
  if (process.env.AUTO_MIGRATE === 'true' || process.env.NODE_ENV === 'development') {
    setTimeout(() => migrateStokTable(), 1000); // delay agar pool siap
  }

  return pool;
}

// === TEST KONEKSI SEKALI ===
async function testConnectionOnce() {
  const testPool = getPool();
  let client: PoolClient | null = null;

  try {
    console.log('Testing database connection...');
    connectionTested = true;

    const acquirePromise = testPool.connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection acquire timeout')), 8000)
    );

    client = await Promise.race([acquirePromise, timeoutPromise]);
    const result = await client.query('SELECT NOW() as current_time, version() as version');

    console.log('Neon PostgreSQL Connected Successfully!');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version.split(',')[0]);
  } catch (error: any) {
    console.error('Connection test FAILED:', error.message);
    console.error('   Application continues...');
  } finally {
    client?.release();
  }
}

// === AUTO MIGRATION TABEL STOK ===
async function migrateStokTable() {
  let client: PoolClient | undefined;
  try {
    console.log('Running auto-migration for table: stok');

    client = await getPool().connect();
    await client.query('BEGIN');

    // 1. Ganti nama kolom jika masih pakai kutip
    await client.query(`
      ALTER TABLE IF EXISTS stok RENAME COLUMN IF EXISTS "Harga_stok" TO harga_stok;
    `);

    // 2. Ubah tipe jumlah_stok: VARCHAR → INTEGER
    const jumlahCheck = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'stok' AND column_name = 'jumlah_stok'
    `);
    if (jumlahCheck.rows[0]?.data_type === 'character varying') {
      await client.query(`
        ALTER TABLE stok 
        ALTER COLUMN jumlah_stok TYPE INTEGER 
        USING NULLIF(TRIM(jumlah_stok), '')::INTEGER;
      `);
    }

    // 3. Ubah tipe harga_stok: VARCHAR → NUMERIC
    const hargaCheck = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'stok' AND column_name = 'harga_stok'
    `);
    if (hargaCheck.rows[0]?.data_type === 'character varying') {
      await client.query(`
        ALTER TABLE stok 
        ALTER COLUMN harga_stok TYPE NUMERIC(10,2) 
        USING NULLIF(TRIM(harga_stok), '')::NUMERIC;
      `);
    }

    // 4. Set default & constraint
    await client.query(`
      ALTER TABLE stok ALTER COLUMN jumlah_stok SET DEFAULT 0;
      ALTER TABLE stok ALTER COLUMN harga_stok SET DEFAULT 0;
      ALTER TABLE stok ALTER COLUMN tanggal_stok SET DEFAULT CURRENT_DATE;

      ALTER TABLE stok 
      ADD CONSTRAINT IF NOT EXISTS chk_jumlah_stok_non_negative 
      CHECK (jumlah_stok >= 0);

      ALTER TABLE stok 
      ADD CONSTRAINT IF NOT EXISTS chk_harga_stok_non_negative 
      CHECK (harga_stok >= 0);
    `);

    await client.query('COMMIT');
    console.log('Auto-migration stok table: SUCCESS');
  } catch (err: any) {
    await client?.query('ROLLBACK');
    if (!['42701', '42703', '23505', '22P02'].includes(err.code)) {
      console.warn('Auto-migration non-critical error:', err.message);
    }
  } finally {
    client?.release();
  }
}

// === ENHANCED QUERY WITH RETRY & TIMEOUT ===
export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = [],
  retries = 3
): Promise<QueryResult<T>> {
  let client: PoolClient | undefined;
  const start = Date.now();

  try {
    console.log(`Executing query: ${text.trim().split('\n')[0].substring(0, 100)}...`);

    const acquirePromise = getPool().connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection acquire timeout')), 8000)
    );
    client = await Promise.race([acquirePromise, timeoutPromise]);

    await client.query('SET statement_timeout = 15000;');
    const res = await client.query<T>(text, params);
    const duration = Date.now() - start;

    console.log(`Query success in ${duration}ms | Rows: ${res.rowCount}`);
    return res;
  } catch (err: any) {
    const duration = Date.now() - start;
    console.error(`Query failed after ${duration}ms:`, {
      message: err.message,
      code: err.code,
      query: text.substring(0, 100),
    });

    const retryable = retries > 0 && (
      ['ETIMEDOUT', 'ECONNRESET', '57P01', '08006'].includes(err.code) ||
      /timeout|terminated|connection|acquire/i.test(err.message)
    );

    if (retryable) {
      const wait = 1000 * (4 - retries);
      console.warn(`Retrying... (${retries} left, wait ${wait}ms)`);
      await new Promise(r => setTimeout(r, wait));
      return query(text, params, retries - 1);
    }

    throw err;
  } finally {
    client?.release();
  }
}

// === HEALTH CHECK ===
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    console.log('Running database health check...');
    const result = await query('SELECT NOW() as current_time', [], 1);
    console.log('Database healthy:', result.rows[0].current_time);
    return true;
  } catch (error: any) {
    console.error('Database unhealthy:', error.message);
    return false;
  }
}

// === POOL STATS ===
export function getPoolStats() {
  const p = getPool();
  return {
    totalCount: p.totalCount,
    idleCount: p.idleCount,
    waitingCount: p.waitingCount,
  };
}

// === TRANSACTION HELPER ===
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// === GRACEFUL SHUTDOWN ===
export async function closePool() {
  if (!pool) return;
  try {
    await pool.end();
    console.log('Database pool closed gracefully');
    pool = null;
  } catch (error: any) {
    console.error('Error closing pool:', error.message);
  }
}

// === PROCESS TERMINATION ===
if (typeof process !== 'undefined') {
  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}, closing pool...`);
    await closePool();
    process.exit(0);
  };

  process.on('beforeExit', () => closePool());
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// === DEFAULT EXPORT ===
export default getPool();