// components/booking/BookingDetails.tsx
'use client';

import { Booking } from '@/types/booking';

interface Props {
  booking?: Booking | null;
}

export default function BookingDetails({ booking }: Props) {
  return (
    <>
      {booking ? (
        <>
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {booking.nama_lengkap.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{booking.nama_lengkap}</h3>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <table className="w-full">
              <tbody className="text-sm">
                {[
                  ['ID Booking', booking.booking_id],
                  ['ID Pelanggan', booking.pelanggan_id],
                  ['Tanggal Booking', new Date(booking.tanggal_booking).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Jam Mulai', booking.jam_mulai],
                  ['Jam Selesai', booking.jam_selesai],
                  ['Status', <StatusBadge key="s" status={booking.status} />],
                  ['Total Biaya', `Rp ${booking.total_biaya.toLocaleString('id-ID')}`],
                  ['Metode Pembayaran', booking.metode_pembayaran],
                  ['Created at', new Date(booking.created_at).toLocaleString('id-ID')],
                  ['Updated at', new Date(booking.updated_at).toLocaleString('id-ID')],
                ].map(([label, value]) => (
                  <tr key={label as string} className="border-b border-gray-200 last:border-0">
                    <td className="py-3 font-medium text-gray-600 w-44">{label}</td>
                    <td className="py-3 text-gray-800">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-6">
            ?
          </div>
          <p className="text-gray-500 text-lg">Tidak ada data dipilih</p>
          <p className="text-sm text-gray-400 mt-2">
            Klik salah satu booking di daftar untuk melihat detail
          </p>
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${colors}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}