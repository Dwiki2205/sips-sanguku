// components/booking/BookingDetails.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Booking } from '@/types/booking';

interface BookingDetailsProps {
  booking: Booking;
  onStatusUpdate: (bookingId: string, newStatus: string) => void;
}

export default function BookingDetails({ booking, onStatusUpdate }: BookingDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await onStatusUpdate(booking.booking_id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Details Data Booking</h2>
            <p className="text-gray-500 mt-1">Informasi lengkap booking</p>
          </div>
          <div className="flex space-x-2">
            {booking.status === 'pending' && (
              <Button
                size="sm"
                onClick={() => handleStatusChange('confirmed')}
                loading={loading}
              >
                Konfirmasi
              </Button>
            )}
            {booking.status === 'confirmed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('cancelled')}
                loading={loading}
              >
                Batalkan
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
        {/* Customer Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Drilla Diah Mawami
          </h3>
        </div>

        {/* Booking Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Speaking</label>
              <p className="mt-1 text-sm text-gray-900">-</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Paintingspan</label>
              <p className="mt-1 text-sm text-gray-900">-</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Tangoja Booking</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(booking.tanggal_booking).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Jam Mulai</label>
              <p className="mt-1 text-sm text-gray-900">{booking.jam_mulai}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Jam Selesai</label>
              <p className="mt-1 text-sm text-gray-900">{booking.jam_selesai}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {booking.status === 'confirmed' ? 'Dikonfirmasi' : 
                 booking.status === 'pending' ? 'Menunggu' : 
                 booking.status === 'cancelled' ? 'Dibatalkan' : booking.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Total Biaya</label>
              <p className="mt-1 text-sm text-gray-900">
                Rp {booking.total_biaya.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Metode Pembayaran</label>
              <p className="mt-1 text-sm text-gray-900">{booking.metode_pembayaran}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(booking.created_at).toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(booking.updated_at).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline">
            Previous
          </Button>
          <Button variant="outline">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}