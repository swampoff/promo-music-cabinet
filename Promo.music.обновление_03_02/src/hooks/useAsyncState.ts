import { useState, useCallback } from 'react';

/**
 * Async State Hook
 * 
 * Универсальный хук для управления асинхронными операциями.
 * Автоматически управляет состояниями loading, error, data.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data, loading, error, execute } = useAsyncState<User[]>();
 * 
 *   useEffect(() => {
 *     execute(async () => {
 *       const response = await fetch('/api/users');
 *       return response.json();
 *     });
 *   }, []);
 * 
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *   return <UserList users={data} />;
 * }
 * ```
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export function useAsyncState<T = any>(initialData: T | null = null): AsyncState<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error('🔴 useAsyncState error:', err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
}

/**
 * Async List Hook
 * 
 * Специализированный хук для работы со списками с пагинацией.
 * 
 * @example
 * ```tsx
 * const { 
 *   items, 
 *   loading, 
 *   hasMore, 
 *   loadMore 
 * } = useAsyncList<Track>(fetchTracks);
 * ```
 */
export interface AsyncListState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function useAsyncList<T>(
  fetchFn: (page: number) => Promise<T[]>,
  pageSize: number = 20
): AsyncListState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchFn(page);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки';
      setError(errorMessage);
      
      if (import.meta.env.DEV) {
        console.error('🔴 useAsyncList error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, loading, hasMore, pageSize]);

  const refresh = useCallback(async () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchFn(1);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems(newItems);
      setPage(2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления';
      setError(errorMessage);
      
      if (import.meta.env.DEV) {
        console.error('🔴 useAsyncList refresh error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pageSize]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setError(null);
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    reset,
  };
}

export default useAsyncState;
