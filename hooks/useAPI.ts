import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const result = await response.json();

      if (response.ok) {
        setState({ data: result, loading: false, error: null });
        return result;
      } else {
        throw new Error(result.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    clearError
  };
}