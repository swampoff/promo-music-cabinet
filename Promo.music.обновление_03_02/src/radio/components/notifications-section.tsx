/**
 * NOTIFICATIONS SECTION - Уведомления и поддержка для радиостанций
 * Enterprise-модуль с полным функционалом
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellOff, Mail, MailOpen, Filter, Search, RefreshCw,
  MessageSquare, Send, Paperclip, X, Check, Clock,
  AlertCircle, CheckCircle, XCircle, Zap, Star, ChevronDown,
  ChevronUp, Eye, Trash2, Archive, Info, ExternalLink, User,
  Shield, Download, Image, File, Plus, Settings
} from 'lucide-react';
import { toast } from 'sonner';

// Import types
import type {
  RadioNotification,
  SupportTicket,
  TicketMessage,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  MessageAttachment,
} from './notifications-section-types';

// Import sub-components
import {
  NotificationsList,
  TicketsList,
  TicketChatView,
  CreateTicketModal,
  NotificationFilters,
} from './notifications-section-parts';

// Re-export types
export type {
  RadioNotification,
  SupportTicket,
  TicketMessage,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  MessageAttachment,
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function NotificationsSection() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'support'>('notifications');
  const [notifications, setNotifications] = useState<RadioNotification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    totalUnread: 0,
    unreadByType: {} as Record<NotificationType, number>,
    openTickets: 0,
    ticketsWaitingUser: 0,
    ticketsWaitingAdmin: 0,
  });
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  
  // Filters
  const [notificationFilters, setNotificationFilters] = useState({
    types: [] as NotificationType[],
    priorities: [] as NotificationPriority[],
    showRead: true,
    showUnread: true,
  });
  
  const [ticketFilters, setTicketFilters] = useState({
    categories: [] as TicketCategory[],
    statuses: [] as TicketStatus[],
    priorities: [] as TicketPriority[],
  });

  // Load data
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // TODO: API calls
      await Promise.all([
        loadNotifications(),
        loadTickets(),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Error loading notifications data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    // TODO: API call
    // Mock data
    const mockNotifications: RadioNotification[] = [
      {
        id: '1',
        radioId: 'radio1',
        notificationType: 'new_order',
        title: 'Новый заказ рекламного слота',
        message: 'Покупатель "DJ Music Store" заказал 3 слота в пакете "Утренний эфир - 30 секунд"',
        priority: 'high',
        isRead: false,
        relatedEntityType: 'order',
        relatedEntityId: 'order1',
        actionUrl: '/radio/ad-slots?tab=orders&orderId=order1',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: '2',
        radioId: 'radio1',
        notificationType: 'creative_uploaded',
        title: 'Креатив загружен на модерацию',
        message: 'Покупатель загрузил рекламный ролик для заказа #12345. Требуется модерация.',
        priority: 'high',
        isRead: false,
        relatedEntityType: 'order',
        relatedEntityId: 'order2',
        actionUrl: '/radio/ad-slots?tab=orders&orderId=order2',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: '3',
        radioId: 'radio1',
        notificationType: 'withdrawal_completed',
        title: 'Вывод средств выполнен',
        message: 'Ваш запрос на вывод 15,000₽ успешно выполнен. Средства зачислены на банковскую карту.',
        priority: 'normal',
        isRead: true,
        relatedEntityType: 'withdrawal',
        relatedEntityId: 'withdrawal1',
        readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: '4',
        radioId: 'radio1',
        notificationType: 'system_announcement',
        title: 'Обновление платформы 15 февраля',
        message: 'Планируется техническое обслуживание платформы 15.02.2026 с 02:00 до 04:00 МСК. Возможны кратковременные перебои в работе.',
        priority: 'normal',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(),
      },
    ];
    
    setNotifications(mockNotifications);
  };

  const loadTickets = async () => {
    // TODO: API call
    // Mock data
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket1',
        radioId: 'radio1',
        radioName: 'Радио Волна FM',
        radioEmail: 'info@volna.fm',
        category: 'ad_slots',
        subject: 'Проблема с загрузкой аудиофайла в рекламный слот',
        description: 'Здравствуйте! Не могу загрузить аудиофайл в формате MP3 для рекламного ролика. Файл весит 4.5 МБ, система выдает ошибку.',
        priority: 'high',
        status: 'waiting_admin',
        assignedAdminId: 'admin1',
        assignedAdminName: 'Мария Петрова',
        messagesCount: 3,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        lastMessageBy: 'radio',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'ticket2',
        radioId: 'radio1',
        radioName: 'Радио Волна FM',
        radioEmail: 'info@volna.fm',
        category: 'financial',
        subject: 'Вопрос по комиссии платформы',
        description: 'Добрый день! Хотел бы уточнить детали начисления комиссии. В заказе #12345 указана сумма 10,000₽, но я получил только 8,200₽. Можете разъяснить?',
        priority: 'normal',
        status: 'resolved',
        assignedAdminId: 'admin2',
        assignedAdminName: 'Иван Смирнов',
        messagesCount: 5,
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastMessageBy: 'admin',
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
    
    setTickets(mockTickets);
  };

  const loadStats = async () => {
    // TODO: API call
    const mockStats: NotificationStats = {
      totalUnread: 3,
      unreadByType: {
        new_order: 1,
        creative_uploaded: 1,
        system_announcement: 1,
      } as Record<NotificationType, number>,
      openTickets: 1,
      ticketsWaitingUser: 0,
      ticketsWaitingAdmin: 1,
    };
    
    setStats(mockStats);
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: API call
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      
      setStats(prev => ({
        ...prev,
        totalUnread: Math.max(0, prev.totalUnread - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Ошибка при отметке уведомления');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // TODO: API call
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      
      setStats(prev => ({
        ...prev,
        totalUnread: 0,
        unreadByType: {} as Record<NotificationType, number>,
      }));
      
      toast.success('Все уведомления отмечены как прочитанные');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Ошибка при отметке уведомлений');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: API call
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Ошибка при удалении');
    }
  };

  // Create ticket
  const handleCreateTicket = async (data: {
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    attachments?: File[];
  }) => {
    try {
      // TODO: API call with file upload
      console.log('Creating ticket:', data);
      
      toast.success('Обращение создано');
      setShowCreateTicket(false);
      loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Ошибка при создании обращения');
    }
  };

  // Send message in ticket
  const handleSendMessage = async (ticketId: string, messageText: string, attachments?: File[]) => {
    try {
      // TODO: API call with file upload
      console.log('Sending message:', { ticketId, messageText, attachments });
      
      toast.success('Сообщение отправлено');
      loadTickets();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка при отправке сообщения');
    }
  };

  // Close ticket
  const handleCloseTicket = async (ticketId: string) => {
    try {
      // TODO: API call
      toast.success('Обращение закрыто');
      setSelectedTicket(null);
      loadTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Ошибка при закрытии обращения');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Уведомления и поддержка
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Следите за обновлениями и общайтесь с администратором
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 sm:px-4 py-2 rounded-xl border transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base ${
              showFilters
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden xs:inline">Фильтры</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Обновить</span>
          </button>

          {activeTab === 'support' && !selectedTicket && (
            <button
              onClick={() => setShowCreateTicket(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Создать обращение</span>
              <span className="sm:hidden">Создать</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('notifications');
            setNotificationFilters({
              ...notificationFilters,
              showRead: false,
              showUnread: true,
            });
          }}
          title="Показать все непрочитанные уведомления"
          className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 text-left hover:border-blue-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-5 h-5 text-blue-400" />
            {stats.totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {stats.totalUnread}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalUnread}</p>
          <p className="text-sm text-slate-400">Непрочитанных</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('support');
            setSelectedTicket(null); // Сбросить выбранный тикет
            setTicketFilters({
              ...ticketFilters,
              statuses: ['open', 'in_progress', 'waiting_admin', 'waiting_user'] as TicketStatus[],
            });
          }}
          title="Показать все открытые обращения"
          className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 text-left hover:border-purple-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            {stats.openTickets > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold">
                {stats.openTickets}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-white">{stats.openTickets}</p>
          <p className="text-sm text-slate-400">Открытых обращений</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('support');
            setTicketFilters({
              ...ticketFilters,
              statuses: ['waiting_admin'] as TicketStatus[],
            });
          }}
          title="Показать обращения, ожидающие ответа администратора"
          className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 text-left hover:border-orange-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.ticketsWaitingAdmin}</p>
          <p className="text-sm text-slate-400">Ожидают ответа</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveTab('notifications');
            setNotificationFilters({
              ...notificationFilters,
              showRead: true,
              showUnread: false,
            });
          }}
          title="Показать все прочитанные уведомления"
          className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 text-left hover:border-green-500/40 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{notifications.filter(n => n.isRead).length}</p>
          <p className="text-sm text-slate-400">Прочитанных</p>
          <p className="text-xs text-slate-500 mt-1">↗ Кликните для детализации</p>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'notifications'
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Уведомления</span>
          <span className="sm:hidden flex items-center gap-1.5">
            <Bell className="w-4 h-4" />
            Уведомления
          </span>
          {stats.totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {stats.totalUnread}
            </span>
          )}
          {activeTab === 'notifications' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'support'
              ? 'text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">Поддержка</span>
          <span className="sm:hidden flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            Поддержка
          </span>
          {stats.openTickets > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-bold">
              {stats.openTickets}
            </span>
          )}
          {activeTab === 'support' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          )}
        </button>
      </div>

      {/* Active Filters Badge */}
      {(notificationFilters.types.length > 0 || 
        notificationFilters.priorities.length > 0 || 
        !notificationFilters.showRead || 
        !notificationFilters.showUnread ||
        ticketFilters.categories.length > 0 ||
        ticketFilters.statuses.length > 0 ||
        ticketFilters.priorities.length > 0) && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
          <Filter className="w-4 h-4 text-indigo-300" />
          <span className="text-sm text-indigo-300">
            Фильтры активны
          </span>
          <button
            onClick={() => {
              setNotificationFilters({
                types: [] as NotificationType[],
                priorities: [] as NotificationPriority[],
                showRead: true,
                showUnread: true,
              });
              setTicketFilters({
                categories: [] as TicketCategory[],
                statuses: [] as TicketStatus[],
                priorities: [] as TicketPriority[],
              });
            }}
            className="ml-auto text-xs text-indigo-300 hover:text-indigo-200 underline"
          >
            Сбросить все
          </button>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {showFilters && (
              <NotificationFilters
                filters={notificationFilters}
                onChange={setNotificationFilters}
                onClose={() => setShowFilters(false)}
              />
            )}
            
            <NotificationsList
              notifications={notifications}
              filters={notificationFilters}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {activeTab === 'support' && !selectedTicket && (
          <motion.div
            key="support-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TicketsList
              tickets={tickets}
              filters={ticketFilters}
              onSelectTicket={setSelectedTicket}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {activeTab === 'support' && selectedTicket && (
          <motion.div
            key="support-chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TicketChatView
              ticket={selectedTicket}
              onBack={() => setSelectedTicket(null)}
              onSendMessage={handleSendMessage}
              onCloseTicket={handleCloseTicket}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <CreateTicketModal
          onClose={() => setShowCreateTicket(false)}
          onSubmit={handleCreateTicket}
        />
      )}
    </div>
  );
}