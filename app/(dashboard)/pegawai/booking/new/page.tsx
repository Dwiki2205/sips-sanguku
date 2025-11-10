'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import ModalPopup from '@/components/ui/ModalPopup';

type FormData = {
  booking_id?: string;
  pelanggan_id: string;
  tanggal_booking: string;
  jam_mulai: string;
  jam_selesai: string;
  status: string;
  total_biaya: string;
  metode_pembayaran: string;
};

export default function BookingFormPage() {
  const router = useRouter();
  const { action } = useParams();
  const isEdit = action === 'edit';

  // State untuk modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState<FormData>({
    pelanggan_id: '',
    tanggal_booking: '',
    jam_mulai: '',
    jam_selesai: '',
    status: 'pending',
    total_biaya: '',
    metode_pembayaran: 'Cash',
  });

  const generatedId = `BKG${String(Date.now()).slice(-4)}`;

  useEffect(() => {
    if (isEdit && action?.[1]) {
      fetch(`/api/booking/${action[1]}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            const b = d.data;
            setForm({
              booking_id: b.booking_id,
              pelanggan_id: b.pelanggan_id,
              tanggal_booking: b.tanggal_booking,
              jam_mulai: b.jam_mulai,
              jam_selesai: b.jam_selesai,
              status: b.status,
              total_biaya: b.total_biaya.toString(),
              metode_pembayaran: b.metode_pembayaran,
            });
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isEdit, action]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validasi wajib isi
    if (!form.pelanggan_id || !form.tanggal_booking || !form.jam_mulai || !form.jam_selesai || !form.total_biaya) {
      setModalType('warning');
      setModalTitle('Data Belum Diisi Lengkap');
      setModalOpen(true);
      return;
    }

    const url = isEdit ? `/api/booking/${form.booking_id}` : '/api/booking';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: form.booking_id || generatedId,
          pelanggan_id: form.pelanggan_id,
          tanggal_booking: form.tanggal_booking,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          status: form.status,
          total_biaya: parseInt(form.total_biaya),
          metode_pembayaran: form.metode_pembayaran,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setModalType('success');
        setModalTitle(isEdit ? 'Booking berhasil diperbarui!' : 'Booking berhasil ditambahkan!');
        setModalOpen(true);
      } else {
        // Cek jenis error dari backend
        if (data.error?.includes('duplicate') || data.error?.includes('sudah ada')) {
          setModalType('warning');
          setModalTitle('ID Booking sudah terdaftar');
        } else {
          setModalType('warning');
          setModalTitle(data.error || 'Gagal menyimpan booking');
        }
        setModalOpen(true);
      }
    } catch (error: any) {
      setModalType('error');
      setModalTitle('Terjadi kesalahan: ' + error.message);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Jika sukses, langsung kembali ke list
    if (modalType === 'success') {
      router.push('/owner/booking');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* HEADER BIRU */}
      <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
        <div className="px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/owner/booking')}
            className="p-2 hover:bg-blue-700 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Booking' : 'Tambah Booking Baru'}
          </h1>
        </div>
      </div>

      {/* FORM */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Booking</label>
                <input
                  readOnly
                  value={form.booking_id || generatedId}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan *</label>
                <input
                  required
                  name="pelanggan_id"
                  value={form.pelanggan_id}
                  onChange={handleChange}
                  placeholder="PLG001"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Booking *</label>
                <input
                  required
                  type="date"
                  name="tanggal_booking"
                  value={form.tanggal_booking}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai *</label>
                <input
                  required
                  type="time"
                  name="jam_mulai"
                  value={form.jam_mulai}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Biaya *</label>
                <input
                  required
                  type="number"
                  name="total_biaya"
                  value={form.total_biaya}
                  onChange={handleChange}
                  placeholder="150000"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition appearance-none [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                />
              </div>
            </div>

            {/* KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai *</label>
                <input
                  required
                  type="time"
                  name="jam_selesai"
                  value={form.jam_selesai}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <select
                  name="metode_pembayaran"
                  value={form.metode_pembayaran}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option>Cash</option>
                  <option>QRIS</option>
                  <option>Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                <input
                  readOnly
                  value={new Date().toLocaleString('id-ID')}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
                <input
                  readOnly
                  value={new Date().toLocaleString('id-ID')}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* TOMBOL */}
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => router.push('/owner/booking')}
              disabled={loading}
              className="px-8"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="px-8 bg-green-500 hover:bg-green-600 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Booking'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* MODAL POPUP */}
      <ModalPopup
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        onClose={handleModalClose}
      />
    </>
  );
}