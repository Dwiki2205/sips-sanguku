'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { ArrowLeft, AlertCircle, CheckCircle, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

// === POPUP COMPONENT ===
const Popup = ({ type, message, onClose, children }: { type: 'error' | 'success'; message: string; onClose?: () => void; children?: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center`}>
        <div className="flex justify-center mb-4">
          {type === 'error' ? (
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          ) : (
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          )}
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
          {type === 'error' ? 'Data Belum Lengkap' : 'Berhasil!'}
        </h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        {children ? (
          children
        ) : (
          <Button onClick={onClose} variant={type === 'error' ? 'danger' : 'primary'} size="md" className="w-full">
            OK
          </Button>
        )}
      </div>
    </div>
  );
};

// === INSTRUKSI PEMBAYARAN POPUP ===
const PaymentInstructionPopup = ({ grandTotal, invoiceNo, onQris }: { grandTotal: number; invoiceNo: string; onQris: () => void }) => {
  const [minutes, setMinutes] = useState(28);
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes, seconds]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-blue-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-700">Instruksi Pembayaran</h2>
          <div className="flex gap-2">
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-sm">
              {minutes.toString().padStart(2, '0')} Menit
            </div>
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded font-bold text-sm">
              {seconds.toString().padStart(2, '0')} Detik
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Silakan lakukan pembayaran ke rekening berikut:
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Transaksi:</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Waiting</span>
          </div>
          <div className="flex justify-between">
            <span>No Transaksi:</span>
            <span className="font-mono font-bold">{invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Nominal Bayar:</span>
            <span className="font-bold">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Bank BCA</span>
            <span className="text-blue-600 font-bold">Salin Rekening</span>
          </div>
          <div className="flex justify-between">
            <span>Nomor Rekening:</span>
            <span className="font-mono font-bold">7382923827</span>
          </div>
          <div className="flex justify-between">
            <span>Nama Pemilik Rekening:</span>
            <span className="font-bold">Dwiki Dharmawan</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-6 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onQris}
        >
          PEMBAYARAN QRIS
        </Button>
      </div>
    </div>
  );
};

// === INVOICE POPUP ===
const InvoicePopup = ({ data, onClose }: { data: any; onClose: () => void }) => {
  const { booking_id, tanggal_booking, jam_mulai, jam_selesai, total_biaya, pelanggan_id } = data;
  const subtotal = parseInt(total_biaya);
  const discount = 0;
  const grandTotal = subtotal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-8 border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
          <p className="text-lg font-semibold text-blue-700">Sanguku.id</p>
          <p className="text-xs text-gray-600">
            Jl. Baladewa No.5, Tambak Bayan, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
          </p>
          <p className="text-xs text-gray-600">
            Email: sangukuid@gmail.com (No Telp: 08557362816)
          </p>
        </div>

        <div className="flex justify-between mb-6 text-sm">
          <div>
            <p className="font-bold">Billed To:</p>
            <p className="font-semibold">Pelanggan ID: {pelanggan_id}</p>
            <p>{new Date().toLocaleString('id-ID')}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Invoice {booking_id}</p>
            <p>Date: {format(new Date(tanggal_booking), 'dd MMMM yyyy', { locale: id })}</p>
            <p>Time: {jam_mulai} - {jam_selesai}</p>
            <p className="text-green-600 font-bold">Transaksi: Success</p>
          </div>
        </div>

        <table className="w-full text-sm border-t border-b">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 px-1">ID</th>
              <th className="text-left py-2 px-1">Tanggal</th>
              <th className="text-left py-2 px-1">Durasi</th>
              <th className="text-left py-2 px-1">Jam Mulai</th>
              <th className="text-left py-2 px-1">Jam Akhir</th>
              <th className="text-right py-2 px-1">Tarif</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 px-1 font-mono">#{booking_id}</td>
              <td className="py-2 px-1">{format(new Date(tanggal_booking), 'dd-MM-yyyy')}</td>
              <td className="py-2 px-1">60 Menit</td>
              <td className="py-2 px-1">{jam_mulai}</td>
              <td className="py-2 px-1">{jam_selesai}</td>
              <td className="py-2 px-1 text-right">Rp {subtotal.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 text-right space-y-1 text-sm">
          <div className="flex justify-end gap-8">
            <span>Subtotal</span>
            <span className="w-32 text-right">Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-end gap-8">
            <span>Diskon</span>
            <span className="w-32 text-right text-green-600">Rp {discount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-end gap-8 font-bold text-lg border-t pt-2">
            <span>Grand Total</span>
            <span className="w-32 text-right">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            className="px-8 py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onClose}
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function BookingFormPage() {
  const router = useRouter();
  const { action } = useParams();
  const isEdit = action === 'edit';
  const [loading, setLoading] = useState(isEdit);
  const [popup, setPopup] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<any>(null);

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
  const invoiceNo = `SLB${String(Date.now()).slice(-8)}`;

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

  const validateForm = () => {
    const required = ['pelanggan_id', 'tanggal_booking', 'jam_mulai', 'jam_selesai', 'total_biaya'];
    for (const field of required) {
      if (!form[field as keyof FormData]?.trim()) {
        return `Field "${field.replace('_', ' ')}" wajib diisi.`;
      }
    }
    if (parseInt(form.total_biaya) <= 0) {
      return 'Total biaya harus lebih dari 0.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const error = validateForm();
    if (error) {
      setPopup({ type: 'error', message: error });
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

      if (res.ok) {
        const saved = {
          booking_id: form.booking_id || generatedId,
          pelanggan_id: form.pelanggan_id,
          tanggal_booking: form.tanggal_booking,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          total_biaya: form.total_biaya,
          metode_pembayaran: form.metode_pembayaran,
        };
        setLastSavedData(saved);

        setPopup({
          type: 'success',
          message: isEdit ? 'Booking berhasil diperbarui!' : 'Booking berhasil ditambahkan!',
        });
      } else {
        const err = await res.json();
        setPopup({ type: 'error', message: err.error || 'Gagal menyimpan data.' });
      }
    } catch (error) {
      setPopup({ type: 'error', message: 'Terjadi kesalahan jaringan.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setPopup(null);
    setShowPayment(true);
  };

  const handleQrisPayment = () => {
    setShowPayment(false);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    router.push('/owner/booking');
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
      {/* HEADER */}
      <div className="bg-blue-600 text-white rounded-2xl">
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
                <input readOnly value={form.booking_id || generatedId} className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan</label>
                <input required name="pelanggan_id" value={form.pelanggan_id} onChange={handleChange} placeholder="PLG001" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Booking</label>
                <input required type="date" name="tanggal_booking" value={form.tanggal_booking} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                <input required type="time" name="jam_mulai" value={form.jam_mulai} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Biaya</label>
                <input required type="number" name="total_biaya" value={form.total_biaya} onChange={handleChange} placeholder="150000" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition appearance-none [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden" />
              </div>
            </div>

            {/* KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                <input required type="time" name="jam_selesai" value={form.jam_selesai} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <select name="metode_pembayaran" value={form.metode_pembayaran} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none">
                  <option>Cash</option>
                  <option>QRIS</option>
                  <option>Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                <input readOnly value={new Date().toLocaleString('id-ID')} className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
                <input readOnly value={new Date().toLocaleString('id-ID')} className="w-full px-4 py-3 rounded-lg bg-gray-100 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-10">
            <Button type="button" variant="danger" size="lg" onClick={() => router.push('/owner/booking')} className="px-8">
              Batal
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={loading} className="px-8 bg-green-500 hover:bg-green-600">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </div>

      {/* POPUP ERROR / SUCCESS */}
      {popup && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)}>
          {popup.type === 'success' && (
            <Button onClick={handleSuccessOk} variant="primary" size="md" className="w-full">
              OK
            </Button>
          )}
        </Popup>
      )}

      {/* POPUP INSTRUKSI PEMBAYARAN */}
      {showPayment && lastSavedData && (
        <PaymentInstructionPopup
          grandTotal={parseInt(lastSavedData.total_biaya)}
          invoiceNo={invoiceNo}
          onQris={handleQrisPayment}
        />
      )}

      {/* POPUP INVOICE */}
      {showInvoice && lastSavedData && (
        <InvoicePopup data={lastSavedData} onClose={handleCloseInvoice} />
      )}
    </>
  );
}