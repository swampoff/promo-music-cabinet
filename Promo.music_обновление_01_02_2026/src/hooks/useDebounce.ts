import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * 
 * Задерживает обновление значения на указанное время.
 * Полезно для оптимизации поисковых запросов и частых обновлений.
 * 
 * @param value - Значение для дебаунса
 * @param delay - Задержка в миллисекундах (по умолчанию 500мс)
 * @returns Дебаунсированное значение
 * 
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * 
 * useEffect(() => {
 *   // Вызывается только через 300мс после последнего изменения
 *   fetchResults(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Создаем таймер для обновления значения
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при каждом изменении value или delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback Hook
 * 
 * Создает дебаунсированную версию колбэка.
 * 
 * @param callback - Функция для дебаунса
 * @param delay - Задержка в миллисекундах
 * @returns Дебаунсированная функция
 * 
 * @example
 * ```tsx
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 300);
 * 
 * <input onChange={(e) => handleSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Очищаем предыдущий таймер
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Создаем новый таймер
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * useThrottle Hook
 * 
 * Ограничивает частоту обновления значения.
 * В отличие от debounce, throttle гарантирует вызов хотя бы раз в указанный интервал.
 * 
 * @param value - Значение для троттлинга
 * @param interval - Интервал в миллисекундах (по умолчанию 500мс)
 * @returns Троттлированное значение
 * 
 * @example
 * ```tsx
 * const [scrollPosition, setScrollPosition] = useState(0);
 * const throttledScroll = useThrottle(scrollPosition, 100);
 * 
 * useEffect(() => {
 *   // Вызывается максимум раз в 100мс
 *   updateScrollIndicator(throttledScroll);
 * }, [throttledScroll]);
 * ```
 */
export function useThrottle<T>(value: T, interval: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastExecuted, setLastExecuted] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted;

    if (timeSinceLastExecution >= interval) {
      setThrottledValue(value);
      setLastExecuted(now);
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        setLastExecuted(Date.now());
      }, interval - timeSinceLastExecution);

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval, lastExecuted]);

  return throttledValue;
}

export default useDebounce;
