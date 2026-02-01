/**
 * EVENT DETAILS - Детальная страница мероприятия
 * Табы: Overview, Билеты, Команда, Бюджет, Продвижение, Timeline, Аналитика
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Clock,
  Settings,
  BarChart3,
  CheckCircle2,
  Eye,
  Edit,
  Share2,
  Download,
  Plus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
  onUpdate: () => void;
}

const TABS = [
  { id: 'overview', name: 'Обзор', icon: Eye },
  { id: 'tickets', name: 'Билеты', icon: Ticket },
  { id: 'team', name: 'Команда', icon: Users },
  { id: 'budget', name: 'Бюджет', icon: DollarSign },
  { id: 'promotion', name: 'Продвижение', icon: TrendingUp },
  { id: 'timeline', name: 'Timeline', icon: Clock },
  { id: 'analytics', name: 'Аналитика', icon: BarChart3 }
];

export default function EventDetails({ eventId, onBack, onUpdate }: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events/${eventId}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvent(data.event);
      }
    } catch (error) {
      console.log('Loading demo event');
      // Демо-данные
      setEvent({
        id: eventId,
        event_name: 'Летний концерт 2026',
        event_type: 'concert',
        city: 'Москва',
        venue: 'Клуб 16 тонн',
        event_date: '2026-06-15',
        expected_audience: 500,
        budget: 500000,
        status: 'confirmed',
        tickets_sold: 350,
        revenue: 700000,
        description: 'Большой летний концерт с презентацией нового альбома'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Мероприятие не найдено</h2>
          <button onClick={onBack} className="text-purple-400 hover:text-purple-300">
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const fillRate = Math.round((event.tickets_sold / event.expected_audience) * 100);
  const daysUntil = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к списку
          </button>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Редактировать
            </motion.button>
          </div>
        </div>

        {/* Event Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{event.event_name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
              </div>
              <div className="flex items-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.city}, {event.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.event_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}</span>
                </div>
                {daysUntil > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Через {daysUntil} дней</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Продано билетов</p>
              <p className="text-2xl font-bold text-white">{event.tickets_sold} / {event.expected_audience}</p>
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                  style={{ width: `${fillRate}%` }}
                />
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Заполненность</p>
              <p className="text-2xl font-bold text-white">{fillRate}%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Выручка</p>
              <p className="text-2xl font-bold text-white">{(event.revenue / 1000).toFixed(0)}k ₽</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Бюджет</p>
              <p className="text-2xl font-bold text-white">{(event.budget / 1000).toFixed(0)}k ₽</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTab event={event} />}
          {activeTab === 'tickets' && <TicketsTab eventId={eventId} />}
          {activeTab === 'team' && <TeamTab eventId={eventId} />}
          {activeTab === 'budget' && <BudgetTab eventId={eventId} />}
          {activeTab === 'promotion' && <PromotionTab eventId={eventId} />}
          {activeTab === 'timeline' && <TimelineTab eventId={eventId} />}
          {activeTab === 'analytics' && <AnalyticsTab eventId={eventId} />}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ event }: { event: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Обзор мероприятия</h2>
      
      {event.description && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Описание</h3>
          <p className="text-gray-400">{event.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Детали</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Тип</span>
              <span className="text-white font-medium">{getEventTypeName(event.event_type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Город</span>
              <span className="text-white font-medium">{event.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Площадка</span>
              <span className="text-white font-medium">{event.venue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Вместимость</span>
              <span className="text-white font-medium">{event.expected_audience} человек</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Финансы</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Бюджет</span>
              <span className="text-white font-medium">{event.budget.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Выручка</span>
              <span className="text-green-400 font-medium">{event.revenue.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Прибыль</span>
              <span className="text-white font-medium">{(event.revenue - event.budget).toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ROI</span>
              <span className="text-purple-400 font-medium">
                {Math.round(((event.revenue - event.budget) / event.budget) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Tickets Tab
function TicketsTab({ eventId }: { eventId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Билеты</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить тип
        </motion.button>
      </div>

      <div className="text-center py-12">
        <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Управление билетами будет добавлено</p>
      </div>
    </motion.div>
  );
}

// Team Tab
function TeamTab({ eventId }: { eventId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Команда</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить члена
        </motion.button>
      </div>

      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Управление командой будет добавлено</p>
      </div>
    </motion.div>
  );
}

// Budget Tab
function BudgetTab({ eventId }: { eventId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Бюджет</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить статью
        </motion.button>
      </div>

      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Управление бюджетом будет добавлено</p>
      </div>
    </motion.div>
  );
}

// Promotion Tab
function PromotionTab({ eventId }: { eventId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Продвижение</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить канал
        </motion.button>
      </div>

      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Управление продвижением будет добавлено</p>
      </div>
    </motion.div>
  );
}

// Timeline Tab
function TimelineTab({ eventId }: { eventId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Timeline</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить этап
        </motion.button>
      </div>

      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Timeline мероприятия будет добавлен</p>
      </div>
    </motion.div>
  );
}

// Analytics Tab
function AnalyticsTab({ eventId }: { eventId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Аналитика</h2>

      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Аналитика мероприятия будет добавлена</p>
      </div>
    </motion.div>
  );
}

// Helper functions
function getStatusColor(status: string) {
  const colors = {
    planning: 'bg-gray-500/20 text-gray-300',
    booking: 'bg-yellow-500/20 text-yellow-300',
    confirmed: 'bg-green-500/20 text-green-300',
    promotion: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-purple-500/20 text-purple-300',
    cancelled: 'bg-red-500/20 text-red-300'
  };
  return colors[status as keyof typeof colors] || colors.planning;
}

function getStatusText(status: string) {
  const texts = {
    planning: 'Планирование',
    booking: 'Букинг',
    confirmed: 'Подтвержден',
    promotion: 'Продвижение',
    completed: 'Завершен',
    cancelled: 'Отменен'
  };
  return texts[status as keyof typeof texts] || status;
}

function getEventTypeName(type: string) {
  const names = {
    concert: 'Концерт',
    festival: 'Фестиваль',
    club_show: 'Клубное шоу',
    online_event: 'Онлайн-концерт',
    tour: 'Тур'
  };
  return names[type as keyof typeof names] || type;
}