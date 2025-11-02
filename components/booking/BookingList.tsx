'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Booking } from '@/types/booking';
import { useAuth } from '@/context/AuthContext';

interface BookingListProps {
  onEdit?: (booking: Booking) => void;
  onDelete?: (bookingId: string) => void;
  showActions?: boolean;
}

export default function BookingList({ onEdit, onDelete, showActions = true }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const url = user?.role_name === 'Pelanggan' 
        ? `/api/booking?role=pelanggan&pelanggan_id=${user.pengguna_id}`
        : '/api/booking';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID Booking</TableHead>
            <TableHead>Nama Pelanggan</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Jam</TableHead>
            <TableHead>Total Biaya</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead>Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.booking_id}>
              <TableCell className="font-medium">{booking.booking_id}</TableCell>
              <TableCell>{booking.nama_lengkap}</TableCell>
              <TableCell>
                {new Date(booking.tanggal_booking).toLocaleDateString('id-ID')}
              </TableCell>
              <TableCell>
                {booking.jam_mulai} - {booking.jam_selesai}
              </TableCell>
              <TableCell>
                Rp {booking.total_biaya.toLocaleString('id-ID')}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status === 'confirmed' ? 'Dikonfirmasi' : 
                   booking.status === 'pending' ? 'Menunggu' : 
                   booking.status === 'cancelled' ? 'Dibatalkan' : booking.status}
                </span>
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex space-x-2">
                    {user?.role_name === 'Owner' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit?.(booking)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onDelete?.(booking.booking_id)}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {bookings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Tidak ada data booking
        </div>
      )}
    </div>
  );
}