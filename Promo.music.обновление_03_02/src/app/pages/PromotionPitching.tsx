/**
 * PROMOTION PITCHING - Питчинг на радио, стриминги и заведения
 * Полная система с расчетом цен и скидками
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
  Loader2,
  Store,
  Tv,
  Coins
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
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
    description: 'Базовая подача на выбранные каналы',
    basePrice: 5000,
    features: [
      'Рассылка на выбранные платформы',
      'Базовая аналитика откликов',
      'Поддержка по email',
      'Срок рассмотрения: 7-14 дней',
    ],
  },
  {
    id: 'premium_direct_to_editor',
    name: 'Premium - Прямая отправка',
    description: 'Персональная рассылка редакторам с гарантированным просмотром',
    basePrice: 5000,
    premiumAdd: 15000,
    features: [
      'Прямая отправка конкретным редакторам',
      'Гарантия прослушивания',
      'Приоритетное рассмотрение',
      'Личная обратная связь от редакторов',
      'Срок рассмотрения: 3-5 дней',
      'БЕСПЛАТНО для подписки ЭЛИТ',
    ],
    recommended: true,
  },
];

// Целевые каналы с ценами
const TARGET_CHANNELS = [
  { 
    id: 'radio', 
    name: 'Радиостанции', 
    icon: Radio,
    description: 'FM и онлайн-радио по всей России',
    price: 3000
  },
  { 
    id: 'streaming', 
    name: 'Стриминги', 
    icon: Music,
    description: 'Spotify, Яндекс.Музыка, VK Музыка',
    price: 5000
  },
  { 
    id: 'venues', 
    name: 'Заведения', 
    icon: Store,
    description: 'Клубы, бары, рестораны, кафе',
    price: 1500
  },
  { 
    id: 'tv', 
    name: 'Телевидение', 
    icon: Tv,
    description: 'ТВ каналы и музыкальные шоу',
    price: 7000
  },
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
    target_channels: ['radio', 'streaming'],
    message: '',
  });

  // Расчет цены
  const calculateTotalPrice = () => {
    const selectedType = PITCH_TYPES.find((t) => t.id === formData.pitch_type);
    if (!selectedType) return 0;

    // Базовая услуга
    let total = selectedType.basePrice;

    // Премиум добавка (бесплатно для ЭЛИТ)
    if (formData.pitch_type === 'premium_direct_to_editor') {
      const isElite = subscription?.tier === 'elite';
      if (!isElite) {
        total += selectedType.premiumAdd || 0;
      }
    }

    // Добавляем стоимость каналов
    formData.target_channels.forEach((channelId) => {
      const channel = TARGET_CHANNELS.find((c) => c.id === channelId);
      if (channel) {
        total += channel.price;
      }
    });

    // Применяем скидку подписки
    const discount = subscription?.limits.marketing_discount || 0;
    total = Math.round(total * (1 - discount));

    return total;
  };

  // Вспомогательная функция для расчета цены со скидкой
  const getDiscountedPrice = (originalPrice: number) => {
    const discount = subscription?.limits.pitching_discount || 0;
    return Math.round(originalPrice * (1 - discount));
  };

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchRequests();
    }
  }, [isAuthenticated, userId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/pitching`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка загрузки заявок: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Pitching fetch error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      toast.error('Не удалось загрузить заявки на питчинг');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.track_title.trim()) {
      toast.error('Укажите название трека');
      return;
    }

    if (formData.target_channels.length === 0) {
      toast.error('Выберите хотя бы одну площадку');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/pitching`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            total_price: calculateTotalPrice(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания заявки');
      }

      toast.success('Заявка на питчинг успешно создана!');
      setShowForm(false);
      setFormData({
        track_id: '',
        track_title: '',
        pitch_type: 'standard',
        target_channels: ['radio', 'streaming'],
        message: '',
      });
      fetchRequests();
    } catch (err) {
      console.error('Pitching submit error:', err);
      toast.error(err instanceof Error ? err.message : 'Ошибка отправки заявки');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowForm(false)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Новая заявка на питчинг</h2>
            <p className="text-white/60 text-sm">Отправьте трек на радиостанции, в стриминги и заведения</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Выберите тип питчинга</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PITCH_TYPES.map((type) => {
                const isSelected = formData.pitch_type === type.id;
                
                // Правильный расчет цены с учетом премиум добавки
                let originalPrice = type.basePrice;
                const isElite = subscription?.tier === 'elite';
                
                // Для премиум типа добавляем премиум надбавку (если не ЭЛИТ)
                if (type.id === 'premium_direct_to_editor' && type.premiumAdd) {
                  if (!isElite) {
                    originalPrice += type.premiumAdd;
                  }
                }
                
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
                      {isElite && type.id === 'premium_direct_to_editor' ? (
                        <div>
                          <span className="text-2xl font-bold text-green-400">
                            БЕСПЛАТНО
                          </span>
                          <p className="text-green-400 text-sm mt-1">
                            🎉 Включено в подписку ЭЛИТ
                          </p>
                        </div>
                      ) : (
                        <div>
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
            <p className="text-white/60 text-sm">Выберите одну или несколько площадок для продвижения</p>
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
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                      <div className="flex-1">
                        <span className="text-white font-medium block mb-1">{channel.name}</span>
                        <span className="text-white/50 text-xs block mb-2">{channel.description}</span>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-purple-300' : 'text-white/70'}`}>
                          +{channel.price.toLocaleString()} ₽
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {formData.target_channels.length === 0 && (
              <p className="text-yellow-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Выберите хотя бы одну площадку
              </p>
            )}
          </div>

          {/* Итоговая стоимость */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Итоговая стоимость</h3>
                <p className="text-white/60 text-sm">Все налоги и скидки учтены</p>
              </div>
              <Coins className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
              {/* Базовая услуга */}
              <div className="flex justify-between text-sm">
                <span className="text-white/70">
                  {formData.pitch_type === 'premium_direct_to_editor' ? 'Premium рассылка' : 'Стандартная рассылка'}
                </span>
                <span className="text-white font-medium">
                  {PITCH_TYPES.find(t => t.id === formData.pitch_type)?.basePrice.toLocaleString()} ₽
                </span>
              </div>
              
              {/* Премиум надбавка */}
              {formData.pitch_type === 'premium_direct_to_editor' && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Премиум надбавка</span>
                  {subscription?.tier === 'elite' ? (
                    <span className="text-green-400 font-medium">БЕСПЛАТНО 🎉</span>
                  ) : (
                    <span className="text-white font-medium">
                      +{PITCH_TYPES.find(t => t.id === formData.pitch_type)?.premiumAdd?.toLocaleString()} ₽
                    </span>
                  )}
                </div>
              )}
              
              {/* Каналы */}
              {formData.target_channels.map(channelId => {
                const channel = TARGET_CHANNELS.find(c => c.id === channelId);
                if (!channel) return null;
                return (
                  <div key={channelId} className="flex justify-between text-sm">
                    <span className="text-white/70">{channel.name}</span>
                    <span className="text-white font-medium">+{channel.price.toLocaleString()} ₽</span>
                  </div>
                );
              })}
              
              {/* Скидка подписки */}
              {subscription && subscription.limits.marketing_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Скидка подписки {subscription.tier.toUpperCase()}</span>
                  <span className="text-green-400 font-medium">
                    -{Math.round(subscription.limits.marketing_discount * 100)}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-baseline justify-between">
              <span className="text-white/80 text-lg">К оплате:</span>
              <span className="text-3xl font-bold text-white">
                {calculateTotalPrice().toLocaleString()} ₽
              </span>
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
              disabled={submitting || !formData.track_title.trim() || formData.target_channels.length === 0}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Питчинг</h2>
          <p className="text-white/60">Отправка треков на радио, в стриминги и заведения</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          Новая заявка
        </button>
      </div>

      {/* Информационные карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-6 h-6 text-purple-400" />
            <h3 className="text-white font-semibold">Радиостанции</h3>
          </div>
          <p className="text-white/60 text-sm mb-2">FM и онлайн-радио</p>
          <p className="text-2xl font-bold text-white">+3,000 ₽</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-6 h-6 text-green-400" />
            <h3 className="text-white font-semibold">Стриминги</h3>
          </div>
          <p className="text-white/60 text-sm mb-2">Spotify, Яндекс, VK</p>
          <p className="text-2xl font-bold text-white">+5,000 ₽</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Store className="w-6 h-6 text-yellow-400" />
            <h3 className="text-white font-semibold">Заведения</h3>
          </div>
          <p className="text-white/60 text-sm mb-2">Клубы, бары, кафе</p>
          <p className="text-2xl font-bold text-white">+1,500 ₽</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-6 h-6 text-pink-400" />
            <h3 className="text-white font-semibold">Телевидение</h3>
          </div>
          <p className="text-white/60 text-sm mb-2">ТВ каналы и шоу</p>
          <p className="text-2xl font-bold text-white">+7,000 ₽</p>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Список заявок */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Мои заявки</h3>
          <div className="grid gap-4">
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {request.track_title}
                    </h4>
                    <p className="text-white/60 text-sm">
                      {request.pitch_type === 'premium_direct_to_editor' ? 'Premium рассылка' : 'Стандартный питчинг'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    request.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    request.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {STATUS_LABELS[request.status] || request.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Откликов</p>
                    <p className="text-white font-semibold">{request.responses_count}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Заинтересованы</p>
                    <p className="text-green-400 font-semibold">{request.interested_count}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">В ротации</p>
                    <p className="text-purple-400 font-semibold">{request.added_to_rotation_count}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {request.target_channels.map((channelId) => {
                    const channel = TARGET_CHANNELS.find((c) => c.id === channelId);
                    if (!channel) return null;
                    const Icon = channel.icon;
                    return (
                      <div
                        key={channelId}
                        className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg"
                      >
                        <Icon className="w-4 h-4 text-white/60" />
                        <span className="text-white/70 text-sm">{channel.name}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            У вас пока нет заявок на питчинг
          </h3>
          <p className="text-white/60 mb-6">
            Создайте первую заявку и начните продвигать свою музыку
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Создать заявку
          </button>
        </div>
      )}
    </div>
  );
}