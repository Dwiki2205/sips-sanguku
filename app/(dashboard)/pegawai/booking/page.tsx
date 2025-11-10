// app/(dashboard)/owner/booking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BookingDetails from '@/components/booking/BookingDetails';
import { Booking } from '@/types/booking';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation'; // Tambahkan ini

export default function OwnerBookingPage() {
  const router = useRouter(); // Tambahkan router
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 7;

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const res = await fetch(`/api/booking?limit=${limit}&offset=${offset}`);
      const data = await res.json();

      if (data.success) {
        const enriched = data.data.map((b: any) => ({
          ...b,
          nama_lengkap: b.nama_pelanggan || 'Unknown',
        }));
        setBookings(enriched);
        setFiltered(enriched);
        setTotal(data.pagination?.total || 0);
        
        // Reset selected ketika data berubah
        setSelected(null);
      }
    } catch (error) {
      console.error('Gagal ambil data');
    } finally {
      setLoading(false);
    }
  };

  const refetchBookings = async () => {
    setPage(1);
    await fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  useEffect(() => {
    const lower = search.toLowerCase();
    const result = bookings.filter(b =>
      b.booking_id.toLowerCase().includes(lower) ||
      (b.nama_lengkap || '').toLowerCase().includes(lower)
    );
    setFiltered(result);
    
    // Jika selected tidak ada di filtered results, unselect
    if (selected && !result.find(b => b.booking_id === selected.booking_id)) {
      setSelected(null);
    }
  }, [search, bookings]);

  // Fungsi untuk handle select/unselect
  const handleSelectBooking = (booking: Booking) => {
    if (selected?.booking_id === booking.booking_id) {
      // Unselect jika booking yang sama diklik
      setSelected(null);
    } else {
      // Select booking baru
      setSelected(booking);
    }
  };

  // Fungsi untuk unselect secara eksplisit
  const handleUnselect = () => {
    setSelected(null);
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const handleEdit = () => {
    if (selected) {
      router.push(`/owner/booking/edit/${selected.booking_id}`);
    }
  };

  const handleAdd = () => {
    router.push('/owner/booking/new');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari booking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none text-gray-700"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* UBAH GRID MENJADI 1:2 - DAFTAR KECIL, DETAIL BESAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAFTAR BOOKING - 1 BAGIAN DARI 3 */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">Daftar Booking</h2>
            {selected && (
              <button
                onClick={handleUnselect}
                className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded transition-colors"
                title="Unselect booking"
              >
                Unselect
              </button>
            )}
          </div>

          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm">Memuat data...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg">?</span>
                </div>
                <p className="text-sm">Tidak ada data</p>
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.booking_id}
                  onClick={() => handleSelectBooking(b)}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition-all hover:bg-blue-50 ${
                    selected?.booking_id === b.booking_id 
                      ? 'bg-blue-100 border-l-4 border-blue-600 ring-2 ring-blue-200' 
                      : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {getInitials(b.nama_lengkap)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 truncate text-sm">#{b.booking_id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ml-1 ${
                        b.status === 'confirmed' ? 'bg-green-500' :
                        b.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{b.nama_lengkap}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.tanggal_booking).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'numeric', year: 'numeric'
                      })}
                    </p>
                  </div>
                  {selected?.booking_id === b.booking_id && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!hasPrev || loading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                !hasPrev || loading
                  ? 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            <span className="text-xs text-gray-600">
              <strong>{page}</strong>/<strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext || loading}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                !hasNext || loading
                  ? 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DETAIL BOOKING - 2 BAGIAN DARI 3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {selected ? `Detail Booking #${selected.booking_id}` : 'Detail Data Booking'}
            </h2>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="success"
                className="bg-green-600 hover:bg-green-700 text-white" 
                onClick={handleAdd}
                disabled={!!selected} // Disable ketika ada yang selected
              >
                Tambah
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                disabled={!selected} // Enable hanya ketika ada yang selected
                onClick={handleEdit}
              >
                Ubah
              </Button>
            </div>
          </div>
          <div className="p-6">
            {selected ? (
              <BookingDetails booking={selected} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Tidak ada booking yang dipilih</h3>
                <p className="text-sm">Pilih booking dari daftar untuk melihat detail</p>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}