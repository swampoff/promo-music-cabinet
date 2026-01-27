/**
 * TICKETS SYSTEM COMPONENT
 * Полноценная система тикетов поддержки
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Loader2,
  Send,
  Paperclip,
  Star,
  BarChart3,
  TrendingUp,
  User,
  Calendar,
  Tag,
  X,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { toast } from 'sonner';

type TicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketCategory = 'technical' | 'billing' | 'content' | 'account' | 'other';
type TicketsSubTab = 'list' | 'create' | 'stats';

interface TicketData {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  attachments: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  sla_due_date: string;
  tags: string[];
  rating: number | null;
  feedback: string | null;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'support' | 'admin';
  message: string;
  attachments: string[];
  internal_note: boolean;
  created_at: string;
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  waiting_response: number;
  resolved: number;
  closed: number;
  by_category: Record<TicketCategory, number>;
  by_priority: Record<TicketPriority, number>;
  avg_resolution_time: number;
  avg_rating: number;
  overdue: number;
}

export function TicketsSystem() {
  const { userId, isAuthenticated } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<TicketsSubTab>('list');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | TicketStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | TicketPriority>('all');
  
  // Create ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'technical' as TicketCategory,
    priority: 'medium' as TicketPriority,
  });
  const [creating, setCreating] = useState(false);
  
  // Message form
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated, activeSubTab]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'list') {
        await loadTickets();
      } else if (activeSubTab === 'stats') {
        await loadStats();
      }
    } catch (error) {
      console.error('Error loading tickets data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTickets(data.data || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    }
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/${ticketId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/stats/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Ошибка загрузки статистики');
    }
  };

  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast.error('Заполните все поля');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            user_id: userId,
            ...newTicket,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Тикет создан');
        setNewTicket({
          subject: '',
          description: '',
          category: 'technical',
          priority: 'medium',
        });
        setActiveSubTab('list');
        loadTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Ошибка создания');
    } finally {
      setCreating(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSending(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/${selectedTicket.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            sender_id: userId,
            sender_type: 'user',
            message: newMessage,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
        setNewMessage('');
        loadTickets(); // Обновить список тикетов
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (ticketId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ status: 'closed' }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Тикет закрыт');
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.data);
        }
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Ошибка закрытия');
    }
  };

  const rateTicket = async (ticketId: string, rating: number, feedback: string = '') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/tickets-system/${ticketId}/rate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ rating, feedback }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Спасибо за оценку!');
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(data.data);
        }
      }
    } catch (error) {
      console.error('Error rating ticket:', error);
      toast.error('Ошибка оценки');
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const subTabs = [
    { id: 'list' as TicketsSubTab, label: 'Мои тикеты', icon: Ticket },
    { id: 'create' as TicketsSubTab, label: 'Создать тикет', icon: Plus },
    { id: 'stats' as TicketsSubTab, label: 'Статистика', icon: BarChart3 },
  ];

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'waiting_response': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open': return AlertCircle;
      case 'in_progress': return Clock;
      case 'waiting_response': return MessageCircle;
      case 'resolved': return CheckCircle2;
      case 'closed': return XCircle;
      default: return Ticket;
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'urgent': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    const labels = {
      open: 'Открыт',
      in_progress: 'В работе',
      waiting_response: 'Ждём ответа',
      resolved: 'Решён',
      closed: 'Закрыт',
    };
    return labels[status];
  };

  const getPriorityLabel = (priority: TicketPriority) => {
    const labels = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      urgent: 'Срочный',
    };
    return labels[priority];
  };

  const getCategoryLabel = (category: TicketCategory) => {
    const labels = {
      technical: 'Техническая проблема',
      billing: 'Вопрос по оплате',
      content: 'Контент и модерация',
      account: 'Аккаунт',
      other: 'Другое',
    };
    return labels[category];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs - Mobile Responsive */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2">
        {/* Desktop View */}
        <div className="hidden md:flex gap-2">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setSelectedTicket(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all flex-1 ${
                  activeSubTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile View - Scrollable */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setSelectedTicket(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* List Tab */}
        {activeSubTab === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {!selectedTicket ? (
              <>
                {/* Search and Filters */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Поиск тикетов..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">Все статусы</option>
                      <option value="open">Открытые</option>
                      <option value="in_progress">В работе</option>
                      <option value="waiting_response">Ждём ответа</option>
                      <option value="resolved">Решённые</option>
                      <option value="closed">Закрытые</option>
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value as any)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">Все приоритеты</option>
                      <option value="urgent">Срочные</option>
                      <option value="high">Высокие</option>
                      <option value="medium">Средние</option>
                      <option value="low">Низкие</option>
                    </select>

                    <button
                      onClick={loadTickets}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tickets List */}
                {filteredTickets.length === 0 ? (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                    <Ticket className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Нет тикетов</h3>
                    <p className="text-white/60 mb-4">Создайте первый тикет для получения помощи</p>
                    <button
                      onClick={() => setActiveSubTab('create')}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Создать тикет
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTickets.map((ticket) => {
                      const StatusIcon = getStatusIcon(ticket.status);
                      const isOverdue = new Date(ticket.sla_due_date) < new Date() && 
                                       ticket.status !== 'resolved' && 
                                       ticket.status !== 'closed';
                      
                      return (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all cursor-pointer"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(ticket.status).replace('text-', 'bg-').replace('-400', '-500/20')}`}>
                              <StatusIcon className={`w-5 h-5 ${getStatusColor(ticket.status).split(' ')[1]}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-white font-semibold">{ticket.subject}</h4>
                                    {isOverdue && (
                                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Просрочен
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white/60 text-sm">{ticket.id}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                    {getStatusLabel(ticket.status)}
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-white/40" />
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {getCategoryLabel(ticket.category)}
                                </span>
                                <span className={`flex items-center gap-1 font-medium ${getPriorityColor(ticket.priority)}`}>
                                  <AlertCircle className="w-4 h-4" />
                                  {getPriorityLabel(ticket.priority)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // Ticket Detail View
              <div className="space-y-4">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                  Назад к списку
                </button>

                {/* Ticket Header */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                      <p className="text-white/60">{selectedTicket.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusLabel(selectedTicket.status)}
                      </span>
                      {selectedTicket.status !== 'closed' && (
                        <button
                          onClick={() => closeTicket(selectedTicket.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all text-sm"
                        >
                          Закрыть тикет
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-white/40 text-xs mb-1">Категория</div>
                      <div className="text-white text-sm">{getCategoryLabel(selectedTicket.category)}</div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Приоритет</div>
                      <div className={`text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                        {getPriorityLabel(selectedTicket.priority)}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">Создан</div>
                      <div className="text-white text-sm">
                        {new Date(selectedTicket.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs mb-1">SLA</div>
                      <div className="text-white text-sm">
                        {new Date(selectedTicket.sla_due_date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <div className="text-white/60 text-sm mb-2">Описание проблемы:</div>
                    <div className="text-white">{selectedTicket.description}</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Переписка</h3>
                  </div>

                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {messages.map((msg) => {
                      const isMe = msg.sender_type === 'user';
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${
                            isMe
                              ? 'bg-purple-500 text-white'
                              : msg.sender_type === 'admin'
                              ? 'bg-yellow-500/20 text-white border border-yellow-500/30'
                              : 'bg-white/10 text-white'
                          } rounded-2xl p-3`}>
                            {!isMe && (
                              <div className="text-xs text-white/60 mb-1">
                                {msg.sender_type === 'admin' ? '👑 Администратор' : '💬 Поддержка'}
                              </div>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-white/40'}`}>
                              {new Date(msg.created_at).toLocaleString('ru-RU', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedTicket.status !== 'closed' && (
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
                          disabled={!newMessage.trim() || sending}
                          className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
                        >
                          {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating (if resolved/closed) */}
                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && !selectedTicket.rating && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Оцените решение</h3>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => rateTicket(selectedTicket.id, rating)}
                          className="w-12 h-12 rounded-full bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500/30 transition-all flex items-center justify-center"
                        >
                          <Star className="w-6 h-6 text-yellow-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTicket.rating && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Спасибо за оценку: {selectedTicket.rating} / 5</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Create Tab */}
        {activeSubTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Создать новый тикет</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Тема</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Кратко опишите проблему"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Категория</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as TicketCategory })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="technical">Техническая проблема</option>
                  <option value="billing">Вопрос по оплате</option>
                  <option value="content">Контент и модерация</option>
                  <option value="account">Аккаунт</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Приоритет</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Описание</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Подробно опишите вашу проблему..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={createTicket}
                disabled={creating || !newTicket.subject || !newTicket.description}
                className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Создать тикет
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats Tab */}
        {activeSubTab === 'stats' && stats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Всего</div>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Открыто</div>
                <div className="text-3xl font-bold text-blue-400">{stats.open}</div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Решено</div>
                <div className="text-3xl font-bold text-green-400">{stats.resolved}</div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Просрочено</div>
                <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
              </div>
            </div>

            {/* By Status */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">По статусам</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="text-blue-400 text-sm mb-1">Открыто</div>
                  <div className="text-2xl font-bold text-white">{stats.open}</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="text-purple-400 text-sm mb-1">В работе</div>
                  <div className="text-2xl font-bold text-white">{stats.in_progress}</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-yellow-400 text-sm mb-1">Ждём ответа</div>
                  <div className="text-2xl font-bold text-white">{stats.waiting_response}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="text-green-400 text-sm mb-1">Решено</div>
                  <div className="text-2xl font-bold text-white">{stats.resolved}</div>
                </div>
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Закрыто</div>
                  <div className="text-2xl font-bold text-white">{stats.closed}</div>
                </div>
              </div>
            </div>

            {/* By Category */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">По категориям</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_category).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-white">{getCategoryLabel(category as TicketCategory)}</span>
                    <span className="text-white/60">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  Среднее время решения
                </div>
                <div className="text-2xl font-bold text-white">{stats.avg_resolution_time}ч</div>
              </div>
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <Star className="w-4 h-4" />
                  Средняя оценка
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.avg_rating > 0 ? `${stats.avg_rating} / 5` : 'Нет оценок'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}