// lib/database.ts
import pool from './db';

export async function query(sql: string, params: any[] = []) {
  let client;
  try {
    client = await pool.connect();
    console.log('📊 Executing query:', sql.substring(0, 50) + '...');
    const startTime = Date.now();
    const result = await client.query(sql, params);
    const duration = Date.now() - startTime;
    console.log(`✅ Query completed in ${duration}ms`);
    return result;
  } catch (error: any) {
    console.error('❌ Query failed:', error.message);
    console.error('   SQL:', sql.substring(0, 100));
    console.error('   Params:', params);
    throw new Error(`Database error: ${error.message}`);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export default query;