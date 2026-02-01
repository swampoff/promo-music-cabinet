/**
 * NOTIFICATION BELL - Иконка уведомлений с счетчиком
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface NotificationBellProps {
  onClick?: () => void;
}

// Mock данные для чата с фанатами (frontend-only мессенджер)
const getFansUnreadCount = () => {
  const fansConversations = [
    { id: 1, unread: 2 },
    { id: 2, unread: 0 },
    { id: 3, unread: 1 },
    { id: 4, unread: 0 },
    { id: 5, unread: 0 },
    { id: 6, unread: 0 },
  ];
  return fansConversations.reduce((sum, c) => sum + c.unread, 0);
};

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [totalUnread, setTotalUnread] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState(false);

  useEffect(() => {
    loadAllUnreadCounts();
    
    // Polling для обновления счетчика каждые 30 секунд
    const interval = setInterval(() => {
      loadAllUnreadCounts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAllUnreadCounts = async () => {
    try {
      const userId = 'demo-user-123'; // hardcoded для прототипа
      
      // Проверяем доступность backend только если еще не проверяли
      if (!backendAvailable && totalUnread === 0) {
        // Пробуем загрузить с backend
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 секунды таймаут

        try {
          const notificationsResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (notificationsResponse.ok) {
            setBackendAvailable(true);
            
            // Загружаем conversations
            const conversationsResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/conversations/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              }
            );

            let unreadNotifications = 0;
            let unreadSupportMessages = 0;
            const unreadFansMessages = getFansUnreadCount();

            // Считаем непрочитанные уведомления
            const notificationsData = await notificationsResponse.json();
            if (notificationsData.success && notificationsData.data) {
              unreadNotifications = notificationsData.data.filter((n: any) => !n.read && !n.archived).length;
            }

            // Считаем непрочитанные сообщения поддержки
            const conversationsData = await conversationsResponse.json();
            if (conversationsData.success && conversationsData.data) {
              unreadSupportMessages = conversationsData.data.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
            }

            // Суммарный счетчик: уведомления + поддержка + фанаты
            setTotalUnread(unreadNotifications + unreadSupportMessages + unreadFansMessages);
          } else {
            throw new Error('Backend unavailable');
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          throw fetchError;
        }
      } else if (backendAvailable) {
        // Backend доступен, загружаем данные
        const notificationsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        const conversationsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/conversations/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        let unreadNotifications = 0;
        let unreadSupportMessages = 0;
        const unreadFansMessages = getFansUnreadCount();

        const notificationsData = await notificationsResponse.json();
        if (notificationsData.success && notificationsData.data) {
          unreadNotifications = notificationsData.data.filter((n: any) => !n.read && !n.archived).length;
        }

        const conversationsData = await conversationsResponse.json();
        if (conversationsData.success && conversationsData.data) {
          unreadSupportMessages = conversationsData.data.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
        }

        setTotalUnread(unreadNotifications + unreadSupportMessages + unreadFansMessages);
      } else {
        // Backend недоступен, используем только frontend данные
        setTotalUnread(getFansUnreadCount());
      }
    } catch (error) {
      // Тихо переключаемся на frontend-only режим без вывода ошибок
      setBackendAvailable(false);
      setTotalUnread(getFansUnreadCount());
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg hover:bg-white/20 transition-all touch-manipulation relative"
    >
      <Bell className="w-6 h-6" />
      {totalUnread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
        >
          {totalUnread > 99 ? '99+' : totalUnread}
        </motion.span>
      )}
    </motion.button>
  );
}