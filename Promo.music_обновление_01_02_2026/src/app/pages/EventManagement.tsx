/**
 * EVENT MANAGEMENT - Управление концертами и мероприятиями
 * Полная система для организации мероприятий с продажей билетов, командой, бюджетом и аналитикой
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowLeft,
  Music2,
  Clock,
  Settings,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  ChevronRight
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';
import CreateEventWizard from '@/app/components/event/CreateEventWizard';
import EventDetails from '@/app/components/event/EventDetails';

// Types
interface Event {
  id: string;
  artist_id: string;
  event_name: string;
  event_type: 'concert' | 'festival' | 'club_show' | 'online_event' | 'tour';
  city: string;
  venue: string;
  event_date: string;
  expected_audience: number;
  budget: number;
  status: 'planning' | 'booking' | 'confirmed' | 'promotion' | 'completed' | 'cancelled';
  tickets_sold: number;
  revenue: number;
  created_at: string;
}

interface EventFinancials {
  event_id: string;
  event_name: string;
  ticket_revenue: number;
  tickets_sold: number;
  expenses_planned: number;
  expenses_actual: number;
  profit: number;
  marketing_budget: number;
  marketing_roi: number;
}

interface UpcomingEvent {
  id: string;
  event_name: string;
  event_date: string;
  city: string;
  venue: string;
  tickets_sold: number;
  tickets_remaining: number;
  fill_rate_percent: number;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export default function EventManagement() {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  
  const [activeView, setActiveView] = useState<'list' | 'create' | 'details'>('list');
  const [events, setEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [financials, setFinancials] = useState<EventFinancials[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadEvents();
    loadUpcomingEvents();
    loadFinancials();
  }, [user]);

  const loadEvents = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/events?artist_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.log('Events loaded from prototype mode');
      // Демо-данные
      setEvents([
        {
          id: '1',
          artist_id: user.id,
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
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingEvents = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/events/upcoming?artist_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpcomingEvents(data.events || []);
      }
    } catch (error) {
      console.log('Upcoming events loaded from prototype mode');
    }
  };

  const loadFinancials = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/events/financials?artist_id=${user.id}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFinancials(data.financials || []);
      }
    } catch (error) {
      console.log('Financials loaded from prototype mode');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-gray-500/20 text-gray-300',
      booking: 'bg-yellow-500/20 text-yellow-300',
      confirmed: 'bg-green-500/20 text-green-300',
      promotion: 'bg-blue-500/20 text-blue-300',
      completed: 'bg-purple-500/20 text-purple-300',
      cancelled: 'bg-red-500/20 text-red-300'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getStatusText = (status: string) => {
    const texts = {
      planning: 'Планирование',
      booking: 'Букинг',
      confirmed: 'Подтвержден',
      promotion: 'Продвижение',
      completed: 'Завершен',
      cancelled: 'Отменен'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Статистика
  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.event_date) > new Date() && e.status !== 'cancelled').length,
    completed: events.filter(e => e.status === 'completed').length,
    revenue: events.reduce((sum, e) => sum + e.revenue, 0),
    ticketsSold: events.reduce((sum, e) => sum + e.tickets_sold, 0),
    avgFillRate: events.length > 0 
      ? Math.round(events.reduce((sum, e) => sum + (e.tickets_sold / e.expected_audience * 100), 0) / events.length)
      : 0
  };

  if (activeView === 'create') {
    return <CreateEventWizard onBack={() => setActiveView('list')} onComplete={() => {
      loadEvents();
      setActiveView('list');
    }} />;
  }

  if (activeView === 'details' && selectedEvent) {
    return <EventDetails 
      eventId={selectedEvent} 
      onBack={() => {
        setActiveView('list');
        setSelectedEvent(null);
      }}
      onUpdate={loadEvents}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Event Management</h1>
            <p className="text-gray-400">Управление концертами и мероприятиями</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveView('create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Создать мероприятие
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Calendar}
            label="Всего мероприятий"
            value={stats.total}
            iconColor="text-purple-400"
          />
          <StatCard
            icon={Clock}
            label="Предстоящие"
            value={stats.upcoming}
            iconColor="text-blue-400"
          />
          <StatCard
            icon={Ticket}
            label="Продано билетов"
            value={stats.ticketsSold.toLocaleString()}
            iconColor="text-green-400"
          />
          <StatCard
            icon={DollarSign}
            label="Выручка"
            value={`${(stats.revenue / 1000).toFixed(0)}k ₽`}
            iconColor="text-yellow-400"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию, городу, площадке..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Все статусы</option>
              <option value="planning">Планирование</option>
              <option value="booking">Букинг</option>
              <option value="confirmed">Подтвержден</option>
              <option value="promotion">Продвижение</option>
              <option value="completed">Завершен</option>
            </select>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет мероприятий</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Попробуйте изменить параметры поиска'
                : 'Создайте свое первое мероприятие'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveView('create')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Создать мероприятие
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onClick={() => {
                  setSelectedEvent(event.id);
                  setActiveView('details');
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, iconColor }: {
  icon: any;
  label: string;
  value: string | number;
  iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-white/5 rounded-xl ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Event Card Component
function EventCard({ event, index, onClick }: {
  event: Event;
  index: number;
  onClick: () => void;
}) {
  const fillRate = Math.round((event.tickets_sold / event.expected_audience) * 100);
  const isUpcoming = new Date(event.event_date) > new Date();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 cursor-pointer hover:border-purple-500/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
            {event.event_name}
          </h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{event.city}, {event.venue}</span>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.status ? event.status : 'planning'}`}>
          {getStatusText(event.status)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-xs mb-1">Дата</p>
          <p className="text-white font-medium">{new Date(event.event_date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Билеты</p>
          <p className="text-white font-medium">{event.tickets_sold} / {event.expected_audience}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Выручка</p>
          <p className="text-white font-medium">{(event.revenue / 1000).toFixed(0)}k ₽</p>
        </div>
      </div>

      {/* Fill Rate Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Заполненность</span>
          <span className="text-white font-medium">{fillRate}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillRate}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-full ${
              fillRate >= 80 ? 'bg-green-500' :
              fillRate >= 50 ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          {isUpcoming ? (
            <>
              <Clock className="w-4 h-4" />
              <span>Через {Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дней</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Завершено</span>
            </>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
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