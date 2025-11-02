import pool from './db';
import { devDB } from './db-dev';

// Check if we can connect to PostgreSQL
async function checkPostgreSQLConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL connection failed, using SQLite fallback');
    return false;
  }
}

// Main database helper dengan fallback
export async function query(sql: string, params: any[] = []) {
  const isPostgreSQLAvailable = await checkPostgreSQLConnection();
  
  if (isPostgreSQLAvailable) {
    try {
      console.log('✅ Using PostgreSQL');
      return await pool.query(sql, params);
    } catch (error) {
      console.log('❌ PostgreSQL query failed, falling back to SQLite');
      return devDB.query(sql, params);
    }
  } else {
    return devDB.query(sql, params);
  }
}

export default query;