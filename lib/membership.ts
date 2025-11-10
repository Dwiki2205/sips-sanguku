// lib/membership.ts
import { Membership } from '@/types/membership';

export function transformMembershipData(row: any): Membership {
  return {
    membership_id: row.membership_id,
    pelanggan_id: row.pelanggan_id,
    nama_lengkap: row.nama_lengkap,
    tanggal_daftar: row.tanggal_daftar,
    status_keaktifan: row.status_keaktifan,
    tier_membership: row.tier_membership,
    expired_date: row.expired_date,
    email: row.email,
    telepon: row.telepon,
  };
}

export function isValidMembershipTier(tier: string): tier is 'Silver' | 'Gold' | 'Platinum' {
  return ['Silver', 'Gold', 'Platinum'].includes(tier);
}