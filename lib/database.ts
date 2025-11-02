// lib/database.ts
import pool from './db';

let devDB: any = null;

async function getDevDB() {
  if (!devDB && process.env.NODE_ENV === 'development') {
    try {
      const module = await import('./db-dev');
      devDB = module.devDB;
    } catch (error) {
      console.error('Gagal load devDB:', error);
    }
  }
  return devDB;
}

export async function query(sql: string, params: any[] = []) {
  try {
    const client = await pool.connect();
    try {
      console.log('Using PostgreSQL (Neon.tech)');
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  } catch (error) {
    console.log('PostgreSQL gagal, fallback ke SQLite...');
    if (process.env.NODE_ENV === 'development') {
      const db = await getDevDB();
      if (db) return db.query(sql, params);
    }
    throw new Error('Database tidak tersedia');
  }
}

export default query;