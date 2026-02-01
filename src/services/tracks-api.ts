/**
 * Tracks API Service
 * Сервис для работы с треками артиста
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { getAccessToken } from '@/lib/supabase';
import type {
  Track,
  CreateTrackInput,
  UpdateTrackInput,
  ApiResponse
} from '@/types/database';

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
// TRACKS API
// ============================================

export const tracksApi = {
  // Get all tracks for current user
  async getAll(): Promise<ApiResponse<Track[]>> {
    return fetchWithAuth<Track[]>('/tracks');
  },

  // Get single track
  async getById(id: string): Promise<ApiResponse<Track>> {
    return fetchWithAuth<Track>(`/tracks/${id}`);
  },

  // Create track
  async create(data: CreateTrackInput): Promise<ApiResponse<Track>> {
    return fetchWithAuth<Track>('/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update track
  async update(id: string, data: UpdateTrackInput): Promise<ApiResponse<Track>> {
    return fetchWithAuth<Track>(`/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete track
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth<{ message: string }>(`/tracks/${id}`, {
      method: 'DELETE',
    });
  },

  // Submit for moderation
  async submit(id: string): Promise<ApiResponse<Track>> {
    return fetchWithAuth<Track>(`/tracks/${id}/submit`, {
      method: 'POST',
    });
  },

  // Promote track
  async promote(id: string, days: number = 7): Promise<ApiResponse<Track>> {
    return fetchWithAuth<Track>(`/tracks/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },

  // Pitch to playlists
  async pitch(id: string, playlistIds: string[]): Promise<ApiResponse<Track>> {
    return fetchWithAuth<Track>(`/tracks/${id}/pitch`, {
      method: 'POST',
      body: JSON.stringify({ playlistIds }),
    });
  },

  // Get track analytics
  async getAnalytics(id: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<{
    plays: number[];
    downloads: number[];
    likes: number[];
    dates: string[];
  }>> {
    return fetchWithAuth(`/tracks/${id}/analytics?period=${period}`);
  },

  // Increment play count
  async recordPlay(id: string): Promise<ApiResponse<{ plays: number }>> {
    return fetchWithAuth(`/tracks/${id}/play`, {
      method: 'POST',
    });
  },
};

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_TRACKS: Track[] = [
  {
    id: 'mock-track-1',
    artist_id: 'mock-artist',
    title: 'Midnight Dreams',
    description: 'Atmospheric ambient track with deep bass',
    genre: 'Electronic',
    mood: 'Chill',
    bpm: 120,
    key: 'Am',
    duration: 245,
    audio_url: 'https://example.com/track1.mp3',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    status: 'published',
    moderation_status: 'approved',
    release_date: '2026-01-15',
    plays: 15420,
    downloads: 342,
    likes: 890,
    shares: 156,
    is_pitched: true,
    pitched_playlists: ['Chill Vibes', 'Night Drive'],
    is_promoted: false,
    is_free: false,
    price: 99,
    tags: ['electronic', 'ambient', 'chill'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-track-2',
    artist_id: 'mock-artist',
    title: 'Electric Sunrise',
    description: 'Energetic techno track for festivals',
    genre: 'Techno',
    mood: 'Energetic',
    bpm: 138,
    key: 'Dm',
    duration: 312,
    audio_url: 'https://example.com/track2.mp3',
    cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    status: 'published',
    moderation_status: 'approved',
    release_date: '2026-01-10',
    plays: 8920,
    downloads: 189,
    likes: 567,
    shares: 89,
    is_pitched: false,
    is_promoted: true,
    promotion_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_free: true,
    tags: ['techno', 'festival', 'dance'],
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockTracksStore = [...MOCK_TRACKS];

// ============================================
// TRACKS API ADAPTER WITH FALLBACK
// ============================================

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await tracksApi.getAll();
    return response.success;
  } catch {
    return false;
  }
}

export const tracksApiAdapter = {
  async getAll(): Promise<ApiResponse<Track[]>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.getAll();
    }
    return { success: true, data: mockTracksStore };
  },

  async getById(id: string): Promise<ApiResponse<Track>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.getById(id);
    }
    const track = mockTracksStore.find(t => t.id === id);
    return track
      ? { success: true, data: track }
      : { success: false, error: 'Track not found' };
  },

  async create(data: CreateTrackInput): Promise<ApiResponse<Track>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.create(data);
    }
    const newTrack: Track = {
      id: `mock-track-${Date.now()}`,
      artist_id: 'mock-artist',
      ...data,
      status: 'draft',
      moderation_status: 'draft',
      plays: 0,
      downloads: 0,
      likes: 0,
      shares: 0,
      is_pitched: false,
      is_promoted: false,
      is_free: data.is_free ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockTracksStore.push(newTrack);
    return { success: true, data: newTrack };
  },

  async update(id: string, data: UpdateTrackInput): Promise<ApiResponse<Track>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.update(id, data);
    }
    const index = mockTracksStore.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTracksStore[index] = {
        ...mockTracksStore[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: mockTracksStore[index] };
    }
    return { success: false, error: 'Track not found' };
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.delete(id);
    }
    const index = mockTracksStore.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTracksStore.splice(index, 1);
      return { success: true, data: { message: 'Track deleted' } };
    }
    return { success: false, error: 'Track not found' };
  },

  async submit(id: string): Promise<ApiResponse<Track>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.submit(id);
    }
    return this.update(id, { moderation_status: 'pending' });
  },

  async promote(id: string, days: number = 7): Promise<ApiResponse<Track>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return tracksApi.promote(id, days);
    }
    const promotionExpiresAt = new Date();
    promotionExpiresAt.setDate(promotionExpiresAt.getDate() + days);
    return this.update(id, {
      is_promoted: true,
    });
  },

  resetMockData() {
    mockTracksStore = [...MOCK_TRACKS];
  },
};
