// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { getLogoutCookieHeader } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.headers.set('Set-Cookie', getLogoutCookieHeader());
  return response;
}