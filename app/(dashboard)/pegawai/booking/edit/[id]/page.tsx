// app/owner/booking/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';

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

// Fungsi untuk format tanggal ke YYYY-MM-DD (format input date)
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString().split('T')[0];
};

// Fungsi untuk format waktu ke HH:MM (format input time)
const formatTimeForInput = (timeString: string) => {
  if (!timeString) return '';
  
  // Jika waktu sudah dalam format HH:MM, return langsung
  if (timeString.match(/^\d{2}:\d{2}$/)) return timeString;
  
  // Jika waktu dalam format lengkap, ambil bagian jam dan menit
  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) return '';
  
  return date.toTimeString().slice(0, 5);
};

export default function EditBookingPage() {
  const router = useRouter();
  const { id } = useParams();
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
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking data');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const booking = data.data;
        
        setForm({
          booking_id: booking.booking_id,
          pelanggan_id: booking.pelanggan_id || '',
          tanggal_booking: formatDateForInput(booking.tanggal_booking),
          jam_mulai: formatTimeForInput(booking.jam_mulai),
          jam_selesai: formatTimeForInput(booking.jam_selesai),
          status: booking.status || 'pending',
          total_biaya: booking.total_biaya?.toString() || '',
          metode_pembayaran: booking.metode_pembayaran || 'Cash',
        });
      } else {
        console.error('Data booking tidak ditemukan');
        alert('Data booking tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Gagal memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !form.booking_id) return;

    try {
      setLoading(true);
      
      // Format data sebelum dikirim
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
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        alert('Booking berhasil diperbarui!');
        router.push('/owner/booking');
      } else {
        alert(result.error || 'Gagal memperbarui booking');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Terjadi kesalahan saat memperbarui booking');
    } finally {
      setLoading(false);
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
      {/* HEADER BIRU FULL */}
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
            {/* KOLOM KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Booking
                </label>
                <input
                  readOnly
                  value={form.booking_id || ''}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Pelanggan *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Booking *
                </label>
                <input
                  required
                  type="date"
                  name="tanggal_booking"
                  value={form.tanggal_booking}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tanggal yang dipilih: {form.tanggal_booking || '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Mulai *
                </label>
                <input
                  required
                  type="time"
                  name="jam_mulai"
                  value={form.jam_mulai}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Selesai *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Biaya *
                </label>
                <input
                  required
                  type="number"
                  name="total_biaya"
                  value={form.total_biaya}
                  onChange={handleChange}
                  placeholder="150000"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
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

          {/* TOMBOL ACTION */}
          <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={() => router.push('/owner/booking')}
              className="px-8"
              disabled={loading}
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
    </div>
  );
}