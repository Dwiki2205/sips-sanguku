export interface DashboardStats {
  totalBooking: number;
  totalMembership: number;
  pendapatanHariIni: number;
  pendapatanBulanIni: number;
  recentBookings: RecentBooking[];
  expiringMemberships: RecentMembership[];
  bookingStats: BookingStat[];
  bookingTrend: BookingTrend[];
  membershipDistribution: MembershipDistribution[];
  revenueByMonth: RevenueByMonth[];
  averageRating?: number;
}

export interface RecentBooking {
  booking_id: string;
  nama_pelanggan: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  total_biaya: number;
  status: string;
   // Tambahkan properti opsional jika diperlukan
  pelanggan_id?: string;
  nama_lengkap?: string; // alias untuk nama_pelanggan
  metode_pembayaran?: string;
}

export interface RecentMembership {
  membership_id: string;
  nama_pelanggan: string;
  tanggal_daftar: string;
  tier_membership: string;
  status_keaktifan: string;
  expired_date?: string;
}

export interface BookingStat {
  status: string;
  count: number;
  total_revenue: number;
}

export interface BookingTrend {
  month: string;
  bookingCount: number;
}

export interface MembershipDistribution {
  tier_membership: string;
  count: number;
  percentage: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  bookingCount: number;
  avgBookingValue: number;
}