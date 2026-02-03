/**
 * NOTIFICATIONS SECTION - PART 2
 * Дополнительные компоненты для уведомлений и поддержки
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, BellOff, Mail, MailOpen, Filter, Search, Clock,
  AlertCircle, CheckCircle, XCircle, Zap, Star, ChevronDown,
  X, Trash2, Eye, ExternalLink, Send, Paperclip, Download,
  Image, File, User, Shield, Plus, Info, ArrowLeft, Check,
  MessageSquare, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// Import types
import type {
  RadioNotification,
  SupportTicket,
  TicketMessage,
  NotificationType,
  NotificationPriority,
  TicketCategory,
  TicketStatus,
  TicketPriority,
  MessageAttachment,
} from './notifications-section-types';

// =====================================================
// NOTIFICATIONS LIST
// =====================================================

interface NotificationsListProps {
  notifications: RadioNotification[];
  filters: {
    types: NotificationType[];
    priorities: NotificationPriority[];
    showRead: boolean;
    showUnread: boolean;
  };
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function NotificationsList({
  notifications,
  filters,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  isLoading,
}: NotificationsListProps) {
  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filters.types.length > 0 && !filters.types.includes(n.notificationType)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(n.priority)) return false;
    if (!filters.showRead && n.isRead) return false;
    if (!filters.showUnread && !n.isRead) return false;
    return true;
  });

  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            {unreadCount} непрочитанных уведомлений
          </p>
          <button
            onClick={onMarkAllAsRead}
            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors font-medium"
          >
            Прочитать все
          </button>
        </div>
      )}

      {/* Notifications */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Загрузка уведомлений...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Нет уведомлений</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// NOTIFICATION CARD
// =====================================================

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: RadioNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const typeConfig = getNotificationTypeConfig(notification.notificationType);
  const priorityConfig = getPriorityConfig(notification.priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-3 sm:p-4 rounded-xl border transition-all group ${
        notification.isRead
          ? 'bg-white/5 border-white/10'
          : 'bg-gradient-to-br from-blue-500/10 to-purple-500/5 border-blue-500/30'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div
          className={`p-2 sm:p-2.5 rounded-lg flex-shrink-0 ${typeConfig.bgColor} ${typeConfig.borderColor} border`}
        >
          <typeConfig.icon className="w-4 h-4 sm:w-5 sm:h-5 ${typeConfig.iconColor}" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-white font-medium text-sm sm:text-base">{notification.title}</h4>
            
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mb-2 line-clamp-2 sm:line-clamp-none">{notification.message}</p>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs text-slate-500">
              {formatTimeAgo(notification.createdAt)}
            </span>

            {notification.priority !== 'normal' && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.textColor}`}
              >
                {priorityConfig.label}
              </span>
            )}

            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span className="hidden xs:inline">Перейти</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-row flex-col items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Отметить прочитанным"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// NOTIFICATION FILTERS
// =====================================================

interface NotificationFiltersProps {
  filters: {
    types: NotificationType[];
    priorities: NotificationPriority[];
    showRead: boolean;
    showUnread: boolean;
  };
  onChange: (filters: any) => void;
  onClose: () => void;
}

export function NotificationFilters({ filters, onChange, onClose }: NotificationFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-white">Фильтры</h4>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Read/Unread */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Статус</label>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={filters.showUnread}
                onChange={(e) => onChange({ ...filters, showUnread: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white">Непрочитанные</span>
            </label>
            
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={filters.showRead}
                onChange={(e) => onChange({ ...filters, showRead: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white">Прочитанные</span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onChange({ types: [], priorities: [], showRead: true, showUnread: true })}
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Сбросить фильтры
        </button>
      </div>
    </motion.div>
  );
}

// =====================================================
// TICKETS LIST
// =====================================================

interface TicketsListProps {
  tickets: SupportTicket[];
  filters: {
    categories: TicketCategory[];
    statuses: TicketStatus[];
    priorities: TicketPriority[];
  };
  onSelectTicket: (ticket: SupportTicket) => void;
  isLoading: boolean;
}

export function TicketsList({ tickets, filters, onSelectTicket, isLoading }: TicketsListProps) {
  const filteredTickets = tickets.filter((t) => {
    if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(t.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(t.priority)) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 mt-4">Загрузка обращений...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Нет обращений</p>
          <p className="text-sm text-slate-500 mt-2">
            Создайте обращение, если у вас возник вопрос
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={() => onSelectTicket(ticket)} />
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// TICKET CARD
// =====================================================

function TicketCard({ ticket, onClick }: { ticket: SupportTicket; onClick: () => void }) {
  const statusConfig = getTicketStatusConfig(ticket.status);
  const categoryConfig = getCategoryConfig(ticket.category);
  const priorityConfig = getPriorityConfig(ticket.priority);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-medium truncate">{ticket.subject}</h4>
            {ticket.lastMessageBy === 'admin' && ticket.status === 'waiting_user' && (
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-slate-400 line-clamp-2">{ticket.description}</p>
        </div>

        <div
          className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.textColor}`}
        >
          {statusConfig.label}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <categoryConfig.icon className="w-3.5 h-3.5" />
          {categoryConfig.label}
        </span>

        {ticket.priority !== 'normal' && (
          <span className={`px-2 py-0.5 rounded ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
            {priorityConfig.label}
          </span>
        )}

        {ticket.assignedAdminName && (
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            {ticket.assignedAdminName}
          </span>
        )}

        <span className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {ticket.messagesCount}
        </span>

        <span>{formatTimeAgo(ticket.lastMessageAt || ticket.createdAt)}</span>
      </div>
    </motion.div>
  );
}

// =====================================================
// TICKET CHAT VIEW
// =====================================================

interface TicketChatViewProps {
  ticket: SupportTicket;
  onBack: () => void;
  onSendMessage: (ticketId: string, messageText: string, attachments?: File[]) => void;
  onCloseTicket: (ticketId: string) => void;
}

export function TicketChatView({ ticket, onBack, onSendMessage, onCloseTicket }: TicketChatViewProps) {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  useEffect(() => {
    // Скролл вниз при загрузке сообщений или добавлении новых
    if (!isLoading && messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [messages, isLoading]);

  // Дополнительный скролл при первом открытии
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [isLoading]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      // TODO: API call
      // Mock data
      const mockMessages: TicketMessage[] = [
        {
          id: 'msg1',
          ticketId: ticket.id,
          senderType: 'radio',
          senderId: 'radio1',
          senderName: 'Радио Волна FM',
          messageText: ticket.description,
          isRead: true,
          createdAt: ticket.createdAt,
        },
        {
          id: 'msg2',
          ticketId: ticket.id,
          senderType: 'admin',
          senderId: 'admin1',
          senderName: ticket.assignedAdminName || 'Администратор',
          senderAvatar: undefined,
          messageText: 'Здравствуйте! Спасибо за обращение. Проверяем вашу проблему.',
          isRead: true,
          createdAt: new Date(new Date(ticket.createdAt).getTime() + 1000 * 60 * 10).toISOString(),
        },
        {
          id: 'msg3',
          ticketId: ticket.id,
          senderType: 'radio',
          senderId: 'radio1',
          senderName: 'Радио Волна FM',
          messageText: 'Спасибо! Буду ждать.',
          isRead: true,
          createdAt: new Date(new Date(ticket.createdAt).getTime() + 1000 * 60 * 15).toISOString(),
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!messageText.trim() && attachments.length === 0) return;
    
    onSendMessage(ticket.id, messageText, attachments);
    setMessageText('');
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const statusConfig = getTicketStatusConfig(ticket.status);
  const categoryConfig = getCategoryConfig(ticket.category);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Назад к списку</span>
          <span className="xs:hidden">Назад</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">{ticket.subject}</h3>
              <span
                className={`px-2 py-1 rounded text-xs font-medium self-start ${statusConfig.bgColor} ${statusConfig.textColor}`}
              >
                {statusConfig.label}</span>
            </div>

            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <categoryConfig.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {categoryConfig.label}
              </span>
              <span className="hidden xs:inline">Тикет #{ticket.id.slice(0, 8)}</span>
              <span>{formatDate(ticket.createdAt)}</span>
            </div>

            {ticket.assignedAdminName && (
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Ответственный: <span className="text-white">{ticket.assignedAdminName}</span>
              </p>
            )}
          </div>

          {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
            <button
              onClick={() => {
                if (confirm('Вы уверены, что хотите закрыть обращение?')) {
                  onCloseTicket(ticket.id);
                }
              }}
              className="px-3 sm:px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors text-xs sm:text-sm font-medium self-start"
            >
              <span className="hidden sm:inline">Закрыть обращение</span>
              <span className="sm:hidden">Закрыть</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 min-h-[300px] sm:min-h-[400px] max-h-[500px] sm:max-h-[600px] overflow-y-auto space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {ticket.status !== 'closed' && (
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/10 border border-white/10 text-xs sm:text-sm"
                >
                  <File className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-white truncate max-w-[100px] sm:max-w-none">{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-0.5 rounded hover:bg-white/10 flex-shrink-0"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col xs:flex-row items-stretch xs:items-end gap-2 xs:gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="xs:order-1 p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
              title="Прикрепить файл"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </button>

            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Введите сообщение... (Enter для отправки)"
              rows={3}
              className="xs:order-2 flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />

            <button
              onClick={handleSend}
              disabled={!messageText.trim() && attachments.length === 0}
              className="xs:order-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline text-sm sm:text-base">Отправить</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Администратор ответит в течение 24 часов
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MESSAGE BUBBLE
// =====================================================

function MessageBubble({ message }: { message: TicketMessage }) {
  const isAdmin = message.senderType === 'admin';
  const isSystem = message.senderType === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400">
          {message.messageText}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[70%] ${isAdmin ? 'order-1' : 'order-2'}`}>
        <div className="flex items-center gap-2 mb-1">
          {isAdmin && <Shield className="w-3.5 h-3.5 text-indigo-400" />}
          <span className="text-xs text-slate-500">{message.senderName}</span>
          <span className="text-xs text-slate-600">{formatTime(message.createdAt)}</span>
        </div>

        <div
          className={`p-3 rounded-xl ${
            isAdmin
              ? 'bg-indigo-500/20 border border-indigo-500/30'
              : 'bg-purple-500/20 border border-purple-500/30'
          }`}
        >
          <p className="text-white text-sm whitespace-pre-wrap">{message.messageText}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {attachment.fileType.startsWith('image/') ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <File className="w-4 h-4" />
                  )}
                  <span className="text-sm flex-1 truncate">{attachment.fileName}</span>
                  <Download className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// CREATE TICKET MODAL
// =====================================================

interface CreateTicketModalProps {
  onClose: () => void;
  onSubmit: (data: {
    category: TicketCategory;
    subject: string;
    description: string;
    priority: TicketPriority;
    attachments?: File[];
  }) => void;
}

export function CreateTicketModal({ onClose, onSubmit }: CreateTicketModalProps) {
  const [category, setCategory] = useState<TicketCategory>('technical_support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!subject.trim()) {
      toast.error('Укажите тему обращения');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Опишите вашу проблему');
      return;
    }

    onSubmit({ category, subject, description, priority, attachments });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Создать обращение</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Категория <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="technical_support">Техническая поддержка</option>
              <option value="financial">Финансовые вопросы</option>
              <option value="ad_slots">Рекламные слоты</option>
              <option value="account">Аккаунт и настройки</option>
              <option value="legal">Юридические вопросы</option>
              <option value="complaint">Жалоба</option>
              <option value="feature_request">Запрос функционала</option>
              <option value="other">Другое</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Тема <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Кратко опишите проблему"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Описание <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробно опишите вашу проблему или вопрос..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Приоритет</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['low', 'normal', 'high', 'urgent'] as TicketPriority[]).map((p) => {
                const config = getPriorityConfig(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      priority === p
                        ? `${config.borderColor} ${config.bgColor}`
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className={priority === p ? config.textColor : 'text-white'}>
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Файлы</label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Paperclip className="w-5 h-5" />
              Прикрепить файлы
            </button>

            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/10"
                  >
                    <File className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white flex-1">{file.name}</span>
                    <span className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-300">Информация</p>
                <p className="text-xs text-slate-400 mt-1">
                  Администратор ответит в течение 24 часов.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90 transition-opacity font-medium"
          >
            Создать обращение
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getNotificationTypeConfig(type: NotificationType) {
  const configs = {
    new_order: {
      icon: Bell,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    creative_uploaded: {
      icon: AlertCircle,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    order_approved: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    order_rejected: {
      icon: XCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
    },
    payment_received: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    order_completed: {
      icon: Star,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    withdrawal_approved: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    withdrawal_rejected: {
      icon: XCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400',
    },
    withdrawal_completed: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400',
    },
    system_announcement: {
      icon: Info,
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400',
    },
    package_warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    admin_message: {
      icon: Mail,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      iconColor: 'text-purple-400',
    },
    platform_update: {
      icon: Zap,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
    },
  };

  return configs[type] || configs.system_announcement;
}

function getPriorityConfig(priority: NotificationPriority | TicketPriority) {
  const configs = {
    low: {
      label: 'Низкий',
      bgColor: 'bg-slate-500/20',
      textColor: 'text-slate-300',
      borderColor: 'border-slate-500',
    },
    normal: {
      label: 'Обычный',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-500',
    },
    high: {
      label: 'Высокий',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-500',
    },
    urgent: {
      label: 'Срочный',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-500',
    },
  };

  return configs[priority];
}

function getTicketStatusConfig(status: TicketStatus) {
  const configs = {
    open: {
      label: 'Открыт',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-300',
    },
    in_progress: {
      label: 'В работе',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-300',
    },
    waiting_user: {
      label: 'Ожидает вас',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-300',
    },
    waiting_admin: {
      label: 'Ожидает ответа',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-300',
    },
    resolved: {
      label: 'Решен',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-300',
    },
    closed: {
      label: 'Закрыт',
      bgColor: 'bg-slate-500/20',
      textColor: 'text-slate-300',
    },
  };

  return configs[status];
}

function getCategoryConfig(category: TicketCategory) {
  const configs = {
    technical_support: { label: 'Тех. поддержка', icon: AlertCircle },
    financial: { label: 'Финансы', icon: Star },
    ad_slots: { label: 'Реклама', icon: Bell },
    account: { label: 'Аккаунт', icon: User },
    legal: { label: 'Юридическое', icon: Shield },
    complaint: { label: 'Жалоба', icon: AlertCircle },
    feature_request: { label: 'Запрос функции', icon: Plus },
    other: { label: 'Другое', icon: Info },
  };

  return configs[category];
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  
  return formatDate(dateString);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}