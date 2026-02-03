/**
 * SUBSCRIPTION PAGE - УПРАВЛЕНИЕ ПОДПИСКАМИ
 * Централизованная система подписок для всей платформы
 */

import { Crown, Sparkles, Check, Zap, TrendingUp, Shield, BarChart3, Music, Video, DollarSign, Target, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Subscription {
  tier: 'free' | 'basic' | 'pro' | 'premium';
  price: number;
  expires_at: string;
  status: 'active' | 'expired' | 'cancelled';
  features: string[];
}

interface SubscriptionPageProps {
  userId: string;
  currentSubscription: Subscription;
  onSubscriptionChange: (subscription: Subscription) => void;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

// Тарифные планы
const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    subtitle: 'Для начинающих',
    price: 0,
    period: 'навсегда',
    icon: Music,
    color: 'from-gray-500 to-gray-600',
    features: [
      { text: 'До 10 треков', icon: Music },
      { text: 'До 5 видео', icon: Video },
      { text: 'Базовая аналитика', icon: BarChart3 },
      { text: '10% комиссия с донатов', icon: DollarSign },
      { text: 'Стандартная поддержка', icon: MessageSquare },
      { text: '5GB хранилища', icon: Shield },
    ],
    limits: {
      tracks: 10,
      videos: 5,
      storage_gb: 5,
      donation_fee: 0.10,
      marketing_discount: 0,
      coins_bonus: 0,
      pitching_discount: 0,
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    subtitle: 'Для активных артистов',
    price: 490,
    period: 'в месяц',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    popular: false,
    features: [
      { text: 'До 50 треков', icon: Music },
      { text: 'До 20 видео', icon: Video },
      { text: 'Расширенная аналитика', icon: BarChart3 },
      { text: '7% комиссия с донатов', icon: DollarSign },
      { text: 'Приоритетная поддержка', icon: MessageSquare },
      { text: '20GB хранилища', icon: Shield },
      { text: '5% скидка на маркетинг', icon: Target },
      { text: '+5% бонус к коинам', icon: Sparkles },
    ],
    limits: {
      tracks: 50,
      videos: 20,
      storage_gb: 20,
      donation_fee: 0.07,
      marketing_discount: 0.05,
      coins_bonus: 0.05,
      pitching_discount: 0.05,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Для профессионалов',
    price: 1490,
    period: 'в месяц',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      { text: 'Безлимитные треки', icon: Music },
      { text: 'Безлимитные видео', icon: Video },
      { text: 'PRO аналитика + экспорт', icon: BarChart3 },
      { text: '5% комиссия с донатов', icon: DollarSign },
      { text: 'VIP поддержка', icon: MessageSquare },
      { text: '100GB хранилища', icon: Shield },
      { text: '15% скидка на маркетинг', icon: Target },
      { text: '+15% бонус к коинам', icon: Sparkles },
      { text: '10% скидка на питчинг', icon: TrendingUp },
      { text: 'Бесплатная консультация', icon: Crown },
    ],
    limits: {
      tracks: -1, // unlimited
      videos: -1,
      storage_gb: 100,
      donation_fee: 0.05,
      marketing_discount: 0.15,
      coins_bonus: 0.15,
      pitching_discount: 0.10,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    subtitle: 'Для звёзд и лейблов',
    price: 4990,
    period: 'в месяц',
    icon: Crown,
    color: 'from-yellow-500 to-orange-500',
    popular: false,
    features: [
      { text: 'Безлимитные треки', icon: Music },
      { text: 'Безлимитные видео', icon: Video },
      { text: 'Enterprise аналитика + AI', icon: BarChart3 },
      { text: '3% комиссия с донатов', icon: DollarSign },
      { text: 'Персональный менеджер 24/7', icon: MessageSquare },
      { text: '500GB хранилища', icon: Shield },
      { text: '25% скидка на маркетинг', icon: Target },
      { text: '+25% бонус к коинам', icon: Sparkles },
      { text: '20% скидка на питчинг', icon: TrendingUp },
      { text: '2 доп. канала продвижения', icon: Crown },
      { text: 'Приоритет в рейтингах', icon: Zap },
      { text: 'Белый лейбл', icon: Shield },
    ],
    limits: {
      tracks: -1,
      videos: -1,
      storage_gb: 500,
      donation_fee: 0.03,
      marketing_discount: 0.25,
      coins_bonus: 0.25,
      pitching_discount: 0.20,
    },
  },
];

export function SubscriptionPage({ userId, currentSubscription, onSubscriptionChange }: SubscriptionPageProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const plansRef = useRef<HTMLDivElement>(null);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === currentSubscription.tier);

  const handleUpgrade = async (planId: string) => {
    if (planId === currentSubscription.tier) {
      toast.info('Вы уже используете этот план');
      return;
    }

    setLoading(true);
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) return;

      const response = await fetch(`${API_URL}/subscriptions/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: userId,
          tier: planId,
          price: plan.price,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Обновляем подписку
        onSubscriptionChange(data.data);
        toast.success(`✅ Подписка ${plan.name} активирована!`, {
          description: plan.price > 0 ? `Списано ${plan.price} ₽` : 'Бесплатный план',
        });
      } else {
        toast.error('Ошибка активации подписки');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Не удалось изменить подписку');
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = () => {
    if (currentSubscription.tier === 'free') return null;
    const expiresAt = new Date(currentSubscription.expires_at);
    const now = new Date();
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const daysLeft = getDaysLeft();

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          Управление подпиской
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-400">
          Выберите тариф для максимального продвижения вашей музыки
        </p>
      </div>

      {/* Current Subscription Status */}
      {currentPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 sm:p-6 rounded-2xl bg-gradient-to-r ${currentPlan.color} bg-opacity-10 border-2 border-white/20`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentPlan.icon && <currentPlan.icon className="w-8 h-8 text-white" />}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Текущий план: {currentPlan.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  {currentSubscription.tier === 'free' ? (
                    'Бесплатный план'
                  ) : (
                    <>
                      {currentSubscription.status === 'active' ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Осталось {daysLeft} {daysLeft === 1 ? 'день' : daysLeft && daysLeft < 5 ? 'дня' : 'дней'}
                        </span>
                      ) : (
                        <span className="text-red-400">Подписка истекла</span>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
            {currentSubscription.tier !== 'premium' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-white text-gray-900 font-semibold transition-all shadow-lg text-sm sm:text-base"
                onClick={scrollToPlans}
              >
                Улучшить план
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Benefits Comparison */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/30">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">💎 Преимущества подписок</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Комиссия с донатов</p>
            <p className="text-xs text-gray-400">
              Free: 10% | Basic: 7% | Pro: 5% | Premium: 3%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Target className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Скидка на маркетинг</p>
            <p className="text-xs text-gray-400">
              Free: 0% | Basic: 5% | Pro: 15% | Premium: 25%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Sparkles className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Бонус к коинам</p>
            <p className="text-xs text-gray-400">
              Free: 0% | Basic: +5% | Pro: +15% | Premium: +25%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <Shield className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-sm font-semibold text-white mb-1">Хранилище</p>
            <p className="text-xs text-gray-400">
              Free: 5GB | Basic: 20GB | Pro: 100GB | Premium: 500GB
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div ref={plansRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {SUBSCRIPTION_PLANS.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentSubscription.tier;
          const canDowngrade = SUBSCRIPTION_PLANS.findIndex(p => p.id === currentSubscription.tier) > index;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 sm:p-6 rounded-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-400/50 shadow-xl shadow-purple-500/20'
                  : isCurrentPlan
                  ? `bg-gradient-to-br ${plan.color} bg-opacity-20 border-2 border-white/30`
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg">
                    ⭐ Популярный
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
                    ✓ Текущий
                  </span>
                </div>
              )}

              <div className="text-center mb-4 sm:mb-6">
                <Icon className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`} />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-3">{plan.subtitle}</p>
                <div className="mb-2">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-400 text-sm ml-1">₽</span>}
                </div>
                <p className="text-xs text-gray-500">{plan.period}</p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {plan.features.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={idx} className="flex items-start gap-2">
                      <FeatureIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-300">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <motion.button
                whileHover={{ scale: isCurrentPlan ? 1 : 1.05 }}
                whileTap={{ scale: isCurrentPlan ? 1 : 0.95 }}
                onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
                disabled={isCurrentPlan || loading}
                className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
                  isCurrentPlan
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isCurrentPlan ? 'Текущий план' : canDowngrade ? 'Понизить' : 'Выбрать план'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">❓ Часто задаваемые вопросы</h3>
        <div className="space-y-3">
          <details className="p-3 rounded-xl bg-white/5 border border-white/10">
            <summary className="font-semibold text-white cursor-pointer text-sm sm:text-base">
              Можно ли отменить подписку?
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              Да, вы можете отменить подписку в любое время. Доступ к функциям сохранится до конца оплаченного периода.
            </p>
          </details>
          <details className="p-3 rounded-xl bg-white/5 border border-white/10">
            <summary className="font-semibold text-white cursor-pointer text-sm sm:text-base">
              Что произойдёт с моими данными при понижении плана?
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              Все ваши данные сохранятся, но будут применены лимиты нового плана. Например, при понижении с Pro на Basic доступ к треками свыше 50 будет ограничен.
            </p>
          </details>
          <details className="p-3 rounded-xl bg-white/5 border border-white/10">
            <summary className="font-semibold text-white cursor-pointer text-sm sm:text-base">
              Можно ли оплатить годовую подписку?
            </summary>
            <p className="mt-2 text-xs sm:text-sm text-gray-400">
              Да, при годовой оплате предоставляется скидка 20%. Свяжитесь с поддержкой для активации.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}

// Export subscription limits for use in other components
export { SUBSCRIPTION_PLANS };