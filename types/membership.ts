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
  alamat?: string;
}

export interface CreateMembershipData {
  pelanggan_id: string;
  tanggal_daftar: string;
  tier_membership: string;
  expired_date: string;
}

// Type guard untuk validasi
export function isValidMembershipStatus(status: string): status is Membership['status_keaktifan'] {
  return ['active', 'inactive', 'expired'].includes(status);
}

export function isValidMembershipTier(tier: string): tier is Membership['tier_membership'] {
  return ['Silver', 'Gold', 'Platinum'].includes(tier);
}

export function transformMembershipData(data: any): Membership {
  return {
    ...data,
    status_keaktifan: isValidMembershipStatus(data.status_keaktifan) ? data.status_keaktifan : 'active',
    tier_membership: isValidMembershipTier(data.tier_membership) ? data.tier_membership : 'Silver'
  };
}