import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await removeAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Terjadi kesalahan server' 
      },
      { status: 500 }
    );
  }
}