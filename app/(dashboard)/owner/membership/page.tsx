'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import MembershipList from '@/components/membership/MembershipList';
import MembershipForm from '@/components/membership/MembershipForm';
import { Membership, CreateMembershipData } from '@/types/membership';

export default function OwnerMembershipPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateMembership = async (data: CreateMembershipData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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

  const handleEditMembership = (membership: Membership) => {
    setEditingMembership(membership);
    setShowForm(true);
  };

  const handleUpdateMembership = async (data: CreateMembershipData) => {
    if (!editingMembership) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/membership/${editingMembership.membership_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingMembership(null);
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Terjadi kesalahan saat mengupdate membership');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMembership = async (membershipId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus membership ini?')) return;

    try {
      const response = await fetch(`/api/membership/${membershipId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error deleting membership:', error);
      alert('Terjadi kesalahan saat menghapus membership');
    }
  };

  const handleFormSubmit = editingMembership ? handleUpdateMembership : handleCreateMembership;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Membership</h1>
        <Button onClick={() => setShowForm(true)}>
          Tambah Membership
        </Button>
      </div>

      {showForm && (
        <MembershipForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMembership(null);
          }}
          loading={loading}
          initialData={editingMembership || undefined}
        />
      )}

      <MembershipList
        onEdit={handleEditMembership}
        onDelete={handleDeleteMembership}
        showActions={true}
      />
    </div>
  );
}