import { Membership } from '@/types/membership';

interface MembershipCardProps {
  membership: Membership;
  onEdit?: () => void;
  onRenew?: () => void;
  showActions?: boolean;
}

export default function MembershipCard({ 
  membership, 
  onEdit, 
  onRenew, 
  showActions = false 
}: MembershipCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const isExpired = new Date(membership.expired_date) < new Date();

  return (
    <div className={`bg-white rounded-lg border-2 p-6 ${getTierColor(membership.tier_membership)}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{membership.nama_lengkap}</h3>
          <p className="text-sm text-gray-600">{membership.email}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(membership.status_keaktifan)}`}>
            {membership.status_keaktifan === 'active' ? 'Aktif' : 
             membership.status_keaktifan === 'inactive' ? 'Tidak Aktif' : 
             membership.status_keaktifan === 'expired' ? 'Kadaluarsa' : membership.status_keaktifan}
          </span>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(membership.tier_membership)}`}>
              {membership.tier_membership}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Tanggal Daftar</p>
          <p className="font-medium text-gray-900">
            {new Date(membership.tanggal_daftar).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Tanggal Expired</p>
          <p className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
            {new Date(membership.expired_date).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Edit
            </button>
          )}
          {onRenew && isExpired && (
            <button
              onClick={onRenew}
              className="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              Perpanjang
            </button>
          )}
        </div>
      )}
    </div>
  );
}