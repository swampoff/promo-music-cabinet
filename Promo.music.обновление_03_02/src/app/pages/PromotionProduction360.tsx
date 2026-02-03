/**
 * PROMOTION PRODUCTION 360° - Видео, монтаж, дизайн
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Camera,
  Scissors,
  Palette,
  Package,
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface ProductionRequest {
  id: string;
  service_type: string;
  project_title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  progress: number;
  created_at: string;
}

const SERVICE_TYPES = [
  {
    id: 'video_shooting',
    name: 'Съёмка видеоклипа',
    description: 'Профессиональная съёмка с командой',
    icon: Camera,
    price: 50000,
    features: [
      'Режиссёр и оператор',
      '4K съёмка',
      'Локация и реквизит',
      'До 2 съёмочных дней',
    ],
  },
  {
    id: 'video_editing',
    name: 'Монтаж и постпродакшн',
    description: 'Профессиональный монтаж видео',
    icon: Scissors,
    price: 25000,
    features: [
      'Цветокоррекция',
      'Звуковой дизайн',
      'Спецэффекты',
      'До 3 правок',
    ],
  },
  {
    id: 'cover_design',
    name: 'Дизайн обложки',
    description: 'Обложка для трека/альбома',
    icon: Palette,
    price: 5000,
    features: [
      'Уникальный дизайн',
      'Все форматы',
      '3 варианта на выбор',
      'Исходники',
    ],
  },
  {
    id: 'full_package',
    name: 'Полный пакет 360°',
    description: 'Всё включено: от идеи до релиза',
    icon: Package,
    price: 150000,
    features: [
      'Съёмка клипа',
      'Монтаж и постпродакшн',
      'Дизайн обложки',
      'Тизеры для соцсетей',
      'Консультация SMM',
    ],
    recommended: true,
  },
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  pending_payment: 'Ожидает оплаты',
  in_review: 'На рассмотрении',
  in_production: 'В работе',
  revision: 'На доработке',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

export function PromotionProduction360() {
  const { subscription } = useSubscription();
  const { userId, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<ProductionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    service_type: 'video_shooting',
    project_title: '',
    description: '',
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
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/production360/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();
      
      // Если база не инициализирована - просто показываем пустое состояние (это прототип!)
      if (data._meta?.needsSetup) {
        console.log('[Production360] Database not initialized yet - showing empty state');
        setRequests([]);
        setLoading(false);
        return;
      }

      // Проверяем success в теле ответа
      if (!data.success) {
        throw new Error(data.error || `Server returned success: false`);
      }

      setRequests(data.data || []);
      console.log(`[Production360] ✅ Loaded ${data.data?.length || 0} requests`);
      
      if (showToast && data.data?.length > 0) {
        toast.success('Данные обновлены');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('[Production360] Error loading production requests:', error);
      
      // Устанавливаем пустой массив вместо ошибки (graceful degradation)
      setRequests([]);
      setError(null);
      
      // Показываем toast только для серьезных ошибок
      if (message.includes('timeout') || message.includes('Network') || message.includes('fetch')) {
        toast.error('Ошибка сети', {
          description: 'Проверьте подключение к интернету',
          action: {
            label: 'Повторить',
            onClick: () => loadRequests(false),
          },
        });
      } else {
        console.log('[Production360] No requests available, showing empty state');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.project_title) {
      toast.error('Название проекта обязательно');
      return;
    }

    if (formData.project_title.length > 200) {
      toast.error('Название слишком длинное', {
        description: 'Максимум 200 символов',
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedType = SERVICE_TYPES.find((t) => t.id === formData.service_type);
      const basePrice = selectedType?.price || 0;
      const discount = subscription?.limits.marketing_discount || 0;
      const finalPrice = Math.round(basePrice * (1 - discount));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/production360/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            artist_id: userId,
            service_type: formData.service_type,
            project_title: formData.project_title,
            description: formData.description,
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
          service_type: 'video_shooting',
          project_title: '',
          description: '',
          deadline: '',
        });
        
        loadRequests(false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error submitting production request:', error);
      
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
      in_review: 'text-blue-400',
      in_production: 'text-purple-400',
      revision: 'text-orange-400',
      completed: 'text-green-400',
      cancelled: 'text-red-400',
    };
    return colors[status] || 'text-white/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending_payment: Clock,
      in_review: Clock,
      in_production: TrendingUp,
      revision: AlertCircle,
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
            Назад к проектам
          </button>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Video className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Новый проект 360°</h1>
            </div>
            <p className="text-white/60">
              Профессиональное производство контента от идеи до релиза
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Выберите услугу</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.service_type === type.id;
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
                    onClick={() => setFormData({ ...formData, service_type: type.id })}
                  >
                    {type.recommended && (
                      <div className="absolute -top-3 right-4">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          ЛУЧШИЙ ВЫБОР
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
            <h3 className="text-xl font-semibold text-white">Детали проекта</h3>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Название проекта <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.project_title}
                onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                placeholder="Например: Видеоклип на трек Summer"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.project_title.length}/200 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                Описание и пожелания
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Расскажите о вашей идее, стиле, референсах..."
                maxLength={2000}
                rows={5}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.description.length}/2000 символов
              </p>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Желаемый срок завершения
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
              disabled={submitting || !formData.project_title}
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
                  Создать проект
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
              <Video className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Production 360°</h1>
                <p className="text-white/60">Профессиональное производство контента</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Новый проект
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Всего проектов</p>
            <p className="text-3xl font-bold text-white">{requests.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">В работе</p>
            <p className="text-3xl font-bold text-purple-400">
              {requests.filter((r) => r.status === 'in_production').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Завершено</p>
            <p className="text-3xl font-bold text-green-400">
              {requests.filter((r) => r.status === 'completed').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Средний прогресс</p>
            <p className="text-3xl font-bold text-cyan-400">
              {requests.length > 0 
                ? Math.round(requests.reduce((sum, r) => sum + r.progress, 0) / requests.length)
                : 0}%
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет проектов</h3>
            <p className="text-white/60 mb-6">
              Создайте первый проект для профессионального производства контента
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Создать проект
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const StatusIcon = getStatusIcon(request.status);
              const serviceType = SERVICE_TYPES.find(s => s.id === request.service_type);
              const ServiceIcon = serviceType?.icon || Video;
              
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
                        <ServiceIcon className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">
                          {request.project_title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{serviceType?.name || request.service_type}</span>
                        <span>•</span>
                        <span>{new Date(request.created_at).toLocaleDateString('ru-RU')}</span>
                        {request.deadline && (
                          <>
                            <span>•</span>
                            <span>Срок: {new Date(request.deadline).toLocaleDateString('ru-RU')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${getStatusColor(request.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{STATUS_LABELS[request.status] || request.status}</span>
                    </div>
                  </div>

                  {request.description && (
                    <p className="text-white/60 text-sm mb-4">{request.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Прогресс</span>
                      <span className="text-white font-semibold">{request.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${request.progress}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
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