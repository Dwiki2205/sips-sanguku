// types/database.ts
export interface QueryResult {
  rows: any[];
  rowCount?: number;
}

export interface UserRow {
  pengguna_id?: string;
  pelanggan_id?: string;
  nama?: string;
  nama_lengkap?: string;
  username: string;
  password: string;
  email?: string;
  telepon?: string;
  role_id?: string;
  role_name?: string;
  permissions?: string | any[];
  alamat?: string;
  tanggal_bergabung?: string;
  tanggal_registrasi?: string;
  role?: string;
}

export interface AuthUser {
  pengguna_id: string;
  nama: string;
  username: string;
  email?: string;
  telepon?: string;
  role_name: string;
  permissions?: any[];
  alamat?: string;
  tanggal_bergabung?: string;
}

export interface BookingRow {
  booking_id: string;
  pelanggan_id: string;
  nama_lengkap: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  total_biaya: number;
  metode_pembayaran: string;
  created_at: string;
  updated_at: string;
  email?: string;
  telepon?: string;
  alamat?: string;
}

export interface MembershipRow {
  membership_id: string;
  pelanggan_id: string;
  nama_lengkap: string;
  tanggal_daftar: string;
  status_keaktifan: string;
  tier_membership: string;
  expired_date: string;
  email?: string;
  telepon?: string;
}