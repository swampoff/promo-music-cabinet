/**
 * Notifications API Service
 * Сервис для работы с уведомлениями пользователя
 */

import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { getAccessToken } from '@/lib/supabase';
import type {
  Notification,
  NotificationPreferences,
  NotificationType,
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
// NOTIFICATIONS API
// ============================================

export const notificationsApi = {
  // Get all notifications
  async getAll(params?: {
    type?: NotificationType;
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.unread_only) queryParams.append('unread_only', 'true');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchWithAuth<Notification[]>(`/notifications${query ? `?${query}` : ''}`);
  },

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return fetchWithAuth<{ count: number }>('/notifications/unread-count');
  },

  // Mark as read
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return fetchWithAuth<Notification>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  // Mark all as read
  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    return fetchWithAuth<{ count: number }>('/notifications/read-all', {
      method: 'POST',
    });
  },

  // Delete notification
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return fetchWithAuth<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // Get preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return fetchWithAuth<NotificationPreferences>('/notifications/preferences');
  },

  // Update preferences
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    return fetchWithAuth<NotificationPreferences>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'mock-notif-1',
    user_id: 'mock-user',
    type: 'moderation',
    title: 'Трек одобрен',
    message: 'Ваш трек "Midnight Dreams" прошёл модерацию и опубликован',
    priority: 'normal',
    is_read: false,
    entity_type: 'track',
    entity_id: 'mock-track-1',
    action_url: '/tracks/mock-track-1',
    action_label: 'Посмотреть',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 'mock-notif-2',
    user_id: 'mock-user',
    type: 'analytics',
    title: 'Новый рекорд!',
    message: 'Ваш трек набрал 10,000 прослушиваний',
    priority: 'high',
    is_read: false,
    entity_type: 'track',
    entity_id: 'mock-track-2',
    metadata: { plays: 10000 },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
  {
    id: 'mock-notif-3',
    user_id: 'mock-user',
    type: 'payment',
    title: 'Платёж получен',
    message: 'Получен платёж на сумму 1,500 ₽ за продвижение',
    priority: 'normal',
    is_read: true,
    entity_type: 'payment',
    entity_id: 'mock-payment-1',
    action_url: '/payments/mock-payment-1',
    action_label: 'Детали',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-notif-4',
    user_id: 'mock-user',
    type: 'concert',
    title: 'Напоминание о концерте',
    message: 'До вашего концерта в Москве осталось 3 дня',
    priority: 'high',
    is_read: false,
    entity_type: 'concert',
    entity_id: 'mock-concert-1',
    action_url: '/concerts/mock-concert-1',
    action_label: 'Подготовиться',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'mock-notif-5',
    user_id: 'mock-user',
    type: 'achievement',
    title: 'Достижение разблокировано!',
    message: 'Вы получили значок "Первый релиз"',
    priority: 'normal',
    is_read: true,
    metadata: { badge: 'first_release', icon: '🎵' },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    read_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-notif-6',
    user_id: 'mock-user',
    type: 'subscription',
    title: 'Подписка скоро истекает',
    message: 'Ваша Pro подписка истекает через 7 дней. Продлите, чтобы не потерять доступ.',
    priority: 'urgent',
    is_read: false,
    action_url: '/settings/subscription',
    action_label: 'Продлить',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-notif-7',
    user_id: 'mock-user',
    type: 'system',
    title: 'Обновление платформы',
    message: 'Мы добавили новые функции аналитики. Узнайте больше!',
    priority: 'low',
    is_read: true,
    action_url: '/changelog',
    action_label: 'Что нового',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    read_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_PREFERENCES: NotificationPreferences = {
  email_notifications: true,
  push_notifications: true,
  system: true,
  moderation: true,
  achievement: true,
  analytics: true,
  promotion: true,
  payment: true,
  subscription: true,
  concert: true,
  release: true,
  collaboration: true,
  daily_digest: false,
  weekly_digest: true,
};

let mockNotificationsStore = [...MOCK_NOTIFICATIONS];
let mockPreferencesStore = { ...MOCK_PREFERENCES };

// ============================================
// NOTIFICATIONS API ADAPTER WITH FALLBACK
// ============================================

async function isApiAvailable(): Promise<boolean> {
  try {
    const response = await notificationsApi.getUnreadCount();
    return response.success;
  } catch {
    return false;
  }
}

export const notificationsApiAdapter = {
  async getAll(params?: {
    type?: NotificationType;
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Notification[]>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.getAll(params);
    }

    let notifications = [...mockNotificationsStore];

    // Filter by type
    if (params?.type) {
      notifications = notifications.filter(n => n.type === params.type);
    }

    // Filter unread only
    if (params?.unread_only) {
      notifications = notifications.filter(n => !n.is_read);
    }

    // Sort by date (newest first)
    notifications.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Pagination
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    notifications = notifications.slice(offset, offset + limit);

    return { success: true, data: notifications };
  },

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.getUnreadCount();
    }

    const count = mockNotificationsStore.filter(n => !n.is_read).length;
    return { success: true, data: { count } };
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.markAsRead(id);
    }

    const index = mockNotificationsStore.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotificationsStore[index] = {
        ...mockNotificationsStore[index],
        is_read: true,
        read_at: new Date().toISOString(),
      };
      return { success: true, data: mockNotificationsStore[index] };
    }
    return { success: false, error: 'Notification not found' };
  },

  async markAllAsRead(): Promise<ApiResponse<{ count: number }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.markAllAsRead();
    }

    let count = 0;
    const now = new Date().toISOString();
    mockNotificationsStore = mockNotificationsStore.map(n => {
      if (!n.is_read) {
        count++;
        return { ...n, is_read: true, read_at: now };
      }
      return n;
    });

    return { success: true, data: { count } };
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.delete(id);
    }

    const index = mockNotificationsStore.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotificationsStore.splice(index, 1);
      return { success: true, data: { message: 'Notification deleted' } };
    }
    return { success: false, error: 'Notification not found' };
  },

  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.getPreferences();
    }

    return { success: true, data: { ...mockPreferencesStore } };
  },

  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    const useApi = await isApiAvailable();
    if (useApi) {
      return notificationsApi.updatePreferences(preferences);
    }

    mockPreferencesStore = { ...mockPreferencesStore, ...preferences };
    return { success: true, data: { ...mockPreferencesStore } };
  },

  // Reset mock data
  resetMockData() {
    mockNotificationsStore = [...MOCK_NOTIFICATIONS];
    mockPreferencesStore = { ...MOCK_PREFERENCES };
  },
};
