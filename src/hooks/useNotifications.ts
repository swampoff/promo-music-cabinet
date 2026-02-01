/**
 * useNotifications Hook
 * React hook для работы с уведомлениями
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApiAdapter } from '@/services/notifications-api';
import type { Notification, NotificationPreferences, NotificationType } from '@/types/database';

interface UseNotificationsOptions {
  autoFetch?: boolean;
  pollInterval?: number; // in ms, 0 to disable
  type?: NotificationType;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    autoFetch = true,
    pollInterval = 60000, // 1 minute default
    type,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async (params?: {
    unread_only?: boolean;
    limit?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await notificationsApiAdapter.getAll({
        type,
        unread_only: params?.unread_only,
        limit: params?.limit,
      });

      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationsApiAdapter.getUnreadCount();
      if (result.success && result.data) {
        setUnreadCount(result.data.count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (id: string) => {
    try {
      const result = await notificationsApiAdapter.markAsRead(id);
      if (result.success && result.data) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? result.data! : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark as read:', err);
      return false;
    }
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationsApiAdapter.markAllAsRead();
      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      return false;
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const notification = notifications.find(n => n.id === id);
      const result = await notificationsApiAdapter.delete(id);
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (notification && !notification.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete notification:', err);
      return false;
    }
  }, [notifications]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  // Polling for new notifications
  useEffect(() => {
    if (pollInterval > 0) {
      pollIntervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollInterval);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [pollInterval, fetchUnreadCount]);

  // Computed values
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  // Group by date
  const groupedByDate = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toLocaleDateString('ru-RU');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    error,

    // Computed
    unreadNotifications,
    readNotifications,
    groupedByDate,
    hasUnread: unreadCount > 0,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
}

/**
 * Hook for notification preferences
 */
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await notificationsApiAdapter.getPreferences();
      if (result.success && result.data) {
        setPreferences(result.data);
      } else {
        setError(result.error || 'Failed to fetch preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (
    updates: Partial<NotificationPreferences>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await notificationsApiAdapter.updatePreferences(updates);
      if (result.success && result.data) {
        setPreferences(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to update preferences');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Toggle individual preference
  const togglePreference = useCallback(async (
    key: keyof NotificationPreferences
  ) => {
    if (!preferences) return false;
    return updatePreferences({ [key]: !preferences[key] });
  }, [preferences, updatePreferences]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
    updatePreferences,
    togglePreference,
  };
}
