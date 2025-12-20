// lib/membership.ts
import { Membership } from '@/types/membership';

// Helper untuk menghitung status berdasarkan tanggal kadaluwarsa
export function calculateMembershipStatus(expiredDate: string): 'active' | 'inactive' | 'expired' {
  const today = new Date();
  const expired = new Date(expiredDate);
  
  // Reset waktu untuk perbandingan tanggal saja
  today.setHours(0, 0, 0, 0);
  expired.setHours(0, 0, 0, 0);
  
  if (expired < today) {
    return 'expired';
  }
  
  // Cek jika expired dalam 7 hari ke depan (peringatan akan kadaluwarsa)
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);
  sevenDaysFromNow.setHours(0, 0, 0, 0);
  
  if (expired <= sevenDaysFromNow) {
    return 'active'; // Masih aktif, tapi akan segera kadaluwarsa
  }
  
  return 'active';
}

// Update transform function untuk menghitung status secara real-time
export function transformMembershipData(row: any): Membership {
  // Hitung status berdasarkan expired_date saat ini
  const calculatedStatus = calculateMembershipStatus(row.expired_date);
  
  return {
    membership_id: row.membership_id,
    pelanggan_id: row.pelanggan_id,
    nama_lengkap: row.nama_lengkap,
    tanggal_daftar: row.tanggal_daftar,
    // Prioritasi status yang dihitung, fallback ke status dari database
    status_keaktifan: calculatedStatus || row.status_keaktifan,
    tier_membership: row.tier_membership,
    expired_date: row.expired_date,
    email: row.email,
    telepon: row.telepon,
  };
}

export function isValidMembershipTier(tier: string): tier is 'Silver' | 'Gold' | 'Platinum' {
  return ['Silver', 'Gold', 'Platinum'].includes(tier);
}