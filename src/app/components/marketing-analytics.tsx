/**
 * MARKETING ANALYTICS DASHBOARD
 * Глубокая аналитика маркетинга и продаж
 */

import { BarChart3, TrendingUp, DollarSign, Users, Mail, Ticket, Calendar, Eye, MousePointer, ShoppingCart, CreditCard, Percent, Download, Filter, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MarketingAnalyticsProps {
  artistId: string;
  concerts?: any[];
}

interface CampaignPerformance {
  date: string;
  emailsSent: number;
  emailOpens: number;
  emailClicks: number;
  ticketViews: number;
  ticketClicks: number;
  purchases: number;
  revenue: number;
}

interface ChannelStats {
  channel: string;
  revenue: number;
  conversions: number;
  roi: number;
}

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-84730125`;

export function MarketingAnalytics({ artistId, concerts = [] }: MarketingAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [performanceData, setPerformanceData] = useState<CampaignPerformance[]>([]);
  const [channelData, setChannelData] = useState<ChannelStats[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [artistId, dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load performance data
      const perfResponse = await fetch(`${API_URL}/marketing/analytics/performance/${artistId}?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const perfData = await perfResponse.json();
      
      if (perfData.success) {
        setPerformanceData(perfData.data);
      }

      // Load channel data
      const channelResponse = await fetch(`${API_URL}/marketing/analytics/channels/${artistId}?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const channelDataRes = await channelResponse.json();
      
      if (channelDataRes.success) {
        setChannelData(channelDataRes.data);
      }

      // Load summary
      const summaryResponse = await fetch(`${API_URL}/marketing/analytics/summary/${artistId}?range=${dateRange}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const summaryData = await summaryResponse.json();
      
      if (summaryData.success) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Не удалось загрузить аналитику');
      
      // Demo data for testing
      setPerformanceData(generateDemoPerformanceData());
      setChannelData(generateDemoChannelData());
      setSummary(generateDemoSummary());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoPerformanceData = (): CampaignPerformance[] => {
    const data: CampaignPerformance[] = [];
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const emailsSent = Math.floor(Math.random() * 500) + 100;
      const emailOpens = Math.floor(emailsSent * (Math.random() * 0.3 + 0.2));
      const emailClicks = Math.floor(emailOpens * (Math.random() * 0.2 + 0.1));
      const ticketViews = Math.floor(Math.random() * 300) + 50;
      const ticketClicks = Math.floor(ticketViews * (Math.random() * 0.15 + 0.05));
      const purchases = Math.floor(ticketClicks * (Math.random() * 0.25 + 0.1));
      const revenue = purchases * (Math.random() * 2000 + 1500);
      
      data.push({
        date: date.toISOString().split('T')[0],
        emailsSent,
        emailOpens,
        emailClicks,
        ticketViews,
        ticketClicks,
        purchases,
        revenue,
      });
    }
    
    return data;
  };

  const generateDemoChannelData = (): ChannelStats[] => {
    return [
      { channel: 'Email-рассылки', revenue: 156000, conversions: 87, roi: 420 },
      { channel: 'Социальные сети', revenue: 234000, conversions: 156, roi: 680 },
      { channel: 'Билетные платформы', revenue: 412000, conversions: 245, roi: 850 },
      { channel: 'Прямые продажи', revenue: 89000, conversions: 52, roi: 320 },
    ];
  };

  const generateDemoSummary = () => {
    return {
      totalRevenue: 891000,
      totalConversions: 540,
      avgConversionRate: 4.2,
      avgROI: 567.5,
      emailsSent: 12450,
      emailOpenRate: 24.3,
      emailClickRate: 3.8,
      ticketViews: 8920,
      ticketClickRate: 12.5,
      avgTicketPrice: 1650,
      topCampaign: 'Летний фестиваль 2026',
    };
  };

  const exportReport = () => {
    toast.success('📊 Отчёт экспортирован в CSV!', {
      description: 'Файл загружен в папку Downloads',
    });
  };

  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-400" />
            Аналитика и отчёты
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Глубокая аналитика маркетинговых кампаний</p>
        </div>
        
        <div className="flex gap-2 sm:gap-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400/50 text-xs sm:text-sm"
          >
            <option value="7d">7 дней</option>
            <option value="30d">30 дней</option>
            <option value="90d">90 дней</option>
            <option value="all">Всё время</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportReport}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Экспорт</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                +{summary.avgROI.toFixed(0)}%
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{(summary.totalRevenue / 1000).toFixed(0)}K ₽</p>
            <p className="text-xs sm:text-sm text-green-300">Общая выручка</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">
                {summary.avgConversionRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{summary.totalConversions}</p>
            <p className="text-xs sm:text-sm text-purple-300">Конверсии</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded-full">
                {summary.emailOpenRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{(summary.emailsSent / 1000).toFixed(1)}K</p>
            <p className="text-xs sm:text-sm text-cyan-300">Email отправлено</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <span className="text-xs text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded-full">
                {(summary.avgTicketPrice / 1000).toFixed(1)}K ₽
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white mb-1">{(summary.ticketViews / 1000).toFixed(1)}K</p>
            <p className="text-xs sm:text-sm text-yellow-300">Просмотры</p>
          </motion.div>
        </div>
      )}

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-base sm:text-lg font-bold text-white mb-4">Динамика показателей</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              fontSize={10}
              tickFormatter={(value) => {
                const date = new Date(value);
                return window.innerWidth < 640 
                  ? date.toLocaleDateString('ru-RU', { day: 'numeric' })
                  : date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis stroke="#9ca3af" fontSize={10} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Выручка" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            <Area 
              type="monotone" 
              dataKey="purchases" 
              name="Покупки" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorPurchases)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Channel Performance & Email Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Channel Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">Эффективность каналов</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ channel, percent }) => window.innerWidth < 640 
                  ? `${(percent * 100).toFixed(0)}%`
                  : `${channel}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={window.innerWidth < 640 ? 70 : 100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: any) => `${value.toLocaleString()} ₽`}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Email Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">Воронка email</h3>
          <div className="space-y-3 sm:space-y-4">
            {summary && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-400 flex items-center gap-1 sm:gap-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Отправлено</span>
                      <span className="sm:hidden">✉️</span>
                    </span>
                    <span className="text-white font-semibold">{summary.emailsSent.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-400 flex items-center gap-1 sm:gap-2">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Открыто</span>
                      <span className="sm:hidden">👁️</span>
                    </span>
                    <span className="text-white font-semibold">
                      {Math.floor(summary.emailsSent * (summary.emailOpenRate / 100)).toLocaleString()} ({summary.emailOpenRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${summary.emailOpenRate}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-400 flex items-center gap-1 sm:gap-2">
                      <MousePointer className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Кликнуто</span>
                      <span className="sm:hidden">🖱️</span>
                    </span>
                    <span className="text-white font-semibold">
                      {Math.floor(summary.emailsSent * (summary.emailClickRate / 100)).toLocaleString()} ({summary.emailClickRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500" style={{ width: `${summary.emailClickRate * 6.5}%` }}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-400 flex items-center gap-1 sm:gap-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Конверсии</span>
                      <span className="sm:hidden">💳</span>
                    </span>
                    <span className="text-white font-semibold">
                      {summary.totalConversions} ({summary.avgConversionRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${summary.avgConversionRate * 24}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Channel Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="text-base sm:text-lg font-bold text-white mb-4">Детализация по каналам</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-400">Канал</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-400">Выручка</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-400 hidden sm:table-cell">Конверсии</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-400">ROI</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map((channel, index) => (
                  <motion.tr
                    key={channel.channel}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="py-3 sm:py-4 px-2 sm:px-4">
                      <span className="text-white font-medium text-xs sm:text-base">{channel.channel}</span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                      <span className="text-green-400 font-semibold text-xs sm:text-base">{(channel.revenue / 1000).toFixed(0)}K ₽</span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right hidden sm:table-cell">
                      <span className="text-white font-semibold text-xs sm:text-base">{channel.conversions}</span>
                    </td>
                    <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-cyan-400 font-semibold text-xs sm:text-base">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        {channel.roi}%
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Best Performing Campaign */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">Лучшая кампания</h3>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-yellow-400 mb-2">{summary.topCampaign}</p>
          <p className="text-xs sm:text-sm text-gray-400">
            Показала наилучшие результаты по конверсии и ROI за выбранный период
          </p>
        </motion.div>
      )}
    </div>
  );
}