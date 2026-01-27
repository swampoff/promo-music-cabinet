import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Play, Pause, Volume2, Heart, Share2, Download, Clock, Zap, CheckCircle2, Music2, Users, Target, Radio, MapPin, Calendar, DollarSign, TrendingUp, Award, BarChart3, Eye, Coins } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';

interface TrackDetailModalProps {
  trackDetail: any;
  isPlaying: boolean;
  playingTrackId: number | null;
  onClose: () => void;
  onPlayToggle: (trackId: number) => void;
}

type TabType = 'overview' | 'sources' | 'marketing' | 'pitching' | 'concerts' | 'revenue';

export function TrackDetailModal({ trackDetail, isPlaying, playingTrackId, onClose, onPlayToggle }: TrackDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Mock extended data
  const extendedData = {
    // Traffic Sources
    trafficSources: [
      { source: 'Органика', plays: 50160, percentage: 40, color: '#10b981' },
      { source: 'Маркетинг', plays: 31350, percentage: 25, color: '#06b6d4' },
      { source: 'Радио', plays: 18810, percentage: 15, color: '#f59e0b' },
      { source: 'Заведения', plays: 15048, percentage: 12, color: '#8b5cf6' },
      { source: 'Стримы', plays: 10032, percentage: 8, color: '#ec4899' },
    ],
    
    // Marketing ROI
    marketingROI: {
      coinsSpent: 1500,
      playsGenerated: 31350,
      costPerPlay: '0.048',
      roi: 208,
      campaigns: [
        { name: 'Instagram Stories', spent: 500, plays: 12500, roi: 250 },
        { name: 'TikTok Promo', spent: 600, plays: 15200, roi: 253 },
        { name: 'YouTube Ads', spent: 400, plays: 3650, roi: 91 },
      ]
    },
    
    // Concert Impact
    concertImpact: {
      hasConcert: true,
      concertDate: '15 июня 2026',
      concertVenue: 'Олимпийский, Москва',
      playsBefore: [
        { week: '-4 нед', plays: 12000 },
        { week: '-3 нед', plays: 13500 },
        { week: '-2 нед', plays: 14200 },
        { week: '-1 нед', plays: 13800 },
      ],
      playsAfter: [
        { week: 'Концерт', plays: 42600 },
        { week: '+1 нед', plays: 28600 },
        { week: '+2 нед', plays: 25400 },
        { week: '+3 нед', plays: 22100 },
        { week: '+4 нед', plays: 19800 },
      ],
      avgIncrease: '+95%',
    },
    
    // Pitching Stats
    pitchingStats: {
      totalPitches: 25,
      approved: 18,
      pending: 5,
      rejected: 2,
      approvalRate: 72,
      topPlaylists: [
        { name: 'Топ 50 Россия', platform: 'Spotify', listeners: 850000, added: true },
        { name: 'Новинки недели', platform: 'Apple Music', listeners: 520000, added: true },
        { name: 'Русский рок', platform: 'YouTube Music', listeners: 340000, added: false },
      ],
      radioStations: [
        { name: 'Европа Плюс', city: 'Москва', rotations: 45, reach: 2500000 },
        { name: 'Русское Радио', city: 'СПб', rotations: 32, reach: 1800000 },
      ]
    },
    
    // Revenue by Source
    revenueBySource: [
      { source: 'Стримы платформ', amount: 8240, percentage: 45, color: '#06b6d4' },
      { source: 'Донаты', amount: 5850, percentage: 32, color: '#ec4899' },
      { source: 'Радио роялти', amount: 2920, percentage: 16, color: '#f59e0b' },
      { source: 'Синхронизация', amount: 1280, percentage: 7, color: '#8b5cf6' },
    ],
    
    // Venues Data
    venuesData: {
      totalVenues: 145,
      topVenues: [
        { name: 'Бар "Стрелка"', city: 'Москва', plays: 2850, type: 'Бар' },
        { name: 'Кафе "Циферблат"', city: 'СПб', plays: 1920, type: 'Кафе' },
        { name: 'Клуб "Мумий Тролль"', city: 'Москва', plays: 1680, type: 'Клуб' },
      ],
      venueTypes: [
        { type: 'Бары', count: 65, plays: 8500 },
        { type: 'Кафе', count: 48, plays: 4200 },
        { type: 'Клубы', count: 25, plays: 2100 },
        { type: 'Рестораны', count: 7, plays: 248 },
      ]
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Общее', icon: BarChart3 },
    { id: 'sources' as TabType, label: 'Источники', icon: Target },
    { id: 'marketing' as TabType, label: 'Маркетинг', icon: TrendingUp },
    { id: 'pitching' as TabType, label: 'Питчинг', icon: Radio },
    { id: 'concerts' as TabType, label: 'Концерты', icon: Calendar },
    { id: 'revenue' as TabType, label: 'Доход', icon: DollarSign },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-black/90 border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-2">
            {payload[0].payload.day || payload[0].payload.week || payload[0].payload.name || payload[0].payload.source}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name || entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-6 sm:p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header with Track Info */}
        <div className="flex items-start gap-6 mb-8">
          <img
            src={trackDetail.cover}
            alt={trackDetail.title}
            className="w-32 h-32 rounded-2xl object-cover ring-4 ring-cyan-400/30 shadow-lg shadow-cyan-500/20"
          />
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{trackDetail.title}</h2>
            <p className="text-lg text-gray-400 mb-4">{trackDetail.artist}</p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">Прослушивания</span>
                </div>
                <div className="text-2xl font-bold text-white">{trackDetail.plays.toLocaleString()}</div>
              </div>
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-xs text-gray-400">Лайки</span>
                </div>
                <div className="text-2xl font-bold text-white">{trackDetail.likes.toLocaleString()}</div>
              </div>
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Репосты</span>
                </div>
                <div className="text-2xl font-bold text-white">{trackDetail.shares.toLocaleString()}</div>
              </div>
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Скачивания</span>
                </div>
                <div className="text-2xl font-bold text-white">{trackDetail.downloads.toLocaleString()}</div>
              </div>
            </div>

            {/* Mini Player */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onPlayToggle(trackDetail.id);
                    toast.success(isPlaying && playingTrackId === trackDetail.id ? 'Воспроизведение остановлено' : 'Воспроизведение начато');
                  }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl transition-all duration-300"
                >
                  {isPlaying && playingTrackId === trackDetail.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>0:00</span>
                    <span>{trackDetail.duration}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: isPlaying && playingTrackId === trackDetail.id ? '100%' : '0%' }}
                      transition={{ duration: 225, ease: 'linear' }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    />
                  </div>
                </div>
                
                <Volume2 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Plays */}
                  <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Прослушивания за неделю</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trackDetail.weeklyPlays}>
                          <defs>
                            <linearGradient id="detailPlays" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                          <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                          <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="plays" stroke="#06b6d4" strokeWidth={2} fill="url(#detailPlays)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Платформы</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trackDetail.platforms} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                          <XAxis type="number" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                          <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} width={100} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="plays" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6 text-cyan-400" />
                      <span className="text-sm text-gray-300">Удержание</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{trackDetail.retention}%</div>
                    <p className="text-xs text-gray-400">слушателей до конца</p>
                  </div>

                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-gray-300">Ср. время</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{trackDetail.avgListenTime}</div>
                    <p className="text-xs text-gray-400">средняя длительность</p>
                  </div>

                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-sm text-gray-300">Завершение</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{trackDetail.completionRate}%</div>
                    <p className="text-xs text-gray-400">прослушали полностью</p>
                  </div>

                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Music2 className="w-6 h-6 text-yellow-400" />
                      <span className="text-sm text-gray-300">Длительность</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{trackDetail.duration}</div>
                    <p className="text-xs text-gray-400">общая длина трека</p>
                  </div>
                </div>

                {/* Demographics */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Демография слушателей</h3>
                  <div className="space-y-3">
                    {trackDetail.demographics.map((demo: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-sm text-gray-400">{demo.age}</div>
                        <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${demo.percentage}%` }}
                            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-end pr-3"
                          >
                            <span className="text-xs font-semibold text-white">{demo.percentage}%</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sources Tab */}
            {activeTab === 'sources' && (
              <div className="space-y-6">
                {/* Traffic Sources Donut Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Источники трафика</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={extendedData.trafficSources}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="plays"
                          >
                            {extendedData.trafficSources.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sources Details */}
                  <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Детализация источников</h3>
                    <div className="space-y-3">
                      {extendedData.trafficSources.map((source, index) => (
                        <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                              <span className="font-semibold text-white">{source.source}</span>
                            </div>
                            <span className="text-cyan-400 font-bold">{source.percentage}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Прослушивания</span>
                            <span className="text-white font-semibold">{source.plays.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marketing Tab */}
            {activeTab === 'marketing' && (
              <div className="space-y-6">
                {/* ROI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Coins className="w-6 h-6 text-cyan-400" />
                      <span className="text-sm text-gray-300">Потрачено</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{extendedData.marketingROI.coinsSpent}</div>
                    <p className="text-xs text-gray-400">коинов</p>
                  </div>

                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Play className="w-6 h-6 text-emerald-400" />
                      <span className="text-sm text-gray-300">Получено</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{extendedData.marketingROI.playsGenerated.toLocaleString()}</div>
                    <p className="text-xs text-gray-400">прослушиваний</p>
                  </div>

                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-6 h-6 text-purple-400" />
                      <span className="text-sm text-gray-300">Цена/Play</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">₽{extendedData.marketingROI.costPerPlay}</div>
                    <p className="text-xs text-gray-400">за прослушивание</p>
                  </div>

                  <div className="p-4 rounded-xl backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                      <span className="text-sm text-gray-300">ROI</span>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{extendedData.marketingROI.roi}%</div>
                    <p className="text-xs text-gray-400">окупаемость</p>
                  </div>
                </div>

                {/* Campaigns */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Маркетинговые кампании</h3>
                  <div className="space-y-4">
                    {extendedData.marketingROI.campaigns.map((campaign, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-white mb-1">{campaign.name}</div>
                            <div className="text-sm text-gray-400">ROI: <span className="text-emerald-400 font-bold">{campaign.roi}%</span></div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{campaign.plays.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">прослушиваний</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Coins className="w-4 h-4" />
                          <span>Потрачено: {campaign.spent} коинов</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pitching Tab */}
            {activeTab === 'pitching' && (
              <div className="space-y-6">
                {/* Pitching Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
                    <div className="text-2xl font-bold text-white mb-1">{extendedData.pitchingStats.totalPitches}</div>
                    <p className="text-xs text-gray-400">Всего</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30">
                    <div className="text-2xl font-bold text-white mb-1">{extendedData.pitchingStats.approved}</div>
                    <p className="text-xs text-gray-400">Одобрено</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30">
                    <div className="text-2xl font-bold text-white mb-1">{extendedData.pitchingStats.pending}</div>
                    <p className="text-xs text-gray-400">На рассмотрении</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30">
                    <div className="text-2xl font-bold text-white mb-1">{extendedData.pitchingStats.rejected}</div>
                    <p className="text-xs text-gray-400">Отклонено</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                    <div className="text-2xl font-bold text-white mb-1">{extendedData.pitchingStats.approvalRate}%</div>
                    <p className="text-xs text-gray-400">Успешность</p>
                  </div>
                </div>

                {/* Playlists */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Топ плейлисты</h3>
                  <div className="space-y-3">
                    {extendedData.pitchingStats.topPlaylists.map((playlist, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white mb-1">{playlist.name}</div>
                          <div className="flex items-center gap-3 text-sm text-gray-400">
                            <span>{playlist.platform}</span>
                            <span>•</span>
                            <span>{(playlist.listeners / 1000).toFixed(0)}K слушателей</span>
                          </div>
                        </div>
                        {playlist.added ? (
                          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-xs font-semibold">
                            Добавлен
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-full bg-gray-500/20 border border-gray-400/30 text-gray-400 text-xs font-semibold">
                            Ожидание
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Radio Stations */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Радиостанции</h3>
                  <div className="space-y-3">
                    {extendedData.pitchingStats.radioStations.map((station, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Radio className="w-4 h-4 text-cyan-400" />
                              <span className="font-semibold text-white">{station.name}</span>
                            </div>
                            <div className="text-sm text-gray-400">{station.city}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">{station.rotations}</div>
                            <div className="text-xs text-gray-500">ротаций</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Eye className="w-4 h-4" />
                          <span>Охват: {(station.reach / 1000000).toFixed(1)}M слушателей</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Concerts Tab */}
            {activeTab === 'concerts' && (
              <div className="space-y-6">
                {/* Concert Info */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white">{extendedData.concertImpact.concertVenue}</div>
                      <div className="text-sm text-gray-400">{extendedData.concertImpact.concertDate}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-emerald-400">{extendedData.concertImpact.avgIncrease}</div>
                      <div className="text-xs text-gray-400">рост прослушиваний</div>
                    </div>
                  </div>
                </div>

                {/* Concert Impact Chart */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4">Влияние концерта на прослушивания</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[...extendedData.concertImpact.playsBefore, ...extendedData.concertImpact.playsAfter]}>
                        <defs>
                          <linearGradient id="concertGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                        <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="plays" stroke="#a855f7" strokeWidth={3} fill="url(#concertGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                {/* Revenue Donut Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Доход по источникам</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={extendedData.revenueBySource}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="amount"
                          >
                            {extendedData.revenueBySource.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Revenue Details */}
                  <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Детализация дохода</h3>
                    <div className="space-y-3">
                      {extendedData.revenueBySource.map((source, index) => (
                        <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                              <span className="font-semibold text-white">{source.source}</span>
                            </div>
                            <span className="text-cyan-400 font-bold">{source.percentage}%</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Заработано</span>
                            <span className="text-white font-semibold text-lg">₽{source.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Venues Data */}
                <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Топ заведения</h3>
                    <div className="text-sm text-gray-400">
                      Всего: <span className="text-white font-semibold">{extendedData.venuesData.totalVenues}</span> заведений
                    </div>
                  </div>
                  <div className="space-y-3">
                    {extendedData.venuesData.topVenues.map((venue, index) => (
                      <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="font-semibold text-white">{venue.name}</div>
                            <div className="text-sm text-gray-400">{venue.city} • {venue.type}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-white">{venue.plays.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">прослушиваний</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
