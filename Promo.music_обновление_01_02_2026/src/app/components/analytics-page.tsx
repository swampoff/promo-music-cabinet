import { TrendingUp, TrendingDown, Users, Play, Heart, Share2, Download, Eye, Clock, MapPin, Calendar, Music2, Target, Award, Zap, DollarSign, Globe, Headphones, Radio, ThumbsUp, MessageCircle, Filter, ChevronDown, Info, ArrowUpRight, Sparkles, BarChart3, FileDown, Loader2, AlertCircle, CheckCircle2, TrendingDown as TrendingDownIcon, X, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';
import { TrackDetailModal } from './track-detail-modal';
import { AnalyticsBanners } from './analytics-banners';

interface AnalyticsPageProps {}

// Mock data for different time periods
const weeklyData = [
  { day: 'Пн', plays: 2400, likes: 400, shares: 240, downloads: 150 },
  { day: 'Вт', plays: 3200, likes: 520, shares: 300, downloads: 180 },
  { day: 'Ср', plays: 4100, likes: 680, shares: 410, downloads: 220 },
  { day: 'Чт', plays: 3800, likes: 610, shares: 380, downloads: 200 },
  { day: 'Пт', plays: 5200, likes: 850, shares: 520, downloads: 280 },
  { day: 'Сб', plays: 6800, likes: 1100, shares: 680, downloads: 350 },
  { day: 'Вс', plays: 5900, likes: 950, shares: 590, downloads: 310 },
];

const monthlyData = [
  { month: 'Янв', plays: 45000, revenue: 12000, followers: 1200, likes: 3200, shares: 890 },
  { month: 'Фев', plays: 52000, revenue: 14500, followers: 1450, likes: 3800, shares: 1050 },
  { month: 'Мар', plays: 61000, revenue: 17200, followers: 1780, likes: 4500, shares: 1280 },
  { month: 'Апр', plays: 58000, revenue: 16800, followers: 1920, likes: 4200, shares: 1150 },
  { month: 'Май', plays: 73000, revenue: 21500, followers: 2300, likes: 5400, shares: 1520 },
  { month: 'Июн', plays: 89000, revenue: 26400, followers: 2850, likes: 6700, shares: 1890 },
];

const yearlyData = [
  { period: 'Янв-Фев', plays: 97000, revenue: 26500, followers: 2650, likes: 7000, shares: 1940 },
  { period: 'Мар-Апр', plays: 119000, revenue: 34000, followers: 3700, likes: 8700, shares: 2430 },
  { period: 'Май-Июн', plays: 162000, revenue: 47900, followers: 5150, likes: 12100, shares: 3410 },
  { period: 'Июл-Авг', plays: 185000, revenue: 54200, followers: 6200, likes: 14200, shares: 3980 },
  { period: 'Сен-Окт', plays: 201000, revenue: 61800, followers: 7450, likes: 16500, shares: 4650 },
  { period: 'Ноя-Дек', plays: 234000, revenue: 72100, followers: 9100, likes: 19800, shares: 5520 },
];

const platformData = [
  { name: 'Spotify', value: 35, color: '#1DB954' },
  { name: 'Apple Music', value: 28, color: '#FA243C' },
  { name: 'YouTube', value: 22, color: '#FF0000' },
  { name: 'VK Music', value: 10, color: '#0077FF' },
  { name: 'Другие', value: 5, color: '#6B7280' },
];

const ageData = [
  { age: '13-17', listeners: 850 },
  { age: '18-24', listeners: 3200 },
  { age: '25-34', listeners: 4500 },
  { age: '35-44', listeners: 2100 },
  { age: '45-54', listeners: 900 },
  { age: '55+', listeners: 450 },
];

const geoData = [
  { country: 'Россия', listeners: 8500, percentage: 68 },
  { country: 'Украина', listeners: 1500, percentage: 12 },
  { country: 'Беларусь', listeners: 900, percentage: 7 },
  { country: 'Казахстан', listeners: 700, percentage: 6 },
  { country: 'Другие', listeners: 900, percentage: 7 },
];

const topTracks = [
  { id: 1, title: 'Летняя ночь', artist: 'Вы', plays: 125400, likes: 8900, shares: 2340, downloads: 1850, duration: '3:45', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop' },
  { id: 2, title: 'Город засыпает', artist: 'Вы', plays: 98300, likes: 7200, shares: 1920, downloads: 1450, duration: '4:12', cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=100&h=100&fit=crop' },
  { id: 3, title: 'Танцуй со мной', artist: 'Вы', plays: 87600, likes: 6100, shares: 1680, downloads: 1230, duration: '3:28', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=100&h=100&fit=crop' },
  { id: 4, title: 'Под звёздами', artist: 'Вы', plays: 76200, likes: 5400, shares: 1450, downloads: 980, duration: '4:05', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop' },
  { id: 5, title: 'Ритм сердца', artist: 'Вы', plays: 68900, likes: 4800, shares: 1280, downloads: 850, duration: '3:52', cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop' },
];

const engagementData = [
  { metric: 'Прослушивания', value: 95 },
  { metric: 'Лайки', value: 88 },
  { metric: 'Репосты', value: 76 },
  { metric: 'Комментарии', value: 82 },
  { metric: 'Сохранения', value: 90 },
  { metric: 'Подписки', value: 85 },
];

const hourlyData = [
  { hour: '00:00', plays: 420 },
  { hour: '03:00', plays: 180 },
  { hour: '06:00', plays: 350 },
  { hour: '09:00', plays: 890 },
  { hour: '12:00', plays: 1420 },
  { hour: '15:00', plays: 1680 },
  { hour: '18:00', plays: 2100 },
  { hour: '21:00', plays: 2350 },
];

// Insights data
const insights = [
  {
    icon: Clock,
    title: 'Пиковое время',
    description: 'Ваши слушатели наиболее активны в 18:00-21:00. Запланируйте релиз на это время!',
    color: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400',
  },
  {
    icon: Target,
    title: 'Целевая аудитория',
    description: 'Основная аудитория: 25-34 года. Адаптируйте контент под эту возрастную группу.',
    color: 'from-cyan-500 to-blue-500',
    iconColor: 'text-cyan-400',
  },
  {
    icon: TrendingUp,
    title: 'Рост вовлечённости',
    description: 'Вовлечённость выросла на 35% за последний месяц. Продолжайте в том же духе!',
    color: 'from-emerald-500 to-green-500',
    iconColor: 'text-emerald-400',
  },
];

// Mock data for individual track detail
const getTrackDetailData = (trackId: number) => {
  const baseTrack = topTracks.find(t => t.id === trackId);
  if (!baseTrack) return null;

  return {
    ...baseTrack,
    weeklyPlays: [
      { day: 'Пн', plays: 15200 },
      { day: 'Вт', plays: 18400 },
      { day: 'Ср', plays: 21300 },
      { day: 'Чт', plays: 19800 },
      { day: 'Пт', plays: 24100 },
      { day: 'Сб', plays: 28600 },
      { day: 'Вс', plays: 26400 },
    ],
    platforms: [
      { name: 'Spotify', plays: 45200, percentage: 36 },
      { name: 'Apple Music', plays: 35100, percentage: 28 },
      { name: 'YouTube', plays: 27600, percentage: 22 },
      { name: 'VK Music', plays: 12500, percentage: 10 },
      { name: 'Другие', plays: 5000, percentage: 4 },
    ],
    demographics: [
      { age: '13-17', percentage: 8 },
      { age: '18-24', percentage: 28 },
      { age: '25-34', percentage: 38 },
      { age: '35-44', percentage: 18 },
      { age: '45+', percentage: 8 },
    ],
    retention: 87,
    avgListenTime: '3:12',
    completionRate: 92,
  };
};

export function AnalyticsPage({}: AnalyticsPageProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'plays' | 'likes' | 'shares'>('plays');
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedTrackDetail, setSelectedTrackDetail] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  // Вычисляем данные на основе выбранного периода
  const currentData = useMemo(() => {
    if (selectedPeriod === 'week') return weeklyData;
    if (selectedPeriod === 'month') return monthlyData;
    return yearlyData;
  }, [selectedPeriod]);

  // Вычисляем метрики для карточек статистики на основе периода
  const stats = useMemo(() => {
    const periodMultiplier = selectedPeriod === 'week' ? 1 : selectedPeriod === 'month' ? 4.5 : 52;
    
    return [
      {
        icon: Play,
        label: 'Всего прослушиваний',
        value: selectedPeriod === 'week' ? '31.4K' : selectedPeriod === 'month' ? '456.2K' : '1.2M',
        change: '+24.5%',
        changeColor: 'text-emerald-400',
        gradient: 'from-cyan-900/40 to-blue-900/40',
        iconColor: 'text-cyan-400',
        trend: [2200, 2400, 2100, 2800, 3200, 2900, 3400]
      },
      {
        icon: Users,
        label: 'Активные слушатели',
        value: selectedPeriod === 'week' ? '2.8K' : selectedPeriod === 'month' ? '28.5K' : '156K',
        change: '+18.2%',
        changeColor: 'text-emerald-400',
        gradient: 'from-purple-900/40 to-pink-900/40',
        iconColor: 'text-purple-400',
        trend: [1800, 2000, 1900, 2300, 2600, 2400, 2850]
      },
      {
        icon: Heart,
        label: 'Всего лайков',
        value: selectedPeriod === 'week' ? '4.2K' : selectedPeriod === 'month' ? '32.1K' : '187K',
        change: '+31.8%',
        changeColor: 'text-emerald-400',
        gradient: 'from-pink-900/40 to-rose-900/40',
        iconColor: 'text-pink-400',
        trend: [900, 1100, 1000, 1300, 1500, 1400, 1600]
      },
      {
        icon: DollarSign,
        label: 'Доход за период',
        value: selectedPeriod === 'week' ? '₽8.2K' : selectedPeriod === 'month' ? '₽26.4K' : '₽284K',
        change: '+22.7%',
        changeColor: 'text-emerald-400',
        gradient: 'from-emerald-900/40 to-teal-900/40',
        iconColor: 'text-emerald-400',
        trend: [12000, 14000, 13500, 17000, 19000, 18500, 21500]
      },
    ];
  }, [selectedPeriod]);

  // Функция экспорта данных в CSV
  const handleExportCSV = () => {
    setLoading(true);
    
    setTimeout(() => {
      try {
        // Формируем CSV
        const headers = ['Период', 'Прослушивания', 'Лайки', 'Репосты'];
        const rows = currentData.map(row => {
          const period = (row as any).day || (row as any).month || (row as any).period;
          return [period, row.plays, row.likes || 0, row.shares || 0];
        });
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Создаём и скачиваем файл
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analytics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        toast.success('Отчёт успешно экспортирован!');
      } catch (error) {
        toast.error('Ошибка при экспорте отчёта');
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-black/90 border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-2">
            {payload[0].payload.day || payload[0].payload.month || payload[0].payload.period || payload[0].payload.hour}
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
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header with Period Filter and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
            Аналитика
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Детальная статистика и анализ вашей музыки</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Period Filter */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex-1 sm:flex-initial">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Год'}
              </button>
            ))}
          </div>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-500/20 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Экспорт</span>
          </motion.button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative overflow-hidden p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${stat.gradient} border border-white/10 group cursor-pointer`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${stat.iconColor}`} />
                  </div>
                </div>
                
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-xs sm:text-sm mb-3">{stat.label}</div>
                
                <div className={`flex items-center gap-1 text-xs sm:text-sm font-semibold ${stat.changeColor}`}>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{stat.change}</span>
                  <span className="text-gray-500 ml-1">за период</span>
                </div>

                {/* Mini trend chart */}
                <div className="mt-4 h-12 opacity-50 group-hover:opacity-80 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stat.trend.map((v, i) => ({ value: v }))}>
                      <defs>
                        <linearGradient id={`trend-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={stat.iconColor.replace('text-', '')} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={stat.iconColor.replace('text-', '')} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="none" fill={`url(#trend-${index})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${insight.color}/20 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex items-start gap-4 mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${insight.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm sm:text-base mb-1">{insight.title}</h3>
                </div>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{insight.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                Активность за {selectedPeriod === 'week' ? 'неделю' : selectedPeriod === 'month' ? 'месяц' : 'год'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">Прослушивания, лайки и репосты</p>
            </div>
            
            {/* Metric Selector */}
            <div className="flex items-center gap-2">
              {(['plays', 'likes', 'shares'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-300 ${
                    selectedMetric === metric
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {metric === 'plays' ? 'Plays' : metric === 'likes' ? 'Likes' : 'Shares'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey={(row: any) => row.day || row.month || row.period}
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedMetric === 'plays' && (
                  <Line 
                    type="monotone" 
                    dataKey="plays" 
                    name="Прослушивания"
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                )}
                {selectedMetric === 'likes' && (
                  <Line 
                    type="monotone" 
                    dataKey="likes" 
                    name="Лайки"
                    stroke="#ec4899" 
                    strokeWidth={3}
                    dot={{ fill: '#ec4899', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                )}
                {selectedMetric === 'shares' && (
                  <Line 
                    type="monotone" 
                    dataKey="shares" 
                    name="Репосты"
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              Рост {selectedPeriod === 'week' ? 'за неделю' : selectedPeriod === 'month' ? 'за 6 месяцев' : 'за год'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">Прослушивания и доход</p>
          </div>
          
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey={(row: any) => row.day || row.month || row.period}
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="plays" 
                  name="Прослушивания"
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fill="url(#colorPlays)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Доход (₽)"
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Platform & Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Платформы</h2>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="backdrop-blur-xl bg-black/90 border border-white/20 rounded-xl p-3 shadow-2xl">
                          <p className="text-white font-semibold">{payload[0].name}</p>
                          <p className="text-cyan-400 text-sm">{payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {platformData.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platform.color }}></div>
                  <span className="text-xs sm:text-sm text-gray-300">{platform.name}</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white">{platform.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Age Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Возраст слушателей</h2>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                <YAxis dataKey="age" type="category" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="listeners" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Engagement Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
        >
          <h2 className="text-lg sm:text-xl font-bold text-white mb-6">Вовлечённость</h2>
          
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={engagementData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  stroke="rgba(255,255,255,0.5)" 
                  style={{ fontSize: '10px' }}
                />
                <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
                <Radar 
                  name="Уровень" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  fill="#06b6d4" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">География слушателей</h2>
            <p className="text-xs sm:text-sm text-gray-400">Топ-5 стран</p>
          </div>
          <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {geoData.map((country, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              className="p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xl sm:text-2xl font-bold text-white">{country.percentage}%</span>
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mb-2">{country.country}</div>
              <div className="text-base sm:text-lg font-bold text-white">{country.listeners.toLocaleString()}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">слушателей</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Tracks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Топ треки</h2>
            <p className="text-xs sm:text-sm text-gray-400">Самые популярные композиции</p>
          </div>
          <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
        </div>

        <div className="space-y-3">
          {topTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + index * 0.1 }}
              onClick={() => setSelectedTrackDetail(selectedTrackDetail === track.id ? null : track.id)}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
                <span className="text-xs sm:text-sm font-bold text-cyan-400">#{index + 1}</span>
              </div>
              
              <img 
                src={track.cover} 
                alt={track.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover ring-2 ring-white/10 group-hover:ring-cyan-400/50 transition-all"
              />
              
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors truncate">
                  {track.title}
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{(track.plays / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{(track.likes / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xl sm:text-2xl font-bold text-white">{(track.plays / 1000).toFixed(1)}K</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">прослушиваний</div>
                </div>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Hourly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Активность по часам</h2>
            <p className="text-xs sm:text-sm text-gray-400">Когда слушают вашу музыку</p>
          </div>
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
        </div>

        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="hour" 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="plays" 
                stroke="#a855f7" 
                strokeWidth={3}
                fill="url(#colorHourly)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">92%</div>
              <div className="text-xs sm:text-sm text-gray-400">Среднее удержание</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-300">Слушатели досматривают треки до конца</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-white/10 hover:border-purple-400/30 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">87%</div>
              <div className="text-xs sm:text-sm text-gray-400">Точность таргетинга</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-300">Музыка достигает целевой аудитории</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
          className="p-4 sm:p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-white/10 hover:border-emerald-400/30 transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-white">+35%</div>
              <div className="text-xs sm:text-sm text-gray-400">Рост вовлечённости</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-300">Аудитория активно взаимодействует</p>
        </motion.div>
      </div>

      {/* Banner Advertising Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
      >
        <AnalyticsBanners userId="artist_demo_001" />
      </motion.div>

      {/* Track Detail Modal */}
      <AnimatePresence>
        {selectedTrackDetail !== null && (() => {
          const trackDetail = getTrackDetailData(selectedTrackDetail);
          if (!trackDetail) return null;

          return (
            <TrackDetailModal
              trackDetail={trackDetail}
              isPlaying={isPlaying}
              playingTrackId={playingTrackId}
              onClose={() => setSelectedTrackDetail(null)}
              onPlayToggle={(trackId) => {
                setPlayingTrackId(playingTrackId === trackId ? null : trackId);
                setIsPlaying(!isPlaying);
              }}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}