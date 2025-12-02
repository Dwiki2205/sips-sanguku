// components/dashboard/ExpiringMembershipsTable.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpiringMembershipsTableProps {
  memberships: any[];
}

export default function ExpiringMembershipsTable({ memberships }: ExpiringMembershipsTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  // Sort memberships by expired_date ascending (soonest expiring first)
  const sortedMemberships = [...memberships].sort((a, b) => 
    new Date(a.expired_date).getTime() - new Date(b.expired_date).getTime()
  );

  const totalPages = Math.ceil(sortedMemberships.length / itemsPerPage);
  const paginatedMemberships = sortedMemberships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white flex justify-between items-center">
        <h3 className="text-lg font-semibold">Membership Akan Expired</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Nama</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Tier</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Expired</th>
              <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedMemberships.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  Tidak ada membership yang akan expired
                </td>
              </tr>
            ) : (
              paginatedMemberships.map((m) => (
                <tr key={m.membership_id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-purple-600">#{m.membership_id}</td>
                  <td className="px-6 py-4">{m.nama_lengkap}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      m.tier_membership === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                      m.tier_membership === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {m.tier_membership}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{new Date(m.expired_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      m.status_keaktifan === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {m.status_keaktifan ? m.status_keaktifan.charAt(0).toUpperCase() + m.status_keaktifan.slice(1) : 'Unknown'}
                    </span>
                  </td>
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