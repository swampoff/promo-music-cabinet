/**
 * useConcerts Hook
 * React hook для работы с концертами
 */

import { useState, useEffect, useCallback } from 'react';
import { concertsApiAdapter } from '@/services/concerts-api-adapter';
import type { TourDate, CreateTourDateInput, UpdateTourDateInput } from '@/types/database';

interface UseConcertsOptions {
  autoFetch?: boolean;
}

export function useConcerts(options: UseConcertsOptions = { autoFetch: true }) {
  const [concerts, setConcerts] = useState<TourDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all concerts
   */
  const fetchConcerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.getAll();
      if (result.success && result.data) {
        setConcerts(result.data);
      } else {
        setError(result.error || 'Failed to fetch concerts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch concerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create concert
   */
  const createConcert = useCallback(async (data: CreateTourDateInput): Promise<TourDate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.create(data);
      if (result.success && result.data) {
        setConcerts(prev => [...prev, result.data!]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create concert');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create concert');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update concert
   */
  const updateConcert = useCallback(async (id: string, data: UpdateTourDateInput): Promise<TourDate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.update(id, data);
      if (result.success && result.data) {
        setConcerts(prev => prev.map(c => c.id === id ? result.data! : c));
        return result.data;
      } else {
        setError(result.error || 'Failed to update concert');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update concert');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete concert
   */
  const deleteConcert = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.delete(id);
      if (result.success) {
        setConcerts(prev => prev.filter(c => c.id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to delete concert');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete concert');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit concert for moderation
   */
  const submitConcert = useCallback(async (id: string): Promise<TourDate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.submit(id);
      if (result.success && result.data) {
        setConcerts(prev => prev.map(c => c.id === id ? result.data! : c));
        return result.data;
      } else {
        setError(result.error || 'Failed to submit concert');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit concert');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Promote concert
   */
  const promoteConcert = useCallback(async (id: string, days: number = 7): Promise<TourDate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.promote(id, days);
      if (result.success && result.data) {
        setConcerts(prev => prev.map(c => c.id === id ? result.data! : c));
        return result.data;
      } else {
        setError(result.error || 'Failed to promote concert');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote concert');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (options.autoFetch) {
      fetchConcerts();
    }
  }, [options.autoFetch, fetchConcerts]);

  return {
    // State
    concerts,
    isLoading,
    error,

    // Actions
    fetchConcerts,
    createConcert,
    updateConcert,
    deleteConcert,
    submitConcert,
    promoteConcert,

    // Utils
    getConcertById: (id: string) => concerts.find(c => c.id === id),
    getUpcomingConcerts: () => concerts.filter(c => new Date(c.date) >= new Date()),
    getPastConcerts: () => concerts.filter(c => new Date(c.date) < new Date()),
    getApprovedConcerts: () => concerts.filter(c => c.moderation_status === 'approved'),
    getPromotedConcerts: () => concerts.filter(c => c.is_promoted),
    getDraftConcerts: () => concerts.filter(c => c.moderation_status === 'draft'),
    getPendingConcerts: () => concerts.filter(c => c.moderation_status === 'pending'),
  };
}

/**
 * Hook for single concert
 */
export function useConcert(concertId: string | null) {
  const [concert, setConcert] = useState<TourDate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConcert = useCallback(async () => {
    if (!concertId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await concertsApiAdapter.getById(concertId);
      if (result.success && result.data) {
        setConcert(result.data);
      } else {
        setError(result.error || 'Concert not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch concert');
    } finally {
      setIsLoading(false);
    }
  }, [concertId]);

  useEffect(() => {
    fetchConcert();
  }, [fetchConcert]);

  return { concert, isLoading, error, refetch: fetchConcert };
}
