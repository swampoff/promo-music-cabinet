/**
 * ADMIN SUPPORT PANEL - Максимально функциональная система поддержки
 * Адаптив: 320px → 4K
 * Функции: уведомления, чат, шаблоны, статистика, SLA
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeadphonesIcon, Search, Filter, MessageSquare, Clock, CheckCircle,
  X, Send, Paperclip, AlertCircle, User, Star, Archive, Trash2,
  Tag, TrendingUp, Users, Zap, ChevronDown, MessageCircleReply,
  UserCheck, Bell, BarChart3, FileText, ExternalLink, Copy, 
  Settings, RefreshCw, Eye, EyeOff, Phone, Mail, MessageCircle,
  ThumbsUp, ThumbsDown, Flag, Bookmark, MoreVertical, Edit3,
  Download, Upload, Hash, Calendar, Timer, Activity, Target,
  PieChart, Smile, Frown, Meh, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  user: {
    id: number;
    name: string;
    avatar: string;
    email: string;
    phone?: string;
    totalTickets?: number;
  };
  status: 'open' | 'waiting_response' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  tags: string[];
  assignedTo?: {
    id: number;
    name: string;
    avatar: string;
  };
  rating?: number;
  sla: {
    dueAt: string;
    firstResponseAt?: string;
    resolvedAt?: string;
    isOverdue: boolean;
  };
  metadata?: {
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
  };
}

interface Message {
  id: string;
  sender_type: 'user' | 'admin';
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  message: string;
  timestamp: string;
  attachments?: Attachment[];
  is_internal?: boolean;
  is_read?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  message: string;
  shortcuts?: string;
}

interface Notification {
  id: string;
  type: 'new_ticket' | 'new_message' | 'sla_warning' | 'sla_overdue' | 'ticket_resolved';
  ticketId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export function Support() {
  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Ticket['status']>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Ticket['priority']>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState<'all' | 'me' | 'unassigned'>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Templates
  const templates: Template[] = [
    {
      id: 't1',
      name: 'Приветствие',
      category: 'general',
      message: 'Здравствуйте! Спасибо за обращение. Мы уже работаем над вашим вопросом и ответим в ближайшее время.',
      shortcuts: '/hi'
    },
    {
      id: 't2',
      name: 'Техническая проблема',
      category: 'technical',
      message: 'Попробуйте выполнить следующие действия:\n1. Очистите кеш браузера (Ctrl+Shift+Del)\n2. Перезагрузите страницу\n3. Попробуйте в режиме инкогнито\n\nЕсли проблема сохраняется - пришлите скриншот ошибки.',
      shortcuts: '/tech'
    },
    {
      id: 't3',
      name: 'Проблема с загрузкой',
      category: 'technical',
      message: 'Проверьте, пожалуйста:\n• Размер файла (максимум 100 МБ)\n• Формат файла (MP3, WAV, FLAC)\n• Скорость интернета\n• Попробуйте другой браузер\n\nЕсли не помогло - сообщите точный текст ошибки.',
      shortcuts: '/upload'
    },
    {
      id: 't4',
      name: 'Возврат средств',
      category: 'billing',
      message: 'Возврат средств обрабатывается в течение 3-5 рабочих дней. Деньги вернутся на ту же карту, с которой была произведена оплата. Вы получите уведомление на email, когда возврат будет обработан.',
      shortcuts: '/refund'
    },
    {
      id: 't5',
      name: 'Модерация отклонена',
      category: 'moderation',
      message: 'Ваш трек был отклонен по следующей причине:\n\n[УКАЖИТЕ ПРИЧИНУ]\n\nРекомендации:\n• Проверьте качество звука\n• Убедитесь в соблюдении авторских прав\n• Заполните все метаданные\n\nВы можете загрузить исправленную версию.',
      shortcuts: '/reject'
    },
    {
      id: 't6',
      name: 'Решено',
      category: 'general',
      message: 'Рады, что смогли помочь! 🎉\n\nЕсли возникнут другие вопросы - обращайтесь в любое время. Мы работаем 24/7.\n\nОцените, пожалуйста, качество нашей поддержки.',
      shortcuts: '/solved'
    },
    {
      id: 't7',
      name: 'Дополнительная информация',
      category: 'general',
      message: 'Для решения вашего вопроса нам нужна дополнительная информация:\n\n[УКАЖИТЕ ЧТО НУЖНО]\n\nПожалуйста, предоставьте запрошенные данные, и мы сразу продолжим работу над тикетом.',
      shortcuts: '/info'
    },
    {
      id: 't8',
      name: 'Эскалация',
      category: 'general',
      message: 'Ваш вопрос требует консультации специалиста. Мы передали тикет нашим экспертам, они свяжутся с вами в течение 2 часов.',
      shortcuts: '/escalate'
    }
  ];

  // Mock data
  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: 'T-001',
        subject: 'Не могу загрузить трек',
        user: {
          id: 101,
          name: 'Александр Иванов',
          avatar: 'https://i.pravatar.cc/150?img=12',
          email: 'alex@example.com',
          phone: '+7 (999) 123-45-67',
          totalTickets: 5
        },
        status: 'open',
        priority: 'high',
        category: 'Техническая проблема',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        tags: ['загрузка', 'ошибка', 'urgent'],
        sla: {
          dueAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
          isOverdue: false
        },
        metadata: {
          browser: 'Chrome 120',
          os: 'Windows 11',
          device: 'Desktop',
          ip: '192.168.1.1'
        },
        messages: [
          {
            id: 'm1',
            sender_type: 'user',
            sender: {
              id: 101,
              name: 'Александр Иванов',
              avatar: 'https://i.pravatar.cc/150?img=12'
            },
            message: 'Здравствуйте! При попытке загрузить трек появляется ошибка "Upload failed". Пробовал несколько раз, файл MP3, 8 МБ. Что делать?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            is_read: true
          }
        ]
      },
      {
        id: 'T-002',
        subject: 'Вопрос по тарифу Premium',
        user: {
          id: 102,
          name: 'Мария Петрова',
          avatar: 'https://i.pravatar.cc/150?img=5',
          email: 'maria@example.com',
          totalTickets: 2
        },
        status: 'in_progress',
        priority: 'medium',
        category: 'Подписка',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        tags: ['тариф', 'premium'],
        assignedTo: {
          id: 1,
          name: 'Анна (Поддержка)',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        sla: {
          dueAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          firstResponseAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          isOverdue: false
        },
        messages: [
          {
            id: 'm2',
            sender_type: 'user',
            sender: {
              id: 102,
              name: 'Мария Петрова',
              avatar: 'https://i.pravatar.cc/150?img=5'
            },
            message: 'Хочу узнать, какие функции входят в Premium тариф? Есть ли пробный период?',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            is_read: true
          },
          {
            id: 'm3',
            sender_type: 'admin',
            sender: {
              id: 1,
              name: 'Анна (Поддержка)',
              avatar: 'https://i.pravatar.cc/150?img=1'
            },
            message: 'Здравствуйте! Premium включает:\n✓ Неограниченную загрузку\n✓ Приоритетную модерацию\n✓ Расширенную аналитику\n✓ Скидки на питчинг 25%\n✓ Без рекламы\n\nПробный период - 14 дней бесплатно!',
            timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            is_read: true
          }
        ]
      },
      {
        id: 'T-003',
        subject: 'Проблема с оплатой',
        user: {
          id: 103,
          name: 'Елена Смирнова',
          avatar: 'https://i.pravatar.cc/150?img=45',
          email: 'elena@example.com',
          totalTickets: 1
        },
        status: 'open',
        priority: 'urgent',
        category: 'Финансы',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        tags: ['оплата', 'срочно', 'баг'],
        sla: {
          dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          isOverdue: false
        },
        messages: [
          {
            id: 'm4',
            sender_type: 'user',
            sender: {
              id: 103,
              name: 'Елена Смирнова',
              avatar: 'https://i.pravatar.cc/150?img=45'
            },
            message: 'Списались деньги за подписку, но доступа к Premium функциям нет! Это уже второй раз!',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            is_read: false
          }
        ]
      },
      {
        id: 'T-004',
        subject: 'Трек отклонен модерацией',
        user: {
          id: 104,
          name: 'Дмитрий Соколов',
          avatar: 'https://i.pravatar.cc/150?img=33',
          email: 'dmitry@example.com',
          totalTickets: 8
        },
        status: 'resolved',
        priority: 'low',
        category: 'Модерация',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['модерация', 'отклонен'],
        rating: 5,
        assignedTo: {
          id: 2,
          name: 'Михаил (Поддержка)',
          avatar: 'https://i.pravatar.cc/150?img=11'
        },
        sla: {
          dueAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          firstResponseAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isOverdue: false
        },
        messages: [
          {
            id: 'm5',
            sender_type: 'user',
            sender: {
              id: 104,
              name: 'Дмитрий Соколов',
              avatar: 'https://i.pravatar.cc/150?img=33'
            },
            message: 'Мой трек отклонили, но я не понимаю почему. Можете объяснить?',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            is_read: true
          },
          {
            id: 'm6',
            sender_type: 'admin',
            sender: {
              id: 2,
              name: 'Михаил (Поддержка)',
              avatar: 'https://i.pravatar.cc/150?img=11'
            },
            message: 'Здравствуйте! Трек был отклонен из-за низкого качества звука. Рекомендуем улучшить мастеринг и загрузить снова.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
            is_read: true
          }
        ]
      },
      {
        id: 'T-005',
        subject: 'Как работает питчинг?',
        user: {
          id: 105,
          name: 'Игорь Волков',
          avatar: 'https://i.pravatar.cc/150?img=68',
          email: 'igor@example.com',
          totalTickets: 3
        },
        status: 'waiting_response',
        priority: 'medium',
        category: 'Питчинг',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        tags: ['питчинг', 'вопрос'],
        assignedTo: {
          id: 1,
          name: 'Анна (Поддержка)',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        sla: {
          dueAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
          firstResponseAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          isOverdue: false
        },
        messages: [
          {
            id: 'm7',
            sender_type: 'user',
            sender: {
              id: 105,
              name: 'Игорь Волков',
              avatar: 'https://i.pravatar.cc/150?img=68'
            },
            message: 'Объясните, как работает питчинг? Сколько партнеров я могу выбрать?',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            is_read: true
          },
          {
            id: 'm8',
            sender_type: 'admin',
            sender: {
              id: 1,
              name: 'Анна (Поддержка)',
              avatar: 'https://i.pravatar.cc/150?img=1'
            },
            message: 'Питчинг - это отправка трека радио, блогерам, плейлистам. Вы выбираете партнеров, платите за каждого. Они прослушивают и дают feedback. Количество партнеров не ограничено!',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            is_read: true
          },
          {
            id: 'm9',
            sender_type: 'user',
            sender: {
              id: 105,
              name: 'Игорь Волков',
              avatar: 'https://i.pravatar.cc/150?img=68'
            },
            message: 'А сколько времени они отвечают обычно?',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
            is_read: false
          }
        ]
      }
    ];

    setTickets(mockTickets);

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'new_message',
        ticketId: 'T-005',
        message: 'Новое сообщение от Игорь Волков',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: 'n2',
        type: 'new_ticket',
        ticketId: 'T-003',
        message: 'Новый тикет от Елена Смирнова (Срочный)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: 'n3',
        type: 'sla_warning',
        ticketId: 'T-001',
        message: 'SLA дедлайн приближается для T-001',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        isRead: false
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicket?.messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (replyMessage.length > 0) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  }, [replyMessage]);

  // Filter tickets
  const filteredTickets = tickets
    .filter(ticket => {
      const matchesSearch = 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
      const matchesAssigned = 
        assignedFilter === 'all' ||
        (assignedFilter === 'me' && ticket.assignedTo?.id === 1) ||
        (assignedFilter === 'unassigned' && !ticket.assignedTo);

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssigned;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        const statusOrder = { open: 0, waiting_response: 1, in_progress: 2, resolved: 3, closed: 4 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    waiting: tickets.filter(t => t.status === 'waiting_response').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    avgResponseTime: '2.5ч',
    satisfaction: 4.8,
    slaCompliance: 95,
    unreadMessages: tickets.reduce((sum, t) => 
      sum + t.messages.filter(m => !m.is_read && m.sender_type === 'user').length, 0
    )
  };

  // Handlers
  const handleSendMessage = () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender_type: 'admin',
      sender: {
        id: 1,
        name: 'Вы',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      message: replyMessage,
      timestamp: new Date().toISOString(),
      is_internal: isInternalNote,
      is_read: true,
      attachments: attachments.map((file, i) => ({
        id: `a${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      }))
    };

    setTickets(tickets.map(t =>
      t.id === selectedTicket.id
        ? {
            ...t,
            messages: [...t.messages, newMessage],
            status: isInternalNote ? t.status : 'in_progress' as const,
            updatedAt: new Date().toISOString()
          }
        : t
    ));

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMessage],
      status: isInternalNote ? selectedTicket.status : 'in_progress',
      updatedAt: new Date().toISOString()
    });

    setReplyMessage('');
    setAttachments([]);
    setIsInternalNote(false);
    toast.success(isInternalNote ? 'Внутренняя заметка добавлена' : 'Сообщение отправлено');
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(tickets.map(t =>
      t.id === ticketId 
        ? { 
            ...t, 
            status: 'resolved' as const,
            sla: {
              ...t.sla,
              resolvedAt: new Date().toISOString()
            }
          } 
        : t
    ));
    toast.success('Тикет помечен как решенный');
    setSelectedTicket(null);
  };

  const handleCloseTicket = (ticketId: string) => {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: 'closed' as const } : t
    ));
    toast.success('Тикет закрыт');
    setSelectedTicket(null);
  };

  const handleAssignToMe = (ticketId: string) => {
    setTickets(tickets.map(t =>
      t.id === ticketId
        ? {
            ...t,
            assignedTo: {
              id: 1,
              name: 'Вы',
              avatar: 'https://i.pravatar.cc/150?img=1'
            }
          }
        : t
    ));
    toast.success('Тикет назначен вам');
  };

  const handleUseTemplate = (template: Template) => {
    setReplyMessage(template.message);
    setShowTemplates(false);
    toast.success(`Шаблон "${template.name}" применен`);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast.success('Все уведомления прочитаны');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Helper functions
  const getStatusColor = (status: Ticket['status']) => {
    const colors = {
      open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      waiting_response: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      in_progress: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
      closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status];
  };

  const getStatusText = (status: Ticket['status']) => {
    const texts = {
      open: 'Открыт',
      waiting_response: 'Ждет ответа',
      in_progress: 'В работе',
      resolved: 'Решен',
      closed: 'Закрыт'
    };
    return texts[status];
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    const colors = {
      urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[priority];
  };

  const getPriorityText = (priority: Ticket['priority']) => {
    const texts = {
      urgent: 'Срочно',
      high: 'Высокий',
      medium: 'Средний',
      low: 'Низкий'
    };
    return texts[priority];
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return then.toLocaleDateString('ru-RU');
  };

  const getSLATimeRemaining = (dueAt: string) => {
    const now = new Date();
    const due = new Date(dueAt);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    if (diffMs < 0) return 'Просрочен';
    if (diffHours < 1) return `${diffMins} мин`;
    return `${diffHours} ч ${diffMins} мин`;
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 max-w-[2000px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 md:mb-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex-shrink-0">
              <HeadphonesIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-pink-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Техподдержка</h1>
              <p className="text-xs sm:text-sm text-gray-400">Управление обращениями</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full lg:w-auto">
            {/* Notifications */}
            <div className="relative flex-1 sm:flex-initial">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-full sm:w-auto px-2.5 sm:px-3 md:px-4 py-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Уведомления</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Mobile Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden"
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-2 sm:top-full mt-0 sm:mt-2 w-auto sm:w-80 md:w-96 max-h-[80vh] sm:max-h-96 overflow-y-auto backdrop-blur-xl bg-gray-900/95 rounded-xl border border-white/10 shadow-2xl z-50"
                    >
                      <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gray-900/95 backdrop-blur-xl">
                        <h3 className="font-bold text-white text-sm sm:text-base">Уведомления</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] sm:text-xs text-pink-400 hover:text-pink-300 transition-colors whitespace-nowrap"
                          >
                            Прочитать все
                          </button>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="sm:hidden p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="divide-y divide-white/5">
                        {notifications.length === 0 ? (
                          <div className="p-6 sm:p-8 text-center text-gray-400">
                            <Bell className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-xs sm:text-sm">Нет уведомлений</p>
                          </div>
                        ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              const ticket = tickets.find(t => t.id === notif.ticketId);
                              if (ticket) setSelectedTicket(ticket);
                              setShowNotifications(false);
                            }}
                            className={`p-3 sm:p-4 hover:bg-white/5 cursor-pointer transition-all ${
                              !notif.isRead ? 'bg-blue-500/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                                notif.type === 'new_ticket' ? 'bg-blue-500' :
                                notif.type === 'new_message' ? 'bg-green-500' :
                                notif.type === 'sla_warning' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm ${!notif.isRead ? 'text-white font-semibold' : 'text-gray-300'}`}>
                                  {notif.message}
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{formatTime(notif.timestamp)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Stats Toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3 md:px-4 py-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              {showStats ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span className="hidden md:inline">Статистика</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                toast.success('Обновлено');
              }}
              className="flex-1 sm:flex-initial px-2.5 sm:px-3 md:px-4 py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:shadow-pink-500/50 text-white transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xl:inline">Обновить</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6"
            >
              <div className="p-3 sm:p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Открыто</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.open}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Ждут ответа</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.waiting}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">В работе</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.inProgress}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Решено</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.resolved}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Ср. ответ</p>
                <p className="text-xl sm:text-2xl font-bold text-pink-400">{stats.avgResponseTime}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-gray-400 text-xs sm:text-sm mb-1">Непрочитано</p>
                <p className="text-xl sm:text-2xl font-bold text-cyan-400">{stats.unreadMessages}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="space-y-3 sm:space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по тикетам, пользователям, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { value: 'all', label: 'Все', count: stats.total },
                { value: 'open', label: 'Открытые', count: stats.open },
                { value: 'in_progress', label: 'В работе', count: stats.inProgress },
                { value: 'waiting_response', label: 'Ждут', count: stats.waiting }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value as any)}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap text-xs sm:text-sm flex items-center gap-1.5 ${
                    statusFilter === filter.value
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-xs font-bold ${
                    statusFilter === filter.value ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center gap-2 justify-center"
            >
              <Filter className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Фильтры</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
              >
                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-all text-sm"
                >
                  <option value="all">Все приоритеты</option>
                  <option value="urgent">Срочные</option>
                  <option value="high">Высокие</option>
                  <option value="medium">Средние</option>
                  <option value="low">Низкие</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-all text-sm"
                >
                  <option value="all">Все категории</option>
                  <option value="Техническая проблема">Техническая проблема</option>
                  <option value="Подписка">Подписка</option>
                  <option value="Финансы">Финансы</option>
                  <option value="Модерация">Модерация</option>
                  <option value="Питчинг">Питчинг</option>
                </select>

                {/* Assigned Filter */}
                <select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-all text-sm"
                >
                  <option value="all">Все тикеты</option>
                  <option value="me">Назначенные мне</option>
                  <option value="unassigned">Не назначены</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-pink-500/50 transition-all text-sm"
                >
                  <option value="date">По дате</option>
                  <option value="priority">По приоритету</option>
                  <option value="status">По статусу</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
        {/* Tickets List */}
        <div className={`${selectedTicket ? 'hidden lg:block' : 'block'} lg:col-span-5 xl:col-span-4 space-y-3`}>
          {paginatedTickets.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-8 sm:p-12 text-center">
              <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Тикеты не найдены</h3>
              <p className="text-sm sm:text-base text-gray-400">Измените фильтры или поисковый запрос</p>
            </div>
          ) : (
            <>
              {paginatedTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`backdrop-blur-xl bg-white/5 rounded-xl border cursor-pointer transition-all p-3 sm:p-4 ${
                    selectedTicket?.id === ticket.id
                      ? 'border-pink-500/50 shadow-lg shadow-pink-500/20'
                      : 'border-white/10 hover:border-pink-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <img
                      src={ticket.user.avatar}
                      alt={ticket.user.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{ticket.subject}</h3>
                        <span className="text-xs font-mono text-gray-500 flex-shrink-0">{ticket.id}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-400 mb-1">{ticket.user.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full border ${getPriorityColor(ticket.priority)}`}>
                          {getPriorityText(ticket.priority)}
                        </span>
                        {ticket.sla.isOverdue && (
                          <span className="px-2 py-0.5 rounded-full border bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Просрочен
                          </span>
                        )}
                        {ticket.messages.some(m => !m.is_read && m.sender_type === 'user') && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(ticket.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messages.length}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-3 sm:p-4 backdrop-blur-xl bg-white/5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all flex items-center gap-1 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Назад</span>
                  </button>
                  <span className="text-sm text-gray-400">
                    Страница {currentPage} из {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all flex items-center gap-1 text-sm"
                  >
                    <span className="hidden sm:inline">Вперед</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Ticket Details / Chat */}
        <div className={`${selectedTicket ? 'block' : 'hidden lg:block'} lg:col-span-7 xl:col-span-8`}>
          {!selectedTicket ? (
            <div className="h-full backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-8 sm:p-12 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 sm:w-24 sm:h-24 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Выберите тикет</h3>
                <p className="text-sm sm:text-base text-gray-400">Кликните на тикет слева для просмотра деталей</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {/* Chat Header */}
              <div className="p-3 sm:p-4 md:p-6 border-b border-white/10 bg-gray-900/50">
                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <img
                      src={selectedTicket.user.avatar}
                      alt={selectedTicket.user.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 line-clamp-1">
                        {selectedTicket.subject}
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-gray-400">{selectedTicket.user.name}</span>
                        <span className="text-gray-600">•</span>
                        <a href={`mailto:${selectedTicket.user.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                          {selectedTicket.user.email}
                        </a>
                        {selectedTicket.user.phone && (
                          <>
                            <span className="text-gray-600 hidden sm:inline">•</span>
                            <span className="text-gray-400 hidden sm:inline">{selectedTicket.user.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => toast.success('Функция в разработке')}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all"
                      title="Дополнительно"
                    >
                      <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-3">
                  <span className={`px-2 sm:px-3 py-1 rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                    {getPriorityText(selectedTicket.priority)}
                  </span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                    {selectedTicket.category}
                  </span>
                  <span className="px-2 sm:px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    SLA: {getSLATimeRemaining(selectedTicket.sla.dueAt)}
                  </span>
                  {selectedTicket.assignedTo && (
                    <span className="px-2 sm:px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      {selectedTicket.assignedTo.name}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {selectedTicket.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedTicket.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {!selectedTicket.assignedTo && (
                    <button
                      onClick={() => handleAssignToMe(selectedTicket.id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all text-xs sm:text-sm flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      Назначить себе
                    </button>
                  )}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleResolveTicket(selectedTicket.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-xs sm:text-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Решить
                    </button>
                  )}
                  {selectedTicket.status === 'resolved' && (
                    <button
                      onClick={() => handleCloseTicket(selectedTicket.id)}
                      className="px-3 py-1.5 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all text-xs sm:text-sm flex items-center gap-1"
                    >
                      <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                      Закрыть
                    </button>
                  )}
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all text-xs sm:text-sm flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    Шаблоны
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                {selectedTicket.messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-2 sm:gap-3 ${message.sender_type === 'admin' ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={message.sender.avatar || 'https://i.pravatar.cc/150?img=1'}
                      alt={message.sender.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                    />
                    <div className={`flex-1 ${message.sender_type === 'admin' ? 'items-end' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${message.sender_type === 'admin' ? 'justify-end' : ''}`}>
                        <span className="text-white font-semibold text-xs sm:text-sm">{message.sender.name}</span>
                        <span className="text-gray-400 text-xs">{formatTime(message.timestamp)}</span>
                        {message.is_internal && (
                          <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Внутренняя
                          </span>
                        )}
                      </div>
                      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl max-w-full sm:max-w-2xl ${
                        message.sender_type === 'admin'
                          ? message.is_internal
                            ? 'bg-yellow-500/10 border border-yellow-500/30'
                            : 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}>
                        <p className="text-gray-200 text-sm sm:text-base whitespace-pre-wrap break-words">{message.message}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map(att => (
                              <a
                                key={att.id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs sm:text-sm"
                              >
                                <Paperclip className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 flex-1 truncate">{att.name}</span>
                                <span className="text-gray-500">{(att.size / 1024).toFixed(1)} KB</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 items-center text-gray-400 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Вы печатаете...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Templates Dropdown */}
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10 p-3 sm:p-4 bg-gray-900/50 max-h-60 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold text-sm">Быстрые ответы</h4>
                      <button
                        onClick={() => setShowTemplates(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => handleUseTemplate(template)}
                          className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/30 transition-all text-left"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-white font-medium text-xs sm:text-sm">{template.name}</span>
                            {template.shortcuts && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-mono">
                                {template.shortcuts}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-2">{template.message}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reply Form */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-3 sm:p-4 md:p-6 border-t border-white/10 bg-gray-900/50 space-y-3">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-xs truncate max-w-[150px]">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="p-0.5 rounded hover:bg-red-500/20 text-red-400 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Internal Note Toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                    />
                    <label htmlFor="internal" className="text-sm text-gray-400 cursor-pointer">
                      Внутренняя заметка (не видна пользователю)
                    </label>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSendMessage();
                        }
                      }}
                      placeholder={isInternalNote ? "Внутренняя заметка (только для команды)..." : "Введите ответ... (Ctrl+Enter для отправки)"}
                      className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border text-white placeholder-gray-400 focus:outline-none transition-all resize-none text-sm sm:text-base ${
                        isInternalNote
                          ? 'bg-yellow-500/5 border-yellow-500/30 focus:border-yellow-500/50'
                          : 'bg-white/5 border-white/10 focus:border-pink-500/50'
                      }`}
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        title="Прикрепить файл"
                      >
                        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                        title="Шаблоны"
                      >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!replyMessage.trim()}
                      className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${
                        isInternalNote
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg hover:shadow-pink-500/50'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isInternalNote ? 'Добавить заметку' : 'Отправить'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
