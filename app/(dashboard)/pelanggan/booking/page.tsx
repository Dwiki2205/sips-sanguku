'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, AlertCircle, Check, Copy, Crown } from 'lucide-react';
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Button from '@/components/ui/Button';

// Import dari file terpisah
import { baseSlots, getBaseSlots } from '@/data/timeSlotes';
import { 
  TimeSlot, 
  UserData, 
  MembershipData,
  BookingFormData 
} from '@/types/booking';

// Interface untuk response available slots
interface AvailableSlotsResponse {
  bookings: Array<{
    jam_mulai: string;
    status: string;
  }>;
}

export default function BookingPelangganPage() {
  const router = useRouter();

  // State untuk data user
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // State untuk data membership
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  // Tanggal
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
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
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [useMembership, setUseMembership] = useState(false);

  // Countdown
  const [minutes, setMinutes] = useState(28);
  const [seconds, setSeconds] = useState(59);

  // Invoice Data - SEKARANG DINAMIS
  const [bookingId, setBookingId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');

  // =============================================
  // FUNGSI BARU: LOAD DATA USER
  // =============================================
  const fetchUserData = async (): Promise<void> => {
    try {
      setUserLoading(true);
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.pengguna_id) {
          setUserData(data);
          console.log('✅ Data user loaded:', data);
          // Setelah mendapatkan user data, fetch membership data
          await fetchMembershipData(data.pengguna_id);
        } else {
          console.error('❌ Gagal load data user:', data);
          // Fallback ke data default jika perlu
          setUserData({
            pengguna_id: 'PLG001',
            nama: 'Guest User',
            username: 'guest',
            email: 'guest@example.com',
            telepon: '081234567890',
            role_name: 'pelanggan',
            permissions: [],
            tanggal_bergabung: new Date().toISOString()
          });
        }
      } else {
        console.error('❌ Response tidak ok saat load user data');
        // Fallback data
        setUserData({
          pengguna_id: 'PLG001',
          nama: 'Guest User',
          username: 'guest',
          email: 'guest@example.com',
          telepon: '081234567890',
          role_name: 'pelanggan',
          permissions: [],
          tanggal_bergabung: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      // Fallback data
      setUserData({
        pengguna_id: 'PLG001',
        nama: 'Guest User',
        username: 'guest',
        email: 'guest@example.com',
        telepon: '081234567890',
        role_name: 'pelanggan',
        permissions: [],
        tanggal_bergabung: new Date().toISOString()
      });
    } finally {
      setUserLoading(false);
    }
  };

  // =============================================
  // FUNGSI BARU: LOAD DATA MEMBERSHIP (DIUBAH SESUAI STRUCTURE ANDA)
  // =============================================
  const fetchMembershipData = async (pelangganId: string): Promise<void> => {
    try {
      setMembershipLoading(true);
      const res = await fetch(`/api/membership?pelanggan_id=${pelangganId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        console.log('📊 Response membership API:', data);
        
        if (data.success && data.data && data.data.length > 0) {
          // Ambil membership pertama dari array (yang terbaru)
          const latestMembership = data.data[0];
          
          // Cek apakah membership masih aktif berdasarkan status dan tanggal
          const isActive = latestMembership.status_keaktifan === 'active' && 
                          new Date(latestMembership.expired_date) >= new Date();
          
          if (isActive) {
            setMembershipData(latestMembership);
            console.log('✅ Data membership aktif ditemukan:', latestMembership);
          } else {
            console.log('ℹ️ Membership ditemukan tapi tidak aktif:', latestMembership);
            setMembershipData(latestMembership); // Tetap simpan data untuk info
          }
        } else {
          console.log('ℹ️ User tidak memiliki membership');
          setMembershipData(null);
        }
      } else {
        console.error('❌ Gagal load data membership, status:', res.status);
        setMembershipData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching membership data:', error);
      setMembershipData(null);
    } finally {
      setMembershipLoading(false);
    }
  };

  // =============================================
  // FUNGSI BARU: CEK APAKAH MEMBERSHIP MASIH AKTIF
  // =============================================
  const isMembershipActive = (): boolean => {
    if (!membershipData) return false;
    
    const today = new Date();
    const expiryDate = new Date(membershipData.expired_date);
    
    return membershipData.status_keaktifan === 'active' && expiryDate >= today;
  };

  // =============================================
  // FUNGSI BARU: HITUNG DISCOUNT BERDASARKAN TIER
  // =============================================
  const calculateDiscount = (): number => {
    if (!isMembershipActive() || !useMembership || !membershipData) return 0;
    
    switch (membershipData.tier_membership) {
      case 'Silver':
        return 10000; // Rp 10.000
      case 'Gold':
        return 15000; // Rp 15.000
      case 'Platinum':
        return 20000; // Rp 20.000
      default:
        return 10000;
    }
  };

  // =============================================
  // FUNGSI BARU: GET DISCOUNT LABEL
  // =============================================
  const getDiscountLabel = (): string => {
    if (!isMembershipActive()|| !membershipData) return '';
    
    switch (membershipData.tier_membership) {
      case 'Silver':
        return 'Diskon Rp 10.000';
      case 'Gold':
        return 'Diskon Rp 15.000';
      case 'Platinum':
        return 'Diskon Rp 20.000';
      default:
        return 'Diskon Membership';
    }
  };

  // =============================================
  // FUNGSI BARU: GET TIER COLOR
  // =============================================
  const getTierColor = (): string => {
    if (!membershipData) return 'gray';
    
    switch (membershipData.tier_membership) {
      case 'Silver':
        return 'gray';
      case 'Gold':
        return 'yellow';
      case 'Platinum':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // =============================================
  // FUNGSI BARU: GENERATE ID OTOMATIS
  // =============================================
  const generateBookingId = (): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000-9999
    return `BKG${randomNum}`;
  };

  const generateInvoiceNo = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-4);
    return `SLB${year}${month}${day}${time}`;
  };

  // Generate 7 hari dalam seminggu
  const getWeekDates = (): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i);
      dates.push(date);
    }
    return dates;
  };

  // Navigasi minggu
  const handlePrevWeek = (): void => {
    const prevWeek = addDays(currentWeekStart, -7);
    const weekEnd = addDays(prevWeek, 6);
    if (weekEnd >= today) {
      setCurrentWeekStart(prevWeek);
      setPage(1);
    }
  };

  const handleNextWeek = (): void => {
    const nextWeek = addDays(currentWeekStart, 7);
    setCurrentWeekStart(nextWeek);
    setPage(1);
  };

  const handleBackToToday = (): void => {
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setSelectedDate(today);
    setPage(1);
  };

  const handleDateSelect = (date: Date | undefined): void => {
    if (date && date >= today) {
      setSelectedDate(date);
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
      setCalendarOpen(false);
      setPage(1);
    }
  };

  const handleDayClick = (date: Date): void => {
    if (date >= today) {
      setSelectedDate(date);
      fetchAvailableSlots(date);
    }
  };

  // =============================================
  // FUNGSI CREATE BOOKING KE DATABASE (DIPERBAIKI)
  // =============================================
  const createBooking = async (): Promise<boolean> => {
    if (!selectedSlot || !selectedDate || !userData) {
      console.error('❌ Data tidak lengkap untuk booking');
      alert('Data tidak lengkap. Silakan login ulang.');
      return false;
    }

    try {
      // Generate ID baru setiap kali booking
      const newBookingId = generateBookingId();
      const newInvoiceNo = generateInvoiceNo();
      
      setBookingId(newBookingId);
      setInvoiceNo(newInvoiceNo);

      // Format waktu dari "08.00 - 09.00" menjadi "08:00" dan "09:00"
      const [startTime, endTime] = selectedSlot.time.split(' - ');
      
      // Konversi format waktu dari "08.00" menjadi "08:00:00"
      const formatTimeForDB = (timeStr: string): string => {
        return timeStr.replace('.', ':') + ':00';
      };

      // Hanya gunakan membership jika tersedia dan aktif
      const canUseMembership = isMembershipActive() && useMembership;
      const discountAmount = calculateDiscount();

      const bookingData: BookingFormData = {
        booking_id: newBookingId,
        pelanggan_id: userData.pengguna_id,
        tanggal_booking: format(selectedDate, 'yyyy-MM-dd'),
        jam_mulai: formatTimeForDB(startTime),
        jam_selesai: formatTimeForDB(endTime),
        status: 'confirmed',
        total_biaya: grandTotal,
        metode_pembayaran: 'QRIS',
        use_membership: canUseMembership,
        discount: discountAmount,
        membership_id: canUseMembership ? membershipData?.membership_id || null : null,
      };

      console.log('🔄 Mengirim data booking ke database:', bookingData);

      const res = await fetch('/api/booking/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        console.log('✅ Booking berhasil dibuat:', result.data);
        return true;
      } else {
        console.error('❌ Gagal membuat booking:', result.error);
        alert(`Gagal membuat booking: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating booking:', error);
      alert('Terjadi kesalahan saat membuat booking');
      return false;
    }
  };

  // MODIFIKASI: handleQrisPayment untuk save ke database
  const handleQrisPayment = async (): Promise<void> => {
    console.log('💰 Memproses pembayaran QRIS...');
    
    // Simpan booking ke database terlebih dahulu
    const bookingCreated = await createBooking();
    
    if (bookingCreated) {
      console.log('✅ Booking berhasil disimpan, menutup popup pembayaran');
      setShowPaymentPopup(false);
      setShowSuccessPopup(true);
    } else {
      console.error('❌ Gagal menyimpan booking, tetap di popup pembayaran');
    }
  };

  // FETCH REAL-TIME DARI NEON DB - MENGGUNAKAN getBaseSlots()
  const fetchAvailableSlots = async (date: Date): Promise<void> => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/booking/available?date=${dateStr}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data: AvailableSlotsResponse = await res.json();
        
        // Normalisasi format jam_mulai untuk konsistensi
        const bookedStarts = data.bookings
          .filter(b => ['pending', 'confirmed', 'paid'].includes(b.status))
          .map(b => {
            let normalizedTime = b.jam_mulai;
            if (normalizedTime.length === 5) {
              normalizedTime = `${normalizedTime}:00`;
            }
            return normalizedTime;
          });

        // Gunakan getBaseSlots() untuk mendapatkan data slots terbaru
        const currentBaseSlots = getBaseSlots();
        const updatedSlots = currentBaseSlots.map(slot => {
          const isBooked = bookedStarts.includes(slot.startHour);
          return {
            ...slot,
            booked: isBooked,
          };
        });

        const available = updatedSlots.filter(s => !s.booked).length;
        setTimeSlots(updatedSlots);
        setAvailableCount(available);
        
      } else {
        console.error('Response not OK:', res.status);
        const fallbackSlots = getBaseSlots().map(s => ({ ...s, booked: false }));
        setTimeSlots(fallbackSlots);
        setAvailableCount(fallbackSlots.length);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      const fallbackSlots = getBaseSlots().map(s => ({ ...s, booked: false }));
      setTimeSlots(fallbackSlots);
      setAvailableCount(fallbackSlots.length);
    } finally {
      setLoading(false);
    }
  };

  // LOAD DATA SAAT KOMPONEN MOUNT
  useEffect(() => {
    fetchUserData();
    fetchAvailableSlots(selectedDate);
  }, [selectedDate]);

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

  // Reset useMembership ketika membership tidak aktif
  useEffect(() => {
    if (!isMembershipActive()) {
      setUseMembership(false);
    }
  }, [membershipData]);

  // Pagination
  const startIndex = (page - 1) * slotsPerPage;
  const currentSlots = timeSlots.slice(startIndex, startIndex + slotsPerPage);
  const totalPages = Math.ceil(timeSlots.length / slotsPerPage);

  // Pilih slot
  const handleSlotClick = (slot: TimeSlot): void => {
    if (slot.booked) {
      console.log('Slot sudah dibooking, tidak bisa dipilih');
      return;
    }
    setSelectedSlot(slot);
  };

  // Buka popup detail
  const handleBookingClick = (): void => {
    if (!selectedSlot || selectedSlot.booked) {
      alert('Silakan pilih slot yang tersedia terlebih dahulu!');
      return;
    }
    
    if (!userData) {
      alert('Silakan login terlebih dahulu!');
      router.push('/');
      return;
    }
    
    setShowDetailPopup(true);
  };

  // Hitung harga
  const getPrice = (): number => {
    if (!selectedSlot) return 0;
    return parseInt(selectedSlot.price.replace(/[^0-9]/g, ''), 10);
  };

  const subtotal = getPrice();
  const discount = calculateDiscount();
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

  // OK → buka invoice
  const handleSuccessOk = (): void => {
    setShowSuccessPopup(false);
    setShowInvoicePopup(true);
  };

  // Tutup invoice dan refresh data
  const handleCloseInvoice = (): void => {
    setShowInvoicePopup(false);
    setSelectedSlot(null);
    setUseMembership(false);
    setPage(1);
    // Refresh data untuk update status slot
    fetchAvailableSlots(selectedDate);
  };

  // Salin rekening
  const handleCopyAccount = (): void => {
    navigator.clipboard.writeText('7382923827');
    alert('Nomor rekening berhasil disalin!');
  };

  // Format jam
  const [startTime, endTime] = selectedSlot?.time.split(' - ') || ['', ''];

  // Cek apakah bisa navigasi ke minggu sebelumnya
  const canGoPrev = (): boolean => {
    const weekEnd = addDays(currentWeekStart, 6);
    return weekEnd > today;
  };

  // Cek apakah hari ini ada di minggu saat ini
  const isTodayInCurrentWeek = isSameDay(today, selectedDate) || 
    getWeekDates().some(date => isToday(date));

  // Loading state untuk user data
  if (userLoading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex gap-2">
            <button 
              onClick={handlePrevWeek} 
              disabled={!canGoPrev()}
              className={`p-2 rounded-full transition ${
                !canGoPrev() 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button 
              onClick={handleBackToToday}
              disabled={isTodayInCurrentWeek}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isTodayInCurrentWeek
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Hari Ini
            </button>
          </div>

          <div className="overflow-x-auto flex gap-1 items-center">
            {getWeekDates().map((date, i) => (
              <button
                key={i}
                onClick={() => handleDayClick(date)}
                disabled={date < today}
                className={`px-2 py-2 sm:px-3 sm:py-3 rounded-xl font-medium transition min-w-[70px] sm:min-w-[80px] text-center ${
                  date < today
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isSameDay(date, selectedDate)
                    ? 'bg-blue-600 text-white shadow-md'
                    : isToday(date)
                    ? 'bg-green-100 text-green-700 border-2 border-green-400'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <div className="text-xs font-semibold">{format(date, 'EEE', { locale: id })}</div>
                <div className="text-sm font-bold">{format(date, 'd', { locale: id })}</div>
                <div className="text-xs">{format(date, 'MMM', { locale: id })}</div>
              </button>
            ))}

            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition ml-2 flex-shrink-0">
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

          <button 
            onClick={handleNextWeek} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          >
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
            <div className="mt-4 text-center">
              <p className="text-lg font-semibold text-gray-700">
                {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
              </p>
              {isToday(selectedDate) && (
                <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  Hari Ini
                </span>
              )}
              {/* Badge Membership Status */}
              {isMembershipActive() && membershipData && (
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  getTierColor() === 'gray' ? 'bg-gray-100 text-gray-800' :
                  getTierColor() === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <Crown className="w-4 h-4" />
                  <span>Member {membershipData.tier_membership}</span>
                  <span className="text-xs">(Aktif hingga {format(new Date(membershipData.expired_date), 'dd/MM/yyyy')})</span>
                </div>
              )}
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {loading ? (
                <div className="col-span-3 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Memuat slot waktu...</p>
                </div>
              ) : (
                currentSlots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => handleSlotClick(slot)}
                    disabled={slot.booked}
                    className={`p-3 rounded-lg text-center transition shadow-md relative ${
                      slot.booked
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                        : selectedSlot?.startHour === slot.startHour
                        ? 'bg-green-600 text-white ring-2 ring-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <div className="text-xs font-medium">60 Menit</div>
                    <div className="text-sm font-bold">{slot.time}</div>
                    <div className="text-xs">{slot.price}</div>
                    {slot.booked && (
                      <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-gray-700 px-2 py-1 rounded">BOOKED</span>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} - {Math.min(startIndex + slotsPerPage, timeSlots.length)} dari {timeSlots.length} slot
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(1)}
                    className={`px-3 py-1 rounded ${page === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    disabled={page === 1}
                  >
                    1
                  </button>
                  {totalPages > 1 && (
                    <button
                      onClick={() => setPage(2)}
                      className={`px-3 py-1 rounded ${page === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
                className="w-full py-5 text-lg font-bold bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleBookingClick}
                disabled={!selectedSlot || selectedSlot.booked || availableCount === 0 || !userData}
              >
                {!userData ? 'Silakan Login' : selectedSlot?.booked ? 'Slot Sudah Dibooking' : 'Booking'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* POPUP DETAIL PEMESANAN */}
      {showDetailPopup && selectedSlot && userData && (
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
              <div className="flex flex-col gap-3 sm:flex-row">
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
                    {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: id })}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    Untuk: {userData.nama}
                  </p>
                  
                  {/* CHECKBOX GUNAKAN MEMBERSHIP - HANYA MUNCUL JIKA MEMBERSHIP AKTIF */}
                  {isMembershipActive() && membershipData && (
                    <label className="flex items-center gap-2 mt-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useMembership}
                        onChange={(e) => setUseMembership(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="flex items-center gap-1">
                        <Crown className="w-4 h-4 text-purple-600" />
                        Gunakan Membership {membershipData.tier_membership} ({getDiscountLabel()})
                      </span>
                    </label>
                  )}

                  {/* INFO MEMBERSHIP JIKA TIDAK AKTIF */}
                  {membershipData && !isMembershipActive() && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="text-yellow-700">
                        Membership {membershipData.tier_membership} Anda sudah tidak aktif. 
                        Berlaku hingga: {format(new Date(membershipData.expired_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}

                  {/* INFO JIKA BELUM MEMILIKI MEMBERSHIP */}
                  {!membershipData && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <p className="text-blue-700">
                        Ingin mendapatkan diskon?{' '}
                        <button 
                          onClick={() => router.push('/membership')}
                          className="font-bold underline hover:text-blue-800"
                        >
                          Daftar Membership
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                
                {/* DISCOUNT HANYA MUNCUL JIKA MEMBERSHIP AKTIF DAN DIPILIH */}
                {useMembership && isMembershipActive() && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-purple-600" />
                      Discount Membership {membershipData?.tier_membership}
                    </span>
                    <span className="font-medium text-green-600">
                      - Rp {discount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                
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
      {showPaymentPopup && selectedSlot && userData && (
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
              <div className="flex justify-between items-center">
                <span>Bank BCA</span>
                <button
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1 text-blue-600 font-bold hover:text-blue-700"
                >
                  <Copy className="w-4 h-4" />
                  Salin Rekening
                </button>
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

      {/* POPUP INVOICE - DIPERBAIKI DENGAN DATA USER YANG SESUAI */}
      {showInvoicePopup && selectedSlot && userData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-4 md:p-8 border border-gray-200">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoice</h1>
              <p className="text-lg font-semibold text-blue-700">Sanguku.id</p>
              <p className="text-xs text-gray-600">
                Jl. Baladewa No.5, Tambak Bayan, Caturtunggal, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281
              </p>
              <p className="text-xs text-gray-600">
                Email: sangukuid@gmail.com (No Telp: 08557362816)
              </p>
            </div>

            {/* Billed To + Invoice Info - MENGGUNAKAN DATA USER YANG LOGIN */}
            <div className="flex flex-col justify-between mb-6 text-sm md:flex-row">
              <div>
                <p className="font-bold">Billed To:</p>
                <p className="font-semibold">{userData.nama}</p>
                <p>{userData.telepon}</p>
                <p>{userData.email}</p>
              </div>
              <div className="text-left mt-4 md:text-right md:mt-0">
                <p className="font-bold">Invoice {invoiceNo}</p>
                <p>Date: {format(selectedDate, 'dd MMMM yyyy', { locale: id })}</p>
                <p>Time: {format(new Date(), 'HH:mm:ss')}</p>
                <p className="text-green-600 font-bold">Transaksi: Success</p>
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-t border-b min-w-[600px]">
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
                    <td className="py-2 px-1">{format(selectedDate, 'dd-MM-yyyy')}</td>
                    <td className="py-2 px-1">60 Menit</td>
                    <td className="py-2 px-1">{startTime}</td>
                    <td className="py-2 px-1">{endTime}</td>
                    <td className="py-2 px-1 text-right">Rp {subtotal.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

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

            {/* Catatan */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">Catatan Penting:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Seluruh pihak penyewa harus menggunakan sepatu badminton</li>
                <li>• Keterlambatan lebih dari 15 menit dikenakan penalti Rp 500.000</li>
                <li>• Pembayaran tidak dapat di-refund</li>
                <li>• Harap datang 15 menit sebelum jadwal bermain</li>
              </ul>
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