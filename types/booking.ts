export interface Booking {
  booking_id: string;
  pelanggan_id: string;
  nama_lengkap: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_biaya: number;
  metode_pembayaran: string;
  created_at: string;
  updated_at: string;
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