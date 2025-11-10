// types/booking.ts

// Types untuk Booking
export interface Booking {
  booking_id: string;
  pelanggan_id: string;
  nama_lengkap: string;
  username: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_biaya: number;
  metode_pembayaran: string;
  created_at: string;
  updated_at: string;
}

// Type guard untuk memvalidasi status
export function isValidBookingStatus(status: string): status is Booking['status'] {
  return ['pending', 'confirmed', 'cancelled', 'completed'].includes(status);
}

// Fungsi untuk mentransform data dari API
export function transformBookingData(data: any): Booking {
  return {
    ...data,
    status: isValidBookingStatus(data.status) ? data.status : 'pending'
  };
}

export interface CreateBookingData {
  pelanggan_id: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  total_biaya: number;
  metode_pembayaran: string;
}

export interface UpdateBookingData {
  tanggal_booking?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  status?: string;
  total_biaya?: number;
  metode_pembayaran?: string;
}

// Types untuk komponen booking page
export interface TimeSlot {
  time: string;
  price: string;
  startHour: string;
  booked?: boolean;
}

export interface UserData {
  pengguna_id: string;
  nama: string;
  username: string;
  email: string;
  telepon: string;
  role_name: string;
  permissions: string[];
  tanggal_bergabung: string;
}

export interface MembershipData {
  membership_id: string;
  pelanggan_id: string;
  tier_membership: 'Silver' | 'Gold' | 'Platinum';
  tanggal_daftar: string;
  expired_date: string;
  status_keaktifan: 'active' | 'expired' | 'inactive';
  nama_lengkap?: string;
  email?: string;
  telepon?: string;
}

export interface BookingFormData {
  booking_id: string;
  pelanggan_id: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_biaya: number;
  metode_pembayaran: string;
  use_membership: boolean;
  discount: number;
  membership_id: string | null;
}