// FILE: app/api/offline/status/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // ✅ MIDDLEWARE sudah handle authentication, 
    // jadi kita bisa langsung lanjut ke business logic

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${apiUrl}/stok?page=1&limit=1`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const isOnline = response.ok;

      return NextResponse.json({
        success: true,
        online: isOnline,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return NextResponse.json({
        success: true,
        online: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }

  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      },
      { status: 500 }
    );
  }
}