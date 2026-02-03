/**
 * PROMOTION MEDIA - PR и работа со СМИ
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Newspaper,
  Mic,
  FileText,
  Radio as Podcast,
  Package,
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  Loader2,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface MediaRequest {
  id: string;
  outreach_type: string;
  topic: string;
  angle: string;
  target_media: string[];
  budget: number;
  deadline: string;
  status: string;
  publications: Array<{
    outlet: string;
    url: string;
    published_at: string;
    reach: number;
  }>;
  reach_total: number;
  created_at: string;
}

const OUTREACH_TYPES = [
  {
    id: 'press_release',
    name: 'Пресс-релиз',
    description: 'Подготовка и распространение пресс-релиза',
    icon: FileText,
    price: 15000,
    features: [
      'Написание текста',
      'Дистрибуция в СМИ',
      'До 30 медиа',
      'Отчёт по публикациям',
    ],
  },
  {
    id: 'interview',
    name: 'Интервью',
    description: 'Организация интервью в топовых СМИ',
    icon: Mic,
    price: 25000,
    features: [
      'Подбор изданий',
      'Подготовка к интервью',
      '1-2 интервью',
      'Публикация и промо',
    ],
    recommended: true,
  },
  {
    id: 'feature',
    name: 'Статья/Feature',
    description: 'Большая статья о вас в крупном издании',
    icon: Newspaper,
    price: 40000,
    features: [
      'Premium издание',
      'Развёрнутый материал',
      'Фотосессия',
      'Соцсети издания',
    ],
  },
  {
    id: 'podcast',
    name: 'Подкаст',
    description: 'Участие в популярных подкастах',
    icon: Podcast,
    price: 20000,
    features: [
      'Подбор подкастов',
      'Подготовка сценария',
      '1-2 выпуска',
      'Промо эпизода',
    ],
  },
  {
    id: 'full_pr',
    name: 'Полный PR-пакет',
    description: 'Комплексная работа со СМИ',
    icon: Package,
    price: 120000,
    features: [
      'Все типы активностей',
      'Персональный PR-менеджер',
      'Медиаплан на 3 месяца',
      'Гарантированные публикации',
      'Кризис-менеджмент',
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  pending_payment: 'Ожидает оплаты',
  outreach: 'Работа со СМИ',
  scheduled: 'Запланировано',
  published: 'Опубликовано',
  declined: 'Отклонено',
  cancelled: 'Отменено',
};

export function PromotionMedia() {
  const { subscription } = useSubscription();
  const { userId, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    outreach_type: 'press_release',
    topic: '',
    angle: '',
    target_media: [] as string[],
    deadline: '',
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/media/${userId}`,
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
      setRequests(data.data || []);
      
      if (showToast) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(message);
      console.error('Error loading media requests:', error);
      
      toast.error('Ошибка загрузки данных', {
        description: message,
        action: {
          label: 'Повторить',
          onClick: () => loadRequests(false),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.topic) {
      toast.error('Тема обязательна');
      return;
    }

    if (formData.topic.length > 200) {
      toast.error('Тема слишком длинная', {
        description: 'Максимум 200 символов',
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedType = OUTREACH_TYPES.find((t) => t.id === formData.outreach_type);
      const basePrice = selectedType?.price || 0;
      const discount = subscription?.limits.marketing_discount || 0;
      const finalPrice = Math.round(basePrice * (1 - discount));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/media/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            artist_id: userId,
            outreach_type: formData.outreach_type,
            topic: formData.topic,
            angle: formData.angle,
            target_media: formData.target_media,
            budget: finalPrice,
            deadline: formData.deadline || null,
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
        toast.success('Заявка успешно создана!', {
          description: `Стоимость: ${finalPrice.toLocaleString()} ₽`,
          duration: 5000,
        });
        
        setShowForm(false);
        setFormData({
          outreach_type: 'press_release',
          topic: '',
          angle: '',
          target_media: [],
          deadline: '',
        });
        
        loadRequests(false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error submitting media request:', error);
      
      toast.error('Ошибка при создании заявки', {
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
      pending_payment: 'text-yellow-400',
      outreach: 'text-blue-400',
      scheduled: 'text-purple-400',
      published: 'text-green-400',
      declined: 'text-red-400',
      cancelled: 'text-red-400',
    };
    return colors[status] || 'text-white/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending_payment: Clock,
      outreach: TrendingUp,
      scheduled: Calendar,
      published: CheckCircle2,
      declined: XCircle,
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
              <Newspaper className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Новая PR-заявка</h1>
            </div>
            <p className="text-white/60">
              Работа со СМИ, интервью и публикации
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Тип активности</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OUTREACH_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.outreach_type === type.id;
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
                    onClick={() => setFormData({ ...formData, outreach_type: type.id })}
                  >
                    {type.recommended && (
                      <div className="absolute -top-3 right-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ПОПУЛЯРНО
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
            <h3 className="text-xl font-semibold text-white">Детали</h3>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Тема/Инфоповод <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Например: Релиз нового альбома"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.topic.length}/200 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                Angle/Подача (как подать материал?)
              </label>
              <textarea
                value={formData.angle}
                onChange={(e) => setFormData({ ...formData, angle: e.target.value })}
                placeholder="Как вы хотите представить эту историю? Что важно подчеркнуть?"
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.angle.length}/500 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Желаемая дата публикации
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
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
              disabled={submitting || !formData.topic}
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
              <Newspaper className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">PR & СМИ</h1>
                <p className="text-white/60">Публикации, интервью и медиа-присутствие</p>
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
            <p className="text-3xl font-bold text-blue-400">
              {requests.filter((r) => r.status === 'outreach' || r.status === 'scheduled').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Опубликовано</p>
            <p className="text-3xl font-bold text-green-400">
              {requests.filter((r) => r.status === 'published').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Охват</p>
            <p className="text-3xl font-bold text-cyan-400">
              {requests.reduce((sum, r) => sum + r.reach_total, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Newspaper className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет заявок</h3>
            <p className="text-white/60 mb-6">
              Начните работу со СМИ для повышения узнаваемости
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
              const outreachType = OUTREACH_TYPES.find(t => t.id === request.outreach_type);
              const TypeIcon = outreachType?.icon || Newspaper;
              
              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <TypeIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">
                          {request.topic}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{outreachType?.name || request.outreach_type}</span>
                        <span>•</span>
                        <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
                        {request.deadline && (
                          <>
                            <span>•</span>
                            <span>Дедлайн: {new Date(request.deadline).toLocaleDateString('ru-RU')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${getStatusColor(request.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{STATUS_LABELS[request.status] || request.status}</span>
                    </div>
                  </div>

                  {request.angle && (
                    <p className="text-white/60 text-sm mb-4">{request.angle}</p>
                  )}

                  {request.publications && request.publications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white/80 font-semibold text-sm mb-2">Публикации:</h4>
                      {request.publications.map((pub, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex-1">
                            <p className="text-white font-medium">{pub.outlet}</p>
                            <p className="text-white/60 text-xs">{new Date(pub.published_at).toLocaleDateString('ru-RU')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-cyan-400 text-sm">{pub.reach.toLocaleString()} охват</span>
                            <a
                              href={pub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {request.reach_total > 0 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm">Общий охват:</span>
                        <span className="text-2xl font-bold text-cyan-400">{request.reach_total.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
