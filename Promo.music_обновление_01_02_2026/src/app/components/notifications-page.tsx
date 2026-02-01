/**
 * NOTIFICATIONS PAGE - Система уведомлений и мессенджер
 * Вкладки: Уведомления, Мессенджер, Тикеты
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell,
  Mail,
  Ticket,
  BarChart3,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Settings,
  Trash2,
  Archive,
  Star,
  AlertCircle,
  Info,
  CheckCheck,
  X,
  Send,
  Loader2,
  User,
  Shield,
  HelpCircle,
  FileText,
  TrendingUp,
  DollarSign,
  Music,
  Video,
  Calendar,
  Radio,
  Megaphone,
  Image as ImageIcon,
  ExternalLink,
  Target,
  Users,
  Headphones,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import { MessagesPage } from './messages-page';
import { TicketsSystem } from './tickets-system';

type TabId = 'all' | 'messenger' | 'tickets';

type NotificationType = 
  | 'payment_success'
  | 'payment_failed'
  | 'track_approved'
  | 'track_rejected'
  | 'video_approved'
  | 'video_rejected'
  | 'concert_approved'
  | 'concert_rejected'
  | 'news_approved'
  | 'news_rejected'
  | 'new_message'
  | 'new_donation'
  | 'new_follower'
  | 'pitching_response'
  | 'marketing_started'
  | 'marketing_completed'
  | 'system'
  | 'admin_message';

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title?: string;
  message: string;
  link?: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
  created_at: string;
  metadata?: any;
}

interface Conversation {
  id: string;
  type: 'admin' | 'support' | 'moderation' | 'user';
  subject: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  from_user_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

const NOTIFICATION_ICONS: Record<NotificationType, any> = {
  payment_success: DollarSign,
  payment_failed: XCircle,
  track_approved: Music,
  track_rejected: XCircle,
  video_approved: Video,
  video_rejected: XCircle,
  concert_approved: Calendar,
  concert_rejected: XCircle,
  news_approved: FileText,
  news_rejected: XCircle,
  new_message: MessageCircle,
  new_donation: DollarSign,
  new_follower: User,
  pitching_response: Radio,
  marketing_started: Megaphone,
  marketing_completed: CheckCircle2,
  system: Info,
  admin_message: Shield,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  payment_success: 'text-green-400',
  payment_failed: 'text-red-400',
  track_approved: 'text-green-400',
  track_rejected: 'text-red-400',
  video_approved: 'text-green-400',
  video_rejected: 'text-red-400',
  concert_approved: 'text-green-400',
  concert_rejected: 'text-red-400',
  news_approved: 'text-green-400',
  news_rejected: 'text-red-400',
  new_message: 'text-blue-400',
  new_donation: 'text-green-400',
  new_follower: 'text-purple-400',
  pitching_response: 'text-cyan-400',
  marketing_started: 'text-purple-400',
  marketing_completed: 'text-green-400',
  system: 'text-blue-400',
  admin_message: 'text-yellow-400',
};

interface NotificationsPageProps {
  onOpenChat?: (userId: string, userName: string, userAvatar?: string) => void;
}

export function NotificationsPage({ onOpenChat }: NotificationsPageProps = {}) {
  const { userId, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [messengerSubTab, setMessengerSubTab] = useState<'fans' | 'support'>('fans');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  
  // Messenger state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadNotifications();
      loadConversations();
      
      // Polling для обновления
      const interval = setInterval(() => {
        loadNotifications();
        loadConversations();
      }, 30000); // каждые 30 секунд
      
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 секунды таймаут

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (error) {
      // Тихо используем пустой массив если backend недоступен
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    if (!userId) return;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/conversations/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      // Тихо используем пустой массив если backend недоступен
      setConversations([]);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/messages/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
        
        // Отметить как прочитанное
        markMessagesAsRead(conversationId);
      }
    } catch (error) {
      // Тихо используем пустой массив если backend недоступен
      setMessages([]);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/conversations/${conversationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const toggleStar = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/${notificationId}/star`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ starred: !notification.starred }),
        }
      );

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, starred: !n.starred } : n
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Ошибка при удалении');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    setSendingMessage(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/notifications-messenger/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            conversation_id: selectedConversation,
            from_user_id: userId,
            message: newMessage,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        loadConversations(); // Обновить список разговоров
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки сообщения');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'unread' && notification.read) return false;
    if (filterType === 'starred' && !notification.starred) return false;
    if (filterType === 'archived' && !notification.archived) return false;
    if (filterType === 'all' && notification.archived) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.message.toLowerCase().includes(query) ||
        notification.title?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  
  // Добавляем непрочитанные от фанатов (frontend данные из MessagesPage)
  const fansUnreadCount = 3; // 2 от Дмитрия + 1 от Ивана (из initialConversations)
  const totalMessengerUnread = totalUnreadMessages + fansUnreadCount;

  const tabs = [
    { 
      id: 'all' as TabId, 
      label: 'Все уведомления', 
      icon: Bell,
      badge: unreadCount 
    },
    { 
      id: 'messenger' as TabId, 
      label: 'Мессенджер', 
      icon: MessageCircle,
      badge: totalMessengerUnread
    },
    { 
      id: 'tickets' as TabId, 
      label: 'Тикеты', 
      icon: Ticket,
      badge: 0 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Уведомления и сообщения</h1>
          </div>
          <p className="text-white/60 text-sm md:text-base">
            {unreadCount} ожидает • {notifications.filter(n => !n.archived).length} отправлено • {notifications.length} всего
          </p>
        </div>

        {/* Tabs - Mobile Responsive */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max md:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'bg-purple-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm md:text-base">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Notifications Tab */}
          {activeTab === 'all' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Filters and Search */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="w-full relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск уведомлений..."
                      className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {/* Filters - Scrollable на мобильных */}
                  <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                    <div className="flex gap-2 min-w-max">
                      {(['all', 'unread', 'starred', 'archived'] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setFilterType(filter)}
                          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                            filterType === filter
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {filter === 'all' && 'Все'}
                          {filter === 'unread' && 'Непрочитанные'}
                          {filter === 'starred' && 'Избранные'}
                          {filter === 'archived' && 'Архив'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              {filteredNotifications.length === 0 ? (
                <div className="space-y-4">
                  {/* Empty State */}
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 text-center">
                    <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Нет системных уведомлений</h3>
                    <p className="text-white/60 text-sm mb-6">
                      Здесь появятся уведомления о платежах, модерации контента,<br className="hidden md:block" />
                      донатах, питчинге и маркетинговых кампаниях
                    </p>
                    
                    {/* Примеры типов уведомлений */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                      <div className="backdrop-blur-xl bg-white/5 rounded-xl p-3 text-center">
                        <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs">Платежи</p>
                      </div>
                      <div className="backdrop-blur-xl bg-white/5 rounded-xl p-3 text-center">
                        <Music className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs">Модерация</p>
                      </div>
                      <div className="backdrop-blur-xl bg-white/5 rounded-xl p-3 text-center">
                        <Radio className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs">Питчинг</p>
                      </div>
                      <div className="backdrop-blur-xl bg-white/5 rounded-xl p-3 text-center">
                        <Megaphone className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs">Маркетинг</p>
                      </div>
                    </div>
                  </div>

                  {/* Hint: Check Messenger если есть непрочитанные */}
                  {totalMessengerUnread > 0 && (
                    <div 
                      onClick={() => setActiveTab('messenger')}
                      className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl p-6 cursor-pointer hover:from-purple-500/30 hover:to-blue-500/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center relative">
                          <MessageCircle className="w-6 h-6 text-purple-400" />
                          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {totalMessengerUnread}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">У вас {totalMessengerUnread} непрочитанных сообщений</h4>
                          <p className="text-white/60 text-sm">Нажмите, чтобы перейти в мессенджер</p>
                        </div>
                        <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                    const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-white/60';
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`backdrop-blur-xl rounded-2xl p-4 transition-all cursor-pointer ${
                          notification.read
                            ? 'bg-white/5 border border-white/10'
                            : 'bg-purple-500/10 border-2 border-purple-500/30'
                        }`}
                        onClick={() => {
                          if (!notification.read) {
                            markAsRead(notification.id);
                          }
                          if (notification.link) {
                            window.location.href = notification.link;
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {notification.title && (
                              <h4 className="text-white font-semibold mb-1">{notification.title}</h4>
                            )}
                            <p className="text-white/80 text-sm">{notification.message}</p>
                            <p className="text-white/40 text-xs mt-2">
                              {new Date(notification.created_at).toLocaleString('ru-RU')}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(notification.id);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Star className={`w-5 h-5 ${notification.starred ? 'text-yellow-400 fill-yellow-400' : 'text-white/40'}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-red-400"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Messenger Tab */}
          {activeTab === 'messenger' && (
            <motion.div
              key="messenger"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Messenger Sub-tabs */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 flex gap-2 mb-4">
                <button
                  onClick={() => setMessengerSubTab('fans')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all flex-1 relative ${
                    messengerSubTab === 'fans'
                      ? 'bg-purple-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Фанаты</span>
                  {fansUnreadCount > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {fansUnreadCount > 99 ? '99+' : fansUnreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setMessengerSubTab('support')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all flex-1 relative ${
                    messengerSubTab === 'support'
                      ? 'bg-purple-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span className="font-medium">Поддержка</span>
                  {totalUnreadMessages > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                    </span>
                  )}
                </button>
              </div>

              {/* Sub-tab content */}
              {messengerSubTab === 'fans' ? (
                <MessagesPage onOpenChat={onOpenChat} />
              ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                    {/* Conversations List */}
                    <div className="border-r border-white/10 overflow-y-auto">
                      <div className="p-4 border-b border-white/10">
                        <h3 className="text-white font-semibold">Диалоги с поддержкой</h3>
                      </div>
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                          <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p className="text-white/60 text-sm">Нет сообщений</p>
                        </div>
                      ) : (
                        <div>
                          {conversations.map((conversation) => (
                            <div
                              key={conversation.id}
                              onClick={() => setSelectedConversation(conversation.id)}
                              className={`p-4 border-b border-white/10 cursor-pointer transition-all ${
                                selectedConversation === conversation.id
                                  ? 'bg-purple-500/20'
                                  : 'hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  conversation.type === 'admin' ? 'bg-yellow-500/20' :
                                  conversation.type === 'support' ? 'bg-blue-500/20' :
                                  conversation.type === 'moderation' ? 'bg-purple-500/20' :
                                  'bg-white/10'
                                }`}>
                                  {conversation.type === 'admin' && <Shield className="w-5 h-5 text-yellow-400" />}
                                  {conversation.type === 'support' && <HelpCircle className="w-5 h-5 text-blue-400" />}
                                  {conversation.type === 'moderation' && <FileText className="w-5 h-5 text-purple-400" />}
                                  {conversation.type === 'user' && <User className="w-5 h-5 text-white/60" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-white font-medium text-sm truncate">{conversation.subject}</h4>
                                    {conversation.unread_count > 0 && (
                                      <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                                        {conversation.unread_count}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/60 text-xs truncate">{conversation.last_message}</p>
                                  <p className="text-white/40 text-xs mt-1">
                                    {new Date(conversation.last_message_at).toLocaleString('ru-RU', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Messages */}
                    <div className="md:col-span-2 flex flex-col">
                      {selectedConversation ? (
                        <>
                          {/* Messages List */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => {
                              const isMe = message.from_user_id === userId;
                              
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[70%] ${
                                    isMe
                                      ? 'bg-purple-500 text-white'
                                      : 'bg-white/10 text-white'
                                  } rounded-2xl p-3`}>
                                    <p className="text-sm">{message.message}</p>
                                    <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-white/40'}`}>
                                      {new Date(message.created_at).toLocaleString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Message Input */}
                          <div className="p-4 border-t border-white/10">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                  }
                                }}
                                placeholder="Введите сообщение..."
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                              />
                              <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || sendingMessage}
                                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
                              >
                                {sendingMessage ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Send className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">Выберите диалог</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TicketsSystem />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}