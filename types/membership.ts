// types/membership.ts
export interface Membership {
  membership_id: string;
  pelanggan_id: string;
  nama_lengkap: string;
  tanggal_daftar: string;
  status_keaktifan: 'active' | 'inactive' | 'expired';
  tier_membership: 'Silver' | 'Gold' | 'Platinum';
  expired_date: string;
  email: string;
  telepon: string;
}

// TAMBAHKAN INI!
export interface CreateMembershipData {
  pelanggan_id: string;
  tanggal_daftar: string;
  tier_membership: 'Silver' | 'Gold' | 'Platinum';
  expired_date: string;
}