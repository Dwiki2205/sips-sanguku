// app/owner/booking/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import BookingSearch from '@/components/booking/BookingSearch';
import BookingCalendar from '@/components/booking/BookingCalender';
import BookingDetails from '@/components/booking/BookingDetails';
import { Booking, transformBookingData, isValidBookingStatus } from '@/types/booking';

export default function OwnerBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/booking');
      const result = await response.json();
      
      if (result.success) {
        // Transform data dari API ke tipe Booking yang valid
        const transformedBookings = result.data.map((item: any) => transformBookingData(item));
        setBookings(transformedBookings);
        setFilteredBookings(transformedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!searchTerm.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter(booking =>
      booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleBookingSelect = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    // Validasi status sebelum mengirim ke API
    if (!isValidBookingStatus(newStatus)) {
      alert('Status tidak valid');
      return;
    }

    try {
      const response = await fetch(`/api/booking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state dengan validasi
        const updatedBookings = bookings.map(booking =>
          booking.booking_id === bookingId 
            ? transformBookingData({ ...booking, status: newStatus })
            : booking
        );
        setBookings(updatedBookings);
        
        if (selectedBooking?.booking_id === bookingId) {
          setSelectedBooking(transformBookingData({ ...selectedBooking, status: newStatus }));
        }
        
        router.refresh();
      } else {
        alert(result.error || 'Gagal mengupdate status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Terjadi kesalahan saat mengupdate status');
    }
  };

  // ... rest of the component remains the same
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Booking</h1>
        <Button onClick={() => router.push('/owner/booking/new')}>
          Buat Booking Baru
        </Button>
      </div>

      {/* Search Section */}
      <BookingSearch onSearch={handleSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Booking List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Calendar */}
          <BookingCalendar 
            onDateSelect={(date) => console.log('Selected date:', date)}
            unavailableDates={[]}
          />

          {/* Booking List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Daftar Booking</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.booking_id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedBooking?.booking_id === booking.booking_id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleBookingSelect(booking)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{booking.booking_id}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.tanggal_booking).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Dikonfirmasi' : 
                       booking.status === 'pending' ? 'Menunggu' : 
                       booking.status === 'cancelled' ? 'Dibatalkan' : 
                       booking.status === 'completed' ? 'Selesai' : 'Tidak Dikenal'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{booking.nama_lengkap}</p>
                </div>
              ))}
              
              {filteredBookings.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Tidak ada data booking
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Details */}
        <div className="lg:col-span-2">
          {selectedBooking ? (
            <BookingDetails 
              booking={selectedBooking}
              onStatusUpdate={handleStatusUpdate}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Booking</h3>
              <p className="text-gray-500">Pilih booking dari daftar di sebelah kiri untuk melihat detail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}