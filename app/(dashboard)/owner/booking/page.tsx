'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import BookingList from '@/components/booking/BookingList';
import BookingForm from '@/components/booking/BookingForm';
import { Booking, CreateBookingData } from '@/types/booking';

export default function OwnerBookingPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateBooking = async (data: CreateBookingData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/booking', {
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
        alert(result.error || 'Gagal membuat booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Terjadi kesalahan saat membuat booking');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleUpdateBooking = async (data: CreateBookingData) => {
    if (!editingBooking) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/booking/${editingBooking.booking_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setShowForm(false);
        setEditingBooking(null);
        router.refresh();
      } else {
        alert(result.error || 'Gagal mengupdate booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Terjadi kesalahan saat mengupdate booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus booking ini?')) return;

    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Gagal menghapus booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Terjadi kesalahan saat menghapus booking');
    }
  };

  const handleFormSubmit = editingBooking ? handleUpdateBooking : handleCreateBooking;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Booking</h1>
        <Button onClick={() => setShowForm(true)}>
          Tambah Booking
        </Button>
      </div>

      {showForm && (
        <BookingForm
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBooking(null);
          }}
          loading={loading}
          initialData={editingBooking || undefined}
        />
      )}

      <BookingList
        onEdit={handleEditBooking}
        onDelete={handleDeleteBooking}
        showActions={true}
      />
    </div>
  );
}