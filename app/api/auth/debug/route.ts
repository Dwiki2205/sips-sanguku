// app/api/auth/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  try {
    if (username) {
      // Cek user di kedua tabel
      const pengguna = await pool.query(
        'SELECT pengguna_id, username, password FROM pengguna WHERE username = $1',
        [username]
      );
      
      const pelanggan = await pool.query(
        'SELECT pelanggan_id, username, password FROM pelanggan WHERE username = $1',
        [username]
      );
      
      return NextResponse.json({
        pengguna: pengguna.rows[0] || 'Not found',
        pelanggan: pelanggan.rows[0] || 'Not found',
        environment: process.env.NODE_ENV
      });
    }
    
    // List semua user
    const allPengguna = await pool.query(
      'SELECT pengguna_id, username FROM pengguna LIMIT 10'
    );
    const allPelanggan = await pool.query(
      'SELECT pelanggan_id, username FROM pelanggan LIMIT 10'
    );
    
    return NextResponse.json({
      pengguna: allPengguna.rows,
      pelanggan: allPelanggan.rows,
      total: allPengguna.rows.length + allPelanggan.rows.length
    });
    
  } catch (error) {
    // PERBAIKAN: Handle error dengan type safety
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('Debug endpoint error:', errorMessage);
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}