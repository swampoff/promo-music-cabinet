import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api`;

// Get user ID from localStorage or use demo user
function getUserId(): string {
  return localStorage.getItem('promo-music-user-id') || 'demo-user';
}

// Base fetch wrapper with auth headers
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-User-Id': getUserId(),
        ...options.headers,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, result);
      return { success: false, error: result.error || 'Request failed' };
    }

    return result;
  } catch (error) {
    console.error(`API Network Error [${endpoint}]:`, error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// TRACKS API
// ============================================

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: number;
  coverUrl?: string;
  audioUrl?: string;
  plays: number;
  likes: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const tracksApi = {
  getAll: () => apiRequest<Track[]>('/tracks'),
  
  getById: (id: string) => apiRequest<Track>(`/tracks/${id}`),
  
  create: (track: Partial<Track>) => 
    apiRequest<Track>('/tracks', {
      method: 'POST',
      body: JSON.stringify(track),
    }),
  
  update: (id: string, track: Partial<Track>) =>
    apiRequest<Track>(`/tracks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(track),
    }),
  
  delete: (id: string) =>
    apiRequest(`/tracks/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================
// ANALYTICS API
// ============================================

export interface TrackAnalytics {
  trackId: string;
  plays: number;
  likes: number;
  downloads: number;
  shares: number;
  comments: number;
  dailyStats: Array<{
    date: string;
    plays: number;
    likes: number;
  }>;
}

export const analyticsApi = {
  getTrackAnalytics: (trackId: string) =>
    apiRequest<TrackAnalytics>(`/analytics/track/${trackId}`),
  
  recordPlay: (trackId: string) =>
    apiRequest<TrackAnalytics>(`/analytics/track/${trackId}/play`, {
      method: 'POST',
    }),
};

// ============================================
// CONCERTS API
// ============================================

export interface Concert {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  time?: string;
  ticketPrice?: number;
  ticketUrl?: string;
  imageUrl?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const concertsApi = {
  getAll: () => apiRequest<Concert[]>('/concerts'),
  
  create: (concert: Partial<Concert>) =>
    apiRequest<Concert>('/concerts', {
      method: 'POST',
      body: JSON.stringify(concert),
    }),
};

// ============================================
// VIDEOS API
// ============================================

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  views: number;
  likes: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const videosApi = {
  getAll: () => apiRequest<Video[]>('/videos'),
  
  create: (video: Partial<Video>) =>
    apiRequest<Video>('/videos', {
      method: 'POST',
      body: JSON.stringify(video),
    }),
};

// ============================================
// NEWS API
// ============================================

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const newsApi = {
  getAll: () => apiRequest<News[]>('/news'),
  
  create: (news: Partial<News>) =>
    apiRequest<News>('/news', {
      method: 'POST',
      body: JSON.stringify(news),
    }),
};

// ============================================
// DONATIONS API
// ============================================

export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  message?: string;
  artistId: string;
  createdAt: string;
  status: string;
}

export const donationsApi = {
  getAll: () => apiRequest<Donation[]>('/donations'),
  
  create: (donation: Partial<Donation>) =>
    apiRequest<Donation>('/donations', {
      method: 'POST',
      body: JSON.stringify(donation),
    }),
};

// ============================================
// COINS API
// ============================================

export interface CoinsBalance {
  balance: number;
  userId: string;
}

export interface CoinsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'spend' | 'reward';
  description: string;
  createdAt: string;
}

export const coinsApi = {
  getBalance: () => apiRequest<CoinsBalance>('/coins/balance'),
  
  getTransactions: () => apiRequest<CoinsTransaction[]>('/coins/transactions'),
  
  addTransaction: (transaction: Partial<CoinsTransaction>) =>
    apiRequest<{ transaction: CoinsTransaction; balance: number }>('/coins/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),
};

// ============================================
// PROFILE API
// ============================================

export interface Profile {
  userId: string;
  name: string;
  avatar?: string;
  bio?: string;
  subscribers: number;
  totalPlays: number;
  totalTracks: number;
  updatedAt?: string;
}

export const profileApi = {
  get: () => apiRequest<Profile>('/profile'),
  
  update: (profile: Partial<Profile>) =>
    apiRequest<Profile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
};

// ============================================
// STATS API
// ============================================

export interface DashboardStats {
  totalPlays: number;
  totalLikes: number;
  totalDownloads: number;
  tracksCount: number;
  coinsBalance: number;
  donationsCount: number;
  totalDonations: number;
  updatedAt: string;
}

export const statsApi = {
  getDashboard: () => apiRequest<DashboardStats>('/stats/dashboard'),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function setUserId(userId: string) {
  localStorage.setItem('promo-music-user-id', userId);
}

export function clearUserId() {
  localStorage.removeItem('promo-music-user-id');
}

// Health check
export async function checkApiHealth() {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-84730125/health`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', error: String(error) };
  }
}
