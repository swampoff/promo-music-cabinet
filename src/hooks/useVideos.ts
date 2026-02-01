/**
 * useVideos Hook
 * React hook для работы с видео
 */

import { useState, useEffect, useCallback } from 'react';
import { videosApiAdapter } from '@/services/videos-api';
import type { Video, CreateVideoInput, UpdateVideoInput, VideoType } from '@/types/database';

interface UseVideosOptions {
  autoFetch?: boolean;
}

export function useVideos(options: UseVideosOptions = { autoFetch: true }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all videos
   */
  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.getAll();
      if (result.success && result.data) {
        setVideos(result.data);
      } else {
        setError(result.error || 'Failed to fetch videos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create video
   */
  const createVideo = useCallback(async (data: CreateVideoInput): Promise<Video | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.create(data);
      if (result.success && result.data) {
        setVideos(prev => [...prev, result.data!]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create video');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create video');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update video
   */
  const updateVideo = useCallback(async (id: string, data: UpdateVideoInput): Promise<Video | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.update(id, data);
      if (result.success && result.data) {
        setVideos(prev => prev.map(v => v.id === id ? result.data! : v));
        return result.data;
      } else {
        setError(result.error || 'Failed to update video');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete video
   */
  const deleteVideo = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.delete(id);
      if (result.success) {
        setVideos(prev => prev.filter(v => v.id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to delete video');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit video for moderation
   */
  const submitVideo = useCallback(async (id: string): Promise<Video | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.submit(id);
      if (result.success && result.data) {
        setVideos(prev => prev.map(v => v.id === id ? result.data! : v));
        return result.data;
      } else {
        setError(result.error || 'Failed to submit video');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit video');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Promote video
   */
  const promoteVideo = useCallback(async (id: string, days: number = 7): Promise<Video | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.promote(id, days);
      if (result.success && result.data) {
        setVideos(prev => prev.map(v => v.id === id ? result.data! : v));
        return result.data;
      } else {
        setError(result.error || 'Failed to promote video');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote video');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto fetch on mount
  useEffect(() => {
    if (options.autoFetch) {
      fetchVideos();
    }
  }, [options.autoFetch, fetchVideos]);

  return {
    // State
    videos,
    isLoading,
    error,

    // Actions
    fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    submitVideo,
    promoteVideo,

    // Utils
    getVideoById: (id: string) => videos.find(v => v.id === id),
    getPublishedVideos: () => videos.filter(v => v.status === 'published'),
    getDraftVideos: () => videos.filter(v => v.status === 'draft'),
    getPendingVideos: () => videos.filter(v => v.moderation_status === 'pending'),
    getVideosByType: (type: VideoType) => videos.filter(v => v.video_type === type),
    getMusicVideos: () => videos.filter(v => v.video_type === 'music_video'),
    getLivePerformances: () => videos.filter(v => v.video_type === 'live_performance'),
  };
}

/**
 * Hook for single video
 */
export function useVideo(videoId: string | null) {
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!videoId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await videosApiAdapter.getById(videoId);
      if (result.success && result.data) {
        setVideo(result.data);
      } else {
        setError(result.error || 'Video not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video');
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  return { video, isLoading, error, refetch: fetchVideo };
}
