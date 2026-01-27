/**
 * PROMOTION PITCHING - Питчинг на радио и плейлисты
 * ИСПРАВЛЕННАЯ ВЕРСИЯ: toast, useAuth, обработка ошибок, перевод статусов
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  Music, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { toast } from 'sonner';

interface PitchingRequest {
  id: string;
  track_title: string;
  pitch_type: 'standard' | 'premium_direct_to_editor';
  target_channels: string[];
  status: string;
  responses_count: number;
  interested_count: number;
  added_to_rotation_count: number;
  created_at: string;
}

const PITCH_TYPES = [
  {
    id: 'standard',
    name: 'Стандартный питчинг',
    description: 'Отправка трека в общую базу радиостанций и плейлистов',
    price: 990,
    features: [
      'Доступ к 50+ радиостанциям',
      'Отправка в кураторские плейлисты',
      'Базовая аналитика откликов',
      'Срок рассмотрения: 7-14 дней',
    ],
  },
  {
    id: 'premium_direct_to_editor',
    name: 'Premium - Прямая отправка',
    description: 'Персональная отправка конкретным редакторам с гарантией прослушивания',
    price: 4990,
    features: [
      'Выбор конкретных редакторов',
      'Гарантия прослушивания',
      'Приоритетное рассмотрение',
      'Личная обратная связь',
      'Срок рассмотрения: 3-5 дней',
    ],
    recommended: true,
  },
];

const TARGET_CHANNELS = [
  { id: 'radio', name: 'Радиостанции', icon: Radio },
  { id: 'playlists', name: 'Плейлисты', icon: Music },
];

// Перевод статусов
const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  pending_payment: 'Ожидает оплаты',
  pending_review: 'На модерации',
  in_progress: 'В работе',
  completed: 'Завершено',
  rejected: 'Отклонено',
  cancelled: 'Отменено',
};

export function PromotionPitching() {
  const { subscription } = useSubscription();
  const { userId, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<PitchingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    track_id: '',
    track_title: '',
    pitch_type: 'standard',
    target_channels: ['radio', 'playlists'],
    message: '',
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadRequests();
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  const loadRequests = async (showToast = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log(`[Pitching] Loading requests for user: ${userId}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/promotion/pitching/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      console.log(`[Pitching] Response status: ${response.status}`);
      
      const data = await response.json();
      console.log(`[Pitching] Response data:`, data);
      
      // Если база не инициализирована - просто показываем пустое состояние (это прототип!)
      if (data._meta?.needsSetup) {
        console.log('[Pitching] Database not initialized yet - showing empty state');
        setRequests([]);
        setLoading(false);
        return;
      }

      // Проверяем success в теле ответа
      if (!data.success) {
        throw new Error(data.error || `Server returned success: false`);
      }

      setRequests(data.data || []);
      console.log(`[Pitching] ✅ Loaded ${data.data?.length || 0} requests`);
      
      if (showToast && data.data?.length > 0) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('[Pitching] Error loading pitching requests:', error);
      
      // Устанавливаем пустой массив вместо ошибки (graceful degradation)
      setRequests([]);
      setError(null);
      
      // Показываем toast только для серьезных ошибок (сеть, таймаут)
      if (message.includes('timeout') || message.includes('Network') || message.includes('fetch')) {
        toast.error('Ошибка сети', {
          description: 'Проверьте подключение к интернету',
          action: {
            label: 'Повторить',
            onClick: () => loadRequests(false),
          },
        });
      } else {
        // Для остальных случаев просто логируем
        console.log('[Pitching] No requests available, showing empty state');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.track_title) {
      toast.error('Название трека обязательно');
      return;
    }

    if (formData.track_title.length > 200) {
      toast.error('Название трека слишком длинное', {
        description: 'Максимум 200 символов',
      });
      return;
    }

    if (formData.message && formData.message.length > 2000) {
      toast.error('Сообщение слишком длинное', {
        description: 'Максимум 2000 символов',
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedType = PITCH_TYPES.find((t) => t.id === formData.pitch_type);
      const basePrice = selectedType?.price || 0;
      const discount = subscription?.limits.pitching_discount || 0;
      const finalPrice = Math.round(basePrice * (1 - discount));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/promotion/pitching/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            artist_id: userId,
            track_id: formData.track_id || `track-${Date.now()}`,
            track_title: formData.track_title,
            pitch_type: formData.pitch_type,
            target_channels: formData.target_channels,
            message: formData.message,
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
        toast.success('Заявка успешно отправлена!', {
          description: `Стоимость: ${finalPrice} коинов. Ожидайте рассмотрения.`,
          duration: 5000,
        });
        
        setShowForm(false);
        setFormData({
          track_id: '',
          track_title: '',
          pitch_type: 'standard',
          target_channels: ['radio', 'playlists'],
          message: '',
        });
        
        loadRequests(false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error submitting pitching request:', error);
      
      toast.error('Ошибка при отправке заявки', {
        description: message,
        action: {
          label: 'Повторить',
          onClick: () => handleSubmit(),
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDiscountedPrice = (price: number) => {
    if (!subscription?.limits.pitching_discount) return price;
    const discount = subscription.limits.pitching_discount;
    return Math.round(price * (1 - discount));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_payment: 'text-yellow-400',
      pending_review: 'text-blue-400',
      in_progress: 'text-purple-400',
      completed: 'text-green-400',
      rejected: 'text-red-400',
    };
    return colors[status] || 'text-white/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending_payment: Clock,
      pending_review: Clock,
      in_progress: TrendingUp,
      completed: CheckCircle2,
      rejected: XCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status] || status;
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
              onClick={() => loadRequests(false)}
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
            Назад к заявкам
          </button>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Radio className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Новая заявка на питчинг</h1>
            </div>
            <p className="text-white/60">
              Отправьте свой трек на рассмотрение радиостанциям и кураторам плейлистов
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Выберите тип питчинга</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PITCH_TYPES.map((type) => {
                const isSelected = formData.pitch_type === type.id;
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
                    onClick={() => setFormData({ ...formData, pitch_type: type.id })}
                  >
                    {type.recommended && (
                      <div className="absolute -top-3 right-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          РЕКОМЕНДУЕМ
                        </div>
                      </div>
                    )}

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
                          Скидка {Math.round(subscription.limits.pitching_discount * 100)}% по подписке
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">Информация о треке</h3>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Название трека <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.track_title}
                onChange={(e) => setFormData({ ...formData, track_title: e.target.value })}
                placeholder="Например: Summer Vibes"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.track_title.length}/200 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                Сообщение для редакторов (опционально)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Расскажите о своём треке, вдохновении, особенностях..."
                maxLength={2000}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.message.length}/2000 символов
              </p>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">Куда отправить</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TARGET_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                const isSelected = formData.target_channels.includes(channel.id);
                
                return (
                  <div
                    key={channel.id}
                    onClick={() => {
                      if (isSelected) {
                        setFormData({
                          ...formData,
                          target_channels: formData.target_channels.filter((c) => c !== channel.id),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          target_channels: [...formData.target_channels, channel.id],
                        });
                      }
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                      <span className="text-white font-medium">{channel.name}</span>
                    </div>
                  </div>
                );
              })}
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
              disabled={submitting || !formData.track_title}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Отправить заявку
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
              <Radio className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Питчинг</h1>
                <p className="text-white/60">Отправка треков на радио и в плейлисты</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Новая заявка
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Всего заявок</p>
            <p className="text-3xl font-bold text-white">{requests.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">В работе</p>
            <p className="text-3xl font-bold text-purple-400">
              {requests.filter((r) => r.status === 'in_progress').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Завершено</p>
            <p className="text-3xl font-bold text-green-400">
              {requests.filter((r) => r.status === 'completed').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Откликов</p>
            <p className="text-3xl font-bold text-cyan-400">
              {requests.reduce((sum, r) => sum + r.responses_count, 0)}
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Radio className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет заявок</h3>
            <p className="text-white/60 mb-6">
              Начните продвижение, отправив первую заявку на питчинг
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Создать заявку
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {request.track_title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>ID: {request.id}</span>
                        <span>•</span>
                        <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {request.pitch_type === 'standard' ? 'Стандарт' : 'Premium'}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${getStatusColor(request.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{getStatusLabel(request.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white mb-1">{request.responses_count}</p>
                      <p className="text-xs text-white/60">Ответов</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-green-400 mb-1">{request.interested_count}</p>
                      <p className="text-xs text-white/60">Заинтересованы</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-purple-400 mb-1">{request.added_to_rotation_count}</p>
                      <p className="text-xs text-white/60">В ротации</p>
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