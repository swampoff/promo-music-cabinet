/**
 * NOTIFICATIONS SECTION - TYPES
 * Типы для раздела уведомлений радиостанций
 */

export type NotificationType = 
  | 'new_order'           // Новый заказ рекламного слота
  | 'creative_uploaded'   // Креатив загружен (требует модерации)
  | 'order_approved'      // Заказ одобрен
  | 'order_rejected'      // Заказ отклонен
  | 'payment_received'    // Оплата получена
  | 'order_completed'     // Заказ выполнен
  | 'withdrawal_approved' // Вывод средств одобрен
  | 'withdrawal_rejected' // Вывод средств отклонен
  | 'withdrawal_completed'// Вывод средств выполнен
  | 'system_announcement' // Системное объявление
  | 'package_warning'     // Предупреждение о пакете
  | 'admin_message'       // Сообщение от администратора
  | 'platform_update';    // Обновление платформы

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface RadioNotification {
  id: string;
  radioId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  relatedEntityType?: 'order' | 'package' | 'withdrawal' | 'ticket' | 'message';
  relatedEntityId?: string;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export type TicketCategory = 
  | 'technical_support'   // Техническая поддержка
  | 'financial'           // Финансовые вопросы
  | 'ad_slots'            // Рекламные слоты
  | 'account'             // Аккаунт и настройки
  | 'legal'               // Юридические вопросы
  | 'complaint'           // Жалоба
  | 'feature_request'     // Запрос функционала
  | 'other';              // Другое

export type TicketStatus = 
  | 'open'                // Открыт
  | 'in_progress'         // В работе
  | 'waiting_user'        // Ожидает ответа пользователя
  | 'waiting_admin'       // Ожидает ответа администратора
  | 'resolved'            // Решен
  | 'closed';             // Закрыт

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  radioId: string;
  radioName: string;
  radioEmail: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdminId?: string;
  assignedAdminName?: string;
  messagesCount: number;
  lastMessageAt?: string;
  lastMessageBy?: 'radio' | 'admin';
  resolvedAt?: string;
  closedAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export type MessageSenderType = 'radio' | 'admin' | 'system';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderType: MessageSenderType;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messageText: string;
  attachments?: MessageAttachment[];
  isInternal?: boolean; // Внутреннее сообщение (видно только администраторам)
  isRead: boolean;
  readAt?: string;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface NotificationStats {
  totalUnread: number;
  unreadByType: Record<NotificationType, number>;
  openTickets: number;
  ticketsWaitingUser: number;
  ticketsWaitingAdmin: number;
}
