// components/dashboard/RecentBookingsTable.tsx
import { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RecentBookingsTableProps {
  bookings: any[];
}

export default function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCsvData(bookings.map(b => ({
      ID: b.booking_id,
      Nama: b.nama_lengkap,
      Tanggal: b.tanggal_booking,
      Status: b.status,
      Biaya: b.total_biaya
    })));
  }, [bookings]);

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex justify-between items-center">
        <h3 className="text-lg font-semibold">Booking Terbaru</h3>
        <CSVLink data={csvData} filename="recent-bookings.csv">
          <button className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-50 transition">Export CSV</button>
        </CSVLink>
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
            {paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  Tidak ada data booking terbaru
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => (
                <tr key={b.booking_id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-blue-600">#{b.booking_id}</td>
                  <td className="px-6 py-4">{b.nama_lengkap}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(b.tanggal_booking).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">Rp {b.total_biaya.toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center text-sm text-gray-600">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span>Halaman {currentPage} dari {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}