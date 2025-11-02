export interface DashboardStats {
  totalBooking: number;
  totalMembership: number;
  pendapatanHariIni: number;
  pendapatanBulanIni: number;
}

export interface RecentBooking {
  booking_id: string;
  nama_pelanggan: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  total_biaya: number;
  status: string;
}

export interface RecentMembership {
  membership_id: string;
  nama_pelanggan: string;
  tanggal_daftar: string;
  tier_membership: string;
  status_keaktifan: string;
}