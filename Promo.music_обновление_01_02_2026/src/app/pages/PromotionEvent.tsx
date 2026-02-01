/**
 * PROMOTION EVENT - Концерты и события
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music2,
  Mic2,
  Users,
  Globe,
  Package,
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Ticket,
  DollarSign
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface EventRequest {
  id: string;
  event_type: string;
  event_name: string;
  city: string;
  venue: string;
  event_date: string;
  expected_audience: number;
  budget: number;
  status: string;
  tickets_sold: number;
  revenue: number;
  team: Record<string, string>;
  created_at: string;
}

const EVENT_TYPES = [
  {
    id: 'concert',
    name: 'Концерт',
    description: 'Сольный концерт в зале',
    icon: Music2,
    price: 80000,
    features: [
      'Аренда площадки',
      'Звук и свет',
      'Организация и координация',
      'Билетинг',
    ],
  },
  {
    id: 'festival',
    name: 'Фестиваль',
    description: 'Участие в музыкальном фестивале',
    icon: Users,
    price: 50000,
    features: [
      'Подбор фестивалей',
      'Переговоры',
      'Логистика',
      'Промо выступления',
    ],
    recommended: true,
  },
  {
    id: 'club_show',
    name: 'Клубный концерт',
    description: 'Выступление в клубе',
    icon: Mic2,
    price: 30000,
    features: [
      'Букинг клубов',
      'Техническая поддержка',
      'Промо-кампания',
      'Билетная система',
    ],
  },
  {
    id: 'online_event',
    name: 'Онлайн-концерт',
    description: 'Стриминг-концерт',
    icon: Globe,
    price: 40000,
    features: [
      'Студия с оборудованием',
      'Трансляция',
      'Интерактив',
      'Запись и монтаж',
    ],
  },
  {
    id: 'tour',
    name: 'Тур',
    description: 'Организация тура по городам',
    icon: Package,
    price: 250000,
    features: [
      '5-10 городов',
      'Полная организация',
      'Логистика и проживание',
      'Маркетинг тура',
      'Тур-менеджер',
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  planning: 'Планирование',
  booking: 'Букинг',
  confirmed: 'Подтверждено',
  promotion: 'Промо',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

export function PromotionEvent() {
  const { subscription } = useSubscription();
  const { userId, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    event_type: 'concert',
    event_name: '',
    city: '',
    venue: '',
    event_date: '',
    expected_audience: 100,
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadEvents();
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  const loadEvents = async (showToast = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/event/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.data || []);
      
      if (showToast) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(message);
      console.error('Error loading events:', error);
      
      toast.error('Ошибка загрузки данных', {
        description: message,
        action: {
          label: 'Повторить',
          onClick: () => loadEvents(false),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.event_name) {
      toast.error('Название события обязательно');
      return;
    }

    setSubmitting(true);

    try {
      const selectedType = EVENT_TYPES.find((t) => t.id === formData.event_type);
      const basePrice = selectedType?.price || 0;
      const discount = subscription?.limits.marketing_discount || 0;
      const finalPrice = Math.round(basePrice * (1 - discount));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/event/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            artist_id: userId,
            event_type: formData.event_type,
            event_name: formData.event_name,
            city: formData.city,
            venue: formData.venue,
            event_date: formData.event_date,
            expected_audience: formData.expected_audience,
            budget: finalPrice,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Failed to submit');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Событие успешно создано!', {
          description: `Бюджет: ${finalPrice.toLocaleString()} ₽`,
          duration: 5000,
        });
        
        setShowForm(false);
        setFormData({
          event_type: 'concert',
          event_name: '',
          city: '',
          venue: '',
          event_date: '',
          expected_audience: 100,
        });
        
        loadEvents(false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error submitting event:', error);
      
      toast.error('Ошибка при создании события', {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscountedPrice = (price: number) => {
    if (!subscription?.limits.marketing_discount) return price;
    const discount = subscription.limits.marketing_discount;
    return Math.round(price * (1 - discount));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'text-blue-400',
      booking: 'text-yellow-400',
      confirmed: 'text-green-400',
      promotion: 'text-purple-400',
      completed: 'text-cyan-400',
      cancelled: 'text-red-400',
    };
    return colors[status] || 'text-white/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      planning: Clock,
      booking: TrendingUp,
      confirmed: CheckCircle2,
      promotion: TrendingUp,
      completed: CheckCircle2,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 mb-4 animate-spin mx-auto" />
          <p className="text-white/60">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">Ошибка загрузки</h3>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => loadEvents(false)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к событиям
          </button>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Music2 className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Новое событие</h1>
            </div>
            <p className="text-white/60">
              Организация концертов, туров и выступлений
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Тип события</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EVENT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.event_type === type.id;
                const originalPrice = type.price;
                const discountedPrice = getDiscountedPrice(originalPrice);
                const hasDiscount = discountedPrice !== originalPrice;

                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    className={`relative backdrop-blur-xl rounded-2xl p-6 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                    onClick={() => setFormData({ ...formData, event_type: type.id })}
                  >
                    {type.recommended && (
                      <div className="absolute -top-3 right-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ХИТ
                        </div>
                      </div>
                    )}

                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                    <h4 className="text-lg font-semibold text-white mb-2">{type.name}</h4>
                    <p className="text-white/60 text-sm mb-4">{type.description}</p>

                    <ul className="space-y-2 mb-4">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-white/70">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-white/40 line-through text-lg">
                            {originalPrice.toLocaleString()} ₽
                          </span>
                        )}
                        <span className="text-2xl font-bold text-white">
                          {discountedPrice.toLocaleString()} ₽
                        </span>
                      </div>
                      {hasDiscount && subscription && (
                        <p className="text-green-400 text-sm mt-1">
                          Скидка {Math.round(subscription.limits.marketing_discount * 100)}% по подписке
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">Детали события</h3>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Название события <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                placeholder="Например: Summer Tour 2026"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Город
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Москва"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Площадка
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Клуб/Зал"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Дата события
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Ожидаемая аудитория
                </label>
                <input
                  type="number"
                  value={formData.expected_audience}
                  onChange={(e) => setFormData({ ...formData, expected_audience: parseInt(e.target.value) || 100 })}
                  min={10}
                  max={100000}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.event_name}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Создать событие
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music2 className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">События</h1>
                <p className="text-white/60">Концерты, туры и выступления</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Новое событие
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Всего событий</p>
            <p className="text-3xl font-bold text-white">{events.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Подтверждено</p>
            <p className="text-3xl font-bold text-green-400">
              {events.filter((e) => e.status === 'confirmed' || e.status === 'promotion').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Билетов продано</p>
            <p className="text-3xl font-bold text-purple-400">
              {events.reduce((sum, e) => sum + e.tickets_sold, 0).toLocaleString()}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Выручка</p>
            <p className="text-3xl font-bold text-cyan-400">
              {events.reduce((sum, e) => sum + e.revenue, 0).toLocaleString()} ₽
            </p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет событий</h3>
            <p className="text-white/60 mb-6">
              Начните организацию концертов и туров
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Создать событие
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const StatusIcon = getStatusIcon(event.status);
              const eventType = EVENT_TYPES.find(t => t.id === event.event_type);
              const TypeIcon = eventType?.icon || Music2;
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <TypeIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">
                          {event.event_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{eventType?.name || event.event_type}</span>
                        {event.city && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.city}
                            </span>
                          </>
                        )}
                        {event.event_date && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(event.event_date).toLocaleDateString('ru-RU')}
                            </span>
                          </>
                        )}
                      </div>
                      {event.venue && (
                        <p className="text-white/60 text-sm mt-1">{event.venue}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${getStatusColor(event.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{STATUS_LABELS[event.status] || event.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white mb-1">{event.expected_audience}</p>
                      <p className="text-xs text-white/60">Ожидается</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-purple-400 mb-1">
                        <Ticket className="w-6 h-6 mx-auto mb-1" />
                        {event.tickets_sold}
                      </p>
                      <p className="text-xs text-white/60">Продано</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-green-400 mb-1">
                        {event.tickets_sold > 0 ? Math.round((event.tickets_sold / event.expected_audience) * 100) : 0}%
                      </p>
                      <p className="text-xs text-white/60">Заполнение</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-cyan-400 mb-1">
                        <DollarSign className="w-6 h-6 mx-auto mb-1" />
                        {(event.revenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-xs text-white/60">Выручка</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
