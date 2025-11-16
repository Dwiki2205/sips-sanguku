// FILE: app/api/offline/clear/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Middleware sudah memastikan user terautentikasi (ada token)
    // Kita hanya perlu log aksi ini
    console.log('🗑️ Offline data clear requested');

    return NextResponse.json({
      success: true,
      message: 'Offline data cleared successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Clear error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Clear failed'
      },
      { status: 500 }
    );
  }
}