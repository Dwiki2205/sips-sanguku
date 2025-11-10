// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bcrypt from 'bcryptjs'; // gunakan bcryptjs (bisa di client & server)

// === UTILS UI ===
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// === UTILS AUTENTIKASI ===
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(String(phone).trim());
};

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};