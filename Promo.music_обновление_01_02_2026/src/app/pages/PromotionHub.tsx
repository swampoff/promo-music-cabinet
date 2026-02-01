/**
 * PROMOTION HUB - Комплексный центр продвижения
 * Полная интеграция всех 6 страниц продвижения
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  Sparkles, 
  TrendingUp, 
  Newspaper, 
  Calendar, 
  Zap,
  ArrowLeft,
  Home,
  Video,
  Target,
  Megaphone,
  PartyPopper
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { PromotionPitching } from './PromotionPitching';
import { PromotionProduction360 } from './PromotionProduction360';
import { PromotionMarketing } from './PromotionMarketing';
import { PromotionMedia } from './PromotionMedia';
import EventManagement from './EventManagement';
import { PromotionPromoLab } from './PromotionPromoLab';

type ServicePage = null | 'pitching' | 'production360' | 'marketing' | 'media' | 'event' | 'promolab';

interface PromotionService {
  id: ServicePage;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  borderColor: string;
  iconColor: string;
  features: string[];
  priceFrom: number;
}

const SERVICES: PromotionService[] = [
  {
    id: 'pitching',
    title: 'Питчинг',
    description: 'Отправка треков на радио и в плейлисты Spotify, Apple Music, Яндекс.Музыка',
    icon: Radio,
    gradient: 'from-purple-500/20 via-pink-500/20 to-purple-500/20',
    borderColor: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    features: [
      '50+ радиостанций России',
      'Топовые плейлисты стримингов',
      'Прямые контакты редакторов',
      'Детальная аналитика откликов',
    ],
    priceFrom: 990,
  },
  {
    id: 'production360',
    title: '360° Production',
    description: 'Полный цикл создания хита: от идеи до релиза с профессиональной командой',
    icon: Sparkles,
    gradient: 'from-blue-500/20 via-cyan-500/20 to-blue-500/20',
    borderColor: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    features: [
      'Запись и продакшн в студии',
      'Сведение и мастеринг',
      'Съемка и монтаж клипа',
      'Дистрибуция на все платформы',
    ],
    priceFrom: 49900,
  },
  {
    id: 'marketing',
    title: 'Маркетинг',
    description: 'Комплексное продвижение в социальных сетях и таргетированная реклама',
    icon: Target,
    gradient: 'from-green-500/20 via-emerald-500/20 to-green-500/20',
    borderColor: 'border-green-500/30',
    iconColor: 'text-green-400',
    features: [
      'Instagram, TikTok, YouTube, VK',
      'Таргет и performance-реклама',
      'Креативы и контент-планы',
      'ROI-аналитика кампаний',
    ],
    priceFrom: 9900,
  },
  {
    id: 'media',
    title: 'PR и СМИ',
    description: 'Публикации в ведущих музыкальных изданиях и организация интервью',
    icon: Newspaper,
    gradient: 'from-orange-500/20 via-red-500/20 to-orange-500/20',
    borderColor: 'border-orange-500/30',
    iconColor: 'text-orange-400',
    features: [
      'Топ-издания (The Flow, Afisha)',
      'Интервью на радио и подкастах',
      'Пресс-релизы и анонсы',
      'Медиа-мониторинг',
    ],
    priceFrom: 14900,
  },
  {
    id: 'event',
    title: 'Event Management',
    description: 'Организация концертов, фестивалей и туров с полным сопровождением',
    icon: Calendar,
    gradient: 'from-yellow-500/20 via-amber-500/20 to-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    features: [
      'Букинг и переговоры с площадками',
      'Организация региональных туров',
      'Технический райдер и логистика',
      'Билетинг и промо-кампании',
    ],
    priceFrom: 19900,
  },
  {
    id: 'promolab',
    title: 'PROMO Lab',
    description: 'Экспериментальное продвижение с AI, viral-маркетингом и Web3 технологиями',
    icon: Zap,
    gradient: 'from-pink-500/20 via-rose-500/20 to-pink-500/20',
    borderColor: 'border-pink-500/30',
    iconColor: 'text-pink-400',
    features: [
      'AI-таргетинг и предиктивная аналитика',
      'Viral-челленджи в TikTok',
      'NFT-дропы и метаверс',
      'Коллаборации с инфлюенсерами',
    ],
    priceFrom: 0, // По запросу
  },
];

export function PromotionHub() {
  const { subscription } = useSubscription();
  const [currentPage, setCurrentPage] = useState<ServicePage>(null);

  // Возврат на главную
  const handleBack = () => {
    setCurrentPage(null);
  };

  // Если открыта подстраница - показываем её
  if (currentPage) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Кнопка "Назад" */}
          <motion.button
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed top-4 left-4 lg:top-6 lg:left-6 z-50 backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 sm:px-4 sm:py-2 flex items-center gap-2 text-white transition-all shadow-lg touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm sm:text-base">Назад к услугам</span>
          </motion.button>

          {/* Рендер соответствующей страницы */}
          {currentPage === 'pitching' && <PromotionPitching />}
          {currentPage === 'production360' && <PromotionProduction360 />}
          {currentPage === 'marketing' && <PromotionMarketing onBack={handleBack} />}
          {currentPage === 'media' && <PromotionMedia />}
          {currentPage === 'event' && <EventManagement />}
          {currentPage === 'promolab' && <PromotionPromoLab />}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Главная страница - обзор всех услуг
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0 pt-16 lg:pt-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3 sm:mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1">
              Центр продвижения
            </h1>
            <p className="text-gray-300 text-sm sm:text-base md:text-lg">
              Выберите услугу для продвижения вашей музыки
            </p>
          </div>
        </div>

        {/* Subscription Badge */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 py-2"
          >
            <PartyPopper className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white">
              Подписка <span className="font-bold uppercase">{subscription.tier}</span> активна
            </span>
            {subscription.limits.marketing_discount > 0 && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                скидка {Math.round(subscription.limits.marketing_discount * 100)}%
              </span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {SERVICES.map((service, index) => {
          const Icon = service.icon;
          const discountedPrice = subscription?.limits.marketing_discount
            ? Math.round(service.priceFrom * (1 - subscription.limits.marketing_discount))
            : service.priceFrom;
          const hasDiscount = discountedPrice !== service.priceFrom;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => setCurrentPage(service.id)}
              className={`cursor-pointer backdrop-blur-xl bg-gradient-to-br ${service.gradient} border ${service.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all group touch-manipulation`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform ${service.iconColor}`}>
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              {/* Title & Description */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">
                {service.title}
              </h3>
              <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                {service.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-white/70 text-xs sm:text-sm">
                    <div className="w-1 h-1 rounded-full bg-white/40 mt-1.5 sm:mt-2 flex-shrink-0" />
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10">
                <div>
                  {service.priceFrom > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      {hasDiscount && (
                        <span className="text-white/40 text-xs sm:text-sm line-through">
                          {service.priceFrom.toLocaleString()} ₽
                        </span>
                      )}
                      <span className="text-lg sm:text-xl font-bold text-white">
                        от {discountedPrice.toLocaleString()} ₽
                      </span>
                    </div>
                  ) : (
                    <span className="text-base sm:text-lg text-white/60">По запросу</span>
                  )}
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${service.iconColor} flex-shrink-0`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 sm:mt-8 backdrop-blur-xl bg-blue-500/10 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">
              Нужна помощь в выборе?
            </h4>
            <p className="text-white/70 text-xs sm:text-sm">
              Наши специалисты помогут подобрать оптимальную стратегию продвижения для вашей музыки. 
              Оставьте заявку в любом разделе, и мы свяжемся с вами в течение 24 часов.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}