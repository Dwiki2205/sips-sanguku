// app/owner/membership/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import MembershipSearch from '@/components/membership/MembershipSearch';
import MembershipDetails from '@/components/membership/MembershipDetails';
import { Membership, transformMembershipData, isValidMembershipStatus } from '@/types/membership';

export default function OwnerMembershipPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMemberships();
  }, []);

  useEffect(() => {
    filterMemberships();
  }, [searchTerm, memberships]);

  const fetchMemberships = async () => {
    try {
      const response = await fetch('/api/membership');
      const result = await response.json();
      
      if (result.success) {
        // TRANSFORM DATA dari API ke tipe yang valid
        const transformedMemberships = result.data.map((item: any) => transformMembershipData(item));
        setMemberships(transformedMemberships);
        setFilteredMemberships(transformedMemberships);
        // Auto-select first membership if available
        if (transformedMemberships.length > 0) {
          setSelectedMembership(transformedMemberships[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMemberships = () => {
    if (!searchTerm.trim()) {
      setFilteredMemberships(memberships);
      return;
    }

    const filtered = memberships.filter(membership =>
      membership.membership_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membership.tier_membership.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMemberships(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleMembershipSelect = (membership: Membership) => {
    setSelectedMembership(membership);
  };

  const handleStatusUpdate = async (membershipId: string, newStatus: string) => {
    // VALIDASI status sebelum mengirim ke API
    if (!isValidMembershipStatus(newStatus)) {
      alert('Status tidak valid');
      return;
    }

    try {
      const response = await fetch(`/api/membership/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status_keaktifan: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state dengan transformasi
        const updatedMemberships = memberships.map(membership =>
          membership.membership_id === membershipId 
            ? transformMembershipData({ ...membership, status_keaktifan: newStatus })
            : membership
        );
        setMemberships(updatedMemberships);
        
        if (selectedMembership?.membership_id === membershipId) {
          setSelectedMembership(transformMembershipData({ ...selectedMembership, status_keaktifan: newStatus }));
        }
        
        router.refresh();
      } else {
        alert(result.error || 'Gagal mengupdate status');
      }
    } catch (error) {
      console.error('Error updating membership status:', error);
      alert('Terjadi kesalahan saat mengupdate status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Membership</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push('/owner/membership/new')}>
            Buat Membership Baru
          </Button>
          <Button onClick={() => router.push('/owner/booking')}>
            Booking
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <MembershipSearch onSearch={handleSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Membership List */}
        <div className="lg:col-span-1">
          {/* Membership List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Data Membership</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredMemberships.map((membership) => (
                <div
                  key={membership.membership_id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMembership?.membership_id === membership.membership_id 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : ''
                  }`}
                  onClick={() => handleMembershipSelect(membership)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{membership.membership_id}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(membership.tanggal_daftar).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      membership.tier_membership === 'Gold' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                        : membership.tier_membership === 'Platinum'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {membership.tier_membership}
                    </span>
                  </div>
                  
                  {/* Status indicator */}
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      membership.status_keaktifan === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : membership.status_keaktifan === 'expired'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {membership.status_keaktifan === 'active' ? 'Aktif' : 
                       membership.status_keaktifan === 'expired' ? 'Kadaluarsa' : 
                       'Tidak Aktif'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(membership.expired_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredMemberships.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Data</h3>
                  <p className="text-gray-500">Tidak ada data membership yang ditemukan</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Membership Details */}
        <div className="lg:col-span-2">
          {selectedMembership ? (
            <MembershipDetails 
              membership={selectedMembership}
              onStatusUpdate={handleStatusUpdate}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Membership</h3>
              <p className="text-gray-500">Pilih membership dari daftar di sebelah kiri untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}