import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pelanggan_id = searchParams.get('pelanggan_id');

    if (!pelanggan_id) {
      return NextResponse.json({ error: 'pelanggan_id is required' }, { status: 400 });
    }

    console.log('Fetching booking count for:', pelanggan_id);

    // Query untuk menghitung booking yang confirmed/sukses
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM booking 
       WHERE pelanggan_id = $1 
       AND status = 'confirmed'`,
      [pelanggan_id]
    );

    const count = parseInt(result.rows[0]?.count || '0');
    
    console.log('Booking count result:', { pelanggan_id, count });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error('Error fetching booking count:', error);
    // Return default 0 daripada error
    return NextResponse.json({ count: 0 });
  }
}