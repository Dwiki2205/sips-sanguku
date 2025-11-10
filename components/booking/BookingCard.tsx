// components/booking/BookingCard.tsx
'use client';

import { Booking } from '@/types/booking';

interface Props {
  booking: Booking;
  isSelected: boolean;
  onClick: () => void;
}

export default function BookingCard({ booking, isSelected, onClick }: Props) {
  const nama = booking.nama_lengkap || 'Tanpa Nama';
  const inisial = nama
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

  const status = {
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
  }[booking.status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: booking.status };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer
                 ${isSelected 
                   ? 'border-blue-500 bg-blue-50 shadow-lg' 
                   : 'border-gray-200 hover:border-blue-300 hover:shadow'
                 }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {inisial}
          </div>
          <div>
            <p className="font-bold text-gray-800">#{booking.booking_id}</p>
            <p className="text-xs text-gray-500">
              {new Date(booking.tanggal_booking).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
}