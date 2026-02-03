/**
 * HOOKS INDEX
 * Централизованный экспорт всех хуков
 */

// Performance & Optimization Hooks
export { 
  useDebounce, 
  useDebouncedCallback, 
  useThrottle 
} from './useDebounce';

export type { default as UseDebounceType } from './useDebounce';

// Async State Management Hooks
export { 
  useAsyncState, 
  useAsyncList 
} from './useAsyncState';

export type { 
  AsyncState, 
  AsyncListState 
} from './useAsyncState';

// API Hooks
export { useApi } from './useApi';

/**
 * @example
 * ```tsx
 * // Performance
 * import { useDebounce, useThrottle } from '@/hooks';
 * 
 * const debouncedValue = useDebounce(searchQuery, 300);
 * const throttledValue = useThrottle(scrollPosition, 100);
 * 
 * // Async State
 * import { useAsyncState, useAsyncList } from '@/hooks';
 * 
 * const { data, loading, error, execute } = useAsyncState<User[]>();
 * const { items, loadMore, hasMore } = useAsyncList(fetchTracks);
 * ```
 */
