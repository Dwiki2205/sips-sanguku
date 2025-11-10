// lib/database.ts
import pool from './db';

/**
 * Query wrapper untuk Neon PostgreSQL
 */
export async function query(sql: string, params: any[] = []) {
  console.log('Using Neon PostgreSQL');
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

export default query;