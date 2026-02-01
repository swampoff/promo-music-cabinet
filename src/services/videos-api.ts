/**
 * Videos API Service
 * Сервис для работы с видео артиста
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { getAccessToken } from '@/lib/supabase';
import type {
  Video,
  CreateVideoInput,
  UpdateVideoInput,
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
// VIDEOS API
// ============================================

export const videosApi = {
  // Get all videos for current user
  async getAll(): Promise<ApiResponse<Video[]>> {
    return fetchWithAuth<Video[]>('/videos');
  },

  // Get single video
  async getById(id: string): Promise<ApiResponse<Video>> {
    return fetchWithAuth<Video>(`/videos/${id}`);
  },

  // Create video
  async create(data: CreateVideoInput): Promise<ApiResponse<Video>> {
    return fetchWithAuth<Video>('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update video
  async update(id: string, data: UpdateVideoInput): Promise<ApiResponse<Video>> {
    return fetchWithAuth<Video>(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete video
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth<{ message: string }>(`/videos/${id}`, {
      method: 'DELETE',
    });
  },

  // Submit for moderation
  async submit(id: string): Promise<ApiResponse<Video>> {
    return fetchWithAuth<Video>(`/videos/${id}/submit`, {
      method: 'POST',
    });
  },

  // Promote video
  async promote(id: string, days: number = 7): Promise<ApiResponse<Video>> {
    return fetchWithAuth<Video>(`/videos/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },

  // Get video analytics
  async getAnalytics(id: string, period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<ApiResponse<{
    views: number[];
    likes: number[];
    comments: number[];
    dates: string[];
  }>> {
    return fetchWithAuth(`/videos/${id}/analytics?period=${period}`);
  },

  // Increment view count
  async recordView(id: string): Promise<ApiResponse<{ views: number }>> {
    return fetchWithAuth(`/videos/${id}/view`, {
      method: 'POST',
    });
  },
};

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_VIDEOS: Video[] = [
  {
    id: 'mock-video-1',
    artist_id: 'mock-artist',
    title: 'Midnight Dreams - Official Music Video',
    description: 'Official music video for the hit single "Midnight Dreams"',
    video_type: 'music_video',
    duration: 245,
    video_url: 'https://example.com/video1.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    youtube_url: 'https://youtube.com/watch?v=example1',
    rutube_url: 'https://rutube.ru/video/example1',
    status: 'published',
    moderation_status: 'approved',
    views: 125000,
    likes: 8500,
    comments: 342,
    shares: 1200,
    is_promoted: true,
    promotion_expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    track_id: 'mock-track-1',
    tags: ['music video', 'electronic', 'visual'],
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-video-2',
    artist_id: 'mock-artist',
    title: 'Live at Moscow Arena 2026',
    description: 'Full concert recording from the Moscow Arena show',
    video_type: 'live_performance',
    duration: 5400,
    video_url: 'https://example.com/video2.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    youtube_url: 'https://youtube.com/watch?v=example2',
    status: 'published',
    moderation_status: 'approved',
    views: 45000,
    likes: 3200,
    comments: 189,
    shares: 567,
    is_promoted: false,
    tags: ['live', 'concert', 'performance'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-video-3',
    artist_id: 'mock-artist',
    title: 'Behind The Scenes - Album Recording',
    description: 'Take a look at the making of our new album',
    video_type: 'behind_scenes',
    duration: 720,
    video_url: 'https://example.com/video3.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    status: 'draft',
    moderation_status: 'draft',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    is_promoted: false,
    tags: ['behind the scenes', 'studio', 'making of'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockVideosStore = [...MOCK_VIDEOS];

// ============================================
// VIDEOS API ADAPTER WITH FALLBACK
// ============================================

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await videosApi.getAll();
    return response.success;
  } catch {
    return false;
  }
}

export const videosApiAdapter = {
  async getAll(): Promise<ApiResponse<Video[]>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.getAll();
    }
    return { success: true, data: mockVideosStore };
  },

  async getById(id: string): Promise<ApiResponse<Video>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.getById(id);
    }
    const video = mockVideosStore.find(v => v.id === id);
    return video
      ? { success: true, data: video }
      : { success: false, error: 'Video not found' };
  },

  async create(data: CreateVideoInput): Promise<ApiResponse<Video>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.create(data);
    }
    const newVideo: Video = {
      id: `mock-video-${Date.now()}`,
      artist_id: 'mock-artist',
      ...data,
      status: 'draft',
      moderation_status: 'draft',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      is_promoted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockVideosStore.push(newVideo);
    return { success: true, data: newVideo };
  },

  async update(id: string, data: UpdateVideoInput): Promise<ApiResponse<Video>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.update(id, data);
    }
    const index = mockVideosStore.findIndex(v => v.id === id);
    if (index !== -1) {
      mockVideosStore[index] = {
        ...mockVideosStore[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return { success: true, data: mockVideosStore[index] };
    }
    return { success: false, error: 'Video not found' };
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.delete(id);
    }
    const index = mockVideosStore.findIndex(v => v.id === id);
    if (index !== -1) {
      mockVideosStore.splice(index, 1);
      return { success: true, data: { message: 'Video deleted' } };
    }
    return { success: false, error: 'Video not found' };
  },

  async submit(id: string): Promise<ApiResponse<Video>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.submit(id);
    }
    return this.update(id, { moderation_status: 'pending' });
  },

  async promote(id: string, days: number = 7): Promise<ApiResponse<Video>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return videosApi.promote(id, days);
    }
    const promotionExpiresAt = new Date();
    promotionExpiresAt.setDate(promotionExpiresAt.getDate() + days);
    return this.update(id, { is_promoted: true });
  },

  resetMockData() {
    mockVideosStore = [...MOCK_VIDEOS];
  },
};
