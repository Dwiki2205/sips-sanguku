'use client';

import BookingList from '@/components/booking/BookingList';

export default function PegawaiBookingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Data Booking</h1>
      </div>

      <BookingList showActions={false} />
    </div>
  );
}