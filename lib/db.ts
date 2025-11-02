import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5, // Reduce connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Reduce timeout
  maxUses: 7500,
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Test connection on startup
pool.on('connect', async (client) => {
  try {
    await client.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');
  } catch (err) {
    console.error('❌ Database connection test failed:', err);
  }
});

export default pool;