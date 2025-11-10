'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, AlertCircle, Check } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Button from '@/components/ui/Button';

interface TimeSlot {
  time: string;
  price: string;
  startHour: string;
  booked?: boolean;
}

interface Booking {
  jam_mulai: string;
  status: string;
}

export default function BookingPelangganPage() {
  const router = useRouter();

  // Tanggal
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Slots & pagination
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableCount, setAvailableCount] = useState(13);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const slotsPerPage = 9;

  // Pilihan slot
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Popup
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showInvoicePopup, setShowInvoicePopup] = useState(false); // BARU
  const [useMembership, setUseMembership] = useState(false);

  // Countdown
  const [minutes, setMinutes] = useState(28);
  const [seconds, setSeconds] = useState(59);

  // Invoice Data
  const [bookingId] = useState(() => `P${Math.floor(60000 + Math.random() * 99999)}`);
  const [invoiceNo] = useState('SLB2722092828');
  const [customerName] = useState('Prilla Diah Mawarni');
  const [customerPhone] = useState('098463728298');
  const [customerEmail] = useState('prilladiah@gmail.com');

  // Base slots
  const baseSlots: TimeSlot[] = [
    { time: '08.00 - 09.00', price: 'Rp 50.000', startHour: '08:00:00' },
    { time: '09.00 - 10.00', price: 'Rp 50.000', startHour: '09:00:00' },
    { time: '10.00 - 11.00', price: 'Rp 50.000', startHour: '10:00:00' },
    { time: '11.00 - 12.00', price: 'Rp 50.000', startHour: '11:00:00' },
    { time: '13.00 - 14.00', price: 'Rp 50.000', startHour: '13:00:00' },
    { time: '14.00 - 15.00', price: 'Rp 50.000', startHour: '14:00:00' },
    { time: '15.00 - 16.00', price: 'Rp 50.000', startHour: '15:00:00' },
    { time: '16.00 - 17.00', price: 'Rp 60.000', startHour: '16:00:00' },
    { time: '17.00 - 18.00', price: 'Rp 60.000', startHour: '17:00:00' },
    { time: '18.00 - 19.00', price: 'Rp 60.000', startHour: '18:00:00' },
    { time: '19.00 - 20.00', price: 'Rp 60.000', startHour: '19:00:00' },
    { time: '21.00 - 22.00', price: 'Rp 60.000', startHour: '21:00:00' },
    { time: '22.00 - 23.00', price: 'Rp 60.000', startHour: '22:00:00' },
  ];

  // Generate 3 hari
  const getDates = (): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Navigasi tanggal
  const handlePrev = (): void => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 3);
    setCurrentDate(prev);
    setPage(1);
  };

  const handleNext = (): void => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 3);
    setCurrentDate(next);
    setPage(1);
  };

  const handleDateSelect = (date: Date | undefined): void => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
      setCalendarOpen(false);
      setPage(1);
    }
  };

  // FETCH REAL-TIME DARI NEON DB
  const fetchAvailableSlots = async (date: Date): Promise<void> => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/booking/available?date=${dateStr}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data: { bookings: Booking[] } = await res.json();

        const bookedStarts = data.bookings
          .filter(b => ['pending', 'confirmed'].includes(b.status))
          .map(b => b.jam_mulai.length === 5 ? `${b.jam_mulai}:00` : b.jam_mulai);

        const updatedSlots = baseSlots.map(slot => ({
          ...slot,
          booked: bookedStarts.includes(slot.startHour),
        }));

        const available = updatedSlots.filter(s => !s.booked).length;
        setTimeSlots(updatedSlots);
        setAvailableCount(available);
      } else {
        setTimeSlots(baseSlots.map(s => ({ ...s, booked: false })));
        setAvailableCount(13);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setTimeSlots(baseSlots.map(s => ({ ...s, booked: false })));
      setAvailableCount(13);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots(currentDate);
  }, [currentDate]);

  // Countdown
  useEffect(() => {
    if (showPaymentPopup && !showSuccessPopup) {
      const timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timer);
          setShowPaymentPopup(false);
          alert('Waktu pembayaran habis!');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showPaymentPopup, showSuccessPopup, minutes, seconds]);

  // Pagination
  const startIndex = (page - 1) * slotsPerPage;
  const currentSlots = timeSlots.slice(startIndex, startIndex + slotsPerPage);
  const totalPages = Math.ceil(timeSlots.length / slotsPerPage);

  // Pilih slot
  const handleSlotClick = (slot: TimeSlot): void => {
    if (slot.booked) return;
    setSelectedSlot(slot);
  };

  // Buka popup detail
  const handleBookingClick = (): void => {
    if (!selectedSlot) return;
    setShowDetailPopup(true);
  };

  // Hitung harga
  const getPrice = (): number => {
    if (!selectedSlot) return 0;
    return parseInt(selectedSlot.price.replace(/[^0-9]/g, ''), 10);
  };

  const subtotal = getPrice();
  const discount = useMembership ? subtotal * 0.1 : 0;
  const grandTotal = subtotal - discount;

  // Pay Now → buka konfirmasi
  const handlePayNow = (): void => {
    setShowDetailPopup(false);
    setShowConfirmPopup(true);
  };

  // Lanjutkan → buka instruksi pembayaran
  const handleConfirm = (): void => {
    setShowConfirmPopup(false);
    setShowPaymentPopup(true);
    setMinutes(28);
    setSeconds(59);
  };

  // PEMBAYARAN QRIS → simulasi sukses
  const handleQrisPayment = (): void => {
    setShowPaymentPopup(false);
    setShowSuccessPopup(true);
  };

  // OK → buka invoice
  const handleSuccessOk = (): void => {
    setShowSuccessPopup(false);
    setShowInvoicePopup(true);
  };

  // Tutup invoice
  const handleCloseInvoice = (): void => {
    setShowInvoicePopup(false);
    setSelectedSlot(null);
    setUseMembership(false);
    setPage(1);
    fetchAvailableSlots(currentDate);
  };

  // Format jam
  const [startTime, endTime] = selectedSlot?.time.split(' - ') || ['', ''];

  return (
    <>
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-center">Pilih Jadwal</h1>
        </div>
      </div>

      {/* KALENDER */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-2 items-center">
            {getDates().map((date, i) => (
              <button
                key={i}
                onClick={() => setCurrentDate(date)}
                className={`px-4 py-3 rounded-xl font-medium transition ${
                  format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <div className="text-xs">{format(date, 'EEE', { locale: id })}</div>
                <div className="text-sm font-bold">{format(date, 'd MMM yyyy', { locale: id })}</div>
              </button>
            ))}

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date): boolean => date < today}
                  initialFocus
                  locale={id}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>

          <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* FOTO LAPANGAN */}
          <div className="flex flex-col justify-between h-full">
            <img
              src="/images/LAPANGAN.png"
              alt="Lapangan Indoor"
              className="w-full h-80 object-cover rounded-xl shadow-lg"
            />
          </div>

          {/* KONTEN KANAN */}
          <div className="flex flex-col justify-between h-full space-y-6">
            {/* JUDUL + BADGE */}
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lapangan Indoor</h2>
              <div className="bg-white px-4 py-2 rounded-full shadow-md inline-flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{availableCount} Jam Tersedia</span>
              </div>
            </div>

            {/* SLOT WAKTU */}
            <div className="grid grid-cols-3 gap-3">
              {loading ? (
                <div className="col-span-3 text-center py-8">Loading...</div>
              ) : (
                currentSlots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => handleSlotClick(slot)}
                    disabled={slot.booked}
                    className={`p-3 rounded-lg text-center transition shadow-md relative ${
                      slot.booked
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        : selectedSlot?.startHour === slot.startHour
                        ? 'bg-green-600 text-white ring-2 ring-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <div className="text-xs font-medium">60 Menit</div>
                    <div className="text-sm font-bold">{slot.time}</div>
                    <div className="text-xs">{slot.price}</div>
                  </button>
                ))
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1  && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} - {Math.min(startIndex + slotsPerPage, timeSlots.length)} of {timeSlots.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(1)}
                    className={`px-3 py-1 rounded ${page === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    disabled={page === 1}
                  >
                    1
                  </button>
                  {totalPages > 1 && (
                    <button
                      onClick={() => setPage(2)}
                      className={`px-3 py-1 rounded ${page === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                      2
                    </button>
                  )}
                  {page < totalPages && (
                    <button
                      onClick={() => setPage(page + 1)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TOMBOL BOOKING HIJAU */}
            <div className="mt-auto pt-4 border-t">
              <Button
                variant="primary"
                size="lg"
                className="w-full py-5 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                onClick={handleBookingClick}
                disabled={!selectedSlot || availableCount === 0}
              >
                Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP DETAIL PEMESANAN */}
      {showDetailPopup && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 relative">
              <button
                onClick={() => setShowDetailPopup(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-center">Detail Pemesanan</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <img
                  src="/images/LAPANGAN.png"
                  alt="Lapangan"
                  className="w-20 h-20 object-cover rounded-lg shadow"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Lapangan Indoor</h3>
                  <p className="text-sm text-green-600 font-medium">
                    {selectedSlot.time} (60 Menit)
                  </p>
                  <p className="text-sm text-green-600 font-medium">{selectedSlot.price}</p>
                  <p className="text-xs text-gray-600">
                    {format(currentDate, 'dd/MM/yyyy')}
                  </p>
                  <label className="flex items-center gap-2 mt-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useMembership}
                      onChange={(e) => setUseMembership(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Membership?</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="font-medium text-green-600">
                    - Rp {discount.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Grand Total</span>
                  <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full py-4 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                onClick={handlePayNow}
              >
                Pay Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP ARE YOU SURE? */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-orange-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h2>
            <p className="text-lg font-semibold text-blue-600 mb-4">PERATURAN UNTUK DIPATUHI</p>

            <ol className="text-left text-sm text-gray-700 space-y-2 mb-6">
              <li>1. SELURUH PIHAK PENYEWAK HARUS MENGGUNAKAN SEPATU BADMINTON.</li>
              <li>2. Jika tidak membawa, kami juga menyediakan sewa sepatu.</li>
              <li>3. Apabila saat penyewaan, PIHAK PENYEWA TELAT LEBIH DARI 15 MENIT, AKAN MENDAPATKAN PENALTI Rp. 500.000 (LIMA RATUS RIBU RUPIAH) dan DAPAT MEMBATALKAN RESERVASI SECARA SEPIHAK.</li>
              <li>4. Pembayaran tidak bisa di REFUND, pastikan jadwal yang dipilih sudah sesuai.</li>
            </ol>

            <p className="text-sm font-semibold text-red-600 mb-6">
              MOHON DISAMPAIKAN KEPADA ANGGOTA YANG IKUT BERMAIN.
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="px-6 py-3 text-lg font-bold bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="px-6 py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleConfirm}
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP INSTRUKSI PEMBAYARAN */}
      {showPaymentPopup && selectedSlot && (
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
              onClick={handleQrisPayment}
            >
              PEMBAYARAN QRIS
            </Button>
          </div>
        </div>
      )}

      {/* POPUP BERHASIL! */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-12 h-12 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil!</h2>
            <p className="text-sm text-gray-600 mb-6">
              Transaksi booking telah berhasil
            </p>

            <Button
              variant="primary"
              size="lg"
              className="w-full py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSuccessOk}
            >
              OK
            </Button>
          </div>
        </div>
      )}

      {/* POPUP INVOICE */}
      {showInvoicePopup && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-8 border border-gray-200">
            {/* Header */}
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

            {/* Billed To + Invoice Info */}
            <div className="flex justify-between mb-6 text-sm">
              <div>
                <p className="font-bold">Billed To:</p>
                <p className="font-semibold">{customerName}</p>
                <p>{customerPhone}</p>
                <p>{customerEmail}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Invoice {invoiceNo}</p>
                <p>Date: {format(currentDate, 'dd MMMM yyyy', { locale: id })}</p>
                <p>Time: {format(new Date(), 'HH:mm:ss')}</p>
                <p className="text-green-600 font-bold">Transaksi: Success</p>
              </div>
            </div>

            {/* Tabel */}
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
                  <td className="py-2 px-1 font-mono">#{bookingId}</td>
                  <td className="py-2 px-1">{format(currentDate, 'dd-MM-yyyy')}</td>
                  <td className="py-2 px-1">60 Menit</td>
                  <td className="py-2 px-1">{startTime}</td>
                  <td className="py-2 px-1">{endTime}</td>
                  <td className="py-2 px-1 text-right">Rp {subtotal.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
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

            {/* Tombol Tutup */}
            <div className="mt-8 text-center">
              <Button
                variant="primary"
                size="lg"
                className="px-8 py-3 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCloseInvoice}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}