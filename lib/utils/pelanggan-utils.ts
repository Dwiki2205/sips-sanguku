// src/lib/utils/pelanggan-utils.ts
// HAPUS import bcrypt
// import bcrypt from 'bcryptjs'; // DIHAPUS

// === GENERATE PELANGGAN ID === (Format: PLG001, PLG002, dst)
export const generatePelangganId = async (): Promise<string> => {
  try {
    const pool = await import('@/lib/db').then(mod => mod.default);
    
    // Get the last pelanggan_id from database
    const result = await pool.query(
      `SELECT pelanggan_id FROM pelanggan 
       WHERE pelanggan_id LIKE 'PLG%' 
       ORDER BY pelanggan_id DESC 
       LIMIT 1`
    );

    let nextNumber = 1;

    if (result.rows.length > 0) {
      const lastId = result.rows[0].pelanggan_id;
      // Extract number from PLG001 format
      const lastNumber = parseInt(lastId.replace('PLG', '')) || 0;
      nextNumber = lastNumber + 1;
    }

    // Format: PLG + 3 digit number (PLG001, PLG002, ..., PLG999)
    return `PLG${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating pelanggan ID:', error);
    // Fallback: use timestamp based ID
    const timestamp = Date.now().toString().slice(-6);
    return `PLG${timestamp}`.substring(0, 10);
  }
};

// === VALIDASI EMAIL ===
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

// === VALIDASI NO. HP === 
export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\s/g, '');
  // Validasi: hanya angka, panjang 10-15 digit
  const re = /^[0-9]{10,15}$/;
  return re.test(cleaned);
};

// === VALIDASI USERNAME ===
export const validateUsername = (username: string): boolean => {
  // Username: 3-20 karakter, huruf/angka/underscore saja
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};

// === VALIDASI PANJANG TEXT ===
export const validateMaxLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) : text;
};

// === VALIDASI PASSWORD ===
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

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
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// === VALIDASI NAMA LENGKAP ===
export const validateNamaLengkap = (nama: string): boolean => {
  // Nama harus minimal 2 karakter, maksimal 100 karakter
  // Hanya boleh mengandung huruf, spasi, dan karakter khusus nama
  const re = /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF.'-]{2,100}$/;
  return re.test(nama.trim());
};

// === HAPUS FUNGSI HASH & COMPARE PASSWORD ===
// export const hashPassword = async (password: string): Promise<string> => {
//   const salt = await bcrypt.genSalt(12);
//   return bcrypt.hash(password, salt);
// };

// export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
//   return bcrypt.compare(password, hashed);
// };