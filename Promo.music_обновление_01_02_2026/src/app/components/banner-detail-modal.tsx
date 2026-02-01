/**
 * BANNER DETAIL MODAL - Детальная информация о баннере
 */

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Image as ImageIcon, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Calendar,
  DollarSign,
  ExternalLink,
  Activity,
  Target,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface BannerDetailModalProps {
  banner: {
    id: string;
    campaign: string;
    type: string;
    views: number;
    clicks: number;
    ctr: number;
    spent: number;
    cpc: number;
    status: string;
    dimensions: string;
    imageUrl: string;
    targetUrl: string;
    startDate: string;
    endDate: string;
    daysRunning: number;
    daysRemaining: number;
  };
  onClose: () => void;
}

// Mock daily stats for the banner
const generateDailyStats = (bannerId: string) => {
  return [
    { date: '21.01', views: 18450, clicks: 412, ctr: 2.23 },
    { date: '22.01', views: 20890, clicks: 478, ctr: 2.29 },
    { date: '23.01', views: 22340, clicks: 534, ctr: 2.39 },
    { date: '24.01', views: 24120, clicks: 598, ctr: 2.48 },
    { date: '25.01', views: 26780, clicks: 687, ctr: 2.57 },
    { date: '26.01', views: 28450, clicks: 745, ctr: 2.62 },
    { date: '27.01', views: 30200, clicks: 800, ctr: 2.65 },
  ];
};

const generateHourlyStats = (bannerId: string) => {
  return [
    { hour: '00:00', views: 820, clicks: 18 },
    { hour: '03:00', views: 420, clicks: 9 },
    { hour: '06:00', views: 680, clicks: 15 },
    { hour: '09:00', views: 1850, clicks: 48 },
    { hour: '12:00', views: 2940, clicks: 76 },
    { hour: '15:00', views: 3450, clicks: 92 },
    { hour: '18:00', views: 4280, clicks: 118 },
    { hour: '21:00', views: 4760, clicks: 145 },
  ];
};

export function BannerDetailModal({ banner, onClose }: BannerDetailModalProps) {
  const dailyStats = generateDailyStats(banner.id);
  const hourlyStats = generateHourlyStats(banner.id);

  const getBannerTypeName = (type: string) => {
    switch (type) {
      case 'top_banner':
        return 'Главный баннер';
      case 'sidebar_large':
        return 'Боковой большой';
      case 'sidebar_small':
        return 'Боковой малый';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'expired':
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      case 'pending_moderation':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'expired':
        return 'Завершён';
      case 'pending_moderation':
        return 'На модерации';
      default:
        return status;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-black/90 border border-white/20 rounded-xl p-3 shadow-2xl">
          <p className="text-white font-semibold mb-1">
            {payload[0].payload.date || payload[0].payload.hour}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl shadow-2xl my-8"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{banner.campaign}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(banner.status)}`}>
                    {getStatusText(banner.status)}
                  </span>
                  <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-400/30">
                    {getBannerTypeName(banner.type)}
                  </span>
                  <span className="text-sm text-gray-400">{banner.dimensions}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Banner Preview and Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Banner Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Превью баннера
                </h3>
                <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.campaign}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Целевой URL:</span>
                  </div>
                  <a 
                    href={banner.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm break-all underline"
                  >
                    {banner.targetUrl}
                  </a>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Ключевые метрики
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
                    <Eye className="w-6 h-6 text-cyan-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{banner.views.toLocaleString('ru-RU')}</div>
                    <div className="text-xs text-gray-400">Показы</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20">
                    <MousePointer className="w-6 h-6 text-green-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{banner.clicks.toLocaleString('ru-RU')}</div>
                    <div className="text-xs text-gray-400">Клики</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20">
                    <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{banner.ctr.toFixed(2)}%</div>
                    <div className="text-xs text-gray-400">CTR</div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/20">
                    <DollarSign className="w-6 h-6 text-orange-400 mb-2" />
                    <div className="text-2xl font-bold text-white">{banner.cpc.toFixed(2)} ₽</div>
                    <div className="text-xs text-gray-400">Цена клика</div>
                  </div>
                </div>

                {/* Campaign Period */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold text-white">Период размещения</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Начало:</span>
                      <span className="text-white font-semibold">{banner.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Окончание:</span>
                      <span className="text-white font-semibold">{banner.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Дней работает:</span>
                      <span className="text-cyan-400 font-semibold">{banner.daysRunning}</span>
                    </div>
                    {banner.status === 'active' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Дней осталось:</span>
                        <span className="text-green-400 font-semibold">{banner.daysRemaining}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Budget Info */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/20">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-white">Бюджет</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Потрачено:</span>
                      <span className="text-white font-bold text-lg">{banner.spent.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Цена за день:</span>
                      <span className="text-emerald-400 font-semibold">
                        {(banner.spent / (banner.daysRunning || 1)).toFixed(2)} ₽
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Средняя цена клика:</span>
                      <span className="text-emerald-400 font-semibold">{banner.cpc.toFixed(2)} ₽</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Performance Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Динамика за последние 7 дней
              </h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorViewsDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorClicksDetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#a855f7" 
                      fillOpacity={1} 
                      fill="url(#colorViewsDetail)"
                      name="Показы"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorClicksDetail)"
                      name="Клики"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CTR Trend */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Тренд CTR
              </h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'CTR (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      formatter={(value: number) => `${value.toFixed(2)}%`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ctr" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="CTR"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Activity */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Активность по часам (сегодня)
              </h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={hourlyStats}>
                    <defs>
                      <linearGradient id="colorHourlyViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      fill="url(#colorHourlyViews)" 
                      name="Показы"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                ID кампании: <span className="text-white font-mono">{banner.id}</span>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
