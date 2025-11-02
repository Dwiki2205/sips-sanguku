// components/membership/MembershipDetails.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Membership, isValidMembershipStatus } from '@/types/membership';

interface MembershipDetailsProps {
  membership: Membership;
  onStatusUpdate: (membershipId: string, newStatus: string) => void;
}

export default function MembershipDetails({ membership, onStatusUpdate }: MembershipDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    // Validasi status
    if (!isValidMembershipStatus(newStatus)) {
      alert('Status tidak valid');
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(membership.membership_id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-100 text-purple-800 border border-purple-300';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Silver':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detail Membership</h2>
            <p className="text-gray-500 mt-1">Informasi lengkap membership pelanggan</p>
          </div>
          <div className="flex space-x-2">
            {membership.status_keaktifan === 'active' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('inactive')}
                loading={loading}
              >
                Nonaktifkan
              </Button>
            )}
            {membership.status_keaktifan === 'inactive' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('active')}
                loading={loading}
              >
                Aktifkan
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Batal Edit' : 'Edit'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Customer Info Header */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drilla Diah Mawami
          </h3>
          <div className="flex space-x-4 text-sm text-gray-600">
            <span>📱 {membership.telepon}</span>
            <span>✉️ {membership.email}</span>
          </div>
        </div>

        {/* Membership Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Membership</label>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getTierColor(membership.tier_membership)}`}>
                  {membership.tier_membership}
                </span>
                <span className="text-sm text-gray-600">Tier</span>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Program</label>
              <p className="text-sm text-gray-900">-</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Tanggal Daftar</label>
              <p className="text-sm text-gray-900 font-medium">
                {new Date(membership.tanggal_daftar).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Status Membership</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(membership.status_keaktifan)}`}>
                {membership.status_keaktifan === 'active' ? 'Aktif' : 
                 membership.status_keaktifan === 'inactive' ? 'Tidak Aktif' : 
                 membership.status_keaktifan === 'expired' ? 'Kadaluarsa' : membership.status_keaktifan}
              </span>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Tier Membership</label>
              <p className="text-sm text-gray-900 font-medium">{membership.tier_membership}</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Expired Date</label>
              <p className={`text-sm font-medium ${
                new Date(membership.expired_date) < new Date() 
                  ? 'text-red-600' 
                  : 'text-gray-900'
              }`}>
                {new Date(membership.expired_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700">USB</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700">English</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700">News</span>
            </label>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between border-t border-gray-200 pt-6">
          <Button variant="outline" className="px-6">
            Previous
          </Button>
          <Button variant="outline" className="px-6">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}