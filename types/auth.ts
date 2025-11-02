export interface User {
  pengguna_id: string;
  nama: string;
  username: string;
  email: string;
  telepon: string;
  role_id: string;
  role_name: string;
  permissions: string[];
  tanggal_bergabung: string;
}

export interface Pelanggan {
  pelanggan_id: string;
  nama_lengkap: string;
  username: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggal_registrasi: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}