/**
 * USE API QUERY
 * React хук для API запросов с кэшированием и обработкой ошибок
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse } from '@/lib/api-client';

interface UseApiQueryOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  initialData?: T;
}

interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export function useApiQuery<T>(
  queryFn: () => Promise<ApiResponse<T>>,
  options: UseApiQueryOptions<T> = {}
): UseApiQueryResult<T> {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    initialData = null,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await queryFn();

      if (!mountedRef.current) return;

      if (result.success && result.data !== undefined) {
        setData(result.data);
        onSuccess?.(result.data);
      } else {
        setIsError(true);
        setError(result.error || 'Неизвестная ошибка');
        onError?.(result.error || 'Неизвестная ошибка');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setIsError(true);
      setError(err.message || 'Ошибка запроса');
      onError?.(err.message || 'Ошибка запроса');
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [queryFn, enabled, onSuccess, onError]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const intervalId = setInterval(fetchData, refetchInterval);
    return () => clearInterval(intervalId);
  }, [refetchInterval, enabled, fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchData,
    mutate,
  };
}

// Хук для мутаций (POST, PUT, DELETE)
interface UseApiMutationOptions<T, V> {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: string, variables: V) => void;
  onSettled?: () => void;
}

interface UseApiMutationResult<T, V> {
  mutate: (variables: V) => Promise<ApiResponse<T>>;
  mutateAsync: (variables: V) => Promise<ApiResponse<T>>;
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  reset: () => void;
}

export function useApiMutation<T = any, V = any>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: UseApiMutationOptions<T, V> = {}
): UseApiMutationResult<T, V> {
  const { onSuccess, onError, onSettled } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = useCallback(async (variables: V): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await mutationFn(variables);

      if (result.success && result.data !== undefined) {
        setData(result.data);
        onSuccess?.(result.data, variables);
      } else {
        setIsError(true);
        setError(result.error || 'Ошибка');
        onError?.(result.error || 'Ошибка', variables);
      }

      return result;
    } catch (err: any) {
      setIsError(true);
      setError(err.message);
      onError?.(err.message, variables);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
      onSettled?.();
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setIsError(false);
    setError(null);
  }, []);

  return {
    mutate: mutateAsync,
    mutateAsync,
    data,
    isLoading,
    isError,
    error,
    reset,
  };
}

export default useApiQuery;
