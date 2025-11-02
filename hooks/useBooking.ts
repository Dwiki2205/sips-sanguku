import { useState, useCallback } from 'react';
import { Booking, CreateBookingData, UpdateBookingData } from '@/types/booking';
import { useAuth } from './useAuth';

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookings = useCallback(async (): Promise<Booking[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = user?.role_name === 'Pelanggan' 
        ? `/api/booking?role=pelanggan&pelanggan_id=${user.pengguna_id}`
        : '/api/booking';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBooking = useCallback(async (data: CreateBookingData): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBooking = useCallback(async (id: string, data: UpdateBookingData): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBooking = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking
  };
}