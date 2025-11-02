'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import BookingList from '@/components/booking/BookingList';
import BookingForm from '@/components/booking/BookingForm';
import { CreateBookingData } from '@/types/booking';

export default function PelangganBookingPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleCreateBooking = async (data: CreateBookingData) => {
    if (!user) return;

    setLoading(true);
    try {
      const bookingData = {
        ...data,
        pelanggan_id: user.pengguna_id
      };

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Terjadi kesalahan saat membuat booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Booking Saya</h1>
        <Button onClick={() => setShowForm(true)}>
          Buat Booking Baru
        </Button>
      </div>

      {showForm && (
        <BookingForm
          onSubmit={handleCreateBooking}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      <BookingList showActions={false} />
    </div>
  );
}