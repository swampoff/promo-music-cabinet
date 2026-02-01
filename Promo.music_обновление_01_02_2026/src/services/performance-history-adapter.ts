import type { PerformanceHistoryItem } from '@/types/database';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Helper for API requests
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

    return { success: true, data: data.data };
  } catch (error) {
    console.error('Performance History API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get all performance history items for the current artist
 */
export async function getPerformanceHistory(): Promise<{
  success: boolean;
  data?: PerformanceHistoryItem[];
  error?: string;
}> {
  return apiRequest<PerformanceHistoryItem[]>('/performance-history', {
    method: 'GET',
  });
}

/**
 * Add a new performance to history
 */
export async function addPerformanceHistory(
  performance: Omit<PerformanceHistoryItem, 'id'>
): Promise<{
  success: boolean;
  data?: PerformanceHistoryItem[];
  error?: string;
}> {
  return apiRequest<PerformanceHistoryItem[]>('/performance-history', {
    method: 'POST',
    body: JSON.stringify(performance),
  });
}

/**
 * Update an existing performance in history
 */
export async function updatePerformanceHistory(
  performanceId: string,
  updates: Partial<PerformanceHistoryItem>
): Promise<{
  success: boolean;
  data?: PerformanceHistoryItem[];
  error?: string;
}> {
  return apiRequest<PerformanceHistoryItem[]>(
    `/performance-history/${performanceId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    }
  );
}

/**
 * Delete a performance from history
 */
export async function deletePerformanceHistory(
  performanceId: string
): Promise<{
  success: boolean;
  data?: PerformanceHistoryItem[];
  error?: string;
}> {
  return apiRequest<PerformanceHistoryItem[]>(
    `/performance-history/${performanceId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Calculate statistics from performance history
 */
export function calculatePerformanceStats(
  history: PerformanceHistoryItem[]
): {
  totalPerformances: number;
  totalAudience: number;
  uniqueCities: number;
  uniqueVenues: number;
  eventTypes: Record<string, number>;
} {
  return {
    totalPerformances: history.length,
    totalAudience: history.reduce((sum, perf) => sum + (perf.audience_size || 0), 0),
    uniqueCities: new Set(history.map(perf => perf.city)).size,
    uniqueVenues: new Set(history.map(perf => perf.venue_name)).size,
    eventTypes: history.reduce((acc, perf) => {
      acc[perf.type] = (acc[perf.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}