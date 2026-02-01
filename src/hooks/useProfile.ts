/**
 * useProfile Hook
 * React hook для работы с профилем артиста
 */

import { useState, useEffect, useCallback } from 'react';
import { profileApiAdapter, UpdateProfileInput, ProfileStats } from '@/services/profile-api';
import type { ArtistProfile } from '@/types/database';

interface UseProfileOptions {
  autoFetch?: boolean;
}

export function useProfile(options: UseProfileOptions = { autoFetch: true }) {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch profile
   */
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await profileApiAdapter.getMyProfile();
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const result = await profileApiAdapter.getStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(async (data: UpdateProfileInput): Promise<ArtistProfile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await profileApiAdapter.update(data);
      if (result.success && result.data) {
        setProfile(result.data);
        return result.data;
      } else {
        setError(result.error || 'Failed to update profile');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update display name
   */
  const updateDisplayName = useCallback(async (name: string) => {
    return updateProfile({ display_name: name });
  }, [updateProfile]);

  /**
   * Update bio
   */
  const updateBio = useCallback(async (bio: string) => {
    return updateProfile({ bio });
  }, [updateProfile]);

  /**
   * Update avatar
   */
  const updateAvatar = useCallback(async (url: string) => {
    return updateProfile({ avatar_url: url });
  }, [updateProfile]);

  /**
   * Update cover image
   */
  const updateCoverImage = useCallback(async (url: string) => {
    return updateProfile({ cover_image_url: url });
  }, [updateProfile]);

  /**
   * Update social links
   */
  const updateSocialLinks = useCallback(async (links: Record<string, string>) => {
    return updateProfile({ social_links: links });
  }, [updateProfile]);

  /**
   * Update streaming links
   */
  const updateStreamingLinks = useCallback(async (links: Record<string, string>) => {
    return updateProfile({ streaming_links: links });
  }, [updateProfile]);

  /**
   * Update genres
   */
  const updateGenres = useCallback(async (genres: string[]) => {
    return updateProfile({ genres });
  }, [updateProfile]);

  /**
   * Update location
   */
  const updateLocation = useCallback(async (city: string, country: string) => {
    return updateProfile({ city, country });
  }, [updateProfile]);

  // Auto fetch on mount
  useEffect(() => {
    if (options.autoFetch) {
      fetchProfile();
      fetchStats();
    }
  }, [options.autoFetch, fetchProfile, fetchStats]);

  return {
    // State
    profile,
    stats,
    isLoading,
    error,

    // Actions
    fetchProfile,
    fetchStats,
    updateProfile,
    updateDisplayName,
    updateBio,
    updateAvatar,
    updateCoverImage,
    updateSocialLinks,
    updateStreamingLinks,
    updateGenres,
    updateLocation,

    // Utils
    isProfileComplete: profile ? Boolean(
      profile.display_name &&
      profile.bio &&
      profile.avatar_url &&
      profile.genres?.length
    ) : false,
  };
}

/**
 * Hook for viewing another artist's profile
 */
export function useArtistProfile(artistId: string | null) {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!artistId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await profileApiAdapter.getById(artistId);
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error || 'Profile not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile };
}
