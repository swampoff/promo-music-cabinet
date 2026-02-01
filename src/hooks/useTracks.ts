/**
 * useTracks Hook
 * React hook для работы с треками
 */

import { useState, useEffect, useCallback } from 'react';
import { tracksApiAdapter } from '@/services/tracks-api';
import type { Track, CreateTrackInput, UpdateTrackInput } from '@/types/database';

interface UseTracksOptions {
  autoFetch?: boolean;
}

export function useTracks(options: UseTracksOptions = { autoFetch: true }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all tracks
   */
  const fetchTracks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.getAll();
      if (result.success && result.data) {
        setTracks(result.data);
      } else {
        setError(result.error || 'Failed to fetch tracks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create track
   */
  const createTrack = useCallback(async (data: CreateTrackInput): Promise<Track | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.create(data);
      if (result.success && result.data) {
        setTracks(prev => [...prev, result.data!]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create track');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create track');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update track
   */
  const updateTrack = useCallback(async (id: string, data: UpdateTrackInput): Promise<Track | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.update(id, data);
      if (result.success && result.data) {
        setTracks(prev => prev.map(t => t.id === id ? result.data! : t));
        return result.data;
      } else {
        setError(result.error || 'Failed to update track');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update track');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete track
   */
  const deleteTrack = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.delete(id);
      if (result.success) {
        setTracks(prev => prev.filter(t => t.id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to delete track');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete track');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit track for moderation
   */
  const submitTrack = useCallback(async (id: string): Promise<Track | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.submit(id);
      if (result.success && result.data) {
        setTracks(prev => prev.map(t => t.id === id ? result.data! : t));
        return result.data;
      } else {
        setError(result.error || 'Failed to submit track');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit track');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Promote track
   */
  const promoteTrack = useCallback(async (id: string, days: number = 7): Promise<Track | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.promote(id, days);
      if (result.success && result.data) {
        setTracks(prev => prev.map(t => t.id === id ? result.data! : t));
        return result.data;
      } else {
        setError(result.error || 'Failed to promote track');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote track');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (options.autoFetch) {
      fetchTracks();
    }
  }, [options.autoFetch, fetchTracks]);

  return {
    // State
    tracks,
    isLoading,
    error,

    // Actions
    fetchTracks,
    createTrack,
    updateTrack,
    deleteTrack,
    submitTrack,
    promoteTrack,

    // Utils
    getTrackById: (id: string) => tracks.find(t => t.id === id),
    getPublishedTracks: () => tracks.filter(t => t.status === 'published'),
    getDraftTracks: () => tracks.filter(t => t.status === 'draft'),
    getPendingTracks: () => tracks.filter(t => t.moderation_status === 'pending'),
  };
}

/**
 * Hook for single track
 */
export function useTrack(trackId: string | null) {
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = useCallback(async () => {
    if (!trackId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await tracksApiAdapter.getById(trackId);
      if (result.success && result.data) {
        setTrack(result.data);
      } else {
        setError(result.error || 'Track not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch track');
    } finally {
      setIsLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  return { track, isLoading, error, refetch: fetchTrack };
}
