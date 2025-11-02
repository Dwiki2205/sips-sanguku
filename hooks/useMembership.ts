import { useState, useCallback } from 'react';
import { Membership, CreateMembershipData } from '@/types/membership';
import { useAuth } from './useAuth';

export function useMembership() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMemberships = useCallback(async (): Promise<Membership[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = user?.role_name === 'Pelanggan' 
        ? `/api/membership?role=pelanggan&pelanggan_id=${user.pengguna_id}`
        : '/api/membership';
      
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

  const createMembership = useCallback(async (data: CreateMembershipData): Promise<Membership | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/membership', {
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

  const updateMembership = useCallback(async (id: string, data: Partial<CreateMembershipData>): Promise<Membership | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/membership/${id}`, {
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

  const deleteMembership = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/membership/${id}`, {
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
    fetchMemberships,
    createMembership,
    updateMembership,
    deleteMembership
  };
}