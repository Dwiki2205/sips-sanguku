import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    console.log('🔄 Processing logout request...');
    
    // Hapus cookie menggunakan fungsi yang sudah ada
    await removeAuthCookie();

    // Buat response success
    const response = NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });

    // Juga clear cookies dari response header untuk memastikan
    response.cookies.set({
      name: 'token',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    response.cookies.set({
      name: 'user', 
      value: '',
      expires: new Date(0),
      path: '/',
    });

    console.log('✅ Logout API completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Logout error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    );
  }
}