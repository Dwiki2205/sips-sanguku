// lib/db.ts
import { Pool } from 'pg';

// Singleton pattern untuk mencegah multiple instances
let pool: Pool | null = null;
let connectionTested = false;

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL tidak ditemukan di environment');
    process.exit(1);
  }

  console.log('🔗 Creating Neon PostgreSQL pool...');

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Event listeners
  pool.on('connect', () => {
    console.log('✅ Database connection established');
  });

  pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);
  });

  // Test koneksi hanya sekali saat startup
  if (!connectionTested && process.env.NODE_ENV === 'development') {
    testConnection();
  }

  return pool;
}

async function testConnection() {
  const testPool = getPool();
  let client;
  
  try {
    console.log('🔄 Testing database connection...');
    connectionTested = true;
    client = await testPool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('🚀 Neon PostgreSQL Connected Successfully!');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version.split(',')[0]);
  } catch (error: any) {
    console.error('💥 Database connection test FAILED:', error.message);
    // Jangan exit process, biarkan aplikasi tetap jalan
    console.error('   Application continues with potential database issues...');
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Export singleton instance
export default getPool();