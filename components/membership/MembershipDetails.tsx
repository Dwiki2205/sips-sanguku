'use client';

import { Membership } from '@/types/membership';

interface Props {
  membership?: Membership | null;
}

// === KOMPONEN UTAMA ===
export default function MembershipDetails({ membership }: Props) {
  if (!membership) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-6">
          ?
        </div>
        <p className="text-gray-500 text-lg">Tidak ada data dipilih</p>
        <p className="text-sm text-gray-400 mt-2">
          Klik salah satu membership di daftar untuk melihat detail
        </p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* HEADER: Avatar + Nama + Email */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {getInitials(membership.nama_lengkap)}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{membership.nama_lengkap}</h3>
          <p className="text-sm text-gray-600">{membership.email || '—'}</p>
          {membership.telepon && (
            <p className="text-xs text-gray-500 mt-1">📞 {membership.telepon}</p>
          )}
        </div>
      </div>

      {/* TABEL DETAIL */}
      <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
        <table className="w-full text-sm">
          <tbody>
            {[
              ['ID Membership', `#${membership.membership_id}`],
              ['ID Pelanggan', membership.pelanggan_id],
              ['Tanggal Daftar', formatDate(membership.tanggal_daftar)],
              ['Status Keaktifan', <StatusBadge key="status" status={membership.status_keaktifan} />],
              ['Tier Membership', <TierBadge key="tier" tier={membership.tier_membership} />],
              ['Expired Date', formatDate(membership.expired_date)],
            ].map(([label, value]) => (
              <tr key={label as string} className="border-b border-gray-200 last:border-0">
                <td className="py-3 font-medium text-gray-600 w-44 align-top">{label}</td>
                <td className="py-3 text-gray-800">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// === BADGE: Status Keaktifan ===
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    active: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
    expired: { label: 'Kadaluarsa', color: 'bg-yellow-100 text-yellow-700' },
    inactive: { label: 'Tidak Aktif', color: 'bg-red-100 text-red-700' },
  };

  const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${color}`}>
      {label}
    </span>
  );
}

// === BADGE: Tier Membership ===
function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, { color: string }> = {
    Platinum: { color: 'bg-purple-100 text-purple-700' },
    Gold: { color: 'bg-yellow-100 text-yellow-700' },
    Silver: { color: 'bg-gray-100 text-gray-700' },
  };

  const { color } = config[tier] || { color: 'bg-blue-100 text-blue-700' };

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${color}`}>
      {tier}
    </span>
  );
}