// components/dashboard/RecentBookingsTable.tsx
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RecentBookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalData: 0
  });

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/dashboard/recent-bookings?page=${page}&limit=${limit}`);
      const json = await res.json();

      if (json.success) {
        setBookings(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("Fetch recent bookings failed:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex justify-between items-center">
        <h3 className="text-lg font-semibold">Booking Terbaru</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Nama</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Tanggal</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Biaya</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  Tidak ada data booking
                </td>
              </tr>
            ) : (
              bookings.map((b: any) => (
                <tr key={b.booking_id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-blue-600">#{b.booking_id}</td>
                  <td className="px-6 py-4">{b.nama_lengkap}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(b.tanggal_booking).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        b.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : b.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : b.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    Rp {b.total_biaya.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="px-6 py-4 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-1 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <span>
          Halaman {page} dari {pagination.totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          disabled={page === pagination.totalPages}
          className="flex items-center gap-1 disabled:opacity-50"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
