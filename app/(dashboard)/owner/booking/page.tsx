'use client';

import { useState, useEffect } from 'react';
import BookingDetails from '@/components/booking/BookingDetails';
import { Booking } from '@/types/booking';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import ModalPopup from '@/components/ui/ModalPopup';

export default function OwnerBookingPage() {
  const router = useRouter();

  // === MODAL STATE ===
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState<string | React.ReactNode>('');
  const [onConfirmAction, setOnConfirmAction] = useState<(() => Promise<void>) | null>(null);

  // === BOOKING STATE ===
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // tambahan: loading saat hapus
  const limit = 7;

  // === FETCH DATA ===
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
      }
    } catch (error) {
      console.error('Gagal mengambil data booking:', error);
      openModal('error', 'Error', 'Gagal memuat data booking.');
    } finally {
      setLoading(false);
    }
  };

  // Refetch halaman saat ini (TIDAK reset ke page 1)
  const refetchCurrentPage = async () => {
    await fetchBookings();
  };

  // Refetch dari page 1 (hanya dipakai saat search atau pertama kali)
  const refetchFromFirstPage = async () => {
    setPage(1);
    await fetchBookings();
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // === SEARCH FILTER ===
  useEffect(() => {
    const lower = search.toLowerCase();
    const result = bookings.filter(b =>
      b.booking_id.toLowerCase().includes(lower) ||
      (b.nama_lengkap || '').toLowerCase().includes(lower)
    );
    setFiltered(result);

    // Jika item yang dipilih tidak ada di hasil filter → unselect
    if (selected && !result.find(b => b.booking_id === selected.booking_id)) {
      setSelected(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, bookings]);

  // === HELPER ===
  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const handleSelectBooking = (booking: Booking) => {
    setSelected(selected?.booking_id === booking.booking_id ? null : booking);
  };

  const handleUnselect = () => setSelected(null);

  // === MODAL HANDLER ===
  const openModal = (
    type: 'success' | 'warning' | 'error',
    title: string,
    message: string | React.ReactNode,
    onConfirm?: () => Promise<void>
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setOnConfirmAction(onConfirm || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setOnConfirmAction(null);
  };

  const handleModalConfirm = async () => {
    if (onConfirmAction) {
      await onConfirmAction();
    }
    closeModal();
  };

  // === HAPUS BOOKING – VERSI AMAN 100% ===
  const handleDelete = () => {
    if (!selected) {
      openModal('warning', 'Peringatan', 'Tidak ada booking yang dipilih.');
      return;
    }

    openModal(
      'warning',
      'Konfirmasi Hapus Booking',
      <>
        Apakah Anda yakin ingin menghapus booking <strong>#{selected.booking_id}</strong> atas nama <strong>{selected.nama_lengkap}</strong>?
        <br /><br />
        <span className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan.</span>
      </>,
      async () => {
        setDeleting(true);
        try {
          const res = await fetch(`/api/booking/${selected.booking_id}`, {
            method: 'DELETE',
          });

          const json = await res.json();

          if (res.ok && json.success) {
            // HANYA JIKA SUKSES → baru update UI
            openModal('success', 'Berhasil!', 'Booking berhasil dihapus.');
            setSelected(null);
            await refetchCurrentPage(); // refresh halaman saat ini saja
          } else {
            openModal('error', 'Gagal', json.error || 'Tidak dapat menghapus booking.');
          }
        } catch (error) {
          openModal('error', 'Error', 'Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  // === EDIT & TAMBAH ===
  const handleEdit = () => {
    if (!selected) {
      openModal('warning', 'Peringatan', 'Pilih booking terlebih dahulu untuk mengubah.');
      return;
    }
    router.push(`/owner/booking/edit/${selected.booking_id}`);
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
            placeholder="Cari booking ID atau nama pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 outline-none text-gray-700 transition"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAFTAR BOOKING */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">Daftar Booking</h2>
            {selected && (
              <button
                onClick={handleUnselect}
                className="text-xs bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded transition"
              >
                Batal Pilih
              </button>
            )}
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-gray-100">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-500">Memuat...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">?</span>
                </div>
                <p>Tidak ada data booking</p>
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.booking_id}
                  onClick={() => handleSelectBooking(b)}
                  className={`p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-blue-50 ${
                    selected?.booking_id === b.booking_id
                      ? 'bg-blue-100 border-l-4 border-blue-600 ring-2 ring-blue-200'
                      : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {getInitials(b.nama_lengkap)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800 text-sm">#{b.booking_id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                        b.status === 'confirmed' ? 'bg-green-500' :
                        b.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{b.nama_lengkap}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(b.tanggal_booking).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          <div className="p-4 border-t bg-gray-50 flex items-center justify-between text-sm">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!hasPrev || loading}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                !hasPrev || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <span className="text-gray-600">
              Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext || loading}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${
                !hasNext || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DETAIL BOOKING */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {selected ? `Detail Booking #${selected.booking_id}` : 'Detail Booking'}
            </h2>
            <div className="flex gap-3">
              <Button size="sm" variant="success" onClick={handleAdd}>
                + Tambah
              </Button>
              <Button size="sm" variant="secondary" disabled={!selected} onClick={handleEdit}>
                Ubah
              </Button>
              <Button 
                size="sm" 
                variant="danger" 
                disabled={!selected || deleting} 
                onClick={handleDelete}
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </div>
          </div>

          <div className="p-6 min-h-[400px]">
            {selected ? (
              <BookingDetails booking={selected} />
            ) : (
              <div className="text-center py-20 text-gray-500">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-5 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Belum ada booking dipilih</h3>
                <p className="text-sm">Klik salah satu booking di daftar sebelah kiri</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <ModalPopup
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={closeModal}
        onConfirm={onConfirmAction ? handleModalConfirm : undefined}
        confirmText={onConfirmAction ? (deleting ? 'Menghapus...' : 'Ya, Hapus') : undefined}
        cancelText={onConfirmAction ? 'Batal' : 'Tutup'}
        confirmDisabled={deleting}
      />
    </div>
  );
}