import { useState, useEffect } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Custom hook для работы с API
 * 
 * @example
 * const { data, loading, error, refetch } = useApi(
 *   () => tracksApi.getAll()
 * );
 */
export function useApi<T>(
  apiFunction: () => Promise<ApiResult<T>>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiFunction();

      if (result.success && result.data) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error || 'Unknown error',
        });
      }
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: String(error),
      });
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

/**
 * Hook для мутаций (POST, PUT, DELETE)
 * 
 * @example
 * const { mutate, loading, error } = useMutation(
 *   (data) => tracksApi.create(data)
 * );
 * 
 * // Использование
 * await mutate({ title: 'New Track' });
 */
export function useMutation<TInput, TOutput>(
  mutationFunction: (input: TInput) => Promise<ApiResult<TOutput>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (input: TInput): Promise<TOutput | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFunction(input);

      if (result.success && result.data) {
        setLoading(false);
        return result.data;
      } else {
        setError(result.error || 'Unknown error');
        setLoading(false);
        return null;
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  return {
    mutate,
    loading,
    error,
    reset: () => {
      setError(null);
      setLoading(false);
    },
  };
}
