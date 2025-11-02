'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Membership } from '@/types/membership';
import { useAuth } from '@/context/AuthContext';

interface MembershipListProps {
  onEdit?: (membership: Membership) => void;
  onDelete?: (membershipId: string) => void;
  showActions?: boolean;
}

export default function MembershipList({ onEdit, onDelete, showActions = true }: MembershipListProps) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const url = user?.role_name === 'Pelanggan' 
        ? `/api/membership?role=pelanggan&pelanggan_id=${user.pengguna_id}`
        : '/api/membership';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setMemberships(result.data);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

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
        return 'bg-purple-100 text-purple-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Silver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Membership</TableHead>
            <TableHead>Nama Pelanggan</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Tanggal Daftar</TableHead>
            <TableHead>Tanggal Expired</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships.map((membership) => (
            <TableRow key={membership.membership_id}>
              <TableCell className="font-medium">{membership.membership_id}</TableCell>
              <TableCell>{membership.nama_lengkap}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(membership.tier_membership)}`}>
                  {membership.tier_membership}
                </span>
              </TableCell>
              <TableCell>
                {new Date(membership.tanggal_daftar).toLocaleDateString('id-ID')}
              </TableCell>
              <TableCell>
                {new Date(membership.expired_date).toLocaleDateString('id-ID')}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(membership.status_keaktifan)}`}>
                  {membership.status_keaktifan === 'active' ? 'Aktif' : 
                   membership.status_keaktifan === 'inactive' ? 'Tidak Aktif' : 
                   membership.status_keaktifan === 'expired' ? 'Kadaluarsa' : membership.status_keaktifan}
                </span>
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex space-x-2">
                    {user?.role_name === 'Owner' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit?.(membership)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete?.(membership.membership_id)}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {memberships.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Tidak ada data membership
        </div>
      )}
    </div>
  );
}