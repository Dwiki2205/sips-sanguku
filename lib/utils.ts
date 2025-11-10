// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bcrypt from 'bcryptjs';

// === UI UTILS ===
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// === TIPE VALIDASI ===
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

// === VALIDASI EMAIL ===
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

// === VALIDASI NO. HP ===
export const validatePhone = (phone: string): boolean => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

// === GENERATE USER ID ===
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// === VALIDASI PASSWORD (KUAT) ===
export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password tidak boleh kosong');
  } else {
    if (password.length < 8) {
      errors.push('Minimal 8 karakter');
    }
    if (password.length > 72) {
      errors.push('Maksimal 72 karakter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Harus ada 1 huruf besar');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Harus ada 1 huruf kecil');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Harus ada 1 angka');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Harus ada 1 simbol (!@#$%^&*)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// === HASH & COMPARE PASSWORD ===
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12); // 12 rounds = aman
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(password, hashed);
};