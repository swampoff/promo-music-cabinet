/**
 * Profile API Service
 * Сервис для работы с профилем артиста
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { getAccessToken } from '@/lib/supabase';
import type { ArtistProfile, ApiResponse } from '@/types/database';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Helper to make authenticated requests
async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    console.error(`Error in ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// PROFILE TYPES
// ============================================

export interface UpdateProfileInput {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  city?: string;
  country?: string;
  studio_address?: string;
  social_links?: Record<string, string>;
  streaming_links?: Record<string, string>;
  genres?: string[];
  influences?: string[];
  epk_url?: string;
  tech_rider_url?: string;
  hospitality_rider_url?: string;
}

export interface ProfileStats {
  total_tracks: number;
  total_videos: number;
  total_concerts: number;
  total_streams: number;
  monthly_listeners: number;
  total_fans: number;
  total_earnings: number;
}

// ============================================
// PROFILE API
// ============================================

export const profileApi = {
  // Get current user's profile
  async getMyProfile(): Promise<ApiResponse<ArtistProfile>> {
    return fetchWithAuth<ArtistProfile>('/profile');
  },

  // Get profile by ID (public)
  async getById(id: string): Promise<ApiResponse<ArtistProfile>> {
    return fetchWithAuth<ArtistProfile>(`/profile/${id}`);
  },

  // Update profile
  async update(data: UpdateProfileInput): Promise<ApiResponse<ArtistProfile>> {
    return fetchWithAuth<ArtistProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Upload avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
      },
      body: formData,
    });

    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, error: data.error };
  },

  // Upload cover image
  async uploadCover(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const accessToken = await getAccessToken();

    const response = await fetch(`${API_BASE_URL}/profile/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
      },
      body: formData,
    });

    const data = await response.json();
    return response.ok ? { success: true, data } : { success: false, error: data.error };
  },

  // Get profile stats
  async getStats(): Promise<ApiResponse<ProfileStats>> {
    return fetchWithAuth<ProfileStats>('/profile/stats');
  },

  // Update social links
  async updateSocialLinks(links: Record<string, string>): Promise<ApiResponse<ArtistProfile>> {
    return fetchWithAuth<ArtistProfile>('/profile/social-links', {
      method: 'PUT',
      body: JSON.stringify({ social_links: links }),
    });
  },

  // Update streaming links
  async updateStreamingLinks(links: Record<string, string>): Promise<ApiResponse<ArtistProfile>> {
    return fetchWithAuth<ArtistProfile>('/profile/streaming-links', {
      method: 'PUT',
      body: JSON.stringify({ streaming_links: links }),
    });
  },
};

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_PROFILE: ArtistProfile = {
  id: 'mock-profile-1',
  user_id: 'mock-user-1',
  display_name: 'Александр Иванов',
  bio: 'Электронный музыкант из Москвы. Создаю атмосферную музыку на стыке ambient и techno.',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
  cover_image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
  city: 'Москва',
  country: 'Россия',
  social_links: {
    instagram: 'https://instagram.com/alexandr_music',
    twitter: 'https://twitter.com/alexandr_music',
    telegram: 'https://t.me/alexandr_music',
    vk: 'https://vk.com/alexandr_music',
  },
  streaming_links: {
    spotify: 'https://open.spotify.com/artist/example',
    apple_music: 'https://music.apple.com/artist/example',
    yandex_music: 'https://music.yandex.ru/artist/example',
    soundcloud: 'https://soundcloud.com/alexandr_music',
  },
  genres: ['Electronic', 'Ambient', 'Techno'],
  influences: ['Aphex Twin', 'Boards of Canada', 'Jon Hopkins'],
  performance_history: [],
  total_streams: 1250000,
  monthly_listeners: 45000,
  total_fans: 12500,
  created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
};

let mockProfileStore = { ...MOCK_PROFILE };

const MOCK_STATS: ProfileStats = {
  total_tracks: 24,
  total_videos: 8,
  total_concerts: 12,
  total_streams: 1250000,
  monthly_listeners: 45000,
  total_fans: 12500,
  total_earnings: 125000,
};

// ============================================
// PROFILE API ADAPTER WITH FALLBACK
// ============================================

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await profileApi.getMyProfile();
    return response.success;
  } catch {
    return false;
  }
}

export const profileApiAdapter = {
  async getMyProfile(): Promise<ApiResponse<ArtistProfile>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return profileApi.getMyProfile();
    }
    return { success: true, data: mockProfileStore };
  },

  async getById(id: string): Promise<ApiResponse<ArtistProfile>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return profileApi.getById(id);
    }
    if (id === mockProfileStore.id || id === mockProfileStore.user_id) {
      return { success: true, data: mockProfileStore };
    }
    return { success: false, error: 'Profile not found' };
  },

  async update(data: UpdateProfileInput): Promise<ApiResponse<ArtistProfile>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return profileApi.update(data);
    }
    mockProfileStore = {
      ...mockProfileStore,
      ...data,
      updated_at: new Date().toISOString(),
    };
    return { success: true, data: mockProfileStore };
  },

  async getStats(): Promise<ApiResponse<ProfileStats>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return profileApi.getStats();
    }
    return { success: true, data: MOCK_STATS };
  },

  async updateSocialLinks(links: Record<string, string>): Promise<ApiResponse<ArtistProfile>> {
    return this.update({ social_links: links });
  },

  async updateStreamingLinks(links: Record<string, string>): Promise<ApiResponse<ArtistProfile>> {
    return this.update({ streaming_links: links });
  },

  resetMockData() {
    mockProfileStore = { ...MOCK_PROFILE };
  },
};
