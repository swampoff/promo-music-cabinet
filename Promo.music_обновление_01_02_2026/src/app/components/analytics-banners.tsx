/**
 * ANALYTICS BANNERS - АНАЛИТИКА БАННЕРНОЙ РЕКЛАМЫ
 * Интеграция с разделом "Аналитика"
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  DollarSign, 
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BannerDetailModal } from './banner-detail-modal';

interface BannerAnalyticsProps {
  userId: string;
}

// Mock данные для прототипа
const MOCK_BANNER_STATS = {
  overview: {
    total_banners: 5,
    active_banners: 2,
    total_views: 287654,
    total_clicks: 8234,
    total_spent: 893500,
    average_ctr: 2.86,
  },
  performance: [
    {
      id: 'banner_1',
      campaign: 'Новый альбом "Звёздная пыль"',
      type: 'top_banner',
      views: 145230,
      clicks: 3254,
      ctr: 2.24,
      spent: 210000,
      cpc: 64.54,
      status: 'active',
    },
    {
      id: 'banner_2',
      campaign: 'Тур 2025',
      type: 'sidebar_large',
      views: 87650,
      clicks: 2876,
      ctr: 3.28,
      spent: 360000,
      cpc: 125.17,
      status: 'active',
    },
    {
      id: 'banner_3',
      campaign: 'Новый клип',
      type: 'sidebar_small',
      views: 54774,
      clicks: 2104,
      ctr: 3.84,
      spent: 56000,
      cpc: 26.62,
      status: 'expired',
    },
  ],
  daily_stats: [
    { date: '2025-01-21', views: 12450, clicks: 342, ctr: 2.75, spent: 15000 },
    { date: '2025-01-22', views: 13890, clicks: 389, ctr: 2.80, spent: 15000 },
    { date: '2025-01-23', views: 15230, clicks: 445, ctr: 2.92, spent: 15000 },
    { date: '2025-01-24', views: 16780, clicks: 512, ctr: 3.05, spent: 15000 },
    { date: '2025-01-25', views: 18450, clicks: 578, ctr: 3.13, spent: 15000 },
    { date: '2025-01-26', views: 19890, clicks: 634, ctr: 3.19, spent: 15000 },
    { date: '2025-01-27', views: 21340, clicks: 698, ctr: 3.27, spent: 15000 },
  ],
  type_distribution: [
    { name: 'Top Banner', value: 40, color: '#a855f7' },
    { name: 'Sidebar Large', value: 35, color: '#ec4899' },
    { name: 'Sidebar Small', value: 25, color: '#06b6d4' },
  ],
};

export function AnalyticsBanners({ userId }: BannerAnalyticsProps) {
  const [stats, setStats] = useState(MOCK_BANNER_STATS);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  const [showBannersList, setShowBannersList] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_payment' | 'pending_moderation' | 'active' | 'completed' | 'rejected'>('all');

  // Расширенные данные для баннеров с полной информацией
  const bannersDetailedData = [
    {
      id: 'banner_1',
      campaign: 'Новый альбом "Звёздная пыль"',
      type: 'top_banner',
      dimensions: '1920×400',
      views: 145230,
      clicks: 3254,
      ctr: 2.24,
      spent: 210000,
      cpc: 64.54,
      status: 'active',
      isPaid: true,
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=400&fit=crop',
      targetUrl: '/artist/album/zvezdnaya-pyl',
      startDate: '15.01.2025',
      endDate: '29.01.2025',
      daysRunning: 12,
      daysRemaining: 2,
    },
    {
      id: 'banner_2',
      campaign: 'Тур 2025',
      type: 'sidebar_large',
      dimensions: '300×600',
      views: 0,
      clicks: 0,
      ctr: 0,
      spent: 0,
      cpc: 0,
      status: 'pending_payment',
      isPaid: false,
      imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&h=600&fit=crop',
      targetUrl: '/artist/tour-2025',
      startDate: '—',
      endDate: '—',
      daysRunning: 0,
      daysRemaining: 0,
      price: 150000,
    },
    {
      id: 'banner_3',
      campaign: 'Новый клип',
      type: 'sidebar_small',
      dimensions: '300×250',
      views: 54774,
      clicks: 2104,
      ctr: 3.84,
      spent: 56000,
      cpc: 26.62,
      status: 'completed',
      isPaid: true,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=250&fit=crop',
      targetUrl: '/artist/video/novyj-klip',
      startDate: '01.01.2025',
      endDate: '08.01.2025',
      daysRunning: 7,
      daysRemaining: 0,
    },
    {
      id: 'banner_4',
      campaign: 'Концерт в Москве',
      type: 'top_banner',
      dimensions: '1920×400',
      views: 0,
      clicks: 0,
      ctr: 0,
      spent: 0,
      cpc: 0,
      status: 'pending_moderation',
      isPaid: true,
      imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1920&h=400&fit=crop',
      targetUrl: '/artist/concerts/moscow',
      startDate: '—',
      endDate: '—',
      daysRunning: 0,
      daysRemaining: 0,
      price: 210000,
    },
    {
      id: 'banner_5',
      campaign: 'Мерч коллекция',
      type: 'sidebar_small',
      dimensions: '300×250',
      views: 0,
      clicks: 0,
      ctr: 0,
      spent: 0,
      cpc: 0,
      status: 'rejected',
      isPaid: true,
      rejectionReason: 'Изображение не соответствует правилам размещения рекламы',
      imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=300&h=250&fit=crop',
      targetUrl: '/artist/merch',
      startDate: '—',
      endDate: '—',
      daysRunning: 0,
      daysRemaining: 0,
      price: 56000,
    },
  ];

  // Фильтрация баннеров по статусу
  const filteredBanners = statusFilter === 'all' 
    ? bannersDetailedData 
    : bannersDetailedData.filter(b => b.status === statusFilter);

  // Подсчет количества по статусам
  const statusCounts = {
    all: bannersDetailedData.length,
    pending_payment: bannersDetailedData.filter(b => b.status === 'pending_payment').length,
    pending_moderation: bannersDetailedData.filter(b => b.status === 'pending_moderation').length,
    active: bannersDetailedData.filter(b => b.status === 'active').length,
    completed: bannersDetailedData.filter(b => b.status === 'completed').length,
    rejected: bannersDetailedData.filter(b => b.status === 'rejected').length,
  };

  // Функция оплаты
  const handlePayment = (bannerId: string, price: number) => {
    console.log(`Переход к оплате баннера ${bannerId}, сумма: ${price} ₽`);
    // TODO: Интеграция с платежной системой
    alert(`Переход к оплате: ${price.toLocaleString('ru-RU')} ₽`);
  };

  // Функция отмены
  const handleCancel = (banner: any) => {
    if (banner.status === 'pending_payment') {
      // Неоплаченный баннер - просто удаляем
      if (confirm(`Удалить черновик "${banner.campaign}"?`)) {
        console.log(`Удаление черновика ${banner.id}`);
        // TODO: Удалить из базы
        alert('Черновик удален');
      }
    } else if (banner.status === 'pending_moderation') {
      // Оплаченный, но еще на модерации - можно вернуть деньги
      if (confirm(`Отменить баннер "${banner.campaign}"? Средства будут возвращены.`)) {
        console.log(`Отмена и возврат средств для ${banner.id}`);
        // TODO: Возврат средств
        alert(`Баннер отменен, ${banner.price?.toLocaleString('ru-RU')} ₽ будут возвращены в течение 3-5 дней`);
      }
    } else if (banner.status === 'rejected') {
      // Отклоненный - возврат средств
      if (confirm(`Вернуть средства за отклоненный баннер "${banner.campaign}"?`)) {
        console.log(`Возврат средств для отклоненного ${banner.id}`);
        // TODO: Возврат средств
        alert(`Запрос на возврат ${banner.price?.toLocaleString('ru-RU')} ₽ отправлен`);
      }
    } else {
      // Активный или завершенный - нельзя отменить
      alert('Нельзя отменить активный или завершенный баннер. Средства не возвращаются.');
    }
  };

  // Stats Cards Data
  const statsCards = [
    {
      icon: Image,
      label: 'Всего баннеров',
      value: stats.overview.total_banners.toString(),
      subValue: `${stats.overview.active_banners} активных`,
      color: 'from-purple-500 to-pink-500',
      trend: null,
      trendUp: false,
    },
    {
      icon: Eye,
      label: 'Показы',
      value: stats.overview.total_views.toLocaleString('ru-RU'),
      subValue: `CTR: ${stats.overview.average_ctr.toFixed(2)}%`,
      color: 'from-cyan-500 to-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      icon: MousePointer,
      label: 'Клики',
      value: stats.overview.total_clicks.toLocaleString('ru-RU'),
      subValue: `${(stats.overview.total_spent / stats.overview.total_clicks).toFixed(2)} ₽/клик`,
      color: 'from-green-500 to-emerald-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      icon: DollarSign,
      label: 'Потрачено',
      value: `${(stats.overview.total_spent / 1000).toFixed(0)}K ₽`,
      subValue: `${stats.overview.active_banners} активных`,
      color: 'from-orange-500 to-red-500',
      trend: '+25%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Аналитика баннерной рекламы
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Эффективность визуального продвижения
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {range === '7d' && '7 дней'}
              {range === '30d' && '30 дней'}
              {range === '90d' && '90 дней'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const isClickable = card.label === 'Всего баннеров';
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={isClickable ? { scale: 1.02 } : undefined}
              onClick={() => isClickable && setShowBannersList(true)}
              className={`p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl ${
                isClickable ? 'cursor-pointer hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {card.trend && (
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    card.trendUp ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {card.trendUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {card.trend}
                  </div>
                )}
                {isClickable && (
                  <ChevronRight className="w-5 h-5 text-purple-400 ml-auto" />
                )}
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
                <p className="text-xs text-gray-500">{card.subValue}</p>
                {isClickable && (
                  <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
                    Подробнее <ChevronRight className="w-3 h-3" />
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Banners List Modal */}
      <AnimatePresence>
        {showBannersList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowBannersList(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Image className="w-7 h-7 text-purple-400" />
                      Все баннеры ({bannersDetailedData.length})
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Управление рекламными кампаниями
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBannersList(false)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'all'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Все ({statusCounts.all})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending_payment')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'pending_payment'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Ожидают оплаты ({statusCounts.pending_payment})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending_moderation')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'pending_moderation'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    На модерации ({statusCounts.pending_moderation})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'active'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Активные ({statusCounts.active})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'completed'
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Завершенные ({statusCounts.completed})
                  </button>
                  <button
                    onClick={() => setStatusFilter('rejected')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === 'rejected'
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Отклоненные ({statusCounts.rejected})
                  </button>
                </div>
              </div>

              {/* Banners Grid */}
              <div className="p-6 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {filteredBanners.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Нет баннеров с этим статусом</p>
                  </div>
                ) : (
                  filteredBanners.map((banner, index) => (
                    <motion.div
                      key={banner.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all"
                    >
                      {/* Banner Thumbnail */}
                      <div 
                        onClick={() => {
                          if (banner.status !== 'pending_payment') {
                            setSelectedBanner(banner);
                            setShowBannersList(false);
                          }
                        }}
                        className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 ${
                          banner.status !== 'pending_payment' ? 'cursor-pointer hover:scale-105 transition-transform' : ''
                        }`}
                      >
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.campaign}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Banner Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{banner.campaign}</h3>
                            <p className="text-xs text-gray-400">
                              {banner.type === 'top_banner' && 'Главный баннер'}
                              {banner.type === 'sidebar_large' && 'Боковой большой'}
                              {banner.type === 'sidebar_small' && 'Боковой малый'}
                              {' • '}{banner.dimensions}
                            </p>
                            {banner.status === 'rejected' && banner.rejectionReason && (
                              <p className="text-xs text-red-400 mt-1">
                                ⚠️ {banner.rejectionReason}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                              banner.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                                : banner.status === 'completed'
                                ? 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                                : banner.status === 'pending_payment'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                                : banner.status === 'pending_moderation'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                                : 'bg-red-500/20 text-red-400 border border-red-400/30'
                            }`}>
                              {banner.status === 'active' && 'Активен'}
                              {banner.status === 'completed' && 'Завершён'}
                              {banner.status === 'pending_payment' && 'Ожидает оплаты'}
                              {banner.status === 'pending_moderation' && 'На модерации'}
                              {banner.status === 'rejected' && 'Отклонён'}
                            </span>
                          </div>
                        </div>

                        {/* Metrics or Actions */}
                        {banner.status === 'pending_payment' ? (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayment(banner.id, banner.price || 0);
                              }}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-semibold transition-all flex items-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              Оплатить {banner.price?.toLocaleString('ru-RU')} ₽
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(banner);
                              }}
                              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm font-semibold transition-all"
                            >
                              Удалить
                            </button>
                          </div>
                        ) : banner.status === 'active' || banner.status === 'completed' ? (
                          <div className="grid grid-cols-4 gap-3 text-xs mt-2">
                            <div>
                              <p className="text-gray-500">Показы</p>
                              <p className="text-white font-semibold">{banner.views.toLocaleString('ru-RU')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Клики</p>
                              <p className="text-white font-semibold">{banner.clicks.toLocaleString('ru-RU')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">CTR</p>
                              <p className="text-green-400 font-semibold">{banner.ctr.toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Потрачено</p>
                              <p className="text-purple-400 font-semibold">{(banner.spent / 1000).toFixed(0)}K ₽</p>
                            </div>
                          </div>
                        ) : banner.status === 'pending_moderation' ? (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="text-sm text-gray-400 flex-1">
                              Ожидает проверки администратора
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(banner);
                              }}
                              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-sm font-semibold transition-all"
                            >
                              Отменить и вернуть средства
                            </button>
                          </div>
                        ) : banner.status === 'rejected' ? (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="text-sm text-red-400 flex-1">
                              Баннер был отклонен
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancel(banner);
                              }}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold transition-all"
                            >
                              Запросить возврат средств
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Detail Icon */}
                      {banner.status !== 'pending_payment' && (
                        <button
                          onClick={() => {
                            setSelectedBanner(banner);
                            setShowBannersList(false);
                          }}
                          className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 text-purple-400 transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10">
                <button
                  onClick={() => setShowBannersList(false)}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner Detail Modal */}
      {selectedBanner && (
        <BannerDetailModal
          banner={selectedBanner}
          onClose={() => setSelectedBanner(null)}
        />
      )}

      {/* Daily Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Динамика показов и кликов
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.daily_stats}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="views" 
              stroke="#a855f7" 
              fillOpacity={1} 
              fill="url(#colorViews)"
              name="Показы"
            />
            <Area 
              type="monotone" 
              dataKey="clicks" 
              stroke="#06b6d4" 
              fillOpacity={1} 
              fill="url(#colorClicks)"
              name="Клики"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* CTR Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          CTR (Click-Through Rate)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.daily_stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af" 
              tick={{ fill: '#9ca3af' }}
              label={{ value: 'CTR (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Line 
              type="monotone" 
              dataKey="ctr" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              name="CTR"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Performance Table & Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Производительность кампаний
          </h3>
          <div className="space-y-3">
            {stats.performance.map((banner, index) => (
              <div
                key={banner.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">{banner.campaign}</h4>
                    <p className="text-xs text-gray-400">{banner.type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    banner.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {banner.status === 'active' ? 'Активен' : 'Завершён'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Показы</p>
                    <p className="font-semibold text-white">{banner.views.toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Клики</p>
                    <p className="font-semibold text-white">{banner.clicks.toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CTR</p>
                    <p className="font-semibold text-green-400">{banner.ctr}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CPC</p>
                    <p className="font-semibold text-purple-400">{banner.cpc.toFixed(2)} ₽</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            Распределение по типам
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.type_distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.type_distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {stats.type_distribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}