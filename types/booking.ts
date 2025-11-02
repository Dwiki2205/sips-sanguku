// types/booking.ts
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