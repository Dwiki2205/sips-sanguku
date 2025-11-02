'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateMembershipData } from '@/types/membership';

interface MembershipFormProps {
  onSubmit: (data: CreateMembershipData) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: CreateMembershipData;
}

export default function MembershipForm({ onSubmit, onCancel, loading = false, initialData }: MembershipFormProps) {
  const [formData, setFormData] = useState<CreateMembershipData>({
    pelanggan_id: initialData?.pelanggan_id || '',
    tanggal_daftar: initialData?.tanggal_daftar || '',
    tier_membership: initialData?.tier_membership || 'Silver',
    expired_date: initialData?.expired_date || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Tanggal Daftar"
          name="tanggal_daftar"
          type="date"
          required
          value={formData.tanggal_daftar}
          onChange={handleChange}
        />
        
        <Input
          label="Tanggal Expired"
          name="expired_date"
          type="date"
          required
          value={formData.expired_date}
          onChange={handleChange}
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tier Membership
          </label>
          <select
            name="tier_membership"
            required
            value={formData.tier_membership}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
            <option value="Platinum">Platinum</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {initialData ? 'Update Membership' : 'Buat Membership'}
        </Button>
      </div>
    </form>
  );
}