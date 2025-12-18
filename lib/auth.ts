// lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Development mode - skip hashing for easier testing
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.warn('WARNING: Password hashing disabled in development mode!');
}

export async function hashPassword(password: string): Promise<string> {
  if (isDevelopment) {
    // Return plain password for development
    return password;
  }
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (isDevelopment) {
    // Simple comparison for development
    return password === hashedPassword;
  }
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret-key', { 
    expiresIn: '24h',
    algorithm: 'HS256' 
  });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

export async function removeAuthCookie() {
  try {
    const cookieStore = await cookies();
    
    // Hapus token cookie
    cookieStore.delete('token');
    
    // Juga hapus user cookie jika ada
    cookieStore.delete('user');
    
    console.log('✅ Auth cookies cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing auth cookies:', error);
    throw error;
  }
}

export function getAuthToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('token')?.value || null;
}