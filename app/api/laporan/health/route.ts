// app/api/laporan/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection, getPoolStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Laporan Health Check...');

    // Test koneksi database
    const dbHealthy = await checkDatabaseConnection();
    
    // Get pool stats
    const poolStats = getPoolStats();

    // Test query sederhana untuk data laporan
    let testQuery;
    try {
      const { query } = await import('@/lib/db');
      const result = await query(`
        SELECT 
          COUNT(*) as total_booking,
          MAX(tanggal_booking) as latest_booking
        FROM booking 
        WHERE status IN ('confirmed', 'completed', 'paid')
        LIMIT 1
      `);
      testQuery = {
        success: true,
        totalBooking: Number(result.rows[0]?.total_booking) || 0,
        latestBooking: result.rows[0]?.latest_booking
      };
    } catch (error: any) {
      testQuery = { 
        success: false, 
        // PERBAIKAN: Type safety untuk error
        error: error.message 
      };
    }

    const healthStatus = {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      poolStats,
      dataAvailability: testQuery,
      system: {
        nodeEnv: process.env.NODE_ENV,
        autoMigrate: process.env.AUTO_MIGRATE
      }
    };

    console.log('Laporan Health Check Result:', healthStatus);

    return NextResponse.json({
      success: true,
      status: dbHealthy ? 'healthy' : 'degraded',
      data: healthStatus
    });

  } catch (error: any) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      details: error.message
    }, { status: 500 });
  }
}