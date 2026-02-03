/**
 * PROMOTION MARKETING - Маркетинговые кампании
 * Enterprise-уровень с системой выбора слотов и блогеров
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp,
  Target,
  Users,
  Mail,
  FileText,
  Package,
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Pause,
  Play,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Instagram,
  Facebook,
  Youtube,
  Database,
  ExternalLink,
  MapPin,
  Heart,
  Briefcase,
  Radio,
  MessageCircle,
  DollarSign,
  Calendar,
  BarChart3,
  Filter,
  Globe,
  Zap,
  UserPlus,
  Settings,
  Megaphone,
  Share2,
  Plus,
  Trash2,
  Music,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  X
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface PromotionMarketingProps {
  onBack?: () => void;
}

interface MarketingCampaign {
  id: string;
  campaign_name: string;
  campaign_type: string;
  budget: number;
  duration_days: number;
  platforms: string[];
  status: string;
  description?: string;
  content_ids?: string[];
  expected_results?: ExpectedResults;
  creatives?: string[];
  brandbook_url?: string;
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    reach?: number;
    engagement?: number;
  };
  roi: number;
  created_at: string;
  started_at?: string;
  targeting?: TargetingConfig;
  blogger_slots?: BloggerSlot[];
}

interface ExpectedResults {
  reach?: number;
  engagement?: number;
  conversions?: number;
  ctr?: number;
}

interface TargetingConfig {
  age_from: number;
  age_to: number;
  genders: string[];
  geo: string[];
  interests: string[];
  lookalike: boolean;
  custom_audiences: string[];
  description?: string;
}

interface BloggerSlot {
  id: string;
  platform: 'instagram' | 'vk' | 'telegram' | 'youtube' | 'tiktok';
  blogger_name: string;
  blogger_link: string;
  subscribers: number;
  category: string;
  content_types: string[]; // ['post', 'stories', 'video', 'reels']
  price_per_slot: number;
  slots_count: number;
}

type CampaignStep = 'slots' | 'content' | 'targeting' | 'bloggers' | 'review';

// Типы рекламных слотов
const SLOT_TYPES = [
  {
    id: 'post',
    name: 'Пост в ленте',
    description: 'Публикация в основной ленте профиля',
    icon: FileText,
    base_price: 5000,
  },
  {
    id: 'stories',
    name: 'Stories',
    description: 'Истории, доступные 24 часа',
    icon: Instagram,
    base_price: 3000,
  },
  {
    id: 'video',
    name: 'Видео',
    description: 'Полноценное видео на канале',
    icon: Video,
    base_price: 15000,
  },
  {
    id: 'reels',
    name: 'Reels/Shorts',
    description: 'Короткие вертикальные видео',
    icon: Zap,
    base_price: 8000,
  },
  {
    id: 'integration',
    name: 'Интеграция',
    description: 'Нативная интеграция в контент',
    icon: Share2,
    base_price: 20000,
  },
];

// Платформы
const PLATFORMS = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: Instagram,
    multiplier: 1.0,
    included_in_subscription: ['post', 'stories'],
  },
  { 
    id: 'vk', 
    name: 'VK', 
    icon: Facebook,
    multiplier: 0.8,
    included_in_subscription: ['post'],
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: MessageCircle,
    multiplier: 0.7,
    included_in_subscription: [],
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: Youtube,
    multiplier: 1.5,
    included_in_subscription: [],
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: Music,
    multiplier: 1.2,
    included_in_subscription: ['reels'],
  },
];

// Категории блогеров
const BLOGGER_CATEGORIES = [
  'Музыка', 'Хип-хоп', 'Рок', 'Электронная музыка', 'Поп',
  'DJ', 'Продюсер', 'Лайфстайл', 'Развлечения', 'Обзоры',
  'Концерты', 'Фестивали', 'Стриминг', 'Подкасты'
];

const RUSSIAN_CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 
  'Казань', 'Нижний Новгород', 'Челябинск', 'Самара', 
  'Омск', 'Ростов-на-Дону', 'Уфа', 'Красноярск'
];

const INTERESTS = [
  'Музыка', 'Хип-хоп', 'Рок', 'Поп', 'Электронная музыка',
  'Концерты', 'Фестивали', 'DJ', 'Вокал', 'Гитара',
  'Продюсирование', 'Битмейкинг', 'Стриминг', 'Винил',
  'Аудиофилия', 'Звукорежиссура'
];

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  pending_approval: 'На согласовании',
  active: 'Активна',
  paused: 'На паузе',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

export function PromotionMarketing({ onBack }: PromotionMarketingProps) {
  const { subscription } = useSubscription();
  const { userId, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<CampaignStep>('slots');

  const [formData, setFormData] = useState({
    campaign_name: '',
    description: '',
    duration_days: 30,
    
    // Контент для продвижения
    content_ids: [] as string[],
    content_type: 'track' as 'track' | 'video' | 'album',
    
    // Креативы и брендбук
    creatives: [] as string[],
    brandbook_url: '',
    
    // Ожидаемые результаты (KPI)
    expected_results: {
      reach: 10000,
      engagement: 500,
      conversions: 100,
      ctr: 2.5,
    },
    
    // Выбранные слоты по платформам
    selected_slots: {} as Record<string, string[]>, // { instagram: ['post', 'stories'] }
    
    // Таргетинг
    targeting: {
      age_from: 18,
      age_to: 35,
      genders: ['all'] as string[],
      geo: ['Москва', 'Санкт-Петербург'] as string[],
      interests: [] as string[],
      lookalike: false,
      custom_audiences: [] as string[],
      description: '',
    },
    
    // Блогеры
    blogger_slots: [] as BloggerSlot[],
  });

  // Модалка добавления блогера
  const [showAddBlogger, setShowAddBlogger] = useState(false);
  const [newBlogger, setNewBlogger] = useState<Partial<BloggerSlot>>({
    platform: 'instagram',
    blogger_name: '',
    blogger_link: '',
    subscribers: 10000,
    category: 'Музыка',
    content_types: ['post'],
    price_per_slot: 5000,
    slots_count: 1,
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadCampaigns();
    } else {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  const loadCampaigns = async (showToast = false) => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/marketing/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || `Server returned success: false`);
      }

      if (data._meta?.needsSetup) {
        console.log('[Marketing] ⚠️  Database tables need setup');
        setError('database_not_initialized');
        setCampaigns([]);
        if (showToast) {
          toast.info('База данных не настроена', {
            description: 'Выполните SQL миграцию для сохранения данных',
          });
        }
        return;
      }

      setCampaigns(data.data || []);
      
      if (showToast) {
        if (data.data?.length > 0) {
          toast.success('Данные обновлены', {
            description: `Загружено ${data.data.length} кампаний`
          });
        } else {
          toast.success('Подключение успешно!', {
            description: 'База данных настроена. Создайте первую кампанию.'
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('[Marketing] Error loading marketing campaigns:', error);
      
      setCampaigns([]);
      setError(null);
      
      if (message.includes('timeout') || message.includes('Network') || message.includes('fetch')) {
        toast.error('Ошибка сети', {
          description: 'Проверьте подключение к интернету',
          action: {
            label: 'Повторить',
            onClick: () => loadCampaigns(false),
          },
        });
      } else {
        console.log('[Marketing] No campaigns available, showing empty state');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name) {
      toast.error('Название кампании обязательно');
      return;
    }

    const totalBudget = calculateTotalBudget();
    
    if (totalBudget === 0) {
      toast.error('Выберите хотя бы один рекламный слот');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84730125/api/promotion/marketing/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            artist_id: userId,
            campaign_name: formData.campaign_name,
            description: formData.description,
            campaign_type: 'slots_based',
            budget: totalBudget,
            duration_days: formData.duration_days,
            platforms: Object.keys(formData.selected_slots),
            content_ids: formData.content_ids,
            expected_results: formData.expected_results,
            creatives: formData.creatives,
            brandbook_url: formData.brandbook_url,
            targeting: formData.targeting,
            blogger_slots: formData.blogger_slots,
            selected_slots: formData.selected_slots,
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
        toast.success('Кампания успешно создана!', {
          description: `Бюджет: ${totalBudget.toLocaleString()} ₽ на ${formData.duration_days} дней`,
          duration: 5000,
        });
        
        setShowForm(false);
        setCurrentStep('slots');
        setError(null); // Сбрасываем ошибку
        // Reset form
        setFormData({
          campaign_name: '',
          description: '',
          duration_days: 30,
          content_ids: [],
          content_type: 'track',
          creatives: [],
          brandbook_url: '',
          expected_results: {
            reach: 10000,
            engagement: 500,
            conversions: 100,
            ctr: 2.5,
          },
          selected_slots: {},
          targeting: {
            age_from: 18,
            age_to: 35,
            genders: ['all'],
            geo: ['Москва', 'Санкт-Петербург'],
            interests: [],
            lookalike: false,
            custom_audiences: [],
            description: '',
          },
          blogger_slots: [],
        });
        
        loadCampaigns(false);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('Error submitting marketing campaign:', error);
      
      toast.error('Ошибка при создании кампании', {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSlotPrice = (platform: string, slotType: string) => {
    const platformData = PLATFORMS.find(p => p.id === platform);
    const slotData = SLOT_TYPES.find(s => s.id === slotType);
    
    if (!platformData || !slotData) return 0;
    
    let price = slotData.base_price * platformData.multiplier;
    
    // Проверяем, входит ли в подписку
    const isIncluded = subscription && platformData.included_in_subscription.includes(slotType);
    
    if (isIncluded) {
      return 0; // Входит в подписку
    }
    
    // Применяем скидку подписки
    const discount = subscription?.limits.marketing_discount || 0;
    price = price * (1 - discount);
    
    return Math.round(price);
  };

  const calculateTotalBudget = () => {
    let total = 0;
    
    // Стоимость выбранных слотов
    Object.entries(formData.selected_slots).forEach(([platform, slots]) => {
      slots.forEach(slotType => {
        total += calculateSlotPrice(platform, slotType);
      });
    });
    
    // Стоимость блогеров
    formData.blogger_slots.forEach(blogger => {
      total += blogger.price_per_slot * blogger.slots_count;
    });
    
    return total;
  };

  const handleAddBlogger = () => {
    if (!newBlogger.blogger_name || !newBlogger.blogger_link) {
      toast.error('Заполните название и ссылку на блогера');
      return;
    }
    
    const blogger: BloggerSlot = {
      id: `blogger_${Date.now()}`,
      platform: newBlogger.platform || 'instagram',
      blogger_name: newBlogger.blogger_name,
      blogger_link: newBlogger.blogger_link,
      subscribers: newBlogger.subscribers || 10000,
      category: newBlogger.category || 'Музыка',
      content_types: newBlogger.content_types || ['post'],
      price_per_slot: newBlogger.price_per_slot || 5000,
      slots_count: newBlogger.slots_count || 1,
    };
    
    setFormData({
      ...formData,
      blogger_slots: [...formData.blogger_slots, blogger],
    });
    
    setShowAddBlogger(false);
    setNewBlogger({
      platform: 'instagram',
      blogger_name: '',
      blogger_link: '',
      subscribers: 10000,
      category: 'Музыка',
      content_types: ['post'],
      price_per_slot: 5000,
      slots_count: 1,
    });
    
    toast.success('Блогер добавлен');
  };

  const handleRemoveBlogger = (bloggerId: string) => {
    setFormData({
      ...formData,
      blogger_slots: formData.blogger_slots.filter(b => b.id !== bloggerId),
    });
    toast.success('Блогер удалён');
  };

  const toggleSlot = (platform: string, slotType: string) => {
    const currentSlots = formData.selected_slots[platform] || [];
    const isSelected = currentSlots.includes(slotType);
    
    if (isSelected) {
      setFormData({
        ...formData,
        selected_slots: {
          ...formData.selected_slots,
          [platform]: currentSlots.filter(s => s !== slotType),
        },
      });
    } else {
      setFormData({
        ...formData,
        selected_slots: {
          ...formData.selected_slots,
          [platform]: [...currentSlots, slotType],
        },
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending_approval: 'text-yellow-400',
      active: 'text-green-400',
      paused: 'text-orange-400',
      completed: 'text-blue-400',
      cancelled: 'text-red-400',
    };
    return colors[status] || 'text-white/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending_approval: Clock,
      active: Play,
      paused: Pause,
      completed: CheckCircle2,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  const renderStepIndicator = () => {
    const steps: CampaignStep[] = ['slots', 'content', 'targeting', 'bloggers', 'review'];
    
    const stepLabels: Record<CampaignStep, string> = {
      slots: 'Слоты',
      content: 'Контент',
      targeting: 'Таргетинг',
      bloggers: 'Блогеры',
      review: 'Обзор',
    };

    const currentIndex = steps.indexOf(currentStep);

    return (
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 flex-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/10 text-white/60'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-sm text-white font-medium hidden sm:block">{stepLabels[step]}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 mb-4 animate-spin mx-auto" />
          <p className="text-white/60">Загрузка кампаний...</p>
        </div>
      </div>
    );
  }

  // ПУСТОЕ СОСТОЯНИЕ - Инструкции по настройке SQL
  // Показываем эту страницу когда: нет кампаний ИЛИ ошибка database_not_initialized
  if ((campaigns.length === 0 && !showForm && !error) || (error === 'database_not_initialized' && !showForm)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад к услугам</span>
            </button>
          )}

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30 rounded-2xl p-8"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6">
                <Megaphone className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Маркетинговые кампании
              </h1>
              <p className="text-xl text-white/80 max-w-2xl">
                Комплексное продвижение в социальных сетях с таргетированной рекламой и работой с блогерами
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Target,
                title: 'Точный таргетинг',
                description: 'Настройка по возрасту, полу, городам и интересам',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Users,
                title: 'Работа с блогерами',
                description: 'Добавление блогеров с расчётом стоимости интеграций',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: BarChart3,
                title: 'Аналитика ROI',
                description: 'Отслеживание эффективности каждой кампании',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: DollarSign,
                title: 'Оптимизация бюджета',
                description: 'Автоматический расчёт со скидками по подписке',
                color: 'from-orange-500 to-red-500',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Pricing Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Стоимость рекламных слотов</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SLOT_TYPES.map((slot) => {
                const Icon = slot.icon;
                return (
                  <div key={slot.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">{slot.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">
                      {slot.base_price.toLocaleString()} ₽
                    </p>
                    <p className="text-white/60 text-sm">{slot.description}</p>
                  </div>
                );
              })}
            </div>
            {subscription && subscription.limits.marketing_discount > 0 && (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">
                    Ваша скидка: {Math.round(subscription.limits.marketing_discount * 100)}% по подписке {subscription.tier.toUpperCase()}
                  </span>
                </p>
              </div>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Создать первую кампанию
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Ошибка (но не database_not_initialized)
  if (error && error !== 'database_not_initialized' && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-xl mb-2">Ошибка загрузки</h3>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => loadCampaigns(false)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ФОРМА СОЗДАНИЯ КАМПАНИИ
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setShowForm(false);
                setCurrentStep('slots');
              }}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Назад к кампаниям</span>
            </button>
          </div>

          {/* Заголовок */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Megaphone className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Новая маркетинговая кампания</h1>
            </div>
            <p className="text-white/60">
              Выберите рекламные слоты и настройте таргетинг
            </p>
          </div>

          {/* Индикатор шагов */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4">
            {renderStepIndicator()}
          </div>

          {/* ШАГ 1: Выбор рекламных слотов */}
          {currentStep === 'slots' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Название кампании */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Основные настройки</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Название кампании <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.campaign_name}
                      onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                      placeholder="Например: Летний релиз 2026"
                      maxLength={200}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Описание целевой аудитории
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Опишите вашу целевую аудиторию..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Длительность кампании (дней)
                    </label>
                    <input
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
                      min={7}
                      max={90}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Выбор слотов по платформам */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Рекламные слоты</h3>
                    <p className="text-sm text-white/60 mt-1">Выберите платформы и типы рекламы</p>
                  </div>
                  {subscription && (
                    <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                      <span className="text-xs text-purple-400 font-semibold">
                        Скидка {Math.round((subscription.limits.marketing_discount || 0) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const platformSlots = formData.selected_slots[platform.id] || [];
                    const hasSelections = platformSlots.length > 0;
                    
                    return (
                      <div
                        key={platform.id}
                        className={`border rounded-xl p-4 transition-all ${
                          hasSelections
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Icon className={`w-6 h-6 ${hasSelections ? 'text-purple-400' : 'text-white/60'}`} />
                          <h4 className="text-lg font-semibold text-white">{platform.name}</h4>
                          {platform.included_in_subscription.length > 0 && subscription && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                              {platform.included_in_subscription.length} слота в подписке
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {SLOT_TYPES.map((slot) => {
                            const SlotIcon = slot.icon;
                            const isSelected = platformSlots.includes(slot.id);
                            const price = calculateSlotPrice(platform.id, slot.id);
                            const isIncluded = price === 0 && subscription;
                            
                            return (
                              <motion.div
                                key={slot.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => toggleSlot(platform.id, slot.id)}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-purple-500/20 border-2 border-purple-500'
                                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <SlotIcon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                                  {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  )}
                                </div>
                                
                                <h5 className="text-white font-semibold text-sm mb-1">{slot.name}</h5>
                                <p className="text-white/60 text-xs mb-3">{slot.description}</p>
                                
                                {isIncluded ? (
                                  <div className="flex items-center gap-1 text-xs">
                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                    <span className="text-green-400 font-semibold">В подписке</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {subscription && subscription.limits.marketing_discount > 0 && (
                                      <span className="text-white/40 line-through text-xs">
                                        {Math.round(slot.base_price * platform.multiplier).toLocaleString()} ₽
                                      </span>
                                    )}
                                    <span className="text-white font-bold text-sm">
                                      {price.toLocaleString()} ₽
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Итого */}
              <div className="backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Стоимость выбранных слотов</p>
                    <p className="text-3xl font-bold text-white">{calculateTotalBudget().toLocaleString()} ₽</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-purple-400" />
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
                  onClick={() => setCurrentStep('content')}
                  disabled={!formData.campaign_name || Object.keys(formData.selected_slots).length === 0}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Далее
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ШАГ 2: Контент и креативы */}
          {currentStep === 'content' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Контент ��ля продвижения</h3>
                </div>

                {/* ID контента */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    ID треков/клипов для продвижения
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Введите ID трека или клипа"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setFormData({
                            ...formData,
                            content_ids: [...formData.content_ids, e.currentTarget.value],
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.content_ids.map((id, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                        <span className="text-sm text-white">{id}</span>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              content_ids: formData.content_ids.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-white/60 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Креативы */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    URLs креативов (изображения, видео)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/creative.jpg"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setFormData({
                            ...formData,
                            creatives: [...formData.creatives, e.currentTarget.value],
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {formData.creatives.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10">
                          <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }} />
                        </div>
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              creatives: formData.creatives.filter((_, i) => i !== index),
                            });
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Брендбук */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    URL брендбука артиста
                  </label>
                  <input
                    type="url"
                    value={formData.brandbook_url}
                    onChange={(e) => setFormData({ ...formData, brandbook_url: e.target.value })}
                    placeholder="https://example.com/brandbook.pdf"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                {/* Ожидаемые результаты (KPI) */}
                <div>
                  <label className="block text-white/80 text-sm mb-3">
                    Ожидаемые результаты (KPI)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Охват</label>
                      <input
                        type="number"
                        value={formData.expected_results.reach}
                        onChange={(e) => setFormData({
                          ...formData,
                          expected_results: { ...formData.expected_results, reach: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Вовлечение</label>
                      <input
                        type="number"
                        value={formData.expected_results.engagement}
                        onChange={(e) => setFormData({
                          ...formData,
                          expected_results: { ...formData.expected_results, engagement: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-2">Конверсии</label>
                      <input
                        type="number"
                        value={formData.expected_results.conversions}
                        onChange={(e) => setFormData({
                          ...formData,
                          expected_results: { ...formData.expected_results, conversions: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-2">CTR (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.expected_results.ctr}
                        onChange={(e) => setFormData({
                          ...formData,
                          expected_results: { ...formData.expected_results, ctr: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('slots')}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
                <button
                  onClick={() => setCurrentStep('targeting')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Далее
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ШАГ 3: Таргетинг */}
          {currentStep === 'targeting' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Настройка таргетинга</h3>
                </div>

                {/* Возраст */}
                <div>
                  <label className="block text-white/80 text-sm mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Возрастная категория
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-xs mb-2">От</label>
                      <input
                        type="number"
                        value={formData.targeting.age_from}
                        onChange={(e) => setFormData({
                          ...formData,
                          targeting: {
                            ...formData.targeting,
                            age_from: parseInt(e.target.value) || 18,
                          }
                        })}
                        min={13}
                        max={65}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-xs mb-2">До</label>
                      <input
                        type="number"
                        value={formData.targeting.age_to}
                        onChange={(e) => setFormData({
                          ...formData,
                          targeting: {
                            ...formData.targeting,
                            age_to: parseInt(e.target.value) || 35,
                          }
                        })}
                        min={13}
                        max={65}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* География */}
                <div>
                  <label className="block text-white/80 text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    География
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RUSSIAN_CITIES.map((city) => {
                      const isSelected = formData.targeting.geo.includes(city);
                      return (
                        <button
                          key={city}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                targeting: {
                                  ...formData.targeting,
                                  geo: formData.targeting.geo.filter(c => c !== city),
                                }
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targeting: {
                                  ...formData.targeting,
                                  geo: [...formData.targeting.geo, city],
                                }
                              });
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Интересы */}
                <div>
                  <label className="block text-white/80 text-sm mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Интересы
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                      const isSelected = formData.targeting.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                targeting: {
                                  ...formData.targeting,
                                  interests: formData.targeting.interests.filter(i => i !== interest),
                                }
                              });
                            } else {
                              setFormData({
                                ...formData,
                                targeting: {
                                  ...formData.targeting,
                                  interests: [...formData.targeting.interests, interest],
                                }
                              });
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            isSelected
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Описание аудитории */}
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Дополнительное описание целевой аудитории
                  </label>
                  <textarea
                    value={formData.targeting.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      targeting: {
                        ...formData.targeting,
                        description: e.target.value,
                      }
                    })}
                    placeholder="Например: Молодые люди 18-25 лет, интересующиеся хип-хопом и андеграундной культурой..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                  />
                </div>

                {/* Lookalike */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-purple-400" />
                      <h4 className="text-white font-medium">Lookalike-аудитория</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Найти похожих пользователей на основе вашей текущей аудитории
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.targeting.lookalike}
                      onChange={(e) => setFormData({
                        ...formData,
                        targeting: {
                          ...formData.targeting,
                          lookalike: e.target.checked,
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('content')}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
                <button
                  onClick={() => setCurrentStep('bloggers')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Далее
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ШАГ 4: Добавление блогеров */}
          {currentStep === 'bloggers' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">Добавьте своих блогеров</h3>
                      <p className="text-sm text-white/60 mt-1">Укажите блогеров, с которыми хотите работать</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddBlogger(true)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Добавить блогера
                  </button>
                </div>

                {formData.blogger_slots.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 mb-4">Вы ещё не добавили ни одного блогера</p>
                    <button
                      onClick={() => setShowAddBlogger(true)}
                      className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Добавить блогера
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.blogger_slots.map((blogger) => {
                      const PlatformIcon = PLATFORMS.find(p => p.id === blogger.platform)?.icon || Users;
                      
                      return (
                        <div
                          key={blogger.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                  <PlatformIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">{blogger.blogger_name}</h4>
                                  <a
                                    href={blogger.blogger_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-400 hover:underline flex items-center gap-1"
                                  >
                                    {blogger.blogger_link}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-white/60">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {blogger.subscribers.toLocaleString()} подписчиков
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs">
                                  {blogger.category}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {(blogger.price_per_slot * blogger.slots_count).toLocaleString()} ₽
                                </span>
                                <span className="text-white/40">
                                  {blogger.slots_count} слот(ов)
                                </span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                {blogger.content_types.map((type) => {
                                  const slotType = SLOT_TYPES.find(s => s.id === type);
                                  return slotType ? (
                                    <span key={type} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                      {slotType.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveBlogger(blogger.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Итого по блогерам */}
                {formData.blogger_slots.length > 0 && (
                  <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {formData.blogger_slots.reduce((sum, b) => sum + b.subscribers, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-white/60 mt-1">Суммарная аудитория</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">
                          {formData.blogger_slots.length}
                        </p>
                        <p className="text-xs text-white/60 mt-1">Блогеров</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">
                          {formData.blogger_slots.reduce((sum, b) => sum + (b.price_per_slot * b.slots_count), 0).toLocaleString()} ₽
                        </p>
                        <p className="text-xs text-white/60 mt-1">Стоимость</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('targeting')}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
                <button
                  onClick={() => setCurrentStep('review')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  Далее
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ШАГ 5: Обзор */}
          {currentStep === 'review' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Обзор кампании</h3>
                </div>

                <div className="space-y-4">
                  {/* Основное */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="text-white/60">Название</span>
                    <span className="text-white font-semibold">{formData.campaign_name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <span className="text-white/60">Длительность</span>
                    <span className="text-white font-semibold">{formData.duration_days} дней</span>
                  </div>

                  {/* Слоты */}
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="text-white font-semibold mb-3">Выбранные слоты</h4>
                    <div className="space-y-2">
                      {Object.entries(formData.selected_slots).map(([platform, slots]) => {
                        const platformData = PLATFORMS.find(p => p.id === platform);
                        return (
                          <div key={platform} className="flex items-center justify-between text-sm">
                            <span className="text-white/60">{platformData?.name}</span>
                            <span className="text-white">{slots.length} слота</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Блогеры */}
                  {formData.blogger_slots.length > 0 && (
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="text-white font-semibold mb-3">Блогеры</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Количество</span>
                          <span className="text-white">{formData.blogger_slots.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Аудитория</span>
                          <span className="text-white">
                            {formData.blogger_slots.reduce((sum, b) => sum + b.subscribers, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Таргетинг */}
                  {formData.targeting.interests.length > 0 && (
                    <div className="p-4 bg-white/5 rounded-xl">
                      <h4 className="text-white font-semibold mb-3">Таргетинг</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Возраст</span>
                          <span className="text-white">{formData.targeting.age_from}-{formData.targeting.age_to} лет</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">География</span>
                          <span className="text-white">{formData.targeting.geo.length} городов</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Интересы</span>
                          <span className="text-white">{formData.targeting.interests.length} категорий</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Итоговый бюджет */}
                  <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm mb-1">Итоговый бюджет</p>
                        <p className="text-3xl font-bold text-white">{calculateTotalBudget().toLocaleString()} ₽</p>
                      </div>
                      <DollarSign className="w-12 h-12 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('bloggers')}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Назад
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Запустить кампанию
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Модалка добавления блогера */}
          <AnimatePresence>
            {showAddBlogger && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                onClick={() => setShowAddBlogger(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Добавить блогера</h3>
                    <button
                      onClick={() => setShowAddBlogger(false)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-white/60" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Платформа */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Платформа</label>
                      <div className="grid grid-cols-5 gap-2">
                        {PLATFORMS.map((platform) => {
                          const Icon = platform.icon;
                          const isSelected = newBlogger.platform === platform.id;
                          return (
                            <button
                              key={platform.id}
                              onClick={() => setNewBlogger({ ...newBlogger, platform: platform.id as any })}
                              className={`p-3 rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Имя блогера */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Имя блогера <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newBlogger.blogger_name}
                        onChange={(e) => setNewBlogger({ ...newBlogger, blogger_name: e.target.value })}
                        placeholder="Например: DJ Blogger"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Ссылка */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Ссылка на профиль <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="url"
                        value={newBlogger.blogger_link}
                        onChange={(e) => setNewBlogger({ ...newBlogger, blogger_link: e.target.value })}
                        placeholder="https://instagram.com/djblogger"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Подписчики */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Количество подписчиков</label>
                      <input
                        type="number"
                        value={newBlogger.subscribers}
                        onChange={(e) => setNewBlogger({ ...newBlogger, subscribers: parseInt(e.target.value) || 0 })}
                        min={1000}
                        step={1000}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Категория */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Категория</label>
                      <select
                        value={newBlogger.category}
                        onChange={(e) => setNewBlogger({ ...newBlogger, category: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        {BLOGGER_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Типы контента */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Типы контента</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SLOT_TYPES.map((slot) => {
                          const Icon = slot.icon;
                          const isSelected = newBlogger.content_types?.includes(slot.id);
                          return (
                            <button
                              key={slot.id}
                              onClick={() => {
                                const current = newBlogger.content_types || [];
                                if (isSelected) {
                                  setNewBlogger({
                                    ...newBlogger,
                                    content_types: current.filter(t => t !== slot.id),
                                  });
                                } else {
                                  setNewBlogger({
                                    ...newBlogger,
                                    content_types: [...current, slot.id],
                                  });
                                }
                              }}
                              className={`p-3 rounded-xl text-left transition-all ${
                                isSelected
                                  ? 'bg-purple-500/20 border-2 border-purple-500'
                                  : 'bg-white/5 border border-white/10 hover:border-white/20'
                              }`}
                            >
                              <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-purple-400' : 'text-white/60'}`} />
                              <span className="text-sm text-white">{slot.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Цена и количество слотов */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">Цена за слот (₽)</label>
                        <input
                          type="number"
                          value={newBlogger.price_per_slot}
                          onChange={(e) => setNewBlogger({ ...newBlogger, price_per_slot: parseInt(e.target.value) || 0 })}
                          min={1000}
                          step={1000}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">Количество слотов</label>
                        <input
                          type="number"
                          value={newBlogger.slots_count}
                          onChange={(e) => setNewBlogger({ ...newBlogger, slots_count: parseInt(e.target.value) || 1 })}
                          min={1}
                          max={10}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Итого */}
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Итого</span>
                        <span className="text-2xl font-bold text-white">
                          {((newBlogger.price_per_slot || 0) * (newBlogger.slots_count || 1)).toLocaleString()} ₽
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setShowAddBlogger(false)}
                      className="flex-1 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleAddBlogger}
                      className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold transition-all"
                    >
                      Добавить
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ГЛАВНАЯ СТРАНИЦА - Список кампаний
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Megaphone className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Маркетинг и продажи</h1>
                <p className="text-white/60">Управление маркетинговыми кампаниями</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать кампанию
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Всего кампаний</p>
            <p className="text-3xl font-bold text-white">{campaigns.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Активных</p>
            <p className="text-3xl font-bold text-green-400">
              {campaigns.filter((c) => c.status === 'active').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Завершено</p>
            <p className="text-3xl font-bold text-blue-400">
              {campaigns.filter((c) => c.status === 'completed').length}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Средний ROI</p>
            <p className="text-3xl font-bold text-cyan-400">
              {campaigns.length > 0 
                ? (campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {/* Список кампаний */}
        {campaigns.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Megaphone className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Нет кампаний</h3>
            <p className="text-white/60 mb-6">
              Создайте первую маркетинговую кампанию для продвижения
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Создать кампанию
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const StatusIcon = getStatusIcon(campaign.status);
              
              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Megaphone className="w-6 h-6 text-purple-400" />
                        <h3 className="text-xl font-semibold text-white">
                          {campaign.campaign_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{campaign.duration_days} дней</span>
                        <span>•</span>
                        <span>{campaign.budget.toLocaleString()} ₽</span>
                        {campaign.platforms && campaign.platforms.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{campaign.platforms.length} платформ</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${getStatusColor(campaign.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{STATUS_LABELS[campaign.status] || campaign.status}</span>
                    </div>
                  </div>

                  {campaign.metrics && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <p className="text-2xl font-bold text-white mb-1">
                          {campaign.metrics.impressions?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-white/60">Показов</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <p className="text-2xl font-bold text-cyan-400 mb-1">
                          {campaign.metrics.clicks?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-white/60">Кликов</p>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-xl">
                        <p className="text-2xl font-bold text-purple-400 mb-1">
                          {campaign.roi.toFixed(1)}%
                        </p>
                        <p className="text-xs text-white/60">ROI</p>
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
