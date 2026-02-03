/**
 * NOTIFICATIONS MANAGER
 * Управление уведомлениями, напоминаниями и настройками
 */

import { Bell, Mail, Settings, Trash2, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Notification {
  id: string;
  userId: string;
  concertId: string;
  type: 'reminder' | 'announcement' | 'ticket_update' | 'promotion';
  title: string;
  message: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'failed';
  channel: 'email' | 'push' | 'both';
  createdAt: string;
  sentAt?: string;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  reminderDaysBefore: number[];
  announcements: boolean;
  promotions: boolean;
  ticketUpdates: boolean;
}

interface NotificationsManagerProps {
  userId: string;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export function NotificationsManager({ userId }: NotificationsManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadNotifications();
    loadSettings();
    loadStats();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/user/${userId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Не удалось загрузить уведомления');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/settings/${userId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/stats/${userId}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await fetch(`${API_URL}/notifications/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(newSettings),
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        toast.success('✅ Настройки сохранены!');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Не удалось сохранить настройки');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${userId}/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await response.json();
      
      if (data.success) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        toast.success('Уведомление удалено');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Не удалось удалить уведомление');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-5 h-5 text-cyan-400" />;
      case 'announcement': return <Bell className="w-5 h-5 text-purple-400" />;
      case 'ticket_update': return <Calendar className="w-5 h-5 text-pink-400" />;
      case 'promotion': return <Sparkles className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">
            <AlertCircle className="w-3 h-3" />
            Ожидает
          </span>
        );
      case 'sent':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
            <CheckCircle className="w-3 h-3" />
            Отправлено
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
            <XCircle className="w-3 h-3" />
            Ошибка
          </span>
        );
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'reminder': return 'Напоминание';
      case 'announcement': return 'Анонс';
      case 'ticket_update': return 'Обновление билетов';
      case 'promotion': return 'Продвижение';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-purple-400" />
            Уведомления
          </h2>
          {stats && (
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {stats.pending} ожидает • {stats.sent} отправлено • {stats.total} всего
            </p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base ${
            showSettings
              ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300'
              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
          }`}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Настройки</span>
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && settings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-bold text-white">Настройки уведомлений</h3>
              
              {/* Channels */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-300">Каналы доставки</h4>
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Email</p>
                      <p className="text-xs text-gray-400">Получать уведомления на почту</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailEnabled}
                      onChange={(e) => updateSettings({ emailEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-white">Push-уведомления</p>
                      <p className="text-xs text-gray-400">Уведомления в браузере</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushEnabled}
                      onChange={(e) => updateSettings({ pushEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>

              {/* Reminder Days */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-300">Напоминать за</h4>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 7, 14, 30].map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        const current = settings.reminderDaysBefore;
                        const updated = current.includes(day)
                          ? current.filter(d => d !== day)
                          : [...current, day].sort((a, b) => b - a);
                        updateSettings({ reminderDaysBefore: updated });
                      }}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                        settings.reminderDaysBefore.includes(day)
                          ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {day} {day === 1 ? 'день' : day < 5 ? 'дня' : 'дней'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Types */}
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-300">Типы уведомлений</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={settings.announcements}
                      onChange={(e) => updateSettings({ announcements: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400"
                    />
                    <span className="text-xs sm:text-sm text-white">Анонсы</span>
                  </label>
                  
                  <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={settings.promotions}
                      onChange={(e) => updateSettings({ promotions: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400"
                    />
                    <span className="text-xs sm:text-sm text-white">Продвижения</span>
                  </label>
                  
                  <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={settings.ticketUpdates}
                      onChange={(e) => updateSettings({ ticketUpdates: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-400"
                    />
                    <span className="text-xs sm:text-sm text-white">Обновления билетов</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white/5 border border-white/10">
          <Bell className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-400 mb-2">Нет уведомлений</h3>
          <p className="text-xs sm:text-sm text-gray-500">Уведомления появятся здесь</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <h4 className="font-semibold text-white text-sm sm:text-base truncate">{notification.title}</h4>
                        {getStatusBadge(notification.status)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2">{notification.message}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        <span className="truncate">{getTypeText(notification.type)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">Запланировано: {new Date(notification.scheduledFor).toLocaleString('ru-RU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="capitalize truncate">{notification.channel === 'both' ? 'Email + Push' : notification.channel}</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1.5 sm:p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}