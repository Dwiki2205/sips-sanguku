// lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

export async function hashPassword(password: string): Promise<string> {
  if (!isProduction) {
    console.warn('DEV MODE: Password tidak di-hash');
    return password;
  }
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  if (!isProduction) return plain === hashed;
  return await bcrypt.compare(plain, hashed);
}

export function generateToken(payload: any): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET tidak diset di environment!');
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  try {
    const secret = process.env.JWT_SECRET || 'fallback';
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

// Set cookie via header (bukan next/headers)
export function getAuthCookieHeader(token: string): string {
  return `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; ${
    isProduction ? 'Secure;' : ''
  }`;
}

export function getLogoutCookieHeader(): string {
  return 'token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;';
}