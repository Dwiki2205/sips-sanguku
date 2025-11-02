'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import MembershipList from '@/components/membership/MembershipList';
import MembershipForm from '@/components/membership/MembershipForm';
import { CreateMembershipData } from '@/types/membership';

export default function PelangganMembershipPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateMembership = async (data: CreateMembershipData) => {
    if (!user) return;

    setLoading(true);
    try {
      const membershipData = {
        ...data,
        pelanggan_id: user.pengguna_id
      };

      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(membershipData),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error creating membership:', error);
      alert('Terjadi kesalahan saat membuat membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Membership Saya</h1>
        <Button onClick={() => setShowForm(true)}>
          Daftar Membership
        </Button>
      </div>

      {showForm && (
        <MembershipForm
          onSubmit={handleCreateMembership}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      <MembershipList showActions={false} />
    </div>
  );
}