/**
 * API CLIENT
 * Централизованный клиент для всех API запросов
 * С обработкой ошибок, retry логикой и типизацией
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { supabase } from '@/utils/supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Типы ответов API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}

// Конфигурация запроса
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: number;
}

// Получить access token из текущей сессии
async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

// Получить user ID из текущей сессии
async function getUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

// Основная функция запроса
async function request<T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeout = 30000,
    retry = 1,
  } = config;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Получить токен авторизации
  const accessToken = await getAccessToken();
  const userId = await getUserId();

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Добавить авторизацию если есть токен
  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  } else {
    requestHeaders['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  // Добавить user ID
  if (userId) {
    requestHeaders['X-User-Id'] = userId;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retry; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Парсим ответ
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      // Если API возвращает { success, data, error }
      if (typeof data.success === 'boolean') {
        return data;
      }

      // Иначе оборачиваем в стандартный формат
      return {
        success: true,
        data,
      };
    } catch (err: any) {
      lastError = err;

      if (err.name === 'AbortError') {
        return {
          success: false,
          error: 'Превышено время ожидания запроса',
        };
      }

      // Ждем перед повторной попыткой
      if (attempt < retry - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  clearTimeout(timeoutId);

  return {
    success: false,
    error: lastError?.message || 'Ошибка сети',
  };
}

// ============================================
// API МЕТОДЫ
// ============================================

export const api = {
  // -------- TRACKS --------
  tracks: {
    list: () => request<any[]>('/api/tracks'),
    get: (id: string) => request<any>(`/api/tracks/${id}`),
    create: (data: any) => request('/api/tracks', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/api/tracks/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/api/tracks/${id}`, { method: 'DELETE' }),
  },

  // -------- VIDEOS --------
  videos: {
    list: () => request<any[]>('/api/videos'),
    get: (id: string) => request<any>(`/api/videos/${id}`),
    create: (data: any) => request('/api/videos', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/api/videos/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/api/videos/${id}`, { method: 'DELETE' }),
  },

  // -------- NEWS --------
  news: {
    list: () => request<any[]>('/api/news'),
    get: (id: string) => request<any>(`/api/news/${id}`),
    create: (data: any) => request('/api/news', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/api/news/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/api/news/${id}`, { method: 'DELETE' }),
  },

  // -------- CONCERTS --------
  concerts: {
    list: () => request<any[]>('/concerts/tour-dates'),
    get: (id: string) => request<any>(`/concerts/tour-dates/${id}`),
    create: (data: any) => request('/concerts/tour-dates', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/concerts/tour-dates/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/concerts/tour-dates/${id}`, { method: 'DELETE' }),
    submit: (id: string) => request(`/concerts/submit/${id}`, { method: 'POST' }),
    promote: (id: string, data: any) => request(`/concerts/promote/${id}`, { method: 'POST', body: data }),
  },

  // -------- DONATIONS --------
  donations: {
    list: () => request<any[]>('/api/donations'),
    stats: () => request('/api/donations/stats'),
    create: (data: any) => request('/api/donations', { method: 'POST', body: data }),
  },

  // -------- PROFILE --------
  profile: {
    get: () => request('/api/profile'),
    update: (data: any) => request('/api/profile', { method: 'PUT', body: data }),
  },

  // -------- SUBSCRIPTIONS --------
  subscriptions: {
    get: (userId: string) => request(`/subscriptions/${userId}`),
    plans: () => request('/subscriptions/plans'),
    subscribe: (plan: string) => request('/subscriptions/subscribe', { method: 'POST', body: { plan } }),
    cancel: (userId: string) => request(`/subscriptions/${userId}/cancel`, { method: 'POST' }),
    checkLimit: (userId: string, type: string) => request(`/subscriptions/${userId}/check-limit/${type}`),
  },

  // -------- PAYMENTS --------
  payments: {
    transactions: () => request<any[]>('/payments/transactions'),
    balance: () => request('/payments/balance'),
    stats: () => request('/payments/stats'),
    methods: () => request<any[]>('/payments/payment-methods'),
    addMethod: (data: any) => request('/payments/payment-methods', { method: 'POST', body: data }),
    withdraw: (data: any) => request('/payments/withdrawals', { method: 'POST', body: data }),
  },

  // -------- COINS --------
  coins: {
    balance: () => request('/api/coins/balance'),
    packages: () => request<any[]>('/api/coins/packages'),
    purchase: (packageId: string) => request('/api/coins/purchase', { method: 'POST', body: { packageId } }),
    transactions: () => request<any[]>('/api/coins/transactions'),
  },

  // -------- BANNERS --------
  banners: {
    list: () => request<any[]>('/banner/my-ads'),
    get: (id: string) => request(`/banner/${id}`),
    create: (data: any) => request('/banner/submit', { method: 'POST', body: data }),
    update: (id: string, data: any) => request(`/banner/manage/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) => request(`/banner/manage/${id}`, { method: 'DELETE' }),
    analytics: (id: string) => request(`/banner/analytics/${id}`),
    active: () => request<any[]>('/banner/active'),
  },

  // -------- NOTIFICATIONS --------
  notifications: {
    list: () => request<any[]>('/notifications/list'),
    markRead: (id: string) => request(`/notifications/mark-read/${id}`, { method: 'POST' }),
    markAllRead: () => request('/notifications/mark-all-read', { method: 'POST' }),
    send: (data: any) => request('/notifications/send', { method: 'POST', body: data }),
  },

  // -------- ANALYTICS --------
  analytics: {
    dashboard: () => request('/stats/dashboard'),
    track: (id: string) => request(`/api/analytics/track/${id}`),
  },

  // -------- EMAIL --------
  email: {
    templates: () => request<any[]>('/email/templates'),
    send: (data: any) => request('/email/send', { method: 'POST', body: data }),
    campaigns: () => request<any[]>('/email/campaigns'),
    createCampaign: (data: any) => request('/email/campaigns', { method: 'POST', body: data }),
  },

  // -------- STORAGE --------
  storage: {
    buckets: () => request('/storage/buckets'),
    upload: async (bucket: string, file: File, path?: string): Promise<ApiResponse<{ url: string }>> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      if (path) formData.append('path', path);

      const accessToken = await getAccessToken();
      const userId = await getUserId();

      try {
        const response = await fetch(`${API_BASE_URL}/storage/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken || publicAnonKey}`,
            ...(userId ? { 'X-User-Id': userId } : {}),
          },
          body: formData,
        });

        const data = await response.json();
        return data;
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
    delete: (bucket: string, path: string) => request('/storage/delete', {
      method: 'DELETE',
      body: { bucket, path }
    }),
  },

  // -------- PROMOTION --------
  promotion: {
    pitching: {
      submit: (data: any) => request('/promotion/pitching/submit', { method: 'POST', body: data }),
      list: () => request<any[]>('/promotion/pitching/list'),
    },
    production: {
      create: (data: any) => request('/promotion/production/create', { method: 'POST', body: data }),
    },
    marketing: {
      campaign: (data: any) => request('/promotion/marketing/campaign', { method: 'POST', body: data }),
    },
    media: {
      outreach: (data: any) => request('/promotion/media/outreach', { method: 'POST', body: data }),
    },
    event: {
      create: (data: any) => request('/promotion/event/create', { method: 'POST', body: data }),
    },
  },

  // -------- MESSAGES --------
  messages: {
    conversations: () => request<any[]>('/notifications-messenger/conversations'),
    messages: (conversationId: string) => request<any[]>(`/notifications-messenger/messages/${conversationId}`),
    send: (data: any) => request('/notifications-messenger/send', { method: 'POST', body: data }),
  },

  // -------- HEALTH --------
  health: () => request('/health'),
};

export default api;
