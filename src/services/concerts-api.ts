import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { getAccessToken } from '@/lib/supabase';
import type { 
  TourDate, 
  CreateTourDateInput, 
  UpdateTourDateInput,
  PerformanceHistoryItem,
  CreatePerformanceHistoryInput,
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
// TOUR DATES (CONCERTS) API
// ============================================

export const concertsApi = {
  // Get all concerts
  async getAll(): Promise<ApiResponse<TourDate[]>> {
    return fetchWithAuth<TourDate[]>('/tour-dates');
  },

  // Get single concert
  async getById(id: string): Promise<ApiResponse<TourDate>> {
    return fetchWithAuth<TourDate>(`/tour-dates/${id}`);
  },

  // Create concert
  async create(data: CreateTourDateInput): Promise<ApiResponse<TourDate>> {
    return fetchWithAuth<TourDate>('/tour-dates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update concert
  async update(id: string, data: UpdateTourDateInput): Promise<ApiResponse<TourDate>> {
    return fetchWithAuth<TourDate>(`/tour-dates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete concert
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth<{ message: string }>(`/tour-dates/${id}`, {
      method: 'DELETE',
    });
  },

  // Submit for moderation
  async submit(id: string): Promise<ApiResponse<TourDate>> {
    return fetchWithAuth<TourDate>(`/tour-dates/${id}/submit`, {
      method: 'POST',
    });
  },

  // Promote concert
  async promote(id: string, days: number = 7): Promise<ApiResponse<TourDate>> {
    return fetchWithAuth<TourDate>(`/tour-dates/${id}/promote`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  },
};

// ============================================
// PERFORMANCE HISTORY API
// ============================================

export const performanceHistoryApi = {
  // Get all performances
  async getAll(): Promise<ApiResponse<PerformanceHistoryItem[]>> {
    return fetchWithAuth<PerformanceHistoryItem[]>('/performance-history');
  },

  // Add performance
  async add(data: CreatePerformanceHistoryInput): Promise<ApiResponse<PerformanceHistoryItem[]>> {
    return fetchWithAuth<PerformanceHistoryItem[]>('/performance-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update performance
  async update(id: string, data: Partial<CreatePerformanceHistoryInput>): Promise<ApiResponse<PerformanceHistoryItem[]>> {
    return fetchWithAuth<PerformanceHistoryItem[]>(`/performance-history/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete performance
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth<{ message: string }>(`/performance-history/${id}`, {
      method: 'DELETE',
    });
  },
};