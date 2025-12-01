// components/dashboard/BookingStatsTable.tsx
import { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';

interface BookingStatsTableProps {
  stats: { status: string; count: number }[];
}

export default function BookingStatsTable({ stats }: BookingStatsTableProps) {
  const [csvData, setCsvData] = useState<any[]>([]);

  useEffect(() => {
    setCsvData(stats.map(s => ({
      Status: s.status,
      Jumlah: s.count
    })));
  }, [stats]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white flex justify-between items-center">
        <h3 className="text-lg font-semibold">Statistik Booking Bulan Ini</h3>
        <CSVLink data={csvData} filename="booking-stats.csv">
          <button className="bg-white text-green-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-50 transition">Export CSV</button>
        </CSVLink>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500 italic">
                  Tidak ada statistik booking
                </td>
              </tr>
            ) : (
              stats.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 capitalize font-medium">{s.status}</td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">{s.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}