'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CreateBookingData } from '@/types/booking';

interface BookingFormProps {
  onSubmit: (data: CreateBookingData) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: CreateBookingData;
}

export default function BookingForm({ onSubmit, onCancel, loading = false, initialData }: BookingFormProps) {
  const [formData, setFormData] = useState<CreateBookingData>({
    pelanggan_id: initialData?.pelanggan_id || '',
    tanggal_booking: initialData?.tanggal_booking || '',
    jam_mulai: initialData?.jam_mulai || '',
    jam_selesai: initialData?.jam_selesai || '',
    total_biaya: initialData?.total_biaya || 0,
    metode_pembayaran: initialData?.metode_pembayaran || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_biaya' ? Number(value) : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Tanggal Booking"
          name="tanggal_booking"
          type="date"
          required
          value={formData.tanggal_booking}
          onChange={handleChange}
        />
        
        <Input
          label="Jam Mulai"
          name="jam_mulai"
          type="time"
          required
          value={formData.jam_mulai}
          onChange={handleChange}
        />
        
        <Input
          label="Jam Selesai"
          name="jam_selesai"
          type="time"
          required
          value={formData.jam_selesai}
          onChange={handleChange}
        />
        
        <Input
          label="Total Biaya"
          name="total_biaya"
          type="number"
          required
          value={formData.total_biaya}
          onChange={handleChange}
        />
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metode Pembayaran
          </label>
          <select
            name="metode_pembayaran"
            required
            value={formData.metode_pembayaran}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Pilih Metode</option>
            <option value="Cash">Cash</option>
            <option value="QRIS">QRIS</option>
            <option value="Transfer">Transfer Bank</option>
            <option value="Debit">Kartu Debit</option>
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
          {initialData ? 'Update Booking' : 'Buat Booking'}
        </Button>
      </div>
    </form>
  );
}