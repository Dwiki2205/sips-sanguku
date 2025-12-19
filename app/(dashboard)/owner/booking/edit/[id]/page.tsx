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

type FormErrors = {
  pelanggan_id?: string;
  tanggal_booking?: string;
  jam_mulai?: string;
  jam_selesai?: string;
  total_biaya?: string;
};

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const formatTimeForInput = (timeString: string) => {
  if (!timeString) return '';
  if (timeString.match(/^\d{2}:\d{2}$/)) return timeString;
  const date = new Date(`1970-01-01T${timeString}`);
  return isNaN(date.getTime()) ? '' : date.toTimeString().slice(0, 5);
};

export default function EditBookingPage() {
  const router = useRouter();
  const { id } = useParams();

  // State untuk modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'warning' | 'error'>('success');
  const [modalTitle, setModalTitle] = useState('');

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>({
    pelanggan_id: '',
    tanggal_booking: '',
    jam_mulai: '',
    jam_selesai: '',
    status: 'pending',
    total_biaya: '',
    metode_pembayaran: 'Cash',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (id) {
      fetchBookingData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking/${id}`);
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const b = data.data;
        setForm({
          booking_id: b.booking_id,
          pelanggan_id: b.pelanggan_id || '',
          tanggal_booking: formatDateForInput(b.tanggal_booking),
          jam_mulai: formatTimeForInput(b.jam_mulai),
          jam_selesai: formatTimeForInput(b.jam_selesai),
          status: b.status || 'pending',
          total_biaya: b.total_biaya?.toString() || '',
          metode_pembayaran: b.metode_pembayaran || 'Cash',
        });
      } else {
        setModalType('warning');
        setModalTitle('Data booking tidak ditemukan');
        setModalOpen(true);
      }
    } catch (error) {
      setModalType('error');
      setModalTitle('Gagal memuat data booking');
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Hapus error saat user mulai mengisi
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validasi setiap field
    if (!form.pelanggan_id.trim()) {
      newErrors.pelanggan_id = 'Data belum diisi sepenuhnya';
      isValid = false;
    }

    if (!form.tanggal_booking) {
      newErrors.tanggal_booking = 'Data belum diisi sepenuhnya';
      isValid = false;
    }

    if (!form.jam_mulai) {
      newErrors.jam_mulai = 'Data belum diisi sepenuhnya';
      isValid = false;
    }

    if (!form.jam_selesai) {
      newErrors.jam_selesai = 'Data belum diisi sepenuhnya';
      isValid = false;
    }

    if (!form.total_biaya.trim()) {
      newErrors.total_biaya = 'Data belum diisi sepenuhnya';
      isValid = false;
    } else if (parseInt(form.total_biaya) <= 0) {
      newErrors.total_biaya = 'Total biaya harus lebih dari 0';
      isValid = false;
    }

    // Validasi jam selesai > jam mulai
    if (form.jam_mulai && form.jam_selesai && form.jam_selesai <= form.jam_mulai) {
      newErrors.jam_selesai = 'Jam selesai harus setelah jam mulai';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !form.booking_id) return;

    // Validasi form menggunakan fungsi validateForm
    if (!validateForm()) {
      return; // Berhenti jika validasi gagal
    }

    try {
      setLoading(true);
      
      const submitData = {
        booking_id: form.booking_id,
        pelanggan_id: form.pelanggan_id,
        tanggal_booking: form.tanggal_booking,
        jam_mulai: form.jam_mulai,
        jam_selesai: form.jam_selesai,
        status: form.status,
        total_biaya: parseInt(form.total_biaya) || 0,
        metode_pembayaran: form.metode_pembayaran,
      };

      const res = await fetch(`/api/booking/${form.booking_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setModalType('success');
        setModalTitle('Booking berhasil diperbarui!');
        setModalOpen(true);
      } else {
        setModalType('warning');
        setModalTitle(result.error || 'Gagal memperbarui booking');
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
    if (modalType === 'success') {
      router.push('/owner/booking');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Memuat data booking...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-blue-600 text-white rounded-2xl mx-6 mt-6">
        <div className="px-6 py-5 flex items-center gap-4">
          <button
            onClick={() => router.push('/owner/booking')}
            className="p-2 hover:bg-blue-700 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Ubah Booking #{form.booking_id}</h1>
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
                  value={form.booking_id || ''}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan *</label>
                <input
                  name="pelanggan_id"
                  value={form.pelanggan_id}
                  onChange={handleChange}
                  placeholder="PLG001"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.pelanggan_id 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } outline-none transition`}
                />
                {errors.pelanggan_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {errors.pelanggan_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Booking *</label>
                <input
                  type="date"
                  name="tanggal_booking"
                  value={form.tanggal_booking}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.tanggal_booking 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } outline-none transition`}
                />
                {errors.tanggal_booking && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {errors.tanggal_booking}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai *</label>
                <input
                  type="time"
                  name="jam_mulai"
                  value={form.jam_mulai}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.jam_mulai 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } outline-none transition`}
                />
                {errors.jam_mulai && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {errors.jam_mulai}
                  </p>
                )}
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
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai *</label>
                <input
                  type="time"
                  name="jam_selesai"
                  value={form.jam_selesai}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.jam_selesai 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } outline-none transition`}
                />
                {errors.jam_selesai && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {errors.jam_selesai}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Biaya *</label>
                <input
                  type="number"
                  name="total_biaya"
                  value={form.total_biaya}
                  onChange={handleChange}
                  placeholder="150000"
                  min="0"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.total_biaya 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } outline-none transition [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden`}
                />
                {errors.total_biaya && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {errors.total_biaya}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <select
                  name="metode_pembayaran"
                  value={form.metode_pembayaran}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Kartu Kredit">Kartu Kredit</option>
                </select>
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
              className="px-8 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* POPUP MODAL */}
      <ModalPopup
        isOpen={modalOpen}
        type={modalType}
        title={modalTitle}
        onClose={handleModalClose}
      />
    </div>
  );
}